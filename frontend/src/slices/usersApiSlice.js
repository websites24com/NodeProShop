import { USERS_URL } from "../constants";
import { apiSlice } from "./apiSlice";
import { productsApiSlice } from "./productsApiSlice";

export const usersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // mutation because of POST request 
        login: builder.mutation({
        // we set data as we send it to endpoint
            query: (data) => ({
                url: `${USERS_URL}/auth`,
                method: 'POST',
                body: data
            }),
            
        }),
        logout: builder.mutation({
            query: () => ({
                url: `${USERS_URL}/logout`,
                method: 'POST'
            })
        }),
        register: builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}`,
                method: 'POST',
                body: data
            })
        })
        
    })
})

export const { useLoginMutation, useLogoutMutation, useRegisterMutation } = usersApiSlice