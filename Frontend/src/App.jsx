import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom'
import AuthPage from './pages/AuthPage'
import Dashboard from './components/Dashboard.jsx'
import { Toaster } from 'sonner'

function App() {
  return (
      <Router>
        <Toaster richColors/>

        <Routes>
          <Route path='/auth' element={<AuthPage/>}/>
          <Route path='/dashboard' element={<Dashboard />}/>

          <Route path='*' element={<Navigate to='/auth'/>}/>
        </Routes>
      </Router>
  )
}

export default App
