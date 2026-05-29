import React, { useContext, useEffect, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap';
import Navbar from './components/Navbar';
import { Route, Routes, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Suggestion from './pages/Suggestion';
import NotFound from './pages/NotFound';
import Transaction from './pages/Transaction';
import Wallet from './pages/Wallet';
import useAppContext from './contexts/AppContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import { createUser, getUser, putAccessToken, putRefreshToken } from './utils/requestAPi';
import Loading from './components/Loading';

export default function App() {
  const { user, setUser } = useAppContext()
  const [loading, setLoading] = useState(true)

  const onLogin = async ({ accessToken, refreshToken }) => {
    putAccessToken(accessToken)
    putRefreshToken(refreshToken)
    const { data } = await getUser()
    setUser(data.data)
  }
  
  const onLogout = async () => {
    setUser(null)
    putAccessToken('')
  }

  const verifyUserLogined = async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const { data } = await getUser()
      setUser(data.data)
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    verifyUserLogined()
  }, [])

  if (loading) {
    return <Loading />
  }

  if (!user) {
    return <Routes>
      <Route path='*' element={<Login onLogin={onLogin} />} />
      <Route path='/register' element={<Register />} />
    </Routes>
  }

  return (
    <Container fluid className='min-vh-100 overflow-hidden'>
      <Row className='vh-100'>
        <Col xs={2} className='ps-0'>
          <Navbar username={user.userName} />
        </Col>
        <Col className='h-100 bg-content-area overflow-auto'>
          <Routes>
            <Route path='/' element={<Dashboard />} />
            <Route path='/transaction' element={<Transaction />} />
            <Route path='/suggestion' element={<Suggestion />} />
            <Route path='/wallet' element={<Wallet />} />
            <Route path='/profile' element={<Profile onLogout={onLogout} />} />
            <Route path='*' element={<NotFound />} />
          </Routes>
        </Col>
      </Row>
    </Container>
  )
}
