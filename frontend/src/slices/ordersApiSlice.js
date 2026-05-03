import { apiSlice } from './apiSlice';
import { ORDERS_URL, PAYPAL_URL } from '../constants';

export const ordersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createOrder: builder.mutation({
            query: (order) => ({
                url: ORDERS_URL,
                method: 'POST',
                body: { ...order },
            }),
        }),

        getOrderDetails: builder.query({
            query: (orderId) => ({
                url: `${ORDERS_URL}/${orderId}`,
            }),
            keepUnusedDataFor: 5,
        }),

        payOrder: builder.mutation({
            query: ({ orderId, details }) => ({
                url: `${ORDERS_URL}/${orderId}/pay`,
                method: 'PUT',
                body: { ...details },
            }),
        }),

        getPayPalClientId: builder.query({
            query: () => ({
                url: PAYPAL_URL,
            }),
            keepUnusedDataFor: 5,
        }),

        createPayPalOrder: builder.mutation({
            query: (orderId) => ({
                url: `${ORDERS_URL}/${orderId}/paypal/create`,
                method: 'POST',
            }),
        }),

        capturePayPalOrder: builder.mutation({
            query: ({ orderId, paypalOrderId }) => ({
                url: `${ORDERS_URL}/${orderId}/paypal/capture`,
                method: 'POST',
                body: { paypalOrderId },
            }),
        }),

        getMyOrders: builder.query({
            query: () => ({
                url: `${ORDERS_URL}/mine`,
            }),
            keepUnusedDataFor: 5,
        }),

        getOrders: builder.query({
            query: () => ({
                url: ORDERS_URL,
            }),
            keepUnusedDataFor: 5,
        }),

        deliverOrder: builder.mutation({
            query: (orderId) => ({
                url: `${ORDERS_URL}/${orderId}/deliver`,
                method: 'PUT',
            }),
        }),
    }),
});

export const {
    useCreateOrderMutation,
    useGetOrderDetailsQuery,
    usePayOrderMutation,
    useGetPayPalClientIdQuery,
    useCreatePayPalOrderMutation,
    useCapturePayPalOrderMutation,
    useGetMyOrdersQuery,
    useGetOrdersQuery,
    useDeliverOrderMutation,
} = ordersApiSlice;