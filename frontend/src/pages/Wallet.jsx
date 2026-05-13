import { SlCompass } from 'react-icons/sl'
import useAppContext from '../contexts/AppContext'

export default function Wallet() {
    const { wallets } = useAppContext().user

    return (
        <article className='p-3 w-100'>
            {/* Header */}
            <div className='d-flex justify-content-between mb-4'>
                <div className='d-flex text-purple gap-3'>
                    <div>
                        <div className='d-flex align-items-center' style={{ height: '34px' }}>
                            <SlCompass className='mt-1 fs-5' />
                        </div>
                        <div style={{ height: '24px' }} />
                    </div>
                    <div>
                        <h2 className='m-0 fs-3' style={{ height: '34px' }}>Wallet</h2>
                        <p className='m-0'><span className='opacity-50'>Kelola dompet dan rekeningmu</span> 💳</p>
                    </div>
                </div>
            </div>
            <div
                style={{
                    background: "white",
                    borderRadius: "20px",
                    marginTop: "30px",
                    padding: "20px",
                }}
            >
                <h2 style={{ marginBottom: "20px", color: "#1E0A78" }}>
                    Wallet List
                </h2>

                {wallets.map((item, index) => (
                    <div
                        key={index}
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "15px",
                            border: "1px solid #ddd",
                            borderRadius: "10px",
                            marginBottom: "10px",
                        }}
                    >
                        <span>{item.name}</span>
                        <span>Rp {item.amount.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </article >
    )
}
