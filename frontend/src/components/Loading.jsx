import React from 'react'
import { Spinner } from 'react-bootstrap'

export default function Loading() {
    return (
        <div className="min-vh-100 d-flex justify-content-center align-items-center">
            <div style={{ position: "relative", width: "100px", height: "100px" }}>

                {/* Spinner belakang (lebih besar) */}
                <Spinner
                    animation="border"
                    style={{
                        width: "100px",
                        height: "100px",
                        position: "absolute",
                        top: 0,
                        left: 0,
                        opacity: 0.5
                    }}
                    variant="purple"
                />

                {/* Spinner depan (lebih kecil) */}
                <Spinner
                    animation="border"
                    style={{
                        width: "50px",
                        height: "50px",
                        position: "absolute",
                        top: "25px",
                        left: "25px"
                    }}
                    variant="green"
                />

            </div>
        </div>
    )
}
