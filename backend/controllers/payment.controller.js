const crypto = require('crypto');
const SuperOxapay = require('../models/SuperOxapay.model');
const Tenant = require('../models/Tenant.model');
const Plan = require('../models/Plan.model');
const { success, error } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /tenant/payment/networks - Get enabled payment networks configured by Super Admin
exports.getNetworks = asyncHandler(async (req, res) => {
    const settings = await SuperOxapay.findOne().sort({ createdAt: -1 });
    if (!settings) {
        return success(res, 'No payment configuration found', { networks: [] });
    }
    const enabled = settings.networks.filter(n => n.is_enabled);
    return success(res, 'Networks fetched', { networks: enabled });
});

// POST /tenant/payment/initiate - Initiate white-label payment
exports.initiatePayment = asyncHandler(async (req, res) => {
    const { plan_id, pay_currency, network } = req.body;

    if (!plan_id || !pay_currency) {
        return error(res, 'Plan ID and pay currency are required', 422);
    }

    const plan = await Plan.findById(plan_id);
    if (!plan || !plan.is_active) {
        return error(res, 'Plan not found or inactive', 404);
    }

    const settings = await SuperOxapay.findOne().sort({ createdAt: -1 });
    if (!settings || !settings.api_key) {
        return error(res, 'Payment gateway not configured by administrator', 400);
    }

    const description = `${req.tenant._id}_${plan._id}_${(Math.random()*1000)}`;
    const orderId = Math.floor(Math.random()*100000)+"_"+(Date.now());
    const callbackUrl = `${process.env.APP_URL || 'https://admin.madarchod.tech/api'}/webhook/oxapay`;
// console.log(orderId);
    const body = {
        amount: plan.price_per_month,
        currency: 'USD',
        pay_currency,
        network: network,
        lifeTime: 60,
        order_id: orderId,
        callback_url: callbackUrl,
        description:description
    };

    try {
        const response = await fetch('https://api.oxapay.com/v1/payment/white-label', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'merchant_api_key': settings.api_key
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        if (data.status !== 200) {
            return error(res, data   || 'Payment initiation failed', 400);
        }

        return success(res, 'Payment initiated', {
            address: data.data.address,
            amount: data.data.amount,
            pay_currency: data.data.pay_currency,
            network: data.data.network,
            track_id: data.data.track_id,
            lifetime: data.data.lifetime || 60,
            order_id: orderId,
            qr_code:data.data.qr_code
        });
    } catch (err) {
        return error(res, `Failed to communicate with payment gateway: ${err.message}`, 500);
    }
});

// POST /webhook/oxapay - Public webhook endpoint
exports.handleWebhook = async (req, res) => {
    try {
        const settings = await SuperOxapay.findOne().sort({ createdAt: -1 });
        if (!settings || !settings.api_key) {
            console.error('OxaPay webhook received but api_key is missing from DB');
            return res.status(400).send('not configured');
        }

        // Validate HMAC signature if provided
        const signature = req.headers['hmac-signature'];
        if (signature) {
            const calculated = crypto
                .createHmac('sha512', settings.api_key)
                .update(JSON.stringify(req.body))
                .digest('hex');
            if (calculated !== signature) {
                console.warn('OxaPay webhook HMAC signature mismatch');
                return res.status(401).send('invalid signature');
            }
        }

        const { status, order_id, track_id,description } = req.body;
        console.log(`OxaPay webhook info - Track: ${track_id}, Order: ${order_id}, Status: ${status}`);

        if (status === 'Paid') {
            const parts = (description || '').split('_');
            if (parts.length >= 2) {
                const [tenantId, planId] = parts;
                const tenant = await Tenant.findById(tenantId);
                const plan = await Plan.findById(planId);

                if (tenant && plan) {
                    tenant.subscription = {
                        plan: plan._id,
                        status: 'active',
                        starts_at: new Date(),
                        ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
                    };
                    await tenant.save();
                    console.log(`Tenant ${tenant.brand_name} subscription activated for plan ${plan.name}`);
                }
            }
        }

        return res.status(200).send('ok');
    } catch (err) {
        console.error('Error handling OxaPay webhook:', err);
        return res.status(500).send('internal error');
    }
};
