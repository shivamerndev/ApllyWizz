import { apiSlice } from "../../../store/apiSlice.js";

export const authApi = apiSlice.injectEndpoints({

  endpoints: (builder) => ({


    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials
      }),
      invalidatesTags: ["User"],
    }),


    register: builder.mutation({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),


    getUser: builder.query({
      query: () => "/auth/user",
      method: "GET",
      providesTags: ["User"],
    }),


    getManagers: builder.query({
      query: () => "/auth/managers",
      method: "GET",
    }),


    getAllUsers: builder.query({
      query: () => "/auth/users",
      method: "GET",
      providesTags: ["User"],
    }),


    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),

  }),

  overrideExisting: false,
});

export const {
  useLoginMutation,
  useGetManagersQuery,
  useGetAllUsersQuery,
  useGetUserQuery,
  useRegisterMutation,
  useLogoutMutation
} = authApi;
