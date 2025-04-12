import { v2 as cloudinary } from 'cloudinary'
import productModel from '../models/productModel.js';
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";


// Compress video function
const compressVideo = (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .outputOptions([
                "-preset veryfast",
                "-crf 28", // quality: lower means better quality but bigger file
                "-c:v libx264",
                "-c:a aac"
            ])
            .save(outputPath)
            .on("end", () => resolve(outputPath))
            .on("error", (err) => reject(err));
    });
};

const addProduct = async (req, res) => {
    try {
        const {
            name, description, price, discount, category,
            subCategory, colours, stock, dialColor, strapMaterial,
            features, movement, bestseller , productDate
        } = req.body;

        // Get files
        const image1 = req.files.image1?.[0];
        const image2 = req.files.image2?.[0];
        const image3 = req.files.image3?.[0];
        const image4 = req.files.image4?.[0];
        const video = req.files.video?.[0];

        const images = [image1, image2, image3, image4].filter(Boolean);

        // Upload images
        const imagesUrl = await Promise.all(
            images.map(async (item) => {
                const result = await cloudinary.uploader.upload(item.path, {
                    resource_type: "image"
                });
                fs.unlinkSync(item.path); // clean up temp file
                return result.secure_url;
            })
        );

        let videoUrl = [];
        if (video) {
            if (video.size > 10 * 1024 * 1024) {
                const tempOutputPath = path.join("uploads", `compressed_${Date.now()}.mp4`);
                await compressVideo(video.path, tempOutputPath);

                const compressedStats = fs.statSync(tempOutputPath);
                if (compressedStats.size > 10 * 1024 * 1024) {
                    throw new Error("Compressed video still exceeds 10MB. Try uploading a smaller file.");
                }

                const result = await cloudinary.uploader.upload(tempOutputPath, {
                    resource_type: "video"
                });
                videoUrl.push(result.secure_url);

                // Clean up
                fs.unlinkSync(video.path);
                fs.unlinkSync(tempOutputPath);
            } else {
                // Direct upload if under 10MB
                const result = await cloudinary.uploader.upload(video.path, {
                    resource_type: "video"
                });
                videoUrl.push(result.secure_url);
                fs.unlinkSync(video.path);
            }
        }

        const parsedStock = stock === "Yes" ? true : false;
        const AdminId = req.user.id;

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
            bestseller: bestseller === "true",
            image: imagesUrl,
            video: videoUrl,
            date: Date.now(),
            WPdate: productDate,
            shopId: AdminId
        };

        console.log('====================================');
        console.log('Product Data:', productData);
        console.log('====================================');

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