import React, { useState } from 'react'
import { ProgressBar, Spinner } from 'react-bootstrap'
import { SlCompass } from "react-icons/sl"
import { CiLock, CiUnlock } from "react-icons/ci"
import { FiPlus } from 'react-icons/fi'
import { FaRegEdit } from "react-icons/fa";
import BlockTips from '../components/BlockTips'
import BudgetItem from '../components/BudgetItem'
import AddBudgeting from '../components/AddBudgeting'
import EditBudgeting from '../components/EditBudgeting'
import useAppContext from '../contexts/AppContext'

export default function Dashboard() {
  const { budgets, wallets } = useAppContext().user

  const [showCash, setShowCash] = useState(false)
  const [addModal, setAddModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [editBudgetId, setEditBudgetId] = useState('')

  const showEditModal = (id, show) => {
    setEditBudgetId(id)
    setEditModal(show)
  }

  const totalSaldo = wallets.reduce((acc, wallet) => acc + wallet.amount, 0)

  return (
    <article className='p-3'>

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
            <h2 className='m-0 fs-3' style={{ height: '34px' }}>Dasboard</h2>
            <p className='m-0'>Hallo, Tama! 🙌</p>
          </div>
        </div>
        <div className='bg-purple rounded-3' style={{ width: '157px' }}>
          <div className='bg-gray d-flex flex-column p-2 rounded-3' style={{ width: '150px' }}>
            <p className='m-0 small text-end'>Periode</p>
            <p className='m-0 fw-bold'>Mei, 2026</p>
            <p className='m-0'>1-31</p>
          </div>
        </div>
      </div>

      {/* Cash */}
      <div className='bg-purple p-4 rounded-4 mb-4'>
        <div className='d-flex justify-content-between mb-2'>
          <div className='text-white'>
            <h3 className='fs-5 fw-light'>Your Cash</h3>
            <div className='d-flex align-items-center mb-2 gap-2'>
              {
                showCash ? (
                  <>
                    <p className='m-0 fs-5 fw-semibold'>Rp.{totalSaldo.toLocaleString()}</p>
                    <button className='d-flex align-items-center bg-transparent border-0 text-white' onClick={() => setShowCash((prev) => !prev)}><CiUnlock size={20} /></button>
                  </>
                ) : (
                  <>
                    <p className='m-0 fs-5 fw-semibold'>Rp.*******</p>
                    <button className='d-flex align-items-center bg-transparent border-0 text-white' onClick={() => setShowCash((prev) => !prev)}><CiLock size={20} /></button>
                  </>
                )
              }

            </div>
            <p className='m-0'>Manfaatkan Saldo dengan <span className='fw-medium text-yellow'>Bijak 💥</span></p>
          </div>
        </div>
      </div>

      <div className='bg-purple rounded-4 mb-4' style={{ minHeight: '100px' }}>
        <div style={{ height: '8px' }} />
        <div className='p-4 bg-white rounded-4' style={{ minHeight: '100px' }}>
          <div className='d-flex justify-content-between align-items-center mb-4'>
            <h3 className='m-0 fs-5 fw-semibold text-purple'>Budgeting</h3>
            <button className='px-3 px-2 bg-gray border-0 d-flex align-items-center justify-content-center rounded-pill' onClick={() => setAddModal(true)}>
              <FiPlus />
              <p className='m-0 text-purple'>Tambah Budgeting</p>
            </button>
          </div>

          {/* Data Budgeting */}
          <div className='d-flex flex-column gap-4 justify-content-center'>
            {
              budgets.length > 0 ? (
                budgets.map((item) => (
                  <BudgetItem key={item.id} item={item} showEditModal={showEditModal} />
                ))
              ) : (
                <p className='text-center text-red'>Anda belum melakukan budgeting</p>
              )
            }
          </div>
        </div>
      </div>

      <div className='d-flex align-items-center gap-5'>
        <BlockTips className='bg-yellow bg-opacity-50 p-2 w-50 border border-3 border-yellow rounded-4' message='Sebaiknya anda mengurasi jajan, karena sisa pada bulan ini sudah menipis' />
        <BlockTips className='bg-green bg-opacity-50 p-2 w-50 border border-3 border-green rounded-4' message='Sebaiknya anda mengurasi jajan, karena sisa pada bulan ini sudah menipis' />
      </div>

      {
        addModal ? (
          <AddBudgeting close={() => setAddModal(false)} />
        ) : editModal ? (
          <EditBudgeting close={() => setEditModal(false)} id={editBudgetId} />
        ) : (<></>)
      }
    </article >
  )
}
