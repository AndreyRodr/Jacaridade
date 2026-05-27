import React, { useState, useEffect } from 'react';
import { Camera, Mail, User, ArrowLeft, Save, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar.jsx';

const EditProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: '',
    profilePicture: '',
    pixKey: ''
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        description: user.description || '',
        profilePicture: user.profilePicture || '',
        pixKey: user.pixKey || ''
      });
      setPreview(user.profilePicture);
    }
  }, []);

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
      };
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const compressedBase64 = await compressImage(file);
      setPreview(compressedBase64);
      setFormData({ ...formData, profilePicture: compressedBase64 });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:3001/api/me', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      localStorage.setItem('user', JSON.stringify(response.data));
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso! Redirecionando... ✨' });
      
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Erro ao atualizar o perfil. Tente novamente.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-wrapper">
      <Navbar />

      <main style={{ maxWidth: '42rem', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <button onClick={() => navigate('/')} className="btn-back">
          <ArrowLeft size={20} />
          <span>Voltar para o Feed</span>
        </button>

        <div className="login-card" style={{ maxWidth: '100%' }}>
          <div className="login-header" style={{ marginBottom: '2.5rem' }}>
            <h1 className="login-title">Personalizar Perfil</h1>
            <p className="login-subtitle">Deixe sua marca na comunidade Jacaridade.</p>
          </div>

          {message.text && (
            <div className={`login-error ${message.type === 'success' ? 'success-msg' : ''}`} style={
              message.type === 'success' 
              ? { backgroundColor: 'rgba(226, 240, 203, 0.3)', borderColor: 'var(--cozy-pastel-green)', color: '#15803d' } 
              : {}
            }>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '8rem', height: '8rem', borderRadius: '2.5rem', backgroundColor: 'var(--cozy-bg)', border: '4px solid white', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {preview ? (
                  <img src={preview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={48} color="rgba(var(--rgb-accent), 0.2)" />
                )}
                <input 
                  type="file" 
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--cozy-accent)', marginTop: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trocar Foto</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'rgba(var(--rgb-text), 0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Seu Nome</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={20} />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="form-input"
                    placeholder="Seu nome"
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'rgba(var(--rgb-text), 0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>E-mail de Contato</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={20} />
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="form-input"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div className="form-group" style={{ position: 'relative' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'rgba(var(--rgb-text), 0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bio / Interesses</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="4"
                  className="form-input"
                  style={{ paddingLeft: '1rem', resize: 'none' }}
                  placeholder="Conte o que te motiva a ajudar..."
                ></textarea>
                <div style={{ position: 'absolute', right: '1rem', bottom: '1rem', display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.3 }}>
                  <Sparkles size={16} color="var(--cozy-accent)" />
                  <span style={{ fontSize: '10px', fontWeight: 'bold' }}>Influencia seu match</span>
                </div>
              </div>

              {JSON.parse(localStorage.getItem('user'))?.type === 'O' && (
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'rgba(var(--rgb-text), 0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Chave PIX da ONG</label>
                  <input 
                    type="text" 
                    value={formData.pixKey}
                    onChange={(e) => setFormData({...formData, pixKey: e.target.value})}
                    className="form-input input-pix"
                    style={{ paddingLeft: '1rem', fontWeight: 'bold' }}
                    placeholder="E-mail, CPF, CNPJ ou Chave Aleatória"
                  />
                  <p style={{ fontSize: '10px', color: 'rgba(var(--rgb-text), 0.4)', marginTop: '0.5rem', fontStyle: 'italic' }}>Essa chave aparecerá para os apoiadores gerarem o QR Code.</p>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-submit" style={{ padding: '1.25rem', fontWeight: 900 }}>
              {loading ? 'Salvando...' : (
                <> <Save size={20} /> Salvar Alterações </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditProfile;