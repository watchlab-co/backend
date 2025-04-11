import express from 'express'
import { allOrders, placeOrder, verifyStripe, PlaceOrderCashfree, placeOrderRazorpay, placeOrderStripe, updateStatus, userOrders, verifyRazorpay, verifyCashfree } from '../controllers/orderController.js'
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'

const orderRouter = express.Router()

// Admin features
orderRouter.post('/list', adminAuth, allOrders)
orderRouter.post('/status', adminAuth, updateStatus)

// Payment features
orderRouter.post('/place', authUser, placeOrder) // cod place order
orderRouter.post('/razorpay', authUser, placeOrderRazorpay)
orderRouter.post('/stripe', authUser, placeOrderStripe)
orderRouter.post('/cashfree', authUser, PlaceOrderCashfree)
orderRouter.post('/verifyCashfree', authUser, verifyCashfree)

// User features
orderRouter.post('/userorders', authUser, userOrders)

// Verify Payment
orderRouter.post('/verifyStripe', authUser, verifyStripe)
orderRouter.post('/verifyRazorpay', authUser, verifyRazorpay)


export default orderRouter;