import React, { useState } from 'react';

const initialStores = [
  {
    id: 1,
    image: '/Bepcuame-cuahang.png',
    name: 'Bếp của Mẹ - Chi nhánh 1',
    address: '296/29 Lương Định Của, Nha Trang',
    phone: '0909 123 456',
  },
  {
    id: 2,
    image: '/Bepcuame-cuahang.png',
    name: 'Bếp của Mẹ - Chi nhánh 2',
    address: '01 Nguyễn Trãi, P. Phước Hải, Nha Trang, Khánh Hòa',
    phone: '0909 123 456',
  },
];

export default function SettingAdminPage() {
  const [stores, setStores] = useState(initialStores);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);

  const handleChange = (id: number, field: string, value: string) => {
    setStores(prev => prev.map(store => (store.id === id ? { ...store, [field]: value } : store)));
  };

  const handleSave = (id: number) => {
    setSavingId(id);
    const newStores = stores.map(store => (store.id === id ? { ...store } : store));
    localStorage.setItem('bcm_stores', JSON.stringify(newStores));
    setTimeout(() => {
      setSavingId(null);
      setSuccessId(id);
      setTimeout(() => setSuccessId(null), 1500);
    }, 1000);
  };

  return (
    <div style={{ maxWidth: 900, margin: '32px auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #0001', padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 32, textAlign: 'center' }}>Cài đặt cửa hàng</h1>
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
        {stores.map(store => (
          <div
            key={store.id}
            style={{
              width: 340,
              background: '#fafafa',
              borderRadius: 16,
              boxShadow: '0 1px 6px #0001',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <img
              src={store.image}
              alt={store.name}
              style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 16, marginBottom: 18, border: '1.5px solid #eee' }}
            />
            <div style={{ width: '100%', marginBottom: 14 }}>
              <label style={{ fontWeight: 600 }}>Tên cửa hàng</label>
              <input
                value={store.name}
                onChange={e => handleChange(store.id, 'name', e.target.value)}
                required
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1.5px solid #e0e0e0', marginTop: 6 }}
              />
            </div>
            <div style={{ width: '100%', marginBottom: 14 }}>
              <label style={{ fontWeight: 600 }}>Địa chỉ</label>
              <input
                value={store.address}
                onChange={e => handleChange(store.id, 'address', e.target.value)}
                required
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1.5px solid #e0e0e0', marginTop: 6 }}
              />
            </div>
            <div style={{ width: '100%', marginBottom: 18 }}>
              <label style={{ fontWeight: 600 }}>Số điện thoại</label>
              <input
                value={store.phone}
                onChange={e => handleChange(store.id, 'phone', e.target.value)}
                required
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1.5px solid #e0e0e0', marginTop: 6 }}
              />
            </div>
            <button
              onClick={() => handleSave(store.id)}
              disabled={savingId === store.id}
              style={{
                width: '100%',
                background: '#C92A15',
                color: '#fff',
                fontWeight: 700,
                fontSize: 17,
                border: 'none',
                borderRadius: 10,
                padding: '12px 0',
                marginTop: 8,
                boxShadow: '0 2px 8px #C92A1533',
                cursor: 'pointer',
                letterSpacing: 0.1,
              }}
            >
              {savingId === store.id ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
            {successId === store.id && (
              <div style={{ color: '#17823c', fontWeight: 600, fontSize: 15, marginTop: 12, textAlign: 'center' }}>Đã lưu thành công!</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
