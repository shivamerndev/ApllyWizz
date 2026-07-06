import { useNavigate } from "react-router-dom"


const ErrorRoute = () => {

    const navigate = useNavigate()

    return (
        <div className="w-full h-screen flex flex-col justify-center items-center gap-5">
            <h1 className="text-5xl font-bold">404</h1>
            <p className="text-xl">Page not found</p>
            <button
                onClick={() => navigate('/')}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600 transition-colors">
                Go to Dashboard
            </button>
        </div>
    )
}

export default ErrorRoute