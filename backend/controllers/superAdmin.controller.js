const SuperAdmin = require('../models/SuperAdmin.model');
const Tenant = require('../models/Tenant.model');
const Admin = require('../models/Admin.model');
const Plan = require('../models/Plan.model');
const SuperOxapay = require('../models/SuperOxapay.model');
const LoginLog = require('../models/LoginLog.model');
const PersonalAccessToken = require('../models/PersonalAccessToken.model');
const { success, error } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { hashPassword, verifyPassword } = require('../services/password.service');
const { createAccessToken } = require('../services/token.service');
const {
    generateBase32Secret,
    verifyCode,
    buildOtpAuthUrl
} = require('../services/totp.service');
const uploadToR2 = require('../utils/uploadToR2');

const sanitizeSuperAdmin = (admin) => {
    const data = admin.toObject ? admin.toObject() : admin;
    delete data.password;
    delete data.second_factor_key;
    return data;
};

const logSuperLogin = (req, payload) => {
    return LoginLog.create({
        ...payload,
        login_type: 'super_admin',
        ip_address: req.ip,
        user_agent: req.get('user-agent') || null
    });
};

const parseMaybeJson = (value) => {
    if (typeof value !== 'string') {
        return value;
    }

    try {
        return JSON.parse(value);
    } catch (err) {
        return value;
    }
};

const applyTenantUploads = async (req, tenantData, tenantId = 'new') => {
    if (req.files?.logo?.[0]) {
        const uploaded = await uploadToR2(req.files.logo[0], `tenants/${tenantId}/theme`);
        tenantData.logo_url = uploaded.url;
    }

    if (req.files?.favicon?.[0]) {
        const uploaded = await uploadToR2(req.files.favicon[0], `tenants/${tenantId}/theme`);
        tenantData.favicon_url = uploaded.url;
    }
};

exports.bootstrap = asyncHandler(async (req, res) => {
    const total = await SuperAdmin.countDocuments();

    if (total > 0) {
        return error(res, 'Super admin already exists', 403);
    }

    const admin = await SuperAdmin.create({
        name: req.body.name,
        email: req.body.email,
        password: hashPassword(req.body.password)
    });

    return success(res, 'Super admin created', {
        user: sanitizeSuperAdmin(admin)
    }, 201);
});

exports.login = asyncHandler(async (req, res) => {
    const { email, password, two_factor_code } = req.body;
    const admin = await SuperAdmin.findOne({ email: String(email || '').toLowerCase() });

    if (!admin || !verifyPassword(password, admin.password)) {
        await logSuperLogin(req, {
            email: email || '',
            status: 'failed',
            reason: 'Invalid credentials'
        });
        return error(res, 'Invalid credentials', 401);
    }

    if (admin.is_2fa_enabled && !verifyCode(admin.second_factor_key, two_factor_code)) {
        await logSuperLogin(req, {
            super_admin: admin._id,
            email: admin.email,
            status: 'failed',
            reason: 'Invalid two factor code'
        });
        return error(res, 'Invalid two factor code', 422);
    }

    const token = await createAccessToken(admin, 'SuperAdmin', req);
    await logSuperLogin(req, {
        super_admin: admin._id,
        email: admin.email,
        status: 'success'
    });

    return success(res, 'Logged in', {
        token,
        user: sanitizeSuperAdmin(admin)
    });
});

exports.changePassword = asyncHandler(async (req, res) => {
    const { current_password, new_password } = req.body;

    if (!verifyPassword(current_password, req.user.password)) {
        return error(res, 'Current password is incorrect', 422);
    }

    req.user.password = hashPassword(new_password);
    await req.user.save();

    return success(res, 'Password changed');
});

exports.setup2fa = asyncHandler(async (req, res) => {
    const secret = generateBase32Secret();
    req.user.second_factor_key = secret;
    req.user.is_2fa_enabled = false;
    await req.user.save();

    return success(res, 'Two factor setup created', {
        secret,
        otpauth_url: buildOtpAuthUrl('B2B Betting Super Admin', req.user.email, secret)
    });
});

exports.enable2fa = asyncHandler(async (req, res) => {
    if (!verifyCode(req.user.second_factor_key, req.body.code)) {
        return error(res, 'Invalid two factor code', 422);
    }

    req.user.is_2fa_enabled = true;
    await req.user.save();

    return success(res, 'Two factor authentication enabled');
});

exports.disable2fa = asyncHandler(async (req, res) => {
    const { password, code } = req.body;

    if (!verifyPassword(password, req.user.password)) {
        return error(res, 'Password is incorrect', 422);
    }

    if (req.user.is_2fa_enabled && !verifyCode(req.user.second_factor_key, code)) {
        return error(res, 'Invalid two factor code', 422);
    }

    req.user.second_factor_key = null;
    req.user.is_2fa_enabled = false;
    await req.user.save();

    return success(res, 'Two factor authentication disabled');
});

exports.listTenants = asyncHandler(async (req, res) => {
    const tenants = await Tenant.find().populate('subscription.plan').sort({ createdAt: -1 });
    return success(res, 'Tenants fetched', { tenants });
});

exports.createTenant = asyncHandler(async (req, res) => {
    const payload = {
        ...req.body,
        subscription: parseMaybeJson(req.body.subscription)
    };
    const tenantData = {
        brand_name: payload.brand_name,
        primary_domain: payload.primary_domain,
        frontend_url: payload.frontend_url,
        theme: payload.theme || 'default',
        website_title: payload.website_title || payload.brand_name,
        website_description: payload.website_description || '',
        logo_url: payload.logo_url,
        favicon_url: payload.favicon_url,
        custom_css: payload.custom_css,
        subscription: payload.subscription
    };

    await applyTenantUploads(req, tenantData);

    const tenant = await Tenant.create(tenantData);

    return success(res, 'Tenant created', { tenant }, 201);
});

exports.updateTenant = asyncHandler(async (req, res) => {
    const tenantData = {
        ...req.body,
        subscription: parseMaybeJson(req.body.subscription)
    };
    await applyTenantUploads(req, tenantData, req.params.tenantId);

    const tenant = await Tenant.findByIdAndUpdate(
        req.params.tenantId,
        tenantData,
        { new: true, runValidators: true }
    );

    if (!tenant) {
        return error(res, 'Tenant not found', 404);
    }

    return success(res, 'Tenant updated', { tenant });
});

exports.banTenant = asyncHandler(async (req, res) => {
    const tenant = await Tenant.findByIdAndUpdate(
        req.params.tenantId,
        {
            is_banned: req.body.is_banned !== false
        },
        { new: true }
    );

    if (!tenant) {
        return error(res, 'Tenant not found', 404);
    }

    return success(res, tenant.is_banned ? 'Tenant banned' : 'Tenant unbanned', { tenant });
});

exports.tenantUsers = asyncHandler(async (req, res) => {
    const users = await Admin.find({ tenant: req.params.tenantId }).select('-password -second_factor_key');
    return success(res, 'Tenant users fetched', { users });
});

exports.listPlans = asyncHandler(async (req, res) => {
    const plans = await Plan.find().sort({ price_per_month: 1 });
    return success(res, 'Plans fetched', { plans });
});

exports.createPlan = asyncHandler(async (req, res) => {
    const plan = await Plan.create(req.body);
    return success(res, 'Plan created', { plan }, 201);
});

exports.updatePlan = asyncHandler(async (req, res) => {
    const plan = await Plan.findByIdAndUpdate(req.params.planId, req.body, {
        new: true,
        runValidators: true
    });

    if (!plan) {
        return error(res, 'Plan not found', 404);
    }

    return success(res, 'Plan updated', { plan });
});

exports.deletePlan = asyncHandler(async (req, res) => {
    const plan = await Plan.findByIdAndDelete(req.params.planId);

    if (!plan) {
        return error(res, 'Plan not found', 404);
    }

    return success(res, 'Plan deleted');
});

exports.getOxapay = asyncHandler(async (req, res) => {
    const settings = await SuperOxapay.findOne().sort({ createdAt: -1 });
    return success(res, 'Oxapay settings fetched', { settings });
});

exports.updateOxapay = asyncHandler(async (req, res) => {
    const current = await SuperOxapay.findOne().sort({ createdAt: -1 });
    const settings = current
        ? await SuperOxapay.findByIdAndUpdate(current._id, req.body, { new: true, runValidators: true })
        : await SuperOxapay.create(req.body);

    return success(res, 'Oxapay settings saved', { settings });
});

exports.loginLogs = asyncHandler(async (req, res) => {
    const logs = await LoginLog.find({ login_type: 'super_admin' })
        .sort({ createdAt: -1 })
        .limit(Number(req.query.limit) || 100);

    return success(res, 'Login logs fetched', { logs });
});

exports.tenantLoginLogs = asyncHandler(async (req, res) => {
    const filter = { login_type: 'admin' };
    if (req.query.tenant) {
        filter.tenant = req.query.tenant;
    }

    const logs = await LoginLog.find(filter)
        .populate('tenant', 'brand_name primary_domain')
        .populate('admin', 'name email type')
        .sort({ createdAt: -1 })
        .limit(Number(req.query.limit) || 100);

    return success(res, 'Tenant login logs fetched', { logs });
});

exports.mySessions = asyncHandler(async (req, res) => {
    const sessions = await PersonalAccessToken.find({
        tokenable_id: req.user._id,
        tokenable_type: 'SuperAdmin',
        revoked_at: null
    }).sort({ createdAt: -1 });

    return success(res, 'Sessions fetched', { sessions });
});

exports.logoutSession = asyncHandler(async (req, res) => {
    const session = await PersonalAccessToken.findOneAndUpdate(
        {
            _id: req.params.sessionId,
            tokenable_id: req.user._id,
            tokenable_type: 'SuperAdmin'
        },
        { revoked_at: new Date() },
        { new: true }
    );

    if (!session) {
        return error(res, 'Session not found', 404);
    }

    return success(res, 'Session revoked');
});
