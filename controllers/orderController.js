import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from 'stripe'
import razorpay from 'razorpay'
import dotenv from 'dotenv';
dotenv.config();  // This loads the environment variables from .env file
import { Cashfree } from "cashfree-pg";
import axios from "axios";
import mongoose from "mongoose";


// Global variables
const currency = 'inr'
const deliveryCharge = 10

// Gateway Initialize of Stripe
// Initialize Stripe with API key from .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Gateway Initialize of Razorpay
const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

// Placing Order using COD
const placeOrder = async (req, res) => {
    try {

        const { userId, items, amount, address } = req.body;

        const orderData = {
            userId,
            items,
            amount,
            address,
            paymentMethod: 'COD',
            payment: false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        await userModel.findByIdAndUpdate(userId, { cartData: {} })

        res.json({ success: true, message: 'Order Placed' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, nessage: error.nessage })
    }
}

// Placing Order using Stripe
const placeOrderStripe = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;
        const { origin } = req.headers;

        const orderData = {
            userId,
            items,
            amount,
            address,
            paymentMethod: 'Stripe',
            payment: false,
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        const line_items = items.map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }));

        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: 'Delivery Charges'
                },
                unit_amount: deliveryCharge * 100
            },
            quantity: 1
        });

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment'
        });

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// Verify Stripe 
const verifyStripe = async (req, res) => {
    const { orderId, success, userId } = req.body

    try {

        if (success === 'true') {
            await orderModel.findByIdAndUpdate(orderId, { payment: true })
            await userModel.findByIdAndUpdate(userId, { cartData: {} })
            res.json({ success: true })
        } else {
            await orderModel.findByIdAndDelete(orderId)
            res.json({ success: false })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, nessage: error.nessage })
    }
}

// Placing Order using Razorpay
const placeOrderRazorpay = async (req, res) => {
    try {

        const { userId, items, amount, address } = req.body;

        const orderData = {
            userId,
            items,
            amount,
            address,
            paymentMethod: 'Razorpay',
            payment: false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        const options = {
            amount: amount * 100,
            currency: currency.toUpperCase(),
            receipt: newOrder._id.toString(),
        }

        await razorpayInstance.orders.create(options, (error, order) => {
            if (error) {
                console.log(error)
                return res.json({ success: false, message: error })
            }
            res.json({ success: true, order })
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, nessage: error.nessage })
    }
}

// All Orders data for admin panel
const allOrders = async (req, res) => {
    try {

        const orders = await orderModel.find({})
        res.json({ success: true, orders })

    } catch (error) {
        console.log(error)
        res.json({ success: false, nessage: error.nessage })
    }

}

// User Order data for frontend
const userOrders = async (req, res) => {
    try {

        const { userId } = req.body
        const orders = await orderModel.find({ userId })
        res.json({ success: true, orders })

    } catch (error) {
        console.log(error)
        res.json({ success: false, nessage: error.nessage })
    }

}

// Update order status from Admin panel
const updateStatus = async (req, res) => {
    try {

        const { orderId, status } = req.body
        const order = await orderModel.findByIdAndUpdate(orderId, { status })
        res.json({ success: true, message: 'Status Updated' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, nessage: error.nessage })
    }
}

const verifyRazorpay = async (req, res) => {
    try {

        const { userId, razorpay_order_id } = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)
        console.log('Order info : ', orderInfo)
        if (orderInfo.status === 'attempt') {
            await orderModel.findByIdAndUpdate(orderInfo.receipt, { payment: true });
            await userModel.findByIdAndUpdate(userId, { cartData: {} })
            res.json({ success: true, message: 'Payment Successful' })
        } else {
            res.json({ success: false, message: 'Payment Failed' })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, nessage: error.nessage })
    }
}


const PlaceOrderCashfree = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;

        const orderData = {
            userId,
            items,
            amount,
            address,
            paymentStatus: 'PENDING',
            status: 'Order Placed',
            paymentMethod: 'Cashfree',
            payment: false,
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        const order = await newOrder.save();


        const payload = {
            order_id: order._id.toString(),
            order_amount: amount,
            order_currency: "INR",
            customer_details: {
                customer_id: userId,
                customer_name: address.firstName || "Shamil",
                customer_email: address.email || "shamilamiyan@gmail.com",
                customer_phone: "+919090407368"
            }
        };


        // Using direct axios call instead of SDK
        const response = await axios.post(
            'https://api.cashfree.com/pg/orders', // Use sandbox for testing
            payload,
            {
                headers: {
                    'x-client-id': process.env.CASHFREE_CLIENT_ID,
                    'x-client-secret': process.env.CASHFREE_CLIENT_SECRET,
                    'x-api-version': '2023-08-01', // Use a supported API version
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('====================================');
        console.log(response);
        console.log('====================================');

        res.status(200).json({ success: true, order: response.data });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.response?.data?.message || error.message
        });
    }
};

const verifyCashfree = async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required"
            });
        }

        // Get user ID from the authentication token
        const userId = req.user.id;

        // Find the order in your database
        const order = await orderModel.findOne({
            _id: orderId,
            userId: userId
        });

        // Check if the order exists
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }



        // Fetch payment status from Cashfree API
        // const cashfreeApiUrl = process.env.CASHFREE_MODE === 'production'
        //     ? 'https://api.cashfree.com/pg/orders/'
        //     : 'https://sandbox.cashfree.com/pg/orders/';

        const response = await axios.get(
            `https://api.cashfree.com/pg/orders/${orderId}`,
            {
                headers: {
                    'x-client-id': process.env.CASHFREE_CLIENT_ID,
                    'x-client-secret': process.env.CASHFREE_CLIENT_SECRET,
                    'x-api-version': '2023-08-01',
                    'Content-Type': 'application/json'
                }
            }
        );

        const paymentData = response.data;
    
        // Check payment status
        if (paymentData.order_status === "PAID") {
            // Payment successful
            const orderUpdate = await orderModel.findByIdAndUpdate(orderId, {
                paymentStatus: 'PAID',
                payment: true,
                paymentMethod: 'Cashfree',
                paymentDetails: {
                    paymentId: paymentData.cf_payment_id || null,
                    paymentMode: paymentData.payment_method?.type || null,
                    paymentTime: new Date(),
                    transactionId: paymentData.cf_order_id,
                    paymentData: paymentData
                },
                status: 'Order verified'
            }, { new: true });

            return res.status(200).json({
                success: true,
                message: "Payment verified successfully",
            });
        } else {
            const errorOrder = await orderModel.findByIdAndUpdate(orderId, {
                paymentStatus: 'FAILED',
                payment: true,
                paymentMethod: 'Cashfree',
                paymentDetails: {
                    paymentId: paymentData.cf_payment_id || null,
                    paymentMode: paymentData.payment_method?.type || null,
                    paymentTime: new Date(),
                    transactionId: paymentData.cf_order_id,
                    paymentData: paymentData
                },
                status: 'Order failed'
            }, { new: true });

            return res.status(200).json({
                success: false,
                message: `Payment ${paymentData.order_status.toLowerCase()}`,
                order: {
                    orderId: order.orderId,
                    status: order.orderStatus,
                    paymentStatus: order.paymentStatus
                }
            });
        }
    } catch (error) {
        console.error("Cashfree verification error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export { placeOrder, verifyCashfree, verifyRazorpay, placeOrderStripe, PlaceOrderCashfree, placeOrderRazorpay, verifyStripe, allOrders, userOrders, updateStatus }