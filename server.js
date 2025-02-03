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
connectDB();
connectCloudinary();

// Proper CORS configuration
app.use(cors({
    origin: ['https://www.watchlab.in', 'https://watchlab.in'], // Allow only specific domains
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token'],
    credentials: true // Allow cookies/auth headers
}));

app.use(express.json());

// Ensure preflight requests are handled correctly
app.options('*', (req, res) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "https://www.watchlab.in");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, token");
    res.header("Access-Control-Allow-Credentials", "true");
    res.sendStatus(204);
});

// API routes
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);

app.get('/', (req, res) => {
    res.send('API Working');
});

// Start the server
app.listen(port, () => {
    console.log('Server started on PORT : ' + port);
});
