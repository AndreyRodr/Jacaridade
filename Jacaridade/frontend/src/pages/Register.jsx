import React, { useState } from 'react';
import { Heart, Mail, Lock, User, Camera, ArrowRight, Building2 } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', description: '', type: 'U', profilePicture: '', pixKey: ''
  });
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const compressImage = (file) => { /* Mantido igual... */
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; const MAX_HEIGHT = 800;
          let width = img.width; let height = img.height;
          if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } } 
          else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
          canvas.width = width; canvas.height = height;
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
    setError(''); setLoading(true);
    try {
      await axios.post('http://localhost:3001/api/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao cadastrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card" style={{ maxWidth: '42rem' }}>
        <div className="login-header">
          <h1 className="login-title">Criar conta</h1>
          <p className="login-subtitle">Junte-se à nossa comunidade de solidariedade.</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="type-selector">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'U' })}
              className={`btn-type ${formData.type === 'U' ? 'active' : ''}`}
            >
              <User size={16} /> Sou Usuário
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'O' })}
              className={`btn-type ${formData.type === 'O' ? 'active' : ''}`}
            >
              <Building2 size={16} /> Sou ONG
            </button>
          </div>

          <div className="register-grid">
            <div className="profile-upload-wrapper">
              <div className="profile-upload-box">
                {preview ? (
                  <img src={preview} alt="Preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                ) : (
                  <Camera size={32} color="rgba(var(--rgb-accent), 0.3)" />
                )}
                <input type="file" onChange={handleFileChange} className="profile-upload-input" accept="image/*" />
              </div>
              <div style={{marginTop: '1rem', fontSize: '0.75rem', color: 'rgba(var(--rgb-text), 0.4)'}}>
                Foto de {formData.type === 'O' ? 'Logo' : 'Perfil'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Nome {formData.type === 'O' ? 'da ONG' : 'Completo'}</label>
                <input type="text" required className="form-input" style={{paddingLeft: '1rem'}}
                  placeholder={formData.type === 'O' ? 'Nome Institucional' : 'Como quer ser chamado'}
                  value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>E-mail</label>
                <input type="email" required className="form-input" style={{paddingLeft: '1rem'}}
                  placeholder="seu@email.com"
                  value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Senha</label>
                <input type="password" required className="form-input" style={{paddingLeft: '1rem'}}
                  placeholder="••••••••"
                  value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>{formData.type === 'O' ? 'Descrição da ONG' : 'Seus Interesses'}</label>
            <textarea rows="3" className="form-input" style={{paddingLeft: '1rem', resize: 'none'}}
              placeholder={formData.type === 'O' ? 'Conte um pouco sobre o trabalho de vocês...' : 'Quais causas você quer apoiar?'}
              value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          {formData.type === 'O' && (
            <div className="form-group">
              <label>Chave PIX da ONG</label>
              <input type="text" className="form-input input-pix" style={{paddingLeft: '1rem'}}
                placeholder="E-mail, CPF, CNPJ ou Chave Aleatória"
                value={formData.pixKey} onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
              />
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
            <ArrowRight size={20} />
          </button>
        </form>

        <div className="login-footer">
          <p>Já tem conta? <button onClick={() => navigate('/login')}>Faça Login</button></p>
        </div>
      </div>
    </div>
  );
};

export default Register;