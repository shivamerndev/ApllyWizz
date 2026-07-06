import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URI ? `${import.meta.env.VITE_BASE_URI}/api/v1` : "https://dta-backend-4i1g.onrender.com/api/v1",
    credentials: "include"
  }),
  tagTypes: ["User", "Attendance", "OTRequest", "Report", "JobsList", "JobsStats", "JobDetails", "DuplicatesList"],
  endpoints: () => ({}),
});
