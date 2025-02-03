import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoutes.js';
import productRouter from './routes/productRoutes.js';
import cartRouter from './routes/cartRoutes.js';
import orderRouter from './routes/orderRoutes.js';

const app = express();
const port = process.env.PORT || 4000;

// Middleware for JSON body parsing
app.use(express.json());

// Error Handling Middleware
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
};

// Connect to services
connectDB();
connectCloudinary();

// CORS Configuration - Allowing specific origins
const allowedOrigins = [
    'https://admin.watchlab.in',
    'https://www.admin.watchlab.in',
    'https://watchlab.in',
    'https://www.watchlab.in',
];

app.use(
    cors({
        origin: (origin, callback) => {
            if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
                callback(null, true);
            } else {
                callback(new Error('Not Allowed by CORS'), false);
            }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'token', 'Origin', 'X-Requested-With', 'Accept'],
        credentials: true,
    })
);

// Handling Preflight Requests (OPTIONS)
app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// API Routes
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);

// Root Route for Health Check
app.get('/', (req, res) => {
    res.send('API Working');
});

// Global Error Handling Middleware
app.use(errorHandler);

// Start Server
app.listen(port, () => {
    console.log(`Server started on PORT: ${port}`);
});

