import { createContext, useEffect, useState } from "react";
import { loginUser } from "./authApi";

export const AuthContext = createContext()

export const AuthProvider = async ({children}) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token= localStorage.getItem('token')
        if(token){
            setUser({ loggedIn: true })
        }
        setLoading(false)
    },[])

    const login = async (credential) => {
        const data = await loginUser(credential)

        if(data.token){
            localStorage.setItem("token", data.token)
            setUser(data.user)
        }
        return data;
    }

    const logout = async () => {
        localStorage.removeItem("token")
        setUser(null)
    }

    return(
        <AuthContext.Provider value={{user, loading, login, logout}}>
            {children}
        </AuthContext.Provider>
    )
}
