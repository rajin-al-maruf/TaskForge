import { createContext, useEffect, useState } from "react";
import { loginUser, registerUser } from "./authApi.js";

export const AuthContext = createContext()

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null)
    
    // This state is ONLY for the initial app mount check
    const [initialLoad, setInitialLoad] = useState(true)

    useEffect(() => {
        const token= localStorage.getItem('token')
        if(token){
            setUser({ loggedIn: true })
        }
        setInitialLoad(false)
    },[])

    const register = async (credential) => {
        try {
            const data = await registerUser(credential)

            if(data.token){
                localStorage.setItem("token", data.token)
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
        setUser(null)
    }

    return(
        <AuthContext.Provider value={{
            user, 
            loading: initialLoad, 
            setLoading: () => {}, // Dummy function to prevent Router unmounting!
            register, 
            login, 
            logout
        }}>
            {children}
        </AuthContext.Provider>
    )
}
