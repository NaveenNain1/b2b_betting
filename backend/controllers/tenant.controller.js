const Tenant = require('../models/Tenant.model');
const Admin = require('../models/Admin.model');
const Plan = require('../models/Plan.model');
const KycSetting = require('../models/KycSetting.model');
const LoginLog = require('../models/LoginLog.model');
const AdminActivityLog = require('../models/AdminActivityLog.model');
const PersonalAccessToken = require('../models/PersonalAccessToken.model');
const permissions = require('../config/permissions');
const dnsRecords = require('../config/dns_record');
const themes = require('../config/themes');
const uploadToR2 = require('../utils/uploadToR2');
const { success, error } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { hashPassword, verifyPassword } = require('../services/password.service');
const { createAccessToken } = require('../services/token.service');
const {
    generateBase32Secret,
    verifyCode,
    buildOtpAuthUrl
} = require('../services/totp.service');

const sanitizeAdmin = (admin) => {
    const data = admin.toObject ? admin.toObject() : admin;
    delete data.password;
    delete data.second_factor_key;
    return data;
};

const logActivity = (req, action, module, description = null, meta = {}) => {
    return AdminActivityLog.create({
        admin: req.user._id,
        tenant: req.tenant._id,
        action,
        module,
        description,
        meta,
        ip_address: req.ip,
        user_agent: req.get('user-agent') || null
    });
};

