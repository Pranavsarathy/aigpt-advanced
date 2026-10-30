import React from 'react';
import { X, Download, FileText } from 'lucide-react';

const PdfViewerModal = ({ base64Data, filename, onClose }) => {
  if (!base64Data) return null;
  const pdfUrl = `data:application/pdf;base64,${base64Data}`;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#0f172a',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '900px',
        height: '85vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          background: '#1e293b',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FileText color="#818cf8" size={22} />
            <span style={{ color: '#fff', fontWeight: '600', fontSize: '1rem' }}>
              {filename || 'Generated Document.pdf'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <a
              href={pdfUrl}
              download={filename || 'document.pdf'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#4f46e5',
                color: '#fff',
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '600',
                transition: 'background 0.2s'
              }}
            >
              <Download size={16} /> Download PDF
            </a>
            <button 
              onClick={onClose} 
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Embedded PDF Viewer */}
        <div style={{ flex: 1, width: '100%', background: '#020617' }}>
          <iframe
            src={pdfUrl}
            title="PDF Preview"
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </div>
      </div>
    </div>
  );
};

export default PdfViewerModal;
