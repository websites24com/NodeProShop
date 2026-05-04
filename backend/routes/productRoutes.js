import express from 'express';
const router = express.Router();
import { protect, admin } from '../middleware/authMiddleware.js'
import { getProductById, getProducts, createProduct, updateProduct, deleteProduct, createReview} from '../controllers/productController.js';

router.route('/')
.get(getProducts)
.post(protect, admin,createProduct)

router.route('/:id')
.get(getProductById )
.put(protect, admin, updateProduct)
.delete(protect, admin, deleteProduct);

router.route('/:id/reviews')
.post(protect, createReview) 

export default router;