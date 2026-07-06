import { createContext, useState, useEffect } from "react";


export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {

    const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark" || (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches));

    useEffect(() => {
        localStorage.setItem("theme", darkMode ? "dark" : "light");
        if (darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [darkMode]);

    return (
        <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};