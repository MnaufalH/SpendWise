import React, { useState } from 'react'
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { useInput } from '../utils/utils'
import useAppContext from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';

export default function LoginInput() {
    const [email, setEmail] = useInput()
    const [pass, setPass] = useInput()
    const [showPass, setShowPass] = useState(false)

    const navigate = useNavigate()
    const { login } = useAppContext()

    const loginHandle = () => {
        if (!email.trim() || !pass.trim()) {
            alert('Tolong isi semua kolom dengan benar!')
            return
        }
        
        if (email !== 'tama@sample.com' || pass !== 'tama123') {
            alert('Salah memasukan akun percobaan')
            return
        }

        login(email, pass)
        navigate('/')
    }

    return (
        <div className='w-50 bg-purple rounded-5 mb-3'>
            <div style={{ height: '8px' }} />
            <form onSubmit={loginHandle} className='p-3 w-100 bg-white d-flex flex-column align-items-center border border-2 border-purple rounded-5'>
                <h1 className='fs-3 text-purple'>Login</h1>
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

                <button type='submit' className='btn btn-purple'>Login</button>
            </form>
        </div>
    )
}
