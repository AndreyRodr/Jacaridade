import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Heart, Copy, Check } from 'lucide-react';

const PixModal = ({ ong, onClose }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(ong.pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 200 }}>
      <div className="pix-modal-card">
        
        {/* Decoração de Fundo (Simulando os blurs do Tailwind) */}
        <div style={{ position: 'absolute', top: '-6rem', right: '-6rem', width: '12rem', height: '12rem', backgroundColor: 'rgba(var(--rgb-accent), 0.1)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
        <div style={{ position: 'absolute', bottom: '-6rem', left: '-6rem', width: '12rem', height: '12rem', backgroundColor: 'rgba(226, 240, 203, 0.2)', borderRadius: '50%', filter: 'blur(40px)' }}></div>

        <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'rgba(var(--rgb-text), 0.3)', cursor: 'pointer', transition: 'color 0.3s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--cozy-text)'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(var(--rgb-text), 0.3)'}>
          <X size={24} />
        </button>

        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '5rem', height: '5rem', backgroundColor: 'rgba(var(--rgb-accent), 0.2)', borderRadius: '2rem', marginBottom: '1.5rem' }}>
          <Heart size={40} color="var(--cozy-accent)" fill="var(--cozy-accent)" />
        </div>

        <h2 style={{ fontSize: '1.875rem', fontWeight: 900, marginBottom: '0.5rem' }}>Apoio Confirmado!</h2>
        <p style={{ color: 'rgba(var(--rgb-text), 0.6)', marginBottom: '2rem', fontWeight: 300, fontStyle: 'italic' }}>
          Obrigado por apoiar a <span style={{ fontWeight: 'bold', color: 'var(--cozy-accent)' }}>{ong.name}</span>. 
          Se desejar, faça uma doação via PIX:
        </p>

        {ong.pixKey ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '2.5rem', boxShadow: '0 20px 25px -5px rgba(var(--rgb-accent), 0.1)', marginBottom: '1.5rem', border: '1px solid rgba(var(--rgb-accent), 0.05)' }}>
              <QRCodeCanvas 
                value={ong.pixKey} 
                size={200}
                level={"H"}
                includeMargin={false}
                imageSettings={{
                  src: ong.profilePicture,
                  x: undefined,
                  y: undefined,
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
            </div>

            <div style={{ width: '100%', backgroundColor: 'var(--cozy-bg)', padding: '1rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', border: '1px solid rgba(var(--rgb-accent), 0.05)' }}>
              <code style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'rgba(var(--rgb-text), 0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, textAlign: 'left' }}>
                {ong.pixKey}
              </code>
              <button 
                onClick={handleCopy}
                style={{
                  padding: '0.5rem', 
                  borderRadius: '0.75rem', 
                  border: 'none', 
                  cursor: 'pointer', 
                  transition: 'all 0.3s',
                  backgroundColor: copied ? 'rgba(226, 240, 203, 1)' : 'rgba(var(--rgb-accent), 0.1)',
                  color: copied ? '#15803d' : 'var(--cozy-accent)'
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            {copied && <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#15803d', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Copiado!</span>}
          </div>
        ) : (
          <div style={{ padding: '2.5rem 1.5rem', backgroundColor: 'var(--cozy-bg)', borderRadius: '2rem', border: '2px dashed rgba(var(--rgb-accent), 0.1)' }}>
            <p style={{ fontSize: '0.875rem', color: 'rgba(var(--rgb-text), 0.4)', fontStyle: 'italic' }}>Esta ONG ainda não cadastrou uma chave PIX para doações diretas.</p>
          </div>
        )}

        <button 
          onClick={onClose}
          style={{ width: '100%', marginTop: '2.5rem', padding: '1rem', background: 'none', border: 'none', color: 'rgba(var(--rgb-text), 0.4)', fontWeight: 'bold', fontSize: '0.875rem', cursor: 'pointer', transition: 'color 0.3s' }}
          onMouseOver={(e) => e.currentTarget.style.color = 'var(--cozy-text)'} 
          onMouseOut={(e) => e.currentTarget.style.color = 'rgba(var(--rgb-text), 0.4)'}
        >
          Fechar e continuar navegando
        </button>
      </div>
    </div>
  );
};

export default PixModal;