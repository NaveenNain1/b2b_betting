const express = require('express');

const controller = require('../controllers/superAdmin.controller');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();
const superAuth = auth('SuperAdmin');

router.post('/login', controller.login);
router.post('/bootstrap', controller.bootstrap);

router.patch('/security/password', superAuth, controller.changePassword);
router.post('/security/2fa/setup', superAuth, controller.setup2fa);
router.post('/security/2fa/enable', superAuth, controller.enable2fa);
router.post('/security/2fa/disable', superAuth, controller.disable2fa);

router.get('/tenants', superAuth, controller.listTenants);
router.post(
    '/tenants',
    superAuth,
    upload.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'favicon', maxCount: 1 }
    ]),
    controller.createTenant
);
router.patch(
    '/tenants/:tenantId',
    superAuth,
    upload.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'favicon', maxCount: 1 }
    ]),
    controller.updateTenant
);
router.patch('/tenants/:tenantId/ban', superAuth, controller.banTenant);
router.get('/tenants/:tenantId/users', superAuth, controller.tenantUsers);

router.get('/plans', superAuth, controller.listPlans);
router.post('/plans', superAuth, controller.createPlan);
router.patch('/plans/:planId', superAuth, controller.updatePlan);
router.delete('/plans/:planId', superAuth, controller.deletePlan);

router.get('/oxapay', superAuth, controller.getOxapay);
router.put('/oxapay', superAuth, controller.updateOxapay);

router.get('/logs/login', superAuth, controller.loginLogs);
router.get('/logs/tenant-login', superAuth, controller.tenantLoginLogs);

router.get('/sessions', superAuth, controller.mySessions);
router.delete('/sessions/:sessionId', superAuth, controller.logoutSession);

module.exports = router;
