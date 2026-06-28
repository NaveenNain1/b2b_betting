const express = require('express');

const controller = require('../controllers/tenant.controller');
const { auth, requirePermission } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();
const tenantAuth = auth('Admin');

router.get('/',(req,res)=>{
    res.status(200).json({status:true,message:'tenant routes working...'})
});

router.post(
    '/register',
    upload.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'favicon', maxCount: 1 }
    ]),
    controller.register
);
router.post('/login', controller.login);

router.get('/me', tenantAuth, controller.me);
router.patch('/profile', tenantAuth, controller.updateProfile);
router.patch('/security/password', tenantAuth, controller.changePassword);
router.post('/security/2fa/setup', tenantAuth, controller.setup2fa);
router.post('/security/2fa/enable', tenantAuth, controller.enable2fa);
router.post('/security/2fa/disable', tenantAuth, controller.disable2fa);

router.get('/users', tenantAuth, requirePermission('Users'), controller.listUsers);
router.post('/users', tenantAuth, requirePermission('Users'), controller.createUser);
router.patch('/users/:userId', tenantAuth, requirePermission('Users'), controller.updateUser);
router.patch('/users/:userId/password', tenantAuth, requirePermission('Users'), controller.updateUserPassword);
router.delete('/users/:userId', tenantAuth, requirePermission('Users'), controller.deleteUser);

router.get('/permissions', tenantAuth, controller.permissions);

router.get('/plans', tenantAuth, controller.plans);
router.patch('/subscription', tenantAuth, controller.updateSubscription);

router.get('/kyc-settings', tenantAuth, requirePermission('KYC'), controller.getKycSettings);
router.put('/kyc-settings', tenantAuth, requirePermission('KYC'), controller.saveKycSettings);

router.get('/logs/login', tenantAuth, controller.loginLogs);
router.get('/logs/activity', tenantAuth, controller.activityLogs);

router.patch('/maintenance-mode', tenantAuth, requirePermission('Settings'), controller.updateMaintenance);
router.post('/domains', tenantAuth, requirePermission('Settings'), controller.connectDomain);
router.get('/dns-records', tenantAuth, requirePermission('Settings'), controller.dnsRecords);

router.get('/themes', tenantAuth, controller.themes);
router.put(
    '/themes',
    tenantAuth,
    requirePermission('Settings'),
    upload.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'favicon', maxCount: 1 }
    ]),
    controller.updateTheme
);

router.get('/sessions', tenantAuth, controller.mySessions);
router.delete('/sessions/:sessionId', tenantAuth, controller.logoutSession);

module.exports = router;
