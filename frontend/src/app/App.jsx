import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "../features/theme/ThemeContext.jsx";
import { useEffect } from "react";
import { useGetUserQuery } from "../features/auth/api/auth.api.js"
import useAuth from "../features/auth/hooks/useAuth.js";

function App() {

    const { data } = useGetUserQuery();
    const { handleSetUser } = useAuth();

    useEffect(() => {
        if (data) {
            handleSetUser(data.data);
        } else {
            handleSetUser(null);
        }
    }, [data]);

    return (
        <div className="h-screen w-full overflow-hidden">
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
            <ThemeProvider>
                <Outlet />
            </ThemeProvider>
        </div>
    );
}

export default App;
