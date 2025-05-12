import shopModel from "../models/adminModel.js"

// Add products to cart
const getShop = async (req, res) => {
    try {
        if (req.query.is_singleShop) {
            const shopId = req.user.id;
            const shop = await shopModel.findById(shopId);

            if (!shop) {
                return res.status(404).json({ success: false, message: 'Shop not found' });
            }
            return res.json(shop);
        } else {
            
            const shops = await shopModel.find();
            return res.json(shops);
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

export { getShop }
