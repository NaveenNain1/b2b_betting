require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).json({success:true, message:'Server running'});
});

const { handleWebhook } = require('./controllers/payment.controller');
app.post('/webhook/oxapay', handleWebhook);

const tenantRoutes = require('./routes/tenant.routes');
app.use('/tenant', tenantRoutes);

const superAdminRoutes = require('./routes/superAdmin.routes');
app.use('/super-admin', superAdminRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Server error'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
