import { createContext, useEffect, useState } from "react";
import { loginUser, registerUser, socialLoginUser } from "./authApi.js";

export const AuthContext = createContext()

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null)
    
    // This state is ONLY for the initial app mount check
    const [initialLoad, setInitialLoad] = useState(true)
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system')
    const [accentColor, setAccentColor] = useState(localStorage.getItem('accentColor') || 'blue')

    useEffect(() => {
        const token= localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')
        if(token){
            if(storedUser) {
                try { setUser(JSON.parse(storedUser)) } 
                catch(e) { setUser({ loggedIn: true }) }
            } else {
                setUser({ loggedIn: true })
            }
        }
        setInitialLoad(false)
    },[])

    // Global Theme Effect
    useEffect(() => {
        const root = document.documentElement;
        const applyTheme = () => {
            const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const isDark = theme === 'dark' || (theme === 'system' && isSystemDark);
            
            root.classList.toggle('dark', isDark);
            root.classList.toggle('light', !isDark);
            
            if (theme === 'system') localStorage.removeItem('theme');
            else localStorage.setItem('theme', theme);
        };

        applyTheme();

        // Listen for OS system theme changes in real-time
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => { if (theme === 'system') applyTheme(); };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    // Global Accent Color Effect
    useEffect(() => {
        if (user && user.userType !== 'pro' && accentColor !== 'blue') {
            setAccentColor('blue');
        } else {
            document.documentElement.setAttribute('data-color', accentColor);
            localStorage.setItem('accentColor', accentColor);
        }
    }, [accentColor, user]);

    const register = async (credential) => {
        try {
            const data = await registerUser(credential)

            if(data.token){
                localStorage.setItem("token", data.token)
                if(data.user) localStorage.setItem("user", JSON.stringify(data.user))
                setUser(data.user || { loggedIn: true })
            }
            return data;
        } catch (error) {
            const message = error?.response?.data?.message || error.message
            return { success: false, message }
        }
    }
    const login = async (credential) => {
        try {
            const data = await loginUser(credential)

            if(data.token){
                localStorage.setItem("token", data.token)
                if(data.user) localStorage.setItem("user", JSON.stringify(data.user))
                setUser(data.user || { loggedIn: true })
            }
            return data;
        } catch (error) {
            const message = error?.response?.data?.message || error.message
            return { success: false, message }
        }
    }

    const socialLogin = async (userData) => {
        try {
            const data = await socialLoginUser(userData);

            if(data.token){
                localStorage.setItem("token", data.token)
                if(data.user) localStorage.setItem("user", JSON.stringify(data.user))
                setUser(data.user || { loggedIn: true })
            }
            return data;
        } catch (error) {
            const message = error?.response?.data?.message || error.message
            return { success: false, message }
        }
    }

    const logout = async () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setUser(null)
    }

    return(
        <AuthContext.Provider value={{
            user, 
            loading: initialLoad, 
            setLoading: () => {}, // Dummy function to prevent Router unmounting!
            register, 
            login, 
            socialLogin,
            logout,
            setUser,
            theme,
            setTheme,
            accentColor,
            setAccentColor
        }}>
            {children}
        </AuthContext.Provider>
    )
}
