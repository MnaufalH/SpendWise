import React, { useState } from 'react'
import { nanoid } from "nanoid";
import { SlCompass } from "react-icons/sl"
import useAppContext from '../contexts/AppContext';

export default function Transaction() {
    const { budgets, transactions, wallets } = useAppContext().user
    const { addTransactions, updateTransaction, deleteTransaction } = useAppContext()
    const inputStyle = {
        width: "100%",
        padding: "10px",
        marginBottom: "10px",
        borderRadius: "8px",
        border: "1px solid #ccc",
    };

    const [showModal, setShowModal] = useState(false)
    const [transactionId, setTransactionId] = useState(null)
    const [cache, setCache] = useState(null)
    const [form, setForm] = useState({
        type: "",
        descript: "",
        amount: "",
        category: "",
        date: "",
        wallet: "",
    })

    const handleChange = (e) => {
        const { name, value } = e.target

        setForm({
            ...form,
            [name]: value
        })
    }

    const handleEdit = (id) => {
        const foundedTransaction = transactions.find((transaction) => transaction.id === id)

        if (!foundedTransaction) {
            alert("Transaksi tidak ditemukan");
            return;
        }

        setCache(foundedTransaction)
        setForm({ ...foundedTransaction, amount: Math.abs(foundedTransaction.amount).toString() })
        setTransactionId(id)
        setShowModal(true)
    }

    const handleSave = () => {
        if (!form.type.trim() || !form.descript.trim() || !form.amount.trim() || !form.date.trim() || !form.wallet.trim()) {
            alert("Isi semua data!");
            return;
        }

        const id = `trc-${nanoid(5)}`
        const parsedAmount = parseInt(form.amount)

        const newTransaction = {
            id, ...form,
            amount: form.type === 'Pemasukan' ? parsedAmount : -parsedAmount
        }

        if (transactionId !== null) {
            updateTransaction(cache, newTransaction);
        } else {
            addTransactions(newTransaction);
        }

        setShowModal(false)
        setTransactionId(null)
        setCache(null)

        setForm({
            type: "",
            descript: "",
            amount: "",
            category: "",
            date: "",
            wallet: "",
        })
    }

    const handleDelete = (id) => {
        const foundedTransaction = transactions.find((transaction) => transaction.id === id)

        deleteTransaction(foundedTransaction)
    }

    const totalIncome = transactions
        .filter((t) => t.amount > 0)
        .reduce((a, b) => a + b.amount, 0);

    const totalExpense = transactions
        .filter((t) => t.amount < 0)
        .reduce((a, b) => a + b.amount, 0);


    const saldo = wallets.reduce((total, w) => total + w.amount, 0);

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
                        <h2 className='m-0 fs-3' style={{ height: '34px' }}>Transaction</h2>
                        <p className='m-0'>Hallo, Tama! 🙌</p>
                    </div>
                </div>
                <button
                    className='bg-purple text-white small px-3 py-1 rounded-3 border-0'
                    onClick={() => {
                        setShowModal(true);
                        setTransactionId(null);
                    }}
                >
                    + Tambah Transaksi
                </button>
            </div>

            {/* SUMMARY */}
            <div className='d-flex gap-4 mb-4'>
                <div className='bg-green p-2 rounded-3 bg-opacity-50' style={{ minWidth: '180px' }}>
                    <h3 className='m-0 text-opacity-75 fs-5 fw-semibold'>Pemasukan</h3>
                    <p className='m-0 fs-4 fw-semibold'>Rp {totalIncome.toLocaleString()}</p>
                </div>

                <div className='bg-red p-2 rounded-3 bg-opacity-25' style={{ minWidth: '180px' }}>
                    <h3 className='m-0 text-opacity-75 fs-5 fw-semibold'>Pengeluaran</h3>
                    <p className='m-0 fs-4 fw-semibold'>Rp {Math.abs(totalExpense).toLocaleString()}</p>
                </div>

                <div className='bg-white p-2 rounded-3 bg-opacity-75 border border-1 border-gray' style={{ minWidth: '180px' }}>
                    <h3 className='m-0 text-opacity-75 fs-5 fw-semibold'>Saldo</h3>
                    <p className='m-0 fs-4 fw-semibold'>Rp {saldo.toLocaleString()}</p>
                </div>
            </div>

            {/* LIST */}
            <div className='bg-white p-3 rounded-3 text-purple'>
                <h3 className='mb-3 fs-4 fw-fw-semibold'>Transaction List</h3>

                {
                    transactions.length > 0 ? (
                        transactions.map((item) => (
                            <div key={item.id} className='p-2 border-1 border-bottom border-gray'>
                                <div>
                                    <p className='m-0'>{item.date}</p>
                                </div>
                                <div className='d-flex justify-content-between align-items-center'>
                                    <p className='m-0 fw-semibold'>{item.descript}</p>
                                    <div className='d-flex gap-2 align-items-center'>
                                        <span style={{ color: item.amount < 0 ? "red" : "green" }}>
                                            {item.amount < 0 ? "-Rp " : "Rp "}
                                            {Math.abs(item.amount).toLocaleString()}
                                        </span>

                                        <button className='bg-yellow px-3 py-1 border-0 rounded-2' onClick={() => handleEdit(item.id)}>Edit</button>
                                        <button className='bg-red px-3 py-1 border-0 rounded-2 text-white' onClick={() => handleDelete(item.id)}>Hapus</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className='text-center'>Belum ada transaksi</p>
                    )
                }
            </div>

            {/* POPUP */}
            {showModal && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "rgba(0,0,0,0.4)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}>
                    <div style={{ background: "white", padding: "20px", borderRadius: "10px", width: "350px" }}>

                        <h2>{transactionId !== null ? "Edit Transaksi" : "Tambah Transaksi"}</h2>

                        <label htmlFor="type">Jenis Transaksi</label>
                        <select name="type" value={form.type} onChange={handleChange} style={inputStyle}>
                            <option value='' disabled>Pilih jenis</option>
                            <option value='Pemasukan'>Pemasukan</option>
                            <option value='Pengeluaran'>Pengeluaran</option>
                        </select>

                        <label htmlFor="descript">Keterangan Transaksi</label>
                        <input name="descript" value={form.descript} onChange={handleChange} placeholder="Keterangan" style={inputStyle} />
                        <label htmlFor="amount">Nominal</label>
                        <input name="amount" value={form.amount} onChange={handleChange} type="number" placeholder="Jumlah" style={inputStyle} />

                        {
                            form.type === 'Pengeluaran' && (
                                <>
                                    <label htmlFor="category">Kategory</label>
                                    <select name="category" value={form.category} onChange={handleChange} style={inputStyle}>
                                        {
                                            budgets.length > 0 ? (
                                                <>
                                                    <option value='' disabled>Pilih Kategory</option>
                                                    {
                                                        budgets.map((budget) => (
                                                            <option key={budget.name} value={budget.name}>{budget.name}</option>
                                                        ))
                                                    }
                                                </>
                                            ) : (
                                                <option value='' disabled>Belum ada budgeting</option>
                                            )
                                        }
                                    </select>
                                </>
                            )
                        }

                        <label htmlFor="date">Tanggal</label>
                        <input name="date" value={form.date} onChange={handleChange} type="date" style={inputStyle} />

                        <label htmlFor="wallet">Sumber dana</label>
                        <select name="wallet" value={form.wallet} onChange={handleChange} style={inputStyle}>
                            {
                                wallets.length > 0 ? (
                                    <>
                                        <option value='' disabled>Pilih Kategory</option>
                                        {
                                            wallets.map((wallet) => (
                                                <option key={wallet.name} value={wallet.name}>{wallet.name}</option>
                                            ))
                                        }
                                    </>

                                ) : (
                                    <option value='' disabled>Belum memiliki wallet</option>
                                )
                            }
                        </select>

                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <button onClick={() => {
                                setShowModal(false)
                                setCache(null)
                                setForm({
                                    type: "",
                                    descript: "",
                                    amount: "",
                                    category: "",
                                    date: "",
                                    wallet: "",
                                })
                            }}>Batal</button>
                            <button onClick={handleSave}>Simpan</button>
                        </div>
                    </div>
                </div>
            )}
        </article>
    )
}
