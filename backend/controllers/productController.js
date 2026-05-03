import asyncHandler from "../middleware/asyncHandler.js"
import Product from "../models/productModel.js";

// @desc Fetch all products
// @route GET /api/products
// @acess Public

const getProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({})
    res.json(products);
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


    


export {getProducts, getProductById, createProduct, updateProduct, deleteProduct};