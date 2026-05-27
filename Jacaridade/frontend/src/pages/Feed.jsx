import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Sparkles, Heart, Users, HeartOff, PlusCircle } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import PostForm from '../components/PostForm.jsx';
import OngModal from '../components/OngModal.jsx';
import PixModal from '../components/PixModal.jsx';

const Feed = () => {
  const [ongs, setOngs] = useState([]);
  const [userSupports, setUserSupports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOng, setSelectedOng] = useState(null);
  const [showPixModal, setShowPixModal] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchData = async () => { /* Logica mantida igual... */
    try {
      const ongsResponse = await axios.get('http://localhost:3001/api/ongs');
      let ongsData = ongsResponse.data;
      if (user) {
        const profileResponse = await axios.get(`http://localhost:3001/api/users/${user.id}`);
        const supportedIds = profileResponse.data.supportedOngs.map(o => o.id);
        setUserSupports(supportedIds);

        if (user.description) {
          const userInterests = user.description.toLowerCase().split(/\W+/).filter(w => w.length > 3);
          ongsData = ongsData.map(ong => {
            let score = 0;
            const ongDesc = (ong.description || '').toLowerCase();
            userInterests.forEach(interest => { if (ongDesc.includes(interest)) score++; });
            return { ...ong, matchScore: score };
          });
          ongsData.sort((a, b) => b.matchScore - a.matchScore);
        }
      }
      setOngs(ongsData);
    } catch (error) { console.error('Erro ao buscar dados', error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleToggleSupport = async (e, ong, isSupporting) => { /* Logica mantida igual... */
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      const url = `http://localhost:3001/api/ongs/${ong.id}/support`;
      if (isSupporting) {
        await axios.delete(url, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });
        if (ong.pixKey) setShowPixModal(ong);
      }
      fetchData(); 
    } catch (error) { alert(error.response?.data?.error || 'Erro ao processar apoio'); }
  };

  return (
    <div className="app-wrapper">
      <Navbar />
      
      <main className="feed-main">
        <header className="feed-header">
          <div>
            <h1 className="feed-title">Feed Solidário</h1>
            <p className="feed-subtitle">Descubra projetos, acompanhe atualizações e apoie as causas que transformam o mundo.</p>
          </div>
          {user?.type === 'U' && (
            <div className="impact-card">
              <span style={{fontSize: '10px', fontWeight: 900, color: 'rgba(var(--rgb-text),0.3)', textTransform: 'uppercase', display: 'block', marginBottom: '4px'}}>Impacto Atual</span>
              <span style={{fontSize: '1.5rem', fontWeight: 900, color: 'var(--cozy-accent)'}}>{userSupports.length} causas apoiadas</span>
            </div>
          )}
        </header>

        {user?.type === 'O' && (
           <div style={{maxWidth: '48rem', margin: '0 auto'}}>
             <PostForm onPostCreated={fetchData} />
           </div>
        )}

        {loading ? (
          <div style={{display: 'flex', justifyContent: 'center', padding: '4rem'}}>Carregando...</div>
        ) : (
          <div className="ong-grid">
            {ongs.map((ong) => {
              const isSupporting = userSupports.includes(ong.id);
              return (
                <div key={ong.id} onClick={() => setSelectedOng(ong)} className="ong-card">
                  <div className="ong-card-image">
                    {ong.profilePicture ? (
                      <img src={ong.profilePicture} alt={ong.name} />
                    ) : (
                      <Heart size={48} color="rgba(var(--rgb-accent), 0.1)" />
                    )}
                    {ong.matchScore > 0 && user?.type === 'U' && (
                      <div className="ong-badge">
                        <Sparkles size={12} /> Recomendado
                      </div>
                    )}
                  </div>

                  <div className="ong-card-content">
                    <h3 className="ong-card-title">{ong.name}</h3>
                    <p className="ong-card-desc">{ong.description || 'Esta ONG ainda não adicionou uma descrição.'}</p>

                    <div className="ong-card-footer">
                      {user?.type === 'U' ? (
                        <button onClick={(e) => handleToggleSupport(e, ong, isSupporting)} className={`btn-support ${isSupporting ? 'active' : 'inactive'}`}>
                          {isSupporting ? <HeartOff size={16} /> : <Heart size={16} fill="currentColor" />}
                          {isSupporting ? 'Parar Apoio' : 'Apoiar'}
                        </button>
                      ) : (
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', fontWeight: 'bold', color: 'var(--cozy-accent)', textTransform: 'uppercase'}}>
                          <PlusCircle size={16} /> Ver Mural
                        </div>
                      )}
                      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
                        <span style={{fontSize: '1.125rem', fontWeight: 900}}>{ong.supporters?.length || 0}</span>
                        <span style={{fontSize: '9px', fontWeight: 900, color: 'rgba(var(--rgb-text),0.3)', textTransform: 'uppercase', marginTop: '4px'}}>Apoiadores</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {selectedOng && <OngModal ong={selectedOng} onClose={() => setSelectedOng(null)} />}
      {showPixModal && <PixModal ong={showPixModal} onClose={() => setShowPixModal(null)} />}
    </div>
  );
};

export default Feed;