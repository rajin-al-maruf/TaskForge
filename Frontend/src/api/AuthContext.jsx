import { createContext, useEffect, useState } from "react";
import { loginUser, registerUser } from "./authApi.js";

export const AuthContext = createContext()

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token= localStorage.getItem('token')
        if(token){
            setUser({ loggedIn: true })
        }
        setLoading(false)
    },[])

    const register = async (credential) => {
        try {
            const data = await registerUser(credential)

            if(data.token){
                localStorage.setItem("token", data.token)
                setUser(data.user)
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
                setUser(data.user)
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
        <AuthContext.Provider value={{user, loading, setLoading, register, login, logout}}>
            {children}
        </AuthContext.Provider>
    )
}
