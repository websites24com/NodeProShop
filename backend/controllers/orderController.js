import asyncHandler from "../middleware/asyncHandler.js";
import Order from "../models/orderModel.js";

/* =========================
   PAYPAL HELPERS
========================= */

const PAYPAL_API_URL =
    process.env.NODE_ENV === 'production'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';

const getPayPalAccessToken = async () => {
    const auth = Buffer.from(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_APP_SECRET}`
    ).toString('base64');

    const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    const data = await response.json();

    console.log('PAYPAL TOKEN STATUS:', response.status);

    if (!response.ok) {
        console.log('PAYPAL TOKEN ERROR:', data);
        throw new Error(data.error_description || 'Could not get PayPal access token');
    }

    return data.access_token;
};

// @desc Create PayPal order
// @route POST /api/orders/:id/paypal/create
// @access Private
const createPayPalOrder = asyncHandler(async (req, res) => {
    console.log('CREATE PAYPAL ORDER START');
    console.log('ORDER ID FROM PARAMS:', req.params.id);

    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    const paypalAmount = Number(order.totalPrice).toFixed(2);

    console.log('ORDER TOTAL PRICE FROM DB:', order.totalPrice);
    console.log('PAYPAL AMOUNT:', paypalAmount);

    if (!paypalAmount || Number(paypalAmount) <= 0 || Number.isNaN(Number(paypalAmount))) {
        res.status(400);
        throw new Error('Invalid PayPal order amount');
    }

    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: 'USD',
                        value: paypalAmount,
                    },
                },
            ],
        }),
    });

    const data = await response.json();

    console.log('CREATE PAYPAL RESPONSE STATUS:', response.status);
    console.log('CREATE PAYPAL RESPONSE DATA:', data);

    if (!response.ok) {
        res.status(500);
        throw new Error(
            data?.details?.[0]?.description ||
            data?.message ||
            'PayPal create order failed'
        );
    }

    res.status(200).json({ orderId: data.id });
});

// @desc Capture PayPal order
// @route POST /api/orders/:id/paypal/capture
// @access Private
const capturePayPalOrder = asyncHandler(async (req, res) => {
    console.log('CAPTURE PAYPAL ORDER START');
    console.log('ORDER ID FROM PARAMS:', req.params.id);
    console.log('REQUEST BODY:', req.body);

    const { paypalOrderId } = req.body;

    if (!paypalOrderId) {
        res.status(400);
        throw new Error('PayPal order ID is required');
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    const accessToken = await getPayPalAccessToken();

    const response = await fetch(
        `${PAYPAL_API_URL}/v2/checkout/orders/${paypalOrderId}/capture`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        }
    );

    const data = await response.json();

    console.log('CAPTURE PAYPAL RESPONSE STATUS:', response.status);
    console.log('CAPTURE PAYPAL RESPONSE DATA:', data);

    if (!response.ok) {
        res.status(500);
        throw new Error(
            data?.details?.[0]?.description ||
            data?.message ||
            'PayPal capture failed'
        );
    }

    res.status(200).json(data);
});

// @desc Create new order
// @route POST /api/orders
// @access Private
const addOrderItems = asyncHandler(async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
    }

    const order = new Order({
        orderItems: orderItems.map((orderItem) => ({
            ...orderItem,
            product: orderItem._id,
            _id: undefined
        })),
        user: req.user._id,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
    });

    const createdOrder = await order.save();

    res.status(201).json(createdOrder);
});

// @desc Get logged in user orders
// @route GET /api/orders/mine
// @access Private
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });

    res.status(200).json(orders);
});

// @desc Get Order by ID
// @route GET /api/orders/:id
// @access Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
        res.status(200).json(order);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc Update order to paid
// @route PUT /api/orders/:id/pay
// @access Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();

        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.payer?.email_address || req.body.email_address || '',
        };

        const updatedOrder = await order.save();

        res.status(200).json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc Update order to delivered
// @route PUT /api/orders/:id/deliver
// @access Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
    res.send('update order to delivered');
});

// @desc Get all orders
// @route GET /api/orders
// @access Private/Admin
const getOrders = asyncHandler(async (req, res) => {
    res.send('get all orders');
});

export {
    addOrderItems,
    getMyOrders,
    getOrderById,
    updateOrderToPaid,
    updateOrderToDelivered,
    getOrders,
    createPayPalOrder,
    capturePayPalOrder
};