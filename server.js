import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoutes.js';
import productRouter from './routes/productRoutes.js';
import cartRouter from './routes/cartRoutes.js';
import orderRouter from './routes/orderRoutes.js';

// App config
const app = express();
const port = process.env.PORT || 4000;

// Connect to services
connectDB();
connectCloudinary();

// Define allowed origins
const allowedOrigins = ['https://www.watchlab.in', 'https://watchlab.in'];

// Comprehensive CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token', 'Origin', 'X-Requested-With', 'Accept'],
    credentials: true,
    maxAge: 86400, // Cache preflight request results for 24 hours
    preflightContinue: false,
    optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Error handler for CORS
app.use((err, req, res, next) => {
    if (err.message === 'Not allowed by CORS') {
        res.status(403).json({
            error: 'CORS not allowed for this origin'
        });
    } else {
        next(err);
    }
});

// API routes
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);

// Health check route
app.get('/', (req, res) => {
    res.status(200).json({ status: 'API Working' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server started on PORT: ${port}`);
});