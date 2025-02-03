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
app.use(express.json());

// Open CORS configuration - accept all origins
app.use(cors({
    origin: ['https://admin.watchlab.in', 'https://www.admin.watchlab.in', 'https://www.watchlab.in', 'https://www.watchlab.in'], 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token', 'Origin', 'X-Requested-With', 'Accept'],
    credentials: true
}));


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://admin.watchlab.in');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, token, Origin, X-Requested-With, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next();
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