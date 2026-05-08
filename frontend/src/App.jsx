import React from 'react'
import { Col, Container, Row } from 'react-bootstrap';
import Navbar from './components/Navbar';
import { Route, Routes, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Suggestion from './pages/Suggestion';
import NotFound from './pages/NotFound';

export default function App() {
  const location = useLocation()
  const availablePage = `/${location.pathname.split('/')[1]}` === '/' ? true : `/${location.pathname.split('/')[1]}` === '/transaction' ? true : `/${location.pathname.split('/')[1]}` === '/wallet' ? true : `/${location.pathname.split('/')[1]}` === '/suggestion' ? true : false

  if (!availablePage) {
    return <NotFound />
  }

  return (
    <Container fluid className='min-vh-100'>
      <Row className='vh-100'>
        <Col xs={2} className='ps-0'>
          <Navbar />
        </Col>
        <Col className='bg-content-area'>
          <Routes>
            <Route path='/' element={<Dashboard />} />
            <Route path='/suggestion' element={<Suggestion />} />
            <Route path='*' element={<NotFound />} />
          </Routes>
        </Col>
      </Row>
    </Container>
  )
}
