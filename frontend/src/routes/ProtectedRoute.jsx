import { useSelector } from "react-redux";
import { selectUser } from "../features/auth/auth.slice.js";
import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = ({ allowedRoles }) => {

    const user = useSelector(selectUser);
    if (!user) return <Navigate to="/login" replace />;

    if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

    return <Outlet />;
};