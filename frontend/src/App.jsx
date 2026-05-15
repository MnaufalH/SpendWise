import React, { useContext } from 'react'
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

export default function App() {
  const { user } = useAppContext()

  if (!user) {
    return <Routes>
      <Route path='*' element={<Login />} />
      <Route path='/register' element={<Register />} />
    </Routes>
  }

  return (
    <Container fluid className='min-vh-100'>
      <Row className='vh-100'>
        <Col xs={2} className='ps-0'>
          <Navbar username={user.username} />
        </Col>
        <Col className='bg-content-area'>
          <Routes>
            <Route path='/' element={<Dashboard />} />
            <Route path='/transaction' element={<Transaction />} />
            <Route path='/suggestion' element={<Suggestion />} />
            <Route path='/wallet' element={<Wallet />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='*' element={<NotFound />} />
          </Routes>
        </Col>
      </Row>
    </Container>
  )
}
