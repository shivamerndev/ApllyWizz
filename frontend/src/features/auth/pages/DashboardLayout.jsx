import { Link, NavLink, Outlet } from "react-router-dom";
import { FiLayout, FiSearch, FiUpload, FiCopy, FiTrendingUp, FiLogOut, FiSun, FiMoon, FiUser, FiCpu } from "react-icons/fi";
import { useTheme } from "../../theme/useTheme.js";
import useAuth from "../hooks/useAuth.js";
import { useSelector } from "react-redux";
import { selectUser } from "../auth.slice.js";

function DashboardLayout() {
  
  const { darkMode, setDarkMode } = useTheme();
  const { handleLogout } = useAuth();
  const user = useSelector(selectUser);

  const navItems = [
    { name: "Dashboard", path: "/", icon: <FiLayout size={18} /> },
    { name: "Search Jobs", path: "/jobs", icon: <FiSearch size={18} /> },
    { name: "Import Dataset", path: "/import", icon: <FiUpload size={18} /> },
    { name: "Duplicate Review", path: "/duplicates", icon: <FiCopy size={18} /> },
    { name: "Resume Tailor", path: "/tailor", icon: <FiCpu size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 hidden md:flex flex-col border-r border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
        {/* Brand Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200/60 dark:border-slate-800/60">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-black bg-gradient-to-r from-indigo-500 to-violet-600 dark:from-indigo-400 dark:to-violet-500 bg-clip-text text-transparent">
              Applywizz
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/50">
              v1.0
            </span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-slate-100"
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Profile Card / Footer */}
        <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold">
              {user?.name ? user.name[0].toUpperCase() : <FiUser />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-100">{user?.name || "Recruiter Account"}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email || "recruiter@applywizz.com"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-sm font-semibold transition-colors duration-200"
          >
            <FiLogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="py-4 flex items-center justify-between px-6 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md z-10">
          {/* Mobile Brand */}
          <div className="md:hidden flex items-center gap-2">
            <span className="text-xl font-black bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
              Applywizz
            </span>
          </div>

          <div className="hidden md:block">
            <h2 className="text-sm font-semibold text-slate-400">Recruiter Console</h2>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Toggle theme"
            >
              {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            {/* Mobile menu signout helper */}
            <button
              onClick={handleLogout}
              className="md:hidden p-2 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100"
              title="Sign out"
            >
              <FiLogOut size={18} />
            </button>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
