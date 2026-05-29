import React from 'react'
import { nanoid } from "nanoid";
import { useInput } from '../utils/utils'
import useAppContext from '../contexts/AppContext';
import { addBudget } from '../utils/requestAPi';

export default function AddBudgeting({ close }) {
    const [name, setName] = useInput()
    const [allocation, setAllocation] = useInput()

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

    const addHandler = async () => {
        try {
            const res = await addBudget(name, allocation)
            close()
            window.location.reload()
        } catch (error) {
            alert(error.response.data.message)
        }
    }

    return (
        <div className='position-fixed top-0 start-0 bg-black bg-opacity-75 w-100 h-100'>
            <div className='h-100 d-flex justify-content-center align-items-center'>
                <section className='w-25 bg-white text-purple p-3 rounded-4'>
                    <h3 className='mb-3 fs-4'>Tambah Budgeting</h3>
                    <div className="input-item">
                        <label htmlFor="name">Category</label>
                        <div className="input-box">
                            <select value={name} onChange={setName}>
                                <option value='' disabled></option>
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
                            <input type="number" className='no-arrow' value={allocation} onChange={setAllocation} />
                        </div>
                    </div>
                    <div className='d-flex justify-content-end gap-2'>
                        <button className='bg-green text-purple p-2 border-0 rounded-3' onClick={addHandler}>Add</button>
                        <button className='bg-red text-white p-2 border-0 rounded-3' onClick={close}>Cancel</button>
                    </div>
                </section>
            </div>
        </div>
    )
}
