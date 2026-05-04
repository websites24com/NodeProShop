import asyncHandler from "../middleware/asyncHandler.js"
import Product from "../models/productModel.js";

// @desc Fetch all products
// @route GET /api/products
// @acess Public

const getProducts = asyncHandler(async (req, res) => {
    const pageSize = 2;

// 1. Get current page from URL
const pageNumberFromQuery = req.query.pageNumber;
const page = Number(pageNumberFromQuery) || 1;

// 2. Count all products
const totalProducts = await Product.countDocuments({});

// 3. Calculate how many pages exist
const totalPages = Math.ceil(totalProducts / pageSize);

// 4. Calculate how many items to skip
const skip = pageSize * (page - 1);

// 5. Get products for current page
const products = await Product.find({})
  .limit(pageSize)
  .skip(skip);

// 6. Send response
res.json({
  products: products,
  page: page,
  pages: totalPages,
});
})

// @desc Fetch individual product
// @route GET /api/products/:id
// @acess Public

const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
    if (product) {
        return res.json(product)
    } else {
        res.status(404)
        throw new Error('Resource not found')
    }
    
});

// @desc create product
// @route POST /api/products
// @acess Private/Admin

const createProduct = asyncHandler(async (req, res) => {
    const product = new Product({
        name: 'sample name',
        price: 0,
        user: req.user._id,
        image: 'images/sample/jpg',
        brand: 'sample brand',
        category: 'sample category',
        countInStock: 0,
        numReviews: 0,
        description: 'Sample description'
    })

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
})

// @desc Update a product
// @route PUT/api/products/:id
// @acess Private/Admin

const updateProduct = asyncHandler(async (req, res) => {
    const { name, price, description, image, brand, category, countInStock} = req.body;

    const product = await Product.findById(req.params.id)

    if (product) {
        product.name = name;
        product.price = price;
        product.description = description;
        product.image = image;
        product.brand = brand;
        product.category = category;
        product.countInStock = countInStock;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404)
        throw new Error('Resource not found')
    }

})

// @desc delete a product
// @route DELETE/api/products/:id
// @acess Private/Admin

const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)

    if (product) {
        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Resource not found');
    }
});

// @desc create a new review
// @route POST /api/products/:id/reviews
// @acess Private

const createReview = asyncHandler(async (req, res) => {

    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id)

    if (product) {
        const alreadyReviewed = product.reviews.find((review) => review.user.toString() === req.user._id.toString());

        if (alreadyReviewed) {
            res.status(400);
            throw new Error('Product already reviewed');
        }

        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id
        }
        
        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;  
        await product.save();
        res.status(201).json({ message: 'Review added' });
    } else {
        res.status(404);
        throw new Error('Resource not found');
    }
}); 


    


export {getProducts, getProductById, createProduct, updateProduct, deleteProduct, createReview};