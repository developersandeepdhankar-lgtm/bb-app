import { createContext, useState, useEffect, useCallback } from "react";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const savedTheme = localStorage.getItem("theme") || "theme-indigo";
    const savedFont = localStorage.getItem("font") || "font-raleway";
    const [theme, setTheme] = useState(savedTheme);
    const [font, setFont] = useState(savedFont)
    const savedBreadcrumbs = localStorage.getItem("breadcrumbs") === "true";
    const [breadcrumbs, setBreadcrumbs] = useState(savedBreadcrumbs);
    const savedMonochrome = localStorage.getItem("monochrome") === "true";
    const savedRadius0 = localStorage.getItem("radius0") === "true";
    const [monochrome, setMonochrome] = useState(savedMonochrome);
    const [radius0, setRadius0] = useState(savedRadius0);
    const savedShadow = localStorage.getItem("shadow") === "true";
    const [shadowActive, setShadowActive] = useState(savedShadow);
    const savedBsTheme = localStorage.getItem("bsTheme") || "light";
    const [bsTheme, setBsTheme] = useState(savedBsTheme);
    const [subLayout, setSubLayout] = useState(false);
    const [title, setTitle] = useState('')

    const [fullWidth, setFullWidth] = useState(false);
    const sidebarToggle = () => {
        setFullWidth(!fullWidth);
    }
    useEffect(() => {
        if (window.innerWidth < 991.98) {
            document.body.classList.toggle("open")
            document.body.classList.toggle("no-scroll")
        } else {
            document.body.classList.toggle("layout-fullwidth")
        }
    }, [fullWidth])

    // Update body whenever theme and font changes
    useEffect(() => {
        // Clear old theme classes
        localStorage.setItem("breadcrumbs", breadcrumbs);
        localStorage.setItem('theme', theme)
        localStorage.setItem('font', font)
        localStorage.setItem("monochrome", monochrome);
        localStorage.setItem("radius0", radius0);
        localStorage.setItem("shadow", shadowActive);
        localStorage.setItem("bsTheme", bsTheme);
        document.documentElement.setAttribute("data-bs-theme", bsTheme);
        document.body.className = document.body.className
            .split(" ")
            .filter(c =>
                !c.startsWith("theme-") &&
                !c.startsWith("font-") &&
                c !== "breadcrumbs-primary" &&
                c !== "monochrome" &&
                c !== "radius-0"
            )
            .join(" ");

        // Add font and theme
        document.body.classList.add(font);
        document.body.setAttribute("data-thunderal", theme);

        if (breadcrumbs) document.body.classList.add("breadcrumbs-primary");
        if (monochrome) document.body.classList.add("monochrome");
        if (radius0) document.body.classList.add("radius-0");
        if (subLayout) {
            document.body.classList.add("sub-layout")
        }
        else {
            document.body.classList.remove("sub-layout")
        }

        const cards = document.querySelectorAll(".card");
        if (shadowActive) {
            cards.forEach(card => card.classList.add("shadow-active"));
        } else {
            cards.forEach(card => card.classList.remove("shadow-active"));
        }
    }, [theme, font, breadcrumbs, monochrome, radius0, shadowActive, bsTheme, subLayout]);

    // Function to switch theme
    const changeTheme = useCallback((newTheme) => {
        setTheme(newTheme);
    }, []);

    // Function to switch font
    const changeFont = useCallback((newFont) => {
        setFont(newFont);
    }, []);

    const changeBsTheme = useCallback((newTheme) => {
        setBsTheme(newTheme);
    }, []);

    const toggleBreadcrumbs = useCallback(() => setBreadcrumbs(prev => !prev), []);
    const toggleMonochrome = useCallback(() => setMonochrome(prev => !prev), []);
    const toggleRadius0 = useCallback(() => setRadius0(prev => !prev), []);
    const toggleShadow = useCallback(() => setShadowActive(prev => !prev), []);

    return (
        <ThemeContext.Provider value={{
            theme, changeTheme, font, changeFont, breadcrumbs, toggleBreadcrumbs, monochrome, toggleMonochrome,
            radius0, toggleRadius0, shadowActive, toggleShadow, bsTheme, changeBsTheme, setSubLayout, sidebarToggle, title, setTitle,
        }}>
            {children}
        </ThemeContext.Provider>
    );
}
