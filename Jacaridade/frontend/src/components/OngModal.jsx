import React, { useEffect, useState } from 'react';
import { X, Calendar, Heart, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const OngModal = ({ ong, onClose }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => { /* Buscar posts - mantido igual */ }, [ong.id]);

  return (
    <div className="modal-overlay">
      <div className="ong-modal-container">
        <button onClick={onClose} style={{position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 110, background: 'white', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
          <X size={24} color="rgba(var(--rgb-text), 0.5)" />
        </button>

        <div className="ong-modal-sidebar">
          <img src={ong.profilePicture || 'https://via.placeholder.com/150'} alt={ong.name} style={{width: '8rem', height: '8rem', borderRadius: '2rem', objectFit: 'cover', marginBottom: '1.5rem', border: '4px solid white'}} />
          <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', textAlign: 'center'}}>{ong.name}</h2>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cozy-accent)', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '2rem'}}>
            <Heart size={12} fill="currentColor" /> {ong.supporters?.length || 0} apoiadores
          </div>
          <div style={{width: '100%'}}>
            <h4 style={{fontSize: '10px', fontWeight: 900, color: 'rgba(var(--rgb-text),0.3)', textTransform: 'uppercase', marginBottom: '0.75rem'}}>Sobre nós</h4>
            <p style={{fontSize: '0.875rem', color: 'rgba(var(--rgb-text),0.7)', lineHeight: '1.6', fontStyle: 'italic'}}>"{ong.description}"</p>
          </div>
        </div>

        <div className="ong-modal-content">
          {selectedPost ? (
            <div>
              <button onClick={() => setSelectedPost(null)} className="btn-back">
                <ArrowLeft size={16} /> Voltar para o mural
              </button>
              <div style={{borderRadius: '1.5rem', overflow: 'hidden', backgroundColor: 'var(--cozy-bg)', marginBottom: '2rem'}}>
                {selectedPost.image && <img src={selectedPost.image} style={{width: '100%', maxHeight: '24rem', objectFit: 'contain'}} alt={selectedPost.title} />}
              </div>
              <h3 style={{fontSize: '2rem', fontWeight: 900, marginBottom: '1.5rem'}}>{selectedPost.title}</h3>
              <p style={{lineHeight: '1.8', whiteSpace: 'pre-wrap'}}>{selectedPost.content}</p>
            </div>
          ) : (
            <>
              <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '2rem'}}>Mural de Atualizações</h3>
              <div className="post-grid">
                {posts.map((post) => (
                  <div key={post.id} onClick={() => setSelectedPost(post)} style={{cursor: 'pointer'}}>
                    <div style={{aspectRatio: '1/1', borderRadius: '1.5rem', overflow: 'hidden', backgroundColor: 'var(--cozy-bg)', marginBottom: '0.75rem'}}>
                      {post.image && <img src={post.image} style={{width: '100%', height: '100%', objectFit: 'cover'}} alt={post.title} />}
                    </div>
                    <h5 style={{fontWeight: 'bold', fontSize: '0.875rem'}}>{post.title}</h5>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OngModal;