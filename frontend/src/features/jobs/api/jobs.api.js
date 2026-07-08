import { apiSlice } from "../../../store/apiSlice.js";

export const jobsApi = apiSlice.injectEndpoints({

  endpoints: (builder) => ({

    getDashboardStats: builder.query({
      query: () => "/dashboard",
      providesTags: ["JobsStats"],
    }),


    getJobs: builder.query({
      query: (params) => ({
        url: "/jobs",
        method: "GET",
        params,
      }),
      providesTags: ["JobsList"],
    }),


    getJobDetails: builder.query({
      query: (id) => `/jobs/${id}`,
      providesTags: (result, error, id) => [{ type: "JobDetails", id }],
    }),


    getDuplicates: builder.query({
      query: () => "/duplicates",
      providesTags: ["DuplicatesList"],
    }),


    resolveDuplicate: builder.mutation({
      query: ({ id, action }) => ({
        url: `/duplicates/${id}`,
        method: "PATCH",
        body: { action },
      }),
      invalidatesTags: ["DuplicatesList", "JobsList", "JobsStats", "JobDetails"],
    }),


    importJobs: builder.mutation({
      query: (formData) => ({
        url: "/jobs/import",
        method: "POST",
        body: formData,
        // FormData requires no headers modification, fetchBaseQuery handles this automatically
      }),
      invalidatesTags: ["JobsList", "JobsStats", "DuplicatesList"],
    }),


    tailorResume: builder.mutation({
      query: (body) => ({
        url: "/resume/tailor",
        method: "POST",
        body,
      }),
    }),

  }),

  overrideExisting: false,
});


export const { useGetDashboardStatsQuery, useGetJobsQuery,
  useGetJobDetailsQuery, useGetDuplicatesQuery,
  useResolveDuplicateMutation, useImportJobsMutation,
  useTailorResumeMutation } = jobsApi;