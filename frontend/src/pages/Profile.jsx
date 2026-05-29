import React from 'react'
import { VscAccount } from 'react-icons/vsc'
import useAppContext from '../contexts/AppContext'
import { useNavigate } from 'react-router-dom'
import { logout } from '../utils/requestAPi'

export default function Profile({ onLogout }) {
    const { fullName, userName, email } = useAppContext().user
    // const { logout } = useAppContext()

    const logoutHendler = async () => {
        try {
            await logout()
            onLogout()
        } catch (error) {
            console.log(error.response)
        }
    }

    const navigate = useNavigate()
    
    return (
        <article className='h-100 w-100 d-flex justify-content-center align-items-center'>
            <div className='bg-purple rounded-4'>
                <div style={{ height: '8px' }} />
                <div className="p-3 bg-white rounded-4">
                    <div className='d-flex align-items-center gap-2 mb-4 text-purple'>
                        <VscAccount size={24} />
                        <h2 className='m-0 fs-3'>Personal Information</h2>
                    </div>
                    <div className='text-purple d-flex flex-column gap-2'>
                        <div className="d-flex align-items-center gap-1">
                            <p className='m-0' style={{ width: '80px' }}>Full Name</p>
                            <p className='m-0'>:</p>
                            <p className='m-0'>{fullName}</p>
                        </div>
                        <div className='bg-gray' style={{ height: '2px' }} />
                        <div className="d-flex align-items-center gap-1">
                            <p className='m-0' style={{ width: '80px' }}>Username</p>
                            <p className='m-0'>:</p>
                            <p className='m-0'>{userName}</p>
                        </div>
                        <div className='bg-gray' style={{ height: '2px' }} />
                        <div className="d-flex align-items-center gap-1">
                            <p className='m-0' style={{ width: '80px' }}>Account</p>
                            <p className='m-0'>:</p>
                            <p className='m-0'>{email}</p>
                        </div>
                        <div className='bg-gray' style={{ height: '2px' }} />
                        <button className='p-2 bg-transparent text-red border-0' onClick={logoutHendler}>Logout</button>
                    </div>
                </div>
            </div>
        </article>
    )
}
