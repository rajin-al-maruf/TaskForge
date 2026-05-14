import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard.jsx'
import { Toaster } from 'sonner'
import { AuthContext } from './api/AuthContext.jsx'
import { useContext } from 'react'
import LoadingSpinner from './components/LoadingSpinner.jsx'

function App() {
  const {user, loading} = useContext(AuthContext)
  
  if(loading) return <LoadingSpinner message="Authenticating..." fullScreen={true} />
  
  return (
      <Router>
        <Toaster richColors/>

        <Routes>
          <Route path='/auth' element={<AuthPage/>}/>
          <Route path='/dashboard' element={user? <Dashboard /> : <Navigate to='/auth'/>}/>
          <Route path='*' element={<Navigate to='/auth'/>}/>
        </Routes>
      </Router>
  )
}

export default App
