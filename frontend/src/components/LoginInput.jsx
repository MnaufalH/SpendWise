import React, { useState } from 'react'
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { useInput } from '../utils/utils'

export default function LoginInput() {
    const [email, setEmail] = useInput()
    const [pass, setPass] = useInput()
    const [showPass, setShowPass] = useState(false)

    return (
        <div className='w-50 bg-purple rounded-5 mb-3'>
            <div style={{ height: '8px' }} />
            <div className='p-3 w-100 bg-white d-flex flex-column align-items-center border border-2 border-purple rounded-5'>
                <h1 className='fs-3 text-purple'>Login</h1>
                <div className="input-item">
                    <label htmlFor="email">Email</label>
                    <div className='input-box'>
                        <input type='text' value={email} onChange={setEmail} required />
                    </div>
                </div>
                <div className="input-item">
                    <label htmlFor="pass">Password</label>
                    <div className='input-box'>
                        <input type={showPass ? 'text' : 'password'} value={pass} onChange={setPass} required />
                        <button onClick={() => setShowPass((prev) => !prev)}>{showPass ? <IoEyeOutline /> : <IoEyeOffOutline />}</button>
                    </div>
                </div>

                <button className='bg-purple text-white p-2 border-0 rounded-3'>Login</button>
            </div>
        </div>
    )
}