const logTenantLogin = (req, payload) => {
    return LoginLog.create({
        ...payload,
        login_type: 'admin',
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

const getRequestTenantData = (req) => parseMaybeJson(req.body.tenant) || req.body;

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

exports.register = asyncHandler(async (req, res) => {
    const tenant = getRequestTenantData(req);
    const admin = parseMaybeJson(req.body.admin) || {
        name: req.body.admin_name,
        email: req.body.admin_email,
        password: req.body.admin_password || req.body.password
    };

    if (!tenant || !admin) {
        return error(res, 'Tenant and admin data are required', 422);
    }

    const exists = await Tenant.findOne({ primary_domain: tenant.primary_domain });
    if (exists) {
        return error(res, 'Tenant domain already exists', 409);
    }

    const tenantData = {
        brand_name: tenant.brand_name,
        primary_domain: tenant.primary_domain,
        frontend_url: tenant.frontend_url,
        theme: tenant.theme || 'default',
        website_title: tenant.website_title || tenant.brand_name,
        website_description: tenant.website_description || '',
        logo_url: tenant.logo_url,
        favicon_url: tenant.favicon_url,
        custom_css: tenant.custom_css,
        dns_records: dnsRecords,
        subscription: parseMaybeJson(tenant.subscription)
    };

    await applyTenantUploads(req, tenantData);

    const createdTenant = await Tenant.create(tenantData);

    const createdAdmin = await Admin.create({
        name: admin.name,
        email: admin.email,
        password: hashPassword(admin.password),
        type: 'admin',
        permissions,
        tenant: createdTenant._id
    });

    const token = await createAccessToken(createdAdmin, 'Admin', req);
    await logTenantLogin(req, {
        admin: createdAdmin._id,
        tenant: createdTenant._id,
        email: createdAdmin.email,
        status: 'success'
    });

    return success(res, 'Tenant registered', {
        token,
        tenant: createdTenant,
        user: sanitizeAdmin(createdAdmin)
    }, 201);
});

exports.login = asyncHandler(async (req, res) => {
    const { email, password, tenant_domain, two_factor_code } = req.body;
    const tenant = await Tenant.findOne({ primary_domain: tenant_domain });

    if (!tenant || tenant.is_banned) {
        await logTenantLogin(req, {
            tenant: tenant ? tenant._id : null,
            email: email || '',
            status: 'failed',
            reason: 'Tenant unavailable'
        });
        return error(res, 'Tenant unavailable', 403);
    }

    const admin = await Admin.findOne({
        email: String(email || '').toLowerCase(),
        tenant: tenant._id
    });

    if (!admin || !verifyPassword(password, admin.password) || admin.status !== 'active') {
        await logTenantLogin(req, {
            tenant: tenant._id,
            email: email || '',
            status: 'failed',
            reason: 'Invalid credentials'
        });
        return error(res, 'Invalid credentials', 401);
    }

    if (admin.is_2fa_enabled && !verifyCode(admin.second_factor_key, two_factor_code)) {
        await logTenantLogin(req, {
            admin: admin._id,
            tenant: tenant._id,
            email: admin.email,
            status: 'failed',
            reason: 'Invalid two factor code'
        });
        return error(res, 'Invalid two factor code', 422);
    }

    const token = await createAccessToken(admin, 'Admin', req);
    await logTenantLogin(req, {
        admin: admin._id,
        tenant: tenant._id,
        email: admin.email,
        status: 'success'
    });

    return success(res, 'Logged in', {
        token,
        tenant,
        user: sanitizeAdmin(admin)
    });
});

exports.me = asyncHandler(async (req, res) => {
    return success(res, 'Profile fetched', {
        user: sanitizeAdmin(req.user),
        tenant: req.tenant
    });
});

exports.updateProfile = asyncHandler(async (req, res) => {
    const allowed = ['name'];
    allowed.forEach((field) => {
        if (req.body[field] !== undefined) {
            req.user[field] = req.body[field];
        }
    });

    await req.user.save();
    await logActivity(req, 'update_profile', 'Profile');

    return success(res, 'Profile updated', { user: sanitizeAdmin(req.user) });
});

exports.changePassword = asyncHandler(async (req, res) => {
    const { current_password, new_password } = req.body;

    if (!verifyPassword(current_password, req.user.password)) {
        return error(res, 'Current password is incorrect', 422);
    }

    req.user.password = hashPassword(new_password);
    await req.user.save();
    await logActivity(req, 'change_password', 'Security');

    return success(res, 'Password changed');
});

exports.setup2fa = asyncHandler(async (req, res) => {
    const secret = generateBase32Secret();
    req.user.second_factor_key = secret;
    req.user.is_2fa_enabled = false;
    await req.user.save();

    return success(res, 'Two factor setup created', {
        secret,
        otpauth_url: buildOtpAuthUrl('B2B Betting Tenant', req.user.email, secret)
    });
});

exports.enable2fa = asyncHandler(async (req, res) => {
    if (!verifyCode(req.user.second_factor_key, req.body.code)) {
        return error(res, 'Invalid two factor code', 422);
    }

    req.user.is_2fa_enabled = true;
    await req.user.save();
    await logActivity(req, 'enable_2fa', 'Security');

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
    await logActivity(req, 'disable_2fa', 'Security');

    return success(res, 'Two factor authentication disabled');
});

exports.listUsers = asyncHandler(async (req, res) => {
    const users = await Admin.find({ tenant: req.tenant._id }).select('-password -second_factor_key');
    return success(res, 'Users fetched', { users });
});

exports.createUser = asyncHandler(async (req, res) => {
    const user = await Admin.create({
        name: req.body.name,
        email: req.body.email,
        password: hashPassword(req.body.password),
        type: req.body.type || 'sub-admin',
        permissions: req.body.permissions || [],
        tenant: req.tenant._id
    });

    await logActivity(req, 'create_user', 'Users', null, { user_id: user._id });
    return success(res, 'User created', { user: sanitizeAdmin(user) }, 201);
});

exports.updateUser = asyncHandler(async (req, res) => {
    const update = { ...req.body };
    delete update.password;
    delete update.tenant;

    const user = await Admin.findOneAndUpdate(
        { _id: req.params.userId, tenant: req.tenant._id },
        update,
        { new: true, runValidators: true }
    ).select('-password -second_factor_key');

    if (!user) {
        return error(res, 'User not found', 404);
    }

    await logActivity(req, 'update_user', 'Users', null, { user_id: user._id });
    return success(res, 'User updated', { user });
});

exports.updateUserPassword = asyncHandler(async (req, res) => {
    const user = await Admin.findOne({
        _id: req.params.userId,
        tenant: req.tenant._id
    });

    if (!user) {
        return error(res, 'User not found', 404);
    }

    user.password = hashPassword(req.body.password);
    await user.save();
    await logActivity(req, 'update_user_password', 'Users', null, { user_id: user._id });

    return success(res, 'User password updated');
});

exports.deleteUser = asyncHandler(async (req, res) => {
    if (String(req.user._id) === String(req.params.userId)) {
        return error(res, 'You cannot delete your own account', 422);
    }

    const user = await Admin.findOneAndDelete({
        _id: req.params.userId,
        tenant: req.tenant._id
    });

    if (!user) {
        return error(res, 'User not found', 404);
    }

    await logActivity(req, 'delete_user', 'Users', null, { user_id: user._id });
    return success(res, 'User deleted');
});

exports.permissions = asyncHandler(async (req, res) => {
    return success(res, 'Permissions fetched', { permissions });
});

exports.plans = asyncHandler(async (req, res) => {
    const plans = await Plan.find({ is_active: true }).sort({ price_per_month: 1 });
    return success(res, 'Plans fetched', { plans });
});

exports.updateSubscription = asyncHandler(async (req, res) => {
    const plan = await Plan.findById(req.body.plan_id);

    if (!plan || !plan.is_active) {
        return error(res, 'Plan not found', 404);
    }

    req.tenant.subscription = {
        plan: plan._id,
        status: req.body.status || 'active',
        starts_at: req.body.starts_at || new Date(),
        ends_at: req.body.ends_at || null
    };
    await req.tenant.save();
    await logActivity(req, 'update_subscription', 'Subscription', null, { plan_id: plan._id });

    return success(res, 'Subscription updated', { tenant: req.tenant });
});

exports.getKycSettings = asyncHandler(async (req, res) => {
    const settings = await KycSetting.findOne({ tenant: req.tenant._id });
    return success(res, 'KYC settings fetched', { settings });
});

exports.saveKycSettings = asyncHandler(async (req, res) => {
    const settings = await KycSetting.findOneAndUpdate(
        { tenant: req.tenant._id },
        {
            tenant: req.tenant._id,
            is_kyc_required: req.body.is_kyc_required,
            kyc_fields: req.body.kyc_fields || []
        },
        { new: true, upsert: true, runValidators: true }
    );

    await logActivity(req, 'save_kyc_settings', 'KYC');
    return success(res, 'KYC settings saved', { settings });
});

exports.loginLogs = asyncHandler(async (req, res) => {
    const logs = await LoginLog.find({ tenant: req.tenant._id })
        .sort({ createdAt: -1 })
        .limit(Number(req.query.limit) || 100);

    return success(res, 'Login logs fetched', { logs });
});

exports.activityLogs = asyncHandler(async (req, res) => {
    const logs = await AdminActivityLog.find({ tenant: req.tenant._id })
        .populate('admin', 'name email')
        .sort({ createdAt: -1 })
        .limit(Number(req.query.limit) || 100);

    return success(res, 'Activity logs fetched', { logs });
});

exports.updateMaintenance = asyncHandler(async (req, res) => {
    req.tenant.maintenance_mode = Boolean(req.body.maintenance_mode);
    req.tenant.maintenance_mode_text = req.body.maintenance_mode_text || null;
    await req.tenant.save();
    await logActivity(req, 'update_maintenance_mode', 'Settings');

    return success(res, 'Maintenance mode updated', { tenant: req.tenant });
});

exports.connectDomain = asyncHandler(async (req, res) => {
    const domain = String(req.body.domain || '').toLowerCase().trim();
    if (!domain) {
        return error(res, 'Domain is required', 422);
    }

    const exists = req.tenant.connected_domains.some((item) => item.domain === domain);
    if (!exists) {
        req.tenant.connected_domains.push({ domain });
    }
    await req.tenant.save();
    await logActivity(req, 'connect_domain', 'Domains', null, { domain });

    return success(res, 'Domain connected', {
        tenant: req.tenant,
        required_records: dnsRecords
    });
});

exports.dnsRecords = asyncHandler(async (req, res) => {
    return success(res, 'DNS records fetched', {
        records: req.tenant.dns_records.length ? req.tenant.dns_records : dnsRecords
    });
});

exports.updateTheme = asyncHandler(async (req, res) => {
    const payload = req.body;

    if (req.files?.logo?.[0]) {
        const uploaded = await uploadToR2(req.files.logo[0], `tenants/${req.tenant._id}/theme`);
        req.tenant.logo_url = uploaded.url;
    }

    if (req.files?.favicon?.[0]) {
        const uploaded = await uploadToR2(req.files.favicon[0], `tenants/${req.tenant._id}/theme`);
        req.tenant.favicon_url = uploaded.url;
    }

    ['theme', 'custom_css', 'website_title', 'website_description'].forEach((field) => {
        if (payload[field] !== undefined) {
            req.tenant[field] = payload[field];
        }
    });

    await req.tenant.save();
    await logActivity(req, 'update_theme', 'Themes');

    return success(res, 'Theme updated', {
        tenant: req.tenant,
        available_themes: themes
    });
});

exports.themes = asyncHandler(async (req, res) => {
    return success(res, 'Themes fetched', { themes });
});

exports.mySessions = asyncHandler(async (req, res) => {
    const sessions = await PersonalAccessToken.find({
        tokenable_id: req.user._id,
        tokenable_type: 'Admin',
        revoked_at: null
    }).sort({ createdAt: -1 });

    return success(res, 'Sessions fetched', { sessions });
});

exports.logoutSession = asyncHandler(async (req, res) => {
    const session = await PersonalAccessToken.findOneAndUpdate(
        {
            _id: req.params.sessionId,
            tokenable_id: req.user._id,
            tokenable_type: 'Admin'
        },
        { revoked_at: new Date() },
        { new: true }
    );

    if (!session) {
        return error(res, 'Session not found', 404);
    }

    return success(res, 'Session revoked');
});
