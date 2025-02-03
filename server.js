import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/userRoutes.js'
import productRouter from './routes/productRoutes.js'
import cartRouter from './routes/cartRoutes.js'
import orderRouter from './routes/orderRoutes.js'

// App config
const app = express()
const port = process.env.PORT || 4000
connectDB();
connectCloudinary()

// Middlewares
app.use(express.json())

// Correct CORS setup (remove redundant calls)
app.use(cors({
    origin: '*', // Allows all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Specify methods
    allowedHeaders: ['Content-Type', 'Authorization', 'token'], // Specify headers
    credentials: true // Allow credentials if needed
}));

// Handle preflight requests
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
  });
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Headers","*")
  })

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
