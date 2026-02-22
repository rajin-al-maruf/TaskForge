import React, { useState } from 'react'
import Register from '../components/Auth/Register'
import Login from '../components/Auth/Login'

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true)
  return (
    <div className='flex items-center justify-center min-h-screen bg-brand-bg'>
      {isLogin? 
        <Login isLogin={isLogin} setIsLogin={setIsLogin}/>:
        <Register isLogin={isLogin} setIsLogin={setIsLogin}/>
      }
    </div>
  )
}

export default AuthPage