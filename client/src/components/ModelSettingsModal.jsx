import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, Cpu, Key, ShieldCheck, Zap } from 'lucide-react';

const ModelSettingsModal = ({ isOpen, onClose }) => {
  const [modelData, setModelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [keys, setKeys] = useState({ geminiKey: '', pollinationsKey: '', huggingFaceKey: '' });
  const [keyStatus, setKeyStatus] = useState({ hasGemini: false, hasPollinations: false, hasHuggingFace: false });
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetch('http://localhost:5000/api/models')
        .then(res => res.json())
        .then(data => {
          setModelData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to load models:", err);
          setLoading(false);
        });

      fetch('http://localhost:5000/api/settings/keys')
        .then(res => res.json())
        .then(data => setKeyStatus(data))
        .catch(() => {});
    }
  }, [isOpen]);

  const handleSaveKeys = async (e) => {
    e.preventDefault();
    setSaveStatus('Saving keys...');
    try {
      const res = await fetch('http://localhost:5000/api/settings/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(keys)
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus('✓ Keys saved! Unlimited fast image & LLM access enabled.');
        setKeyStatus(prev => ({
          hasGemini: prev.hasGemini || !!keys.geminiKey,
          hasPollinations: prev.hasPollinations || !!keys.pollinationsKey,
          hasHuggingFace: prev.hasHuggingFace || !!keys.huggingFaceKey
        }));
        setTimeout(() => setSaveStatus(''), 4000);
      } else {
        setSaveStatus('Error saving: ' + (data.error || 'Unknown'));
      }
    } catch (err) {
      setSaveStatus('Error: ' + err.message);
    }
  };

  if (!isOpen) return null;

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
        borderRadius: '20px',
        width: '100%',
        maxWidth: '750px',
        maxHeight: '88vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: '#1e293b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Cpu color="#38bdf8" size={24} />
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: '700', margin: 0 }}>
                OMNIAI Model Registry & API Keys
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '2px 0 0 0' }}>
                Configure zero-limit Image Synthesis & LLM providers
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* API Key Configuration Section (Removes Free Limits) */}
        <form onSubmit={handleSaveKeys} style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(15, 23, 42, 0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 600, fontSize: '0.9rem', marginBottom: '14px' }}>
            <Key size={18} /> Instant Free-Limit Removal & Zero-Wait Image Keys
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {/* Pollinations Pollen Key */}
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.78rem', marginBottom: '4px', fontWeight: 500 }}>
                Pollinations Pollen Key {keyStatus.hasPollinations && <span style={{ color: '#10b981' }}>✓ Active</span>}
              </label>
              <input
                type="password"
                placeholder="pk_... (Get free at enter.pollinations.ai)"
                value={keys.pollinationsKey}
                onChange={e => setKeys({ ...keys, pollinationsKey: e.target.value })}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#fff',
                  fontSize: '0.82rem'
                }}
              />
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Removes 45s wait & watermarks completely</span>
            </div>

            {/* Hugging Face Token */}
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.78rem', marginBottom: '4px', fontWeight: 500 }}>
                Hugging Face Token {keyStatus.hasHuggingFace && <span style={{ color: '#10b981' }}>✓ Active</span>}
              </label>
              <input
                type="password"
                placeholder="hf_... (Get free at huggingface.co/settings/tokens)"
                value={keys.huggingFaceKey}
                onChange={e => setKeys({ ...keys, huggingFaceKey: e.target.value })}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#fff',
                  fontSize: '0.82rem'
                }}
              />
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Fastest 2s FLUX.1-schnell photorealism</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
            {saveStatus && <span style={{ color: saveStatus.includes('✓') ? '#34d399' : '#fbbf24', fontSize: '0.78rem' }}>{saveStatus}</span>}
            <button
              type="submit"
              style={{
                marginLeft: 'auto',
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                color: '#fff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              Save Keys & Remove Limits
            </button>
          </div>
        </form>

        {/* Models list */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loading ? (
            <div style={{ color: '#94a3b8', textAlign: 'center', padding: '30px' }}>Loading provider status...</div>
          ) : (
            modelData?.models?.map(model => (
              <div 
                key={model.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#fff', fontWeight: '600', fontSize: '1rem' }}>{model.name}</span>
                    {model.isDefault && (
                      <span style={{ background: '#3b82f6', color: '#fff', fontSize: '0.68rem', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>
                        ACTIVE CORE
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {model.status === 'active' ? (
                      <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: '600' }}>
                        <CheckCircle2 size={16} /> Online
                      </span>
                    ) : (
                      <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: '600' }}>
                        <AlertTriangle size={16} /> API Key Optional
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '18px', color: '#94a3b8', fontSize: '0.8rem' }}>
                  <span><strong>Provider:</strong> {model.provider}</span>
                  <span><strong>Latency:</strong> {model.latency}</span>
                </div>

                {/* Capabilities pills */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {model.capabilities.map((cap, i) => (
                    <span key={i} style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', color: '#38bdf8', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px' }}>
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ModelSettingsModal;