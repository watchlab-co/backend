import jwt from 'jsonwebtoken';

const adminAuth = async (req, res, next) => {
    try {
        const { token } = req.headers
        
        if (!token) {
            return res.status(401).json({ success: false, message: "Not authorized, login again" });
        }

        // Verify and decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded || !decoded.email || !decoded.id) {
            return res.status(401).json({ success: false, message: "Invalid token, login again" });
        }

        // Attach user details to the request
        req.user = {
            email: decoded.email,
            id: decoded.id
        };

        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ success: false, message: "Authentication failed" });
    }
};

export default adminAuth;
