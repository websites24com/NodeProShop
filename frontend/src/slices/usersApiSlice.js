
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
        }),
        profile: builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}/profile`,
                method: 'PUT',
                body: data })
        }),
        getUsers: builder.query({
            query: () => ({
                url: `${USERS_URL}`,   
                method: 'GET'         
        }),
        // it will automatically refetch the users list after a user is updated or deleted  
        providesTags: ['User'],
        // if we want to keep the data in cache for 5 seconds after component unmounts, we can set it like this:    
        keepUnusedDataFor: 5, 
        }),
        deleteUser: builder.mutation({
            query: (userId) => ({
                url: `${USERS_URL}/${userId}`,
                method: 'DELETE'
            }),
            
            invalidatesTags: ['User']
    }),
        getUserDetails: builder.query({
            query: (userId) => ({
                url: `${USERS_URL}/${userId}`,
        }),
        keepUnusedDataFor: 5,
    
    }),
    updateUser: builder.mutation({
        query: ({ userId, ...data }) => ({
            url: `${USERS_URL}/${userId}`,
            method: 'PUT',
            body: data
        }),
        invalidatesTags: ['User']
    })
})

})

export const { useLoginMutation, useLogoutMutation, useRegisterMutation, useProfileMutation,useGetUsersQuery, useDeleteUserMutation, useGetUserDetailsQuery, useUpdateUserMutation } = usersApiSlice