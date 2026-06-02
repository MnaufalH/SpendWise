import React, { useEffect, useState } from 'react'
import useAppContext from '../contexts/AppContext'
import { Spinner } from 'react-bootstrap'
import { editBudget, getBudgetByIdentic } from '../utils/requestAPi'

export default function EditBudgeting({ close, id }) {
    const { budgets } = useAppContext().user
    const { updateBudget } = useAppContext()

    const [item, setItem] = useState({})
    const [loading, setLoading] = useState(true)

    const categories = [
        { value: 'Sewa tempat tinggal' },
        { value: 'Pembayaran cicilan' },
        { value: 'Asuransi' },
        { value: 'Belanja bahan makan' },
        { value: 'Transport' },
        { value: 'Makan di luar' },
        { value: 'Hiburan' },
        { value: 'Tagihan listrik atau air' },
        { value: 'Kesehatan' },
        { value: 'Pendidikan' },
        { value: 'Lainnya' }
    ]

    const changeHandler = (e) => {
        const { name, value } = e.target
        setItem((prev) => {
            return {
                ...prev,
                [name]: value
            }
        })
    }

    const updateHandler = async () => {
        if (!item.name.trim() || item.allocation < 1) {
            alert('Semua data harus di-isi!')
            return
        }

        await editBudget(item.id, item.name, item.allocation)
        window.location.reload()
    }

    const getBudgetById = async () => {
        const founded = await getBudgetByIdentic(id)
        setItem(founded.data.data)
    }

    useEffect(() => {
        setTimeout(() => {
            getBudgetById()
            setLoading(false)
        }, 2000);
    }, [])

    return (
        <div className='position-fixed top-0 start-0 bg-black bg-opacity-75 w-100 h-100'>
            <div className='h-100 d-flex justify-content-center align-items-center'>
                <section className='w-25 bg-white text-purple p-3 rounded-4'>
                    {
                        loading ? (
                            <div className="d-flex justify-content-center align-items-center h-100">
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
                        ) : (
                            <>
                                <h3 className='mb-3 fs-4'>Edit Budgeting</h3>
                                <div className="input-item">
                                    <label htmlFor="name">Nama</label>
                                    <div className="input-box">
                                        <select name='name' value={item.name || ''} onChange={changeHandler}>
                                            {
                                                categories.map((category) => (
                                                    <option key={category.value} value={category.value}>{category.value}</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                </div>
                                <div className="input-item">
                                    <label htmlFor="nominal">Nominal</label>
                                    <div className="input-box">
                                        <input name='allocation' type="number" className='no-arrow' value={item.allocation || ''} onChange={changeHandler} />
                                    </div>
                                </div>
                                <div className='d-flex justify-content-end gap-2'>
                                    <button className='bg-green text-purple p-2 border-0 rounded-3' onClick={updateHandler}>Update</button>
                                    <button className='bg-red text-white p-2 border-0 rounded-3' onClick={close}>Cancel</button>
                                </div>
                            </>
                        )
                    }
                </section>
            </div>
        </div>
    )
}
