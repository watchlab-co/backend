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

// ✅ Fix: Proper CORS setup
const allowedOrigins = [
    'https://admin.watchlab.in',
    'https://www.admin.watchlab.in',
    'https://watchlab.in',
    'https://www.watchlab.in',
    "http://localhost:5174",
    "http://localhost:5173"
];

app.use(
    cors({
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'token'],
        credentials: true,
    })
);

// ✅ Fix: Ensure preflight requests (OPTIONS) are handled
app.options('*', cors()); 

// Middleware for JSON body parsing
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
