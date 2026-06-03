import React, { useState } from 'react';

export default function PeriodeDropdown({ bulan, setBulan, tahun, setTahun }) {
  return (
    <div className='bg-purple rounded-3' style={{ width: '150px', paddingRight: '7px', paddingBottom: '7px' }}>
      <div className='bg-gray d-flex flex-column p-2 rounded-3' style={{ width: '150px' }}>
        <p className='m-0 small text-end text-muted'>Periode</p>

        <select
          className="form-select form-select-sm border-0 bg-transparent fw-bold p-0 shadow-none"
          value={bulan}
          onChange={(e) => setBulan(e.target.value)}
          style={{ cursor: 'pointer' }}
        >
          <option value="Januari">Januari</option>
          <option value="Februari">Februari</option>
          <option value="Maret">Maret</option>
          <option value="April">April</option>
          <option value="Mei">Mei</option>
          <option value="Juni">Juni</option>
          <option value="Juli">Juli</option>
          <option value="Agustus">Agustus</option>
          <option value="September">September</option>
          <option value="Oktober">Oktober</option>
          <option value="November">November</option>
          <option value="Desember">Desember</option>
        </select>

        <select
          className="form-select form-select-sm border-0 bg-transparent p-0 small shadow-none"
          value={tahun}
          onChange={(e) => setTahun(e.target.value)}
          style={{ cursor: 'pointer', fontSize: '0.85rem' }}
        >
          <option value="2025">2025</option>
          <option value="2026">2026</option>
          <option value="2027">2027</option>
        </select>
      </div>
    </div>
  );
}