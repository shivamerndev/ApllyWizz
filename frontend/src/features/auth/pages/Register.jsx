import { Link } from "react-router-dom";
import { handleForm } from "../utils/formHandler.js";
import { FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "../../theme/useTheme.js";
import useAuth from "../hooks/useAuth.js";


function Register() {

  const { darkMode, setDarkMode } = useTheme();
  const { handleRegister, isRegisterLoading } = useAuth();


  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors">
      <div className="glass-card w-full max-w-md p-8 border border-slate-200/50 dark:border-slate-800/50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">Register</h2>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            {darkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
          </button>
        </div>
        <form onSubmit={handleForm(handleRegister)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="John Doe"
              name="name"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="john@company.com"
              name="email"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="•••••••• (Min 6 chars)"
              name="password"
            />
          </div>

          <button
            type="submit"
            disabled={isRegisterLoading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50 mt-4"
          >
            {isRegisterLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
