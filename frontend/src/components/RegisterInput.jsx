import React, { useState } from 'react'
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { useInput } from '../utils/utils'
import useAppContext from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';

export default function RegisterInput() {
    const [fullName, setFullName] = useInput()
    const [username, setUsername] = useInput()
    const [email, setEmail] = useInput()
    const [pass, setPass] = useInput()
    const [confirm, setConfirm] = useInput()
    const [showPass, setShowPass] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    
    const { signin } = useAppContext()
    const navigate = useNavigate()

    const registHandle = (e) => {
        e.preventDefault()

        if (!fullName.trim() || !username.trim() || !pass.trim() || !confirm.trim()) {
            alert('Tolong isi semua data!')
            return
        }

        if (pass !== confirm) {
            alert('Ulang pengisian password dengan benar')
            return
        }

        signin(fullName, username, email, pass)
        navigate('/')
    }

    return (
        <div className='w-50 bg-purple rounded-5 mb-3'>
            <div style={{ height: '8px' }} />
            <form onSubmit={registHandle} className='p-3 w-100 bg-white d-flex flex-column align-items-center border border-2 border-purple rounded-5'>
                <h1 className='fs-3 text-purple'>Daftar</h1>
                <div className="input-item">
                    <label htmlFor="name">Name</label>
                    <div className='input-box'>
                        <input type='text' value={fullName} onChange={setFullName} required />
                    </div>
                </div>
                <div className="input-item">
                    <label htmlFor="username">Username</label>
                    <div className='input-box'>
                        <input type='text' value={username} onChange={setUsername} required />
                    </div>
                </div>
                <div className="input-item">
                    <label htmlFor="email">Email</label>
                    <div className='input-box'>
                        <input type='email' value={email} onChange={setEmail} required />
                    </div>
                </div>
                <div className="input-item">
                    <label htmlFor="pass">Password</label>
                    <div className='input-box'>
                        <input type={showPass ? 'text' : 'password'} value={pass} onChange={setPass} required />
                        <button onClick={() => setShowPass((prev) => !prev)}>{showPass ? <IoEyeOutline /> : <IoEyeOffOutline />}</button>
                    </div>
                </div>
                <div className="input-item">
                    <label htmlFor="ConfirmPass">Cofirm Password</label>
                    <div className='input-box'>
                        <input type={showConfirm ? 'text' : 'password'} value={confirm} onChange={setConfirm} required />
                        <button onClick={() => setShowConfirm((prev) => !prev)}>{showConfirm ? <IoEyeOutline /> : <IoEyeOffOutline />}</button>
                    </div>
                </div>

                <button type='submit' className='btn btn-purple'>Daftar</button>
            </form>
        </div>
    )
}
