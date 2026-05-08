import React, { useEffect } from 'react'
import { Stack } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiHome } from "react-icons/fi"
import { PiArrowsLeftRightLight } from "react-icons/pi"
import { IoWalletOutline } from "react-icons/io5"
import { MdOutlineTipsAndUpdates } from "react-icons/md"

export default function Navbar() {
    const navigate = useNavigate()
    const location = useLocation()

    const navbarList = [
        { name: 'Dashboard', path: '/', icon: <FiHome className='ms-2' /> },
        { name: 'Transaction', path: '/transaction', icon: <PiArrowsLeftRightLight className='ms-2' /> },
        { name: 'Wallet', path: '/wallet', icon: <IoWalletOutline className='ms-2' /> },
        { name: 'Suggestion', path: '/suggestion', icon: <MdOutlineTipsAndUpdates className='ms-2' /> },
    ]

    const isActive = (path) => location.pathname.split('/')[1] === path.split('/')[1]

    return (
        <Stack gap={2}>
            <header>
                <h1 className='fs-2'>SpendWise</h1>
            </header>
            {
                navbarList.map((menu) => (
                    <button key={menu.name} className={`p-2 rounded-end-pill border-0 action_hover ${isActive(menu.path) ? 'active' : 'bg-transparent'}`} onClick={() => navigate(menu.path)}>
                        <div className='d-flex align-items-center'>
                            { menu.icon }
                            <span className='ms-2'>{menu.name}</span>
                        </div>
                    </button>
                ))
            }
            {/* <button className={`p-2 rounded-end-pill border-0 action_hover ${isActive('/') ? 'active' : 'bg-transparent'}`} onClick={() => navigate('/')}>
                <div className='d-flex align-items-center'>
                    <FiHome className='ms-2' />
                    <span className='ms-2'>Dashboard</span>
                </div>
            </button>
            <button className={`p-2 rounded-end-pill border-0 action_hover ${isActive('/transaction') ? 'active' : 'bg-transparent'}`} onClick={() => navigate('/transaction')}>
                <div className='d-flex align-items-center'>
                    <PiArrowsLeftRightLight className='ms-2' />
                    <span className='ms-2'>Transaction</span>
                </div>
            </button>
            <button className={`p-2 rounded-end-pill border-0 action_hover ${isActive('/wallet') ? 'active' : 'bg-transparent'}`} onClick={() => navigate('/wallet')}>
                <div className='d-flex align-items-center'>
                    <IoWalletOutline className='ms-2' />
                    <span className='ms-2'>Wallet</span>
                </div>
            </button>
            <button className={`p-2 rounded-end-pill border-0 action_hover ${isActive('/suggestion') ? 'active' : 'bg-transparent'}`} onClick={() => navigate('/suggestion')}>
                <div className='d-flex align-items-center'>
                    <MdOutlineTipsAndUpdates className='ms-2' />
                    <span className='ms-2'>Suggestion</span>
                </div>
            </button> */}
        </Stack>
    )
}
