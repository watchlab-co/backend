import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
    userId:{type:String,required:true},
    items:{type:Array,required:true},
    amount:{type:Number,required:true},
    address:{type:Object,required:true},
    status:{type:String,required:true, default:'Order Placed'},
    paymentStatus:{type:String,required:true, default:'PENDING'},
    paymentMethod:{type:String,required:true},
    payment:{type:Boolean,required:true, default:false},
    paymentDetails: {
        paymentId: { type: String, default: null },
        paymentMode: { type: String, default: null },
        paymentTime: { type: Date, default: null },
        transactionId: { type: String, default: null },
        paymentData: { type: Object, default: {} }
    },

    date:{type:Number,required:true}
})

const orderModel = mongoose.models.order || mongoose.model('order',orderSchema)

export default orderModel;