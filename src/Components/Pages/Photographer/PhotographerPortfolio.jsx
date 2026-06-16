import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import PhotographerLayout from './PhotographerLayout';
import PageHeader from '../../PageHeader';
import { API_ENDPOINTS, SITE_URL } from '../../../api/apiConfig';
import { toast } from '../../../utils/toast';
import { getAuthHeaders, getStoredUser } from '../../../utils/auth';

const TABS = ['template', 'brand', 'hero', 'about', 'website', 'gallery', 'contact', 'publish'];

const TEMPLATES = [
  {
    id: 'noir',
    name: 'Noir',
    description: 'Elegant Dark',
    previewBg: 'linear-gradient(135deg, #0a0a0a 60%, #D4AF37 100%)',
    previewText: '#D4AF37',
  },
  {
    id: 'studio',
    name: 'Studio',
    description: 'Clean Studio',
    previewBg: 'linear-gradient(135deg, #f7f4f0 60%, #8B7355 100%)',
    previewText: '#8B7355',
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'Bold & Dramatic',
    previewBg: 'linear-gradient(135deg, #000 60%, #FF3366 100%)',
    previewText: '#FF3366',
  },
  {
    id: 'lens',
    name: 'Lens',
    description: 'Lens Pro',
    previewBg: 'linear-gradient(135deg, #0d1f33 60%, #6BBDD0 100%)',
    previewText: '#6BBDD0',
  },
];

const defaultPortfolio = {
  template: 'noir',
  isPublished: false,
  brand: {
    siteTitle: '',
    tagline: '',
    specialty: '',
  },
  hero: {
    headline: '',
    subheadline: '',
    backgroundImage: '',
    ctaText: 'View My Work',
  },
  about: {
    bio: '',
    image: '',
    experience: '',
    approach: '',
  },
  featuredMediaIds: [],
  featuredAlbumIds: [],
  stats: [
    { label: 'Years Experience', value: '8+' },
    { label: 'Client Shoots', value: '120+' },
    { label: 'Albums Delivered', value: '75+' },
  ],
  services: [
    { title: 'Wedding Stories', description: 'Full-day wedding coverage with a polished documentary style and timeless portrait direction.' },
    { title: 'Portrait Sessions', description: 'Editorial portraits for graduates, families, artists, and founders who want intentional imagery.' },
    { title: 'Brand Campaigns', description: 'Commercial photography for hospitality, lifestyle, and product-focused visual campaigns.' },
  ],
  testimonials: [
    { name: 'Amina & David', role: 'Wedding Clients', quote: 'Every image felt natural, cinematic, and deeply personal. We still cannot stop looking at them.' },
    { name: 'Kijani Studio', role: 'Brand Client', quote: 'The final gallery looked like a magazine campaign. The process was smooth from planning to delivery.' },
  ],
  process: [
    { title: 'Discovery Call', description: 'We align on your story, mood, schedule, and the visual feel you want the final gallery to carry.' },
    { title: 'Shoot Direction', description: 'I guide posing, pacing, and details on the day so you feel confident while the work stays natural.' },
    { title: 'Delivery', description: 'You receive a curated online gallery with polished edits, organized selections, and easy sharing.' },
  ],
  contact: {
    email: '',
    phone: '',
    location: '',
  },
  social: {
    instagram: '',
    twitter: '',
    facebook: '',
    website: '',
    youtube: '',
  },
  theme: {
    primaryColor: '#D4AF37',
  },
  seo: {
    title: '',
    description: '',
  },
};

const hydratePortfolio = (raw = {}) => ({
  ...defaultPortfolio,
  ...raw,
  brand: { ...defaultPortfolio.brand, ...(raw.brand || {}) },
  hero: { ...defaultPortfolio.hero, ...(raw.hero || {}) },
  about: { ...defaultPortfolio.about, ...(raw.about || {}) },
  contact: { ...defaultPortfolio.contact, ...(raw.contact || {}) },
  social: { ...defaultPortfolio.social, ...(raw.social || {}) },
  theme: { ...defaultPortfolio.theme, ...(raw.theme || {}) },
  seo: { ...defaultPortfolio.seo, ...(raw.seo || {}) },
  stats: Array.isArray(raw.stats) && raw.stats.length ? raw.stats : defaultPortfolio.stats,
  services: Array.isArray(raw.services) && raw.services.length ? raw.services : defaultPortfolio.services,
  testimonials: Array.isArray(raw.testimonials) && raw.testimonials.length ? raw.testimonials : defaultPortfolio.testimonials,
  process: Array.isArray(raw.process) && raw.process.length ? raw.process : defaultPortfolio.process,
});

const inputStyle = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(107,189,208,0.3)',
  color: '#fff',
  borderRadius: '8px',
  padding: '10px 14px',
  width: '100%',
  outline: 'none',
  marginBottom: '12px',
};

const labelStyle = {
  color: 'rgba(255,255,255,0.7)',
  fontSize: '0.82rem',
  marginBottom: '4px',
  display: 'block',
};

const glassCard = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '14px',
  padding: '20px',
  marginBottom: '20px',
};

const PhotographerPortfolio = () => {
  const [activeTab, setActiveTab] = useState('template');
  const [portfolio, setPortfolio] = useState(defaultPortfolio);
  const [myMedia, setMyMedia] = useState([]);
  const [myAlbums, setMyAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const user = getStoredUser();
      if (user?.username) setUsername(user.username);

      // Fetch portfolio
      try {
        const res = await axios.get(API_ENDPOINTS.PORTFOLIO.GET_MY, { headers });
        if (res.data?.portfolio) {
          setPortfolio(hydratePortfolio(res.data.portfolio));
          if (res.data.portfolio.username) setUsername(res.data.portfolio.username);
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          console.warn('[Portfolio] Could not load portfolio:', err.message);
        }
      }

      // Fetch media
      try {
        const mediaRes = await axios.get(API_ENDPOINTS.MEDIA.GET_MY, { headers });
        const items = mediaRes.data?.media || mediaRes.data?.items || mediaRes.data || [];
        setMyMedia(Array.isArray(items) ? items : []);
      } catch (err) {
        console.warn('[Portfolio] Could not load media:', err.message);
      }

      // Fetch albums
      try {
        const albumRes = await axios.get(API_ENDPOINTS.MEDIA.GET_ALBUMS, { headers });
        const albums = albumRes.data?.albums || albumRes.data || [];
        setMyAlbums(Array.isArray(albums) ? albums : []);
      } catch (err) {
        console.warn('[Portfolio] Could not load albums:', err.message);
      }
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const headers = getAuthHeaders();
      const res = await axios.put(API_ENDPOINTS.PORTFOLIO.SAVE, portfolio, { headers });
      if (res.data?.portfolio) {
        setPortfolio(res.data.portfolio);
        if (res.data.portfolio.username) setUsername(res.data.portfolio.username);
      }
      toast.success('Portfolio saved successfully!');
    } catch (err) {
      console.error('[Portfolio] Save error:', err);
      toast.error(err.response?.data?.message || 'Failed to save portfolio');
    } finally {
      setSaving(false);
    }
  };

  const setField = (path, value) => {
    setPortfolio(prev => {
      const parts = path.split('.');
      if (parts.length === 1) {
        return { ...prev, [parts[0]]: value };
      }
      const [section, key] = parts;
      return {
        ...prev,
        [section]: { ...prev[section], [key]: value },
      };
    });
  };

  const updateListItem = (field, index, key, value) => {
    setPortfolio(prev => ({
      ...prev,
      [field]: (prev[field] || []).map((item, i) => i === index ? { ...item, [key]: value } : item),
    }));
  };

  const addListItem = (field, template) => {
    setPortfolio(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), template],
    }));
  };

  const removeListItem = (field, index) => {
    setPortfolio(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index),
    }));
  };

  const toggleMedia = (id) => {
    const idStr = String(id);
    const current = (portfolio.featuredMediaIds || []).map(String);
    if (current.includes(idStr)) {
      setField('featuredMediaIds', current.filter(x => x !== idStr));
    } else {
      setField('featuredMediaIds', [...current, idStr]);
    }
  };

  const toggleAlbum = (id) => {
    const idStr = String(id);
    const current = (portfolio.featuredAlbumIds || []).map(String);
    if (current.includes(idStr)) {
      setField('featuredAlbumIds', current.filter(x => x !== idStr));
    } else {
      setField('featuredAlbumIds', [...current, idStr]);
    }
  };

  const copyUrl = () => {
    const url = `${SITE_URL}/portfolio/${username}`;
    navigator.clipboard.writeText(url).then(() => toast.success('URL copied!')).catch(() => toast.error('Failed to copy'));
  };

  if (loading) {
    return (
      <PhotographerLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <div className="spinner-border text-info" role="status" />
        </div>
      </PhotographerLayout>
    );
  }

  return (
    <PhotographerLayout>
      <div className="mc-page" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <PageHeader
          title="My Portfolio"
          subtitle="Build and publish your portfolio website"
          action={
            <div className="d-flex gap-2">
              {username && (
                <a href={`/portfolio/${username}`} target="_blank" rel="noopener noreferrer" className="btn mc-btn mc-btn-ghost btn-sm">
                  <i className="fas fa-external-link-alt me-1"></i>Preview
                </a>
              )}
              <button className="btn mc-btn mc-btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>Saving...</> : <><i className="fas fa-save me-1"></i>Save</>}
              </button>
            </div>
          }
        />

        {/* Tabs */}
        <div className="d-flex gap-1 flex-wrap mb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? 'rgba(107,189,208,0.2)' : 'transparent',
                border: activeTab === tab ? '1px solid rgba(107,189,208,0.5)' : '1px solid transparent',
                color: activeTab === tab ? '#6BBDD0' : 'rgba(255,255,255,0.55)',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '0.85rem',
                fontWeight: activeTab === tab ? 600 : 400,
                textTransform: 'capitalize',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Template Tab */}
        {activeTab === 'template' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
              {TEMPLATES.map(t => (
                <div
                  key={t.id}
                  onClick={() => setField('template', t.id)}
                  className={`mc-card`}
                  style={{
                    cursor: 'pointer',
                    border: portfolio.template === t.id ? `2px solid var(--mc-accent)` : undefined,
                    transition: 'all 0.2s',
                    padding: '12px',
                    marginBottom: 0,
                  }}
                >
                  {/* CSS preview */}
                  <div style={{
                    height: '80px',
                    borderRadius: '8px',
                    background: t.previewBg,
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <span style={{ color: t.previewText, fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.05em' }}>
                      {t.name.toUpperCase()}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{t.name}</div>
                      <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem' }}>{t.description}</div>
                    </div>
                    {portfolio.template === t.id && (
                      <i className="fas fa-check-circle" style={{ color: '#6BBDD0', fontSize: '1.1rem' }}></i>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Accent color */}
            <div className="mc-card">
              <label style={labelStyle}>Accent Color</label>
              <div className="d-flex align-items-center gap-3">
                <input
                  type="color"
                  value={portfolio.theme?.primaryColor || '#D4AF37'}
                  onChange={e => setField('theme.primaryColor', e.target.value)}
                  style={{ width: '48px', height: '40px', border: 'none', background: 'none', cursor: 'pointer' }}
                />
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                  {portfolio.theme?.primaryColor || '#D4AF37'}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'brand' && (
          <div className="mc-card">
            <h5 style={{ color: '#6BBDD0', marginBottom: '16px' }}>Website Identity</h5>
            <label style={labelStyle}>Website Title</label>
            <input
              style={inputStyle}
              type="text"
              placeholder="e.g. Njeri Visual Stories"
              value={portfolio.brand?.siteTitle || ''}
              onChange={e => setField('brand.siteTitle', e.target.value)}
            />
            <label style={labelStyle}>Short Tagline</label>
            <input
              style={inputStyle}
              type="text"
              placeholder="e.g. Wedding and portrait photography across East Africa"
              value={portfolio.brand?.tagline || ''}
              onChange={e => setField('brand.tagline', e.target.value)}
            />
            <label style={labelStyle}>Specialty</label>
            <input
              style={inputStyle}
              type="text"
              placeholder="e.g. Wedding, Editorial, Documentary"
              value={portfolio.brand?.specialty || ''}
              onChange={e => setField('brand.specialty', e.target.value)}
            />
          </div>
        )}

        {/* Hero Tab */}
        {activeTab === 'hero' && (
          <div className="mc-card">
            <h5 style={{ color: '#6BBDD0', marginBottom: '16px' }}>Hero Section</h5>
            <label style={labelStyle}>Main Headline</label>
            <input
              style={inputStyle}
              type="text"
              placeholder="e.g. Capturing Moments That Last Forever"
              value={portfolio.hero?.headline || ''}
              onChange={e => setField('hero.headline', e.target.value)}
            />
            <label style={labelStyle}>Tagline / Subheadline</label>
            <input
              style={inputStyle}
              type="text"
              placeholder="e.g. Award-winning photographer based in Nairobi"
              value={portfolio.hero?.subheadline || ''}
              onChange={e => setField('hero.subheadline', e.target.value)}
            />
            <label style={labelStyle}>Call-to-Action Button Text</label>
            <input
              style={inputStyle}
              type="text"
              placeholder="e.g. View My Work"
              value={portfolio.hero?.ctaText || ''}
              onChange={e => setField('hero.ctaText', e.target.value)}
            />
            <label style={labelStyle}>Background Image URL (optional)</label>
            <input
              style={inputStyle}
              type="text"
              placeholder="https://..."
              value={portfolio.hero?.backgroundImage || ''}
              onChange={e => setField('hero.backgroundImage', e.target.value)}
            />
            {portfolio.hero?.backgroundImage && (
              <img
                src={portfolio.hero.backgroundImage}
                alt="Hero preview"
                style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '8px', marginTop: '8px' }}
                onError={e => { e.target.style.display = 'none'; }}
              />
            )}
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="mc-card">
            <h5 style={{ color: '#6BBDD0', marginBottom: '16px' }}>About Me</h5>
            <label style={labelStyle}>About Me Text</label>
            <textarea
              style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
              placeholder="Tell visitors about yourself, your style, your experience..."
              value={portfolio.about?.bio || ''}
              onChange={e => setField('about.bio', e.target.value)}
            />
            <label style={labelStyle}>Photo URL (leave blank to use profile photo)</label>
            <input
              style={inputStyle}
              type="text"
              placeholder="https://..."
              value={portfolio.about?.image || ''}
              onChange={e => setField('about.image', e.target.value)}
            />
            <label style={labelStyle}>Experience Summary</label>
            <input
              style={inputStyle}
              type="text"
              placeholder="e.g. 8 years photographing weddings, portraits, and hospitality brands"
              value={portfolio.about?.experience || ''}
              onChange={e => setField('about.experience', e.target.value)}
            />
            <label style={labelStyle}>Approach / Working Style</label>
            <textarea
              style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }}
              placeholder="Describe how you direct, shoot, and deliver your work."
              value={portfolio.about?.approach || ''}
              onChange={e => setField('about.approach', e.target.value)}
            />
            {portfolio.about?.image && (
              <img
                src={portfolio.about.image}
                alt="About preview"
                style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%', marginTop: '8px' }}
                onError={e => { e.target.style.display = 'none'; }}
              />
            )}
          </div>
        )}

        {activeTab === 'website' && (
          <div>
            <div className="mc-card">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 style={{ color: '#6BBDD0', marginBottom: 0 }}>Stats Strip</h5>
                <button className="btn btn-outline-info btn-sm" onClick={() => addListItem('stats', { label: '', value: '' })}>
                  <i className="fas fa-plus me-1"></i>Add Stat
                </button>
              </div>
              {(portfolio.stats || []).map((item, index) => (
                <div key={`stat-${index}`} style={glassCard}>
                  <label style={labelStyle}>Value</label>
                  <input style={inputStyle} type="text" value={item.value || ''} onChange={e => updateListItem('stats', index, 'value', e.target.value)} />
                  <label style={labelStyle}>Label</label>
                  <input style={inputStyle} type="text" value={item.label || ''} onChange={e => updateListItem('stats', index, 'label', e.target.value)} />
                  <button className="btn btn-outline-danger btn-sm" onClick={() => removeListItem('stats', index)}>Remove</button>
                </div>
              ))}
            </div>

            <div className="mc-card">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 style={{ color: '#6BBDD0', marginBottom: 0 }}>Services</h5>
                <button className="btn btn-outline-info btn-sm" onClick={() => addListItem('services', { title: '', description: '' })}>
                  <i className="fas fa-plus me-1"></i>Add Service
                </button>
              </div>
              {(portfolio.services || []).map((item, index) => (
                <div key={`service-${index}`} style={glassCard}>
                  <label style={labelStyle}>Service Title</label>
                  <input style={inputStyle} type="text" value={item.title || ''} onChange={e => updateListItem('services', index, 'title', e.target.value)} />
                  <label style={labelStyle}>Description</label>
                  <textarea style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }} value={item.description || ''} onChange={e => updateListItem('services', index, 'description', e.target.value)} />
                  <button className="btn btn-outline-danger btn-sm" onClick={() => removeListItem('services', index)}>Remove</button>
                </div>
              ))}
            </div>

            <div className="mc-card">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 style={{ color: '#6BBDD0', marginBottom: 0 }}>Testimonials</h5>
                <button className="btn btn-outline-info btn-sm" onClick={() => addListItem('testimonials', { name: '', role: '', quote: '' })}>
                  <i className="fas fa-plus me-1"></i>Add Testimonial
                </button>
              </div>
              {(portfolio.testimonials || []).map((item, index) => (
                <div key={`testimonial-${index}`} style={glassCard}>
                  <label style={labelStyle}>Client Name</label>
                  <input style={inputStyle} type="text" value={item.name || ''} onChange={e => updateListItem('testimonials', index, 'name', e.target.value)} />
                  <label style={labelStyle}>Role / Context</label>
                  <input style={inputStyle} type="text" value={item.role || ''} onChange={e => updateListItem('testimonials', index, 'role', e.target.value)} />
                  <label style={labelStyle}>Quote</label>
                  <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} value={item.quote || ''} onChange={e => updateListItem('testimonials', index, 'quote', e.target.value)} />
                  <button className="btn btn-outline-danger btn-sm" onClick={() => removeListItem('testimonials', index)}>Remove</button>
                </div>
              ))}
            </div>

            <div className="mc-card">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 style={{ color: '#6BBDD0', marginBottom: 0 }}>Process</h5>
                <button className="btn btn-outline-info btn-sm" onClick={() => addListItem('process', { title: '', description: '' })}>
                  <i className="fas fa-plus me-1"></i>Add Step
                </button>
              </div>
              {(portfolio.process || []).map((item, index) => (
                <div key={`process-${index}`} style={glassCard}>
                  <label style={labelStyle}>Step Title</label>
                  <input style={inputStyle} type="text" value={item.title || ''} onChange={e => updateListItem('process', index, 'title', e.target.value)} />
                  <label style={labelStyle}>Description</label>
                  <textarea style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }} value={item.description || ''} onChange={e => updateListItem('process', index, 'description', e.target.value)} />
                  <button className="btn btn-outline-danger btn-sm" onClick={() => removeListItem('process', index)}>Remove</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div>
            <div className="mc-card">
              <h5 style={{ color: '#6BBDD0', marginBottom: '4px' }}>Featured Photos</h5>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', marginBottom: '14px' }}>
                Click thumbnails to feature them on your portfolio
              </p>
              {myMedia.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '20px 0' }}>
                  No media found. Upload some photos first.
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '10px' }}>
                  {myMedia.map(item => {
                    const id = String(item._id || item.id);
                    const checked = (portfolio.featuredMediaIds || []).map(String).includes(id);
                    return (
                      <div
                        key={id}
                        onClick={() => toggleMedia(id)}
                        style={{
                          position: 'relative',
                          cursor: 'pointer',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: checked ? '2px solid #6BBDD0' : '2px solid transparent',
                          transition: 'border 0.2s',
                        }}
                      >
                        {item.fileUrl ? (
                          <img
                            src={item.fileUrl}
                            alt={item.title || 'photo'}
                            style={{ width: '100%', height: '80px', objectFit: 'cover', display: 'block' }}
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '80px', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fas fa-image" style={{ color: 'rgba(255,255,255,0.3)' }}></i>
                          </div>
                        )}
                        {checked && (
                          <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(107,189,208,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <i className="fas fa-check-circle" style={{ color: '#6BBDD0', fontSize: '1.4rem' }}></i>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mc-card">
              <h5 style={{ color: '#6BBDD0', marginBottom: '4px' }}>Featured Albums</h5>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', marginBottom: '14px' }}>
                Select albums to display on your portfolio
              </p>
              {myAlbums.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '20px 0' }}>
                  No albums found. Create some albums first.
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
                  {myAlbums.map(album => {
                    const id = String(album._id || album.id);
                    const checked = (portfolio.featuredAlbumIds || []).map(String).includes(id);
                    return (
                      <div
                        key={id}
                        onClick={() => toggleAlbum(id)}
                        style={{
                          cursor: 'pointer',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          border: checked ? '2px solid #ffc107' : '2px solid rgba(255,255,255,0.1)',
                          background: 'rgba(255,255,255,0.04)',
                          transition: 'border 0.2s',
                          position: 'relative',
                        }}
                      >
                        {album.coverImage ? (
                          <img
                            src={album.coverImage}
                            alt={album.name}
                            style={{ width: '100%', height: '80px', objectFit: 'cover', display: 'block' }}
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '80px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fas fa-folder-open" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '1.5rem' }}></i>
                          </div>
                        )}
                        <div style={{ padding: '8px' }}>
                          <div style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {album.name}
                          </div>
                          {album.mediaCount != null && (
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem' }}>{album.mediaCount} photos</div>
                          )}
                        </div>
                        {checked && (
                          <div style={{ position: 'absolute', top: '6px', right: '6px' }}>
                            <i className="fas fa-check-circle" style={{ color: '#ffc107', fontSize: '1.1rem' }}></i>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="mc-card">
            <h5 style={{ color: '#6BBDD0', marginBottom: '16px' }}>Contact & Social</h5>

            <h6 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
              Contact Info
            </h6>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} type="email" placeholder="your@email.com" value={portfolio.contact?.email || ''} onChange={e => setField('contact.email', e.target.value)} />
            <label style={labelStyle}>Phone</label>
            <input style={inputStyle} type="text" placeholder="+254 700 000 000" value={portfolio.contact?.phone || ''} onChange={e => setField('contact.phone', e.target.value)} />
            <label style={labelStyle}>Location</label>
            <input style={inputStyle} type="text" placeholder="Nairobi, Kenya" value={portfolio.contact?.location || ''} onChange={e => setField('contact.location', e.target.value)} />

            <h6 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '16px 0 10px' }}>
              Social Links
            </h6>
            {['instagram', 'twitter', 'facebook', 'website', 'youtube'].map(platform => (
              <div key={platform}>
                <label style={labelStyle}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</label>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder={platform === 'website' ? 'https://yourwebsite.com' : `https://${platform}.com/yourprofile`}
                  value={portfolio.social?.[platform] || ''}
                  onChange={e => setField(`social.${platform}`, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Publish Tab */}
        {activeTab === 'publish' && (
          <div>
            <div className="mc-card">
              <h5 style={{ color: '#6BBDD0', marginBottom: '16px' }}>Publish Settings</h5>

              {/* Toggle */}
              <div className="d-flex align-items-center justify-content-between mb-4" style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '14px 16px' }}>
                <div>
                  <div style={{ color: '#fff', fontWeight: 600 }}>Portfolio Status</div>
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem' }}>
                    {portfolio.isPublished ? 'Your portfolio is live and visible to the public.' : 'Your portfolio is hidden from the public.'}
                  </div>
                </div>
                <div
                  onClick={() => setField('isPublished', !portfolio.isPublished)}
                  style={{
                    width: '52px', height: '28px',
                    background: portfolio.isPublished ? '#6BBDD0' : 'rgba(255,255,255,0.15)',
                    borderRadius: '14px',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.3s',
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '3px',
                    left: portfolio.isPublished ? '26px' : '3px',
                    width: '22px', height: '22px',
                    background: '#fff',
                    borderRadius: '50%',
                    transition: 'left 0.3s',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                  }} />
                </div>
              </div>

              {/* Portfolio URL */}
              {username && (
                <div className="mb-4">
                  <label style={labelStyle}>Your Portfolio URL</label>
                  <div className="d-flex gap-2">
                    <input
                      readOnly
                      style={{ ...inputStyle, marginBottom: 0, color: '#6BBDD0' }}
                      value={`${SITE_URL}/portfolio/${username}`}
                    />
                    <button
                      className="btn btn-outline-info btn-sm"
                      onClick={copyUrl}
                      style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                    >
                      <i className="fas fa-copy me-1"></i>Copy
                    </button>
                  </div>
                </div>
              )}

              {/* SEO */}
              <h6 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
                SEO Settings
              </h6>
              <label style={labelStyle}>Page Title</label>
              <input
                style={inputStyle}
                type="text"
                placeholder="John Doe — Professional Photographer"
                value={portfolio.seo?.title || ''}
                onChange={e => setField('seo.title', e.target.value)}
              />
              <label style={labelStyle}>Meta Description</label>
              <textarea
                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                placeholder="Award-winning photographer specializing in portrait and wildlife photography..."
                value={portfolio.seo?.description || ''}
                onChange={e => setField('seo.description', e.target.value)}
              />
            </div>

            <button
              className="btn btn-warning w-100"
              onClick={handleSave}
              disabled={saving}
              style={{ padding: '14px', fontWeight: 700, fontSize: '1rem', borderRadius: '10px' }}
            >
              {saving ? (
                <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Saving...</>
              ) : (
                <><i className="fas fa-rocket me-2"></i>Save &amp; Publish</>
              )}
            </button>
          </div>
        )}
      </div>
    </PhotographerLayout>
  );
};

export default PhotographerPortfolio;
