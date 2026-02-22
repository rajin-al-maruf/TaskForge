

const Login = ({isLogin, setIsLogin}) => {
  return (
    <div className='w-full max-w-sm mx-auto flex flex-col items-center justify-center bg-brand-surface px-8 py-12 rounded-lg shadow-lg border border-brand-primary/20'>
        <h2 className='text-2xl font-semibold text-white'>Login</h2>

        <form className='w-full flex flex-col items-center justify-center gap-4 mt-8'>

            <input
                className='border border-white/20 px-4 py-2 text-xs text-white placeholder-white/60 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30 w-full rounded bg-white/5 transition-all'
                type="email" 
                placeholder='Email'
                name='email'
            />
            <input
                className='border border-white/20 px-4 py-2 text-xs text-white placeholder-white/60 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30 w-full rounded bg-white/5 transition-all'
                type="password" 
                placeholder='Password'
                name='password'
            />
            <button 
                className='bg-brand-primary hover:bg-brand-primary/90 active:bg-brand-primary/80 text-white px-4 py-2 text-xs font-semibold transition-all cursor-pointer w-full rounded shadow-md hover:shadow-lg'
                type='submit'
            >
              Login
            </button>

            <p className='text-xs text-white/70 mt-2'>Don't have an account?
                <span
                    onClick={() => setIsLogin(!isLogin)}
                    className='text-brand-primary hover:text-brand-primary/80 cursor-pointer ml-1 font-semibold transition-colors'>
                    Sign Up
                </span>
            </p>

        </form>
    </div>
  )
}

export default Login