import { createBrowserRouter } from "react-router-dom";
import Login from "../features/auth/pages/Login.jsx";
import Register from "../features/auth/pages/Register.jsx";
import { ProtectedRoute } from "./ProtectedRoute.jsx";
import { PublicRoute } from "./PublicRoute.jsx";
import App from "../app/App.jsx";
import DashboardLayout from "../features/auth/pages/DashboardLayout.jsx";
import Dashboard from "../features/jobs/pages/Dashboard.jsx";
import JobSearch from "../features/jobs/pages/JobSearch.jsx";
import JobDetails from "../features/jobs/pages/JobDetails.jsx";
import ExcelImport from "../features/jobs/pages/ExcelImport.jsx";
import DuplicateResolver from "../features/jobs/pages/DuplicateResolver.jsx";
import ResumeTailor from "../features/jobs/pages/ResumeTailor.jsx";
import ErrorRoute from "./ErrorRoute.jsx";

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        element: <PublicRoute />,
        children: [
          {
            path: "/login",
            element: <Login />,
          },
          {
            path: "/register",
            element: <Register />,
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/",
            element: <DashboardLayout />,
            children: [
              {
                path: "",
                element: <Dashboard />,
              },
              {
                path: "jobs",
                element: <JobSearch />,
              },
              {
                path: "jobs/:id",
                element: <JobDetails />,
              },
              {
                path: "import",
                element: <ExcelImport />,
              },
              {
                path: "duplicates",
                element: <DuplicateResolver />,
              },
              {
                path: "tailor",
                element: <ResumeTailor />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <ErrorRoute />,
  },
]);
