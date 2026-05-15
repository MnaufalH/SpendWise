import React from 'react'
import LoginInput from '../components/LoginInput'

export default function Login() {
    return (
        <article className='min-vh-100 w-100 d-flex flex-column justify-content-center align-items-center'>
            <LoginInput />
            <p>Belum punya akun? <a href="/register">Daftar di-sini</a></p>
        </article>
    )
}
