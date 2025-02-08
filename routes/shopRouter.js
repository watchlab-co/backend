import express from 'express'
import { getShop } from '../controllers/shopController.js';
import adminAuth from '../middleware/adminAuth.js';

const shopeRouter = express.Router();

shopeRouter.get('/getShop', adminAuth, getShop)

export default shopeRouter;