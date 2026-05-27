import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Sparkles, Heart, Users, HeartOff, PlusCircle, Compass, LayoutList } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import PostForm from '../components/PostForm.jsx';
import OngModal from '../components/OngModal.jsx';
import PixModal from '../components/PixModal.jsx';

const Feed = () => {
  const [ongs, setOngs] = useState([]);
  const [userSupports, setUserSupports] = useState([]);
  const [feedPosts, setFeedPosts] = useState([]); // Guarda os posts do feed do usuário
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' (Descobrir) ou 'feed' (Meu Feed)
  const [loading, setLoading] = useState(true);
  const [selectedOng, setSelectedOng] = useState(null);
  const [showPixModal, setShowPixModal] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchData = async () => {
    try {
      const ongsResponse = await axios.get('http://localhost:3001/api/ongs');
      let ongsData = ongsResponse.data;

      if (user) {
        const profileResponse = await axios.get(`http://localhost:3001/api/users/${user.id}`);
        const supportedIds = profileResponse.data.supportedOngs.map(o => o.id);
        setUserSupports(supportedIds);

        // --- BUSCAR POSTS DAS ONGS APOIADAS ---
        if (user.type === 'U' && supportedIds.length > 0) {
          try {
            // Cria um array de requisições para buscar os posts de cada ONG apoiada
            const postPromises = supportedIds.map(id => axios.get(`http://localhost:3001/api/posts/ong/${id}`));
            const postResponses = await Promise.all(postPromises);
            
            // Junta todos os posts e anexa a foto/nome da ONG em cada post
            let posts = postResponses.flatMap((res, index) => {
              const ongId = supportedIds[index];
              const ongInfo = ongsData.find(o => o.id === ongId);
              return res.data.map(post => ({ ...post, ong: ongInfo }));
            });
            
            // Ordena os posts: os mais novos primeiro
            posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setFeedPosts(posts);
          } catch (err) {
            console.error('Erro ao buscar posts para o feed', err);
          }
        } else {
          setFeedPosts([]);
        }

        // --- CALCULAR MATCH SCORE (Recomendações) ---
        if (user.description) {
          const userInterests = user.description.toLowerCase().split(/\W+/).filter(w => w.length > 3);
          ongsData = ongsData.map(ong => {
            let score = 0;
            const ongDesc = (ong.description || '').toLowerCase();
            userInterests.forEach(interest => {
              if (ongDesc.includes(interest)) score++;
            });
            return { ...ong, matchScore: score };
          });
          ongsData.sort((a, b) => b.matchScore - a.matchScore);
        }
      }

      setOngs(ongsData);
    } catch (error) {
      console.error('Erro ao buscar dados', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleSupport = async (e, ong, isSupporting) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      const url = `http://localhost:3001/api/ongs/${ong.id}/support`;
      if (isSupporting) {
        await axios.delete(url, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });
        if (ong.pixKey) {
          setShowPixModal(ong);
        }
      }
      fetchData(); // Recarrega os dados (incluindo o feed de posts)
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao processar apoio');
    }
  };

  return (
    <div className="app-wrapper">
      <Navbar />
      
      <main className="feed-main">
        <header className="feed-header">
          <div>
            <h1 className="feed-title">Feed Solidário</h1>
            <p className="feed-subtitle">
              Descubra projetos, acompanhe atualizações e apoie as causas que transformam o mundo.
            </p>
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

        {/* NAVEGAÇÃO DE ABAS PARA USUÁRIOS (Descobrir x Feed) */}
        {user?.type === 'U' && (
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', borderBottom: '2px solid rgba(var(--rgb-accent), 0.1)', paddingBottom: '1rem' }}>
            <button 
              onClick={() => setActiveTab('explore')}
              style={{
                padding: '0.75rem 1.5rem', borderRadius: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', cursor: 'pointer', transition: 'all 0.3s',
                backgroundColor: activeTab === 'explore' ? 'var(--cozy-accent)' : 'transparent',
                color: activeTab === 'explore' ? 'white' : 'rgba(var(--rgb-text), 0.5)'
              }}
            >
              <Compass size={18} /> Descobrir ONGs
            </button>
            <button 
              onClick={() => setActiveTab('feed')}
              style={{
                padding: '0.75rem 1.5rem', borderRadius: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', cursor: 'pointer', transition: 'all 0.3s',
                backgroundColor: activeTab === 'feed' ? 'var(--cozy-accent)' : 'transparent',
                color: activeTab === 'feed' ? 'white' : 'rgba(var(--rgb-text), 0.5)'
              }}
            >
              <LayoutList size={18} /> Meu Feed
            </button>
          </div>
        )}

        {loading ? (
          <div style={{display: 'flex', justifyContent: 'center', padding: '4rem'}}>
            <div style={{ width: '3rem', height: '3rem', borderTop: '4px solid var(--cozy-accent)', borderRight: '4px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          </div>
        ) : (
          <>
            {/* ABA: DESCOBRIR (Mostra o grid de ONGs) */}
            {(activeTab === 'explore' || user?.type === 'O') && (
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
                            <button 
                              onClick={(e) => handleToggleSupport(e, ong, isSupporting)} 
                              className={`btn-support ${isSupporting ? 'active' : 'inactive'}`}
                            >
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

            {/* ABA: MEU FEED (Mostra os posts das ONGs apoiadas) */}
            {activeTab === 'feed' && user?.type === 'U' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '42rem', margin: '0 auto' }}>
                {feedPosts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'var(--cozy-card)', borderRadius: '2.5rem', border: '1px solid rgba(var(--rgb-accent), 0.1)' }}>
                    <LayoutList size={48} color="rgba(var(--rgb-accent), 0.2)" style={{ margin: '0 auto 1rem auto' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Nenhuma novidade ainda</h3>
                    <p style={{ color: 'rgba(var(--rgb-text), 0.5)', fontSize: '0.875rem' }}>Apoie mais causas ou aguarde as ONGs que você segue postarem atualizações.</p>
                  </div>
                ) : (
                  feedPosts.map(post => (
                    <div key={post.id} style={{ backgroundColor: 'var(--cozy-card)', borderRadius: '2.5rem', overflow: 'hidden', border: '1px solid rgba(var(--rgb-accent), 0.05)', boxShadow: '0 10px 15px -3px rgba(var(--rgb-accent), 0.05)' }}>
                      
                      {/* Cabeçalho do Post */}
                      <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--cozy-bg)', cursor: 'pointer' }} onClick={() => setSelectedOng(post.ong)}>
                        <img src={post.ong?.profilePicture || 'https://via.placeholder.com/40'} alt={post.ong?.name} style={{ width: '3rem', height: '3rem', borderRadius: '1rem', objectFit: 'cover' }} />
                        <div>
                          <h4 style={{ fontWeight: 'bold', margin: '0 0 0.25rem 0', color: 'var(--cozy-text)' }}>{post.ong?.name}</h4>
                          <span style={{ fontSize: '0.75rem', color: 'rgba(var(--rgb-text), 0.4)', fontWeight: 'bold', textTransform: 'uppercase' }}>
                            {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      
                      {/* Imagem do Post */}
                      {post.image && (
                        <div style={{ backgroundColor: 'var(--cozy-bg)' }}>
                          <img src={post.image} alt={post.title} style={{ width: '100%', maxHeight: '24rem', objectFit: 'contain' }} />
                        </div>
                      )}

                      {/* Conteúdo do Post */}
                      <div style={{ padding: '2rem' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1rem', color: 'var(--cozy-text)' }}>{post.title}</h3>
                        <p style={{ color: 'rgba(var(--rgb-text), 0.8)', lineHeight: '1.8', whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>{post.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal de Detalhes da ONG */}
      {selectedOng && (
        <OngModal 
          ong={selectedOng} 
          onClose={() => setSelectedOng(null)} 
        />
      )}

      {/* Modal de PIX (Doação) */}
      {showPixModal && (
        <PixModal 
          ong={showPixModal} 
          onClose={() => setShowPixModal(null)} 
        />
      )}
    </div>
  );
};

export default Feed;