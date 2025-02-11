import { v2 as cloudinary } from 'cloudinary'
import productModel from '../models/productModel.js';


const addProduct = async (req, res) => {
    try {
        const { name, description, price, discount, category, subCategory, colours, stock, dialColor, strapMaterial, features, movement, bestseller } = req.body;
        
        
        // Get images from request
        const image1 = req.files.image1 && req.files.image1[0];
        const image2 = req.files.image2 && req.files.image2[0];
        const image3 = req.files.image3 && req.files.image3[0];
        const image4 = req.files.image4 && req.files.image4[0];

        // Filter out undefined images
        const images = [image1, image2, image3, image4].filter((item) => item !== undefined);

        // Upload images to cloudinary
        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url;
            })
        );
        const parsedStock = stock === "Yes" ? true : false;

        const AdminId = req.user.id; // Assuming user authentication middleware adds `req.user`

        const productData = {
            name,
            description,
            price: Number(price),
            discount: Number(discount),
            category,
            subCategory,
            colours: JSON.parse(colours),
            stock: parsedStock,
            strapMaterial,
            features: JSON.parse(features),
            movement,
            bestseller: bestseller === "true" ? true : false,
            image: imagesUrl,
            date: Date.now(),
            shopId: AdminId
        };

        // Create and save new product
        const product = new productModel(productData);
        await product.save();

        res.json({ success: true, message: 'Product added successfully' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export default addProduct;

const listProductsByShop = async (req, res) => {
    const id = req.user.id
    try {
        const products = await productModel.find({ shopId: id });
        res.json({ success: true, products })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const listallProduct = async (req, res) => {
    try {
        const products = await productModel.find().sort({ createdAt: -1 });
        res.json({ success: true, products });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};



const removeProduct = async (req, res) => {

    try {
        await productModel.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: 'Product removed' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

const singleProduct = async (req, res) => {

    try {
        const { productId } = req.params

        const product = await productModel.findById(productId)
        res.json({ success: true, product })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

const UpdateProduct = async (req, res) => {

    try {
        const { productId } = req.params;
        const updateData = req.body;

        

        const updatedProduct = await productModel.findByIdAndUpdate(productId, updateData, {
            new: true,
            runValidators: true
        });

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.json({ success: true, message: 'Product updated successfully', product: updatedProduct });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }

}

export { addProduct, listProductsByShop, UpdateProduct, removeProduct, singleProduct, listallProduct }