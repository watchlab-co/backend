import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    image: { type: Array, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    sizes: { type: Array, required: true },
    bestseller: { type: Boolean, default: false },
    date: { type: Number, required: true },
    stock: { type: Boolean, required: true },
    dialColor: { type: String },
    strapMaterial: { type: String, required: true },
    features: { type: Array, required: true },
    movement: { type: String, required: true },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "admin", required: true }
}, { minimize: false });

const productModel = mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
