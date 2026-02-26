import { useState, useContext } from "react"
import { AuthContext } from '../../api/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const Register = ({isLogin, setIsLogin}) => {

    const [registerData, setRegisterData] =  useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    })

    const [error, setError] = useState(null)

    const { register, loading, setLoading } = useContext(AuthContext)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)

        const { firstName, lastName, email, password } = registerData
        if (!firstName || !lastName || !email || !password) {
            setError("All fields are required.")
            return
        }

        setLoading(true)
        const data = await register(registerData)
        setLoading(false)

        if (data.token) {
            toast.success(data.message)
            navigate('/dashboard')
        } else {
            toast.error(data.message)
        }
    }

    const handleFormChange = (e) => {
        setRegisterData((prev) => ({
            ...prev,
            [e.target.name] : e.target.value
        }))
    }
    console.log(registerData);
  return (
    <div className='w-full max-w-sm mx-auto flex flex-col items-center justify-center bg-brand-surface px-8 py-12 rounded-lg shadow-lg border border-brand-primary/20'>
        <h2 className='text-2xl font-semibold text-white'>Create An Account</h2>

        <form onSubmit={handleSubmit} className='w-full flex flex-col items-center justify-center gap-4 mt-8'>

            <input
                className='border border-white/20 px-4 py-2 text-xs text-white placeholder-white/60 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30 w-full rounded bg-white/5 transition-all'
                type="text" 
                placeholder='First Name'
                name='firstName'
                value={registerData.firstName}
                onChange={handleFormChange}
            />
            <input
                className='border border-white/20 px-4 py-2 text-xs text-white placeholder-white/60 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30 w-full rounded bg-white/5 transition-all'
                type="text" 
                placeholder='Last Name'
                name='lastName'
                value={registerData.lastName}
                onChange={handleFormChange}
            />
            <input
                className='border border-white/20 px-4 py-2 text-xs text-white placeholder-white/60 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30 w-full rounded bg-white/5 transition-all'
                type="email" 
                placeholder='Email'
                name='email'
                value={registerData.email}
                onChange={handleFormChange}
            />
            <input
                className='border border-white/20 px-4 py-2 text-xs text-white placeholder-white/60 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30 w-full rounded bg-white/5 transition-all'
                type="password" 
                placeholder='Password'
                name='password'
                value={registerData.password}
                onChange={handleFormChange}
            />
            <button
                className='bg-brand-primary hover:bg-brand-primary/90 active:bg-brand-primary/80 text-white px-4 py-2 text-xs font-semibold transition-all cursor-pointer w-full rounded shadow-md hover:shadow-lg'
                type='submit'
                disabled={loading}
            >
              {loading ? 'Signing up…' : 'Sign Up'}
            </button>

            {error && (
                <p className='text-red-400 text-xs mt-2'>{error}</p>
            )}

            <p className='text-xs text-white/70 mt-2'>Already have an account?
                <span
                    onClick={() => setIsLogin(!isLogin)}
                    className='text-brand-primary hover:text-brand-primary/80 cursor-pointer ml-1 font-semibold transition-colors'>
                    Log in
                </span>
            </p>

        </form>
    </div>
  )
}

export default Register