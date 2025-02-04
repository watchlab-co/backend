import { v2 as cloudinary } from 'cloudinary'
import productModel from '../models/productModel.js';


const addProduct = async (req, res) => {
    try {

        const { name, description, price, category, subCategory, sizes, bestseller } = req.body;
        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined)

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' })
                return result.secure_url
            })
        )
        const AdminId = req.user.id
        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            sizes: JSON.parse(sizes),
            image: imagesUrl,
            date: Date.now(),
            shopId: AdminId
        }
        const product = new productModel(productData)
        await product.save()

        res.json({ success: true, message: 'Product added' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

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
        const products = await productModel.find();
        res.json({ success: true, products })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}



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
        console.log(productId);

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