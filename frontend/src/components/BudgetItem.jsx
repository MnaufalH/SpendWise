import React from 'react'
import { ProgressBar } from 'react-bootstrap'
import { FaRegEdit } from 'react-icons/fa'
import { RiDeleteBin6Line } from "react-icons/ri";
import { deleteBudget } from '../utils/requestAPi';

export default function BudgetItem({ item, showEditModal }) {
    const persentage = ((item.allocation - item.used) / item.allocation) * 100
    let color

    if (persentage > 50) {
        color = 'green'
    } else if (persentage > 20) {
        color = 'yellow'
    }
    else color = 'red'

    const deleteHendler = () => {
        deleteBudget(item.id)
        window.location.reload()
    }

    return (
        <div className='d-flex align-items-center justify-content-between gap-3'>
            <div className='w-100'>
                <div className='d-flex align-items-center mb-2 gap-4'>
                    <p className='m-0 ms-2'>{item.name}</p>
                    <p className='m-0'>Rp.{(item.allocation - item.used).toLocaleString()}</p>
                    <p className='m-0'>/</p>
                    <p className='m-0'>Rp.{item.allocation.toLocaleString()}</p>
                </div>
                <ProgressBar variant={color} now={persentage} style={{ height: '8px' }} />
            </div>
            <button className='p-0 border-0 bg-transparent'>
                <FaRegEdit size={22} onClick={() => showEditModal(item.id, true)} />
            </button>
            <button className='p-0 border-0 bg-transparent'>
                <RiDeleteBin6Line size={23} className='text-red' onClick={deleteHendler} />
            </button>
        </div>
    )
}
