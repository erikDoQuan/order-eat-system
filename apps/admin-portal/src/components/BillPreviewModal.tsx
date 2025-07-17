import React from 'react';

export default function BillPreviewModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.3)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ background: '#fff', borderRadius: 8, padding: 16, width: '80vw', height: '90vh', position: 'relative', boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 8, right: 8, fontSize: 24, background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
        <iframe src={url} style={{ width: '100%', height: 'calc(100% - 48px)', border: 'none' }} title="Xem hóa đơn PDF" />
        <div style={{ marginTop: 8, textAlign: 'right' }}>
          <a href={url} target="_blank" rel="noopener noreferrer" download>
            <button style={{ marginRight: 8 }}>Tải PDF</button>
          </a>
          <button onClick={() => window.open(url, '_blank')}>In hóa đơn</button>
        </div>
      </div>
    </div>
  );
} 