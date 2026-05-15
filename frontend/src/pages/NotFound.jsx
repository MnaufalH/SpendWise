import React from 'react'

export default function NotFound() {
  return (
    <article className='min-vh-100 w-100 d-flex flex-column justify-content-center align-items-center text-purple'>
        <img src="/navbar-logo.png" alt="SpendWise Logo" className='w-25'/>
        <h3>Tidak dapat menemukan PATH yang anda cari</h3>
        <p>Silahkan kembali ke halaman yang utama</p>
    </article>
  )
}
