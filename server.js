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
app.use(cors({
    origin: ['https://admin.watchlab.in', 'https://www.admin.watchlab.in'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token'],
    credentials: true
}));
app.use(express.json());


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://www.admin.watchlab.in');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, token');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});



app.use(cors())

// API end points

app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);

app.get('/', (req, res) => {
    res.send('API Working')
})

// log
app.listen(port, () => {
    console.log('Server started on PORT : ' + port)
})