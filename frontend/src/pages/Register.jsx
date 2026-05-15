import React from 'react'
import RegisterInput from '../components/RegisterInput'

export default function Register() {
    return (
        <article className='min-vh-100 w-100 d-flex flex-column justify-content-center align-items-center'>
            <RegisterInput />
            <p>sudah punya akun? <a href="/">Masuk di-sini</a></p>
        </article>
    )
}
