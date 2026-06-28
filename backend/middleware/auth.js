const PersonalAccessToken = require('../models/PersonalAccessToken.model');
const SuperAdmin = require('../models/SuperAdmin.model');
const Admin = require('../models/Admin.model');
const Tenant = require('../models/Tenant.model');
const { hashToken } = require('../services/token.service');
const { error } = require('../utils/apiResponse');

const auth = (...allowedTypes) => async (req, res, next) => {
    try {
        const authHeader = req.get('authorization') || '';
        const plainTextToken = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : null;

        if (!plainTextToken) {
            return error(res, 'Unauthenticated', 401);
        }

        const accessToken = await PersonalAccessToken.findOne({
            token: hashToken(plainTextToken),
            revoked_at: null,
            $or: [
                { expires_at: null },
                { expires_at: { $gt: new Date() } }
            ]
        });

        if (!accessToken || !allowedTypes.includes(accessToken.tokenable_type)) {
            return error(res, 'Unauthenticated', 401);
        }

        const Model = accessToken.tokenable_type === 'SuperAdmin'
            ? SuperAdmin
            : Admin;
        const user = await Model.findById(accessToken.tokenable_id);

        if (!user) {
            return error(res, 'Unauthenticated', 401);
        }

        if (accessToken.tokenable_type === 'Admin') {
            if (user.status !== 'active') {
                return error(res, 'User disabled', 403);
            }

            const tenant = await Tenant.findById(user.tenant);
            if (!tenant || tenant.is_banned) {
                return error(res, 'Tenant is banned or unavailable', 403);
            }
            req.tenant = tenant;
        }

        accessToken.last_used_at = new Date();
        await accessToken.save();

        req.user = user;
        req.accessToken = accessToken;
        req.authType = accessToken.tokenable_type;

        return next();
    } catch (err) {
        return next(err);
    }
};

const requirePermission = (permission) => (req, res, next) => {
    if (req.authType !== 'Admin') {
        return next();
    }

    if (req.user.type === 'admin' || req.user.permissions.includes(permission)) {
        return next();
    }

    return error(res, 'Permission denied', 403);
};

module.exports = {
    auth,
    requirePermission
};
