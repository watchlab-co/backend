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

// ✅ Fix: Correct CORS setup
const allowedOrigins = [
    'https://admin.watchlab.in',
    'https://www.admin.watchlab.in',
    'https://watchlab.in',
    'https://www.watchlab.in',
    'http://localhost:5174',
    'http://localhost:5173'
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('CORS not allowed'), false);
            }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'token'],
        credentials: true,
    })
);

// ✅ Fix: Ensure preflight (`OPTIONS`) requests are handled correctly
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, token");
    res.header("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

// Middleware for JSON body parsing (Fix 413 Error)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to services
connectDB();
connectCloudinary();

// API Routes
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);

// Root Route for Health Check
app.get('/', (req, res) => {
    res.send('API Working');
});

// Start Server
app.listen(port, () => {
    console.log(`Server started on PORT: ${port}`);
});
