import React, { useEffect } from 'react'
import { Stack } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiHome } from "react-icons/fi"
import { PiArrowsLeftRightLight } from "react-icons/pi"
import { IoWalletOutline } from "react-icons/io5"
import { MdOutlineTipsAndUpdates } from "react-icons/md"
import { VscAccount } from "react-icons/vsc"

export default function Navbar({ username }) {
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
        <div className='h-100 d-flex flex-column justify-content-between'>
            <Stack gap={2}>
                <img src="/navbar-logo.png" alt="SpendWise-Logo" className='w-100 my-2' />
                {
                    navbarList.map((menu) => (
                        <button key={menu.name} className={`p-2 rounded-end-pill border-0 action_hover ${isActive(menu.path) ? 'active' : 'bg-transparent text-purple'}`} onClick={() => navigate(menu.path)}>
                            <div className='d-flex align-items-center'>
                                {menu.icon}
                                <span className='ms-2'>{menu.name}</span>
                            </div>
                        </button>
                    ))
                }
            </Stack>

            <div className='ps-2 pb-3'>
                <button
                    className={`w-100 d-flex justify-content-center align-items-center gap-2 p-2 border-2 border-purple rounded-4 action_hover ${isActive('/profile') ? 'active' : 'bg-transparent text-purple'}`}
                    onClick={() => navigate('/profile')}
                >
                    <VscAccount size={20} />
                    <h2 className='m-0 fs-5 fw-normal'>{username}</h2>
                    {/* <h2 className='m-0 fs-5 fw-normal'>Tama</h2> */}
                </button>
            </div>
        </div>
    )
}
