import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../api/apiConfig';
import ReviewsSection from '../../ReviewsSection';
import { Helmet } from 'react-helmet-async';

/* ──────────────── shared helpers ──────────────── */

const socialIcon = (platform) => {
  const map = {
    instagram: 'fa-instagram',
    twitter: 'fa-twitter',
    facebook: 'fa-facebook',
    youtube: 'fa-youtube',
    website: 'fa-globe',
  };
  return map[platform] || 'fa-link';
};

function MediaCard({ item, accentColor, borderOnHover }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '8px',
        border: hovered && borderOnHover ? `2px solid ${accentColor}` : '2px solid transparent',
        transition: 'border 0.2s',
        background: '#111',
      }}
    >
      {item.fileUrl ? (
        <img
          src={item.fileUrl}
          alt={item.title || 'Photo'}
          style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }}
          onError={e => { e.target.style.display = 'none'; }}
        />
      ) : (
        <div style={{ width: '100%', height: '220px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="fas fa-image" style={{ fontSize: '2rem', color: 'rgba(255,255,255,0.2)' }}></i>
        </div>
      )}
      {item.price != null && (
        <div style={{
          position: 'absolute', bottom: '8px', right: '8px',
          background: accentColor, color: '#000',
          fontSize: '0.72rem', fontWeight: 700,
          padding: '3px 8px', borderRadius: '20px',
        }}>
          KES {Number(item.price).toLocaleString()}
        </div>
      )}
    </div>
  );
}

function SocialLinks({ social, accentColor }) {
  if (!social) return null;
  const platforms = Object.entries(social).filter(([, v]) => !!v);
  if (platforms.length === 0) return null;
  return (
    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '12px' }}>
      {platforms.map(([platform, url]) => (
        <a
          key={platform}
          href={url.startsWith('http') ? url : `https://${url}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: accentColor, fontSize: '1.3rem', textDecoration: 'none' }}
        >
          <i className={`fab ${socialIcon(platform)}`}></i>
        </a>
      ))}
    </div>
  );
}

function ContactRow({ icon, value, accentColor }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
      <i className={`fas ${icon}`} style={{ color: accentColor, width: '18px', flexShrink: 0 }}></i>
      <span>{value}</span>
    </div>
  );
}

function SectionTitle({ eyebrow, title, description, color = '#fff', muted = 'rgba(255,255,255,0.6)' }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      {eyebrow && (
        <div style={{ color: muted, fontSize: '0.78rem', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '10px' }}>
          {eyebrow}
        </div>
      )}
      <h2 style={{ color, fontSize: 'clamp(1.5rem, 3vw, 2.3rem)', fontWeight: 700, marginBottom: description ? '10px' : 0 }}>
        {title}
      </h2>
      {description && (
        <p style={{ color: muted, maxWidth: '700px', margin: 0, lineHeight: 1.7 }}>
          {description}
        </p>
      )}
    </div>
  );
}

function StatsStrip({ stats = [], accentColor, bg = 'rgba(255,255,255,0.04)', textColor = '#fff', muted = 'rgba(255,255,255,0.55)' }) {
  const filtered = stats.filter(item => item?.label || item?.value);
  if (!filtered.length) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
      {filtered.map((item, index) => (
        <div key={`${item.label}-${index}`} style={{ background: bg, border: `1px solid ${accentColor}22`, borderRadius: '14px', padding: '18px 20px' }}>
          <div style={{ color: accentColor, fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px' }}>{item.value}</div>
          <div style={{ color: muted, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.label}</div>
        </div>
      ))}
    </div>
  );
}

function ServicesSection({ services = [], accentColor, bg = 'transparent', cardBg = 'rgba(255,255,255,0.04)', textColor = '#fff', muted = 'rgba(255,255,255,0.6)' }) {
  const filtered = services.filter(item => item?.title || item?.description);
  if (!filtered.length) return null;
  return (
    <section style={{ padding: '70px 40px', background: bg }}>
      <div style={{ maxWidth: '1150px', margin: '0 auto' }}>
        <SectionTitle eyebrow="Services" title="How I Can Help" description="Shape your portfolio into a real client-facing website with clear offers and polished messaging." color={textColor} muted={muted} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '18px' }}>
          {filtered.map((item, index) => (
            <div key={`${item.title}-${index}`} style={{ background: cardBg, borderRadius: '16px', padding: '24px', border: `1px solid ${accentColor}22` }}>
              <div style={{ color: accentColor, fontWeight: 800, fontSize: '0.82rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
                {String(index + 1).padStart(2, '0')}
              </div>
              <h3 style={{ color: textColor, fontSize: '1.1rem', fontWeight: 700, marginBottom: '10px' }}>{item.title}</h3>
              <p style={{ color: muted, margin: 0, lineHeight: 1.7 }}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection({ testimonials = [], accentColor, textColor = '#fff', muted = 'rgba(255,255,255,0.6)', bg = 'transparent' }) {
  const filtered = testimonials.filter(item => item?.quote || item?.name);
  if (!filtered.length) return null;
  return (
    <section style={{ padding: '70px 40px', background: bg }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <SectionTitle eyebrow="Client Words" title="What Clients Remember" color={textColor} muted={muted} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
          {filtered.map((item, index) => (
            <div key={`${item.name}-${index}`} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '24px', border: `1px solid ${accentColor}22` }}>
              <div style={{ color: accentColor, fontSize: '1.6rem', lineHeight: 1, marginBottom: '14px' }}>&ldquo;</div>
              <p style={{ color: textColor, lineHeight: 1.8, marginBottom: '16px' }}>{item.quote}</p>
              <div style={{ color: textColor, fontWeight: 700 }}>{item.name}</div>
              {item.role && <div style={{ color: muted, fontSize: '0.82rem', marginTop: '4px' }}>{item.role}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessSection({ process = [], accentColor, textColor = '#fff', muted = 'rgba(255,255,255,0.6)', bg = 'transparent' }) {
  const filtered = process.filter(item => item?.title || item?.description);
  if (!filtered.length) return null;
  return (
    <section style={{ padding: '70px 40px', background: bg }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <SectionTitle eyebrow="Process" title="What It Feels Like To Work Together" color={textColor} muted={muted} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
          {filtered.map((item, index) => (
            <div key={`${item.title}-${index}`} style={{ padding: '20px 22px', borderLeft: `3px solid ${accentColor}`, background: 'rgba(255,255,255,0.03)', borderRadius: '0 14px 14px 0' }}>
              <div style={{ color: accentColor, fontWeight: 800, marginBottom: '10px' }}>{String(index + 1).padStart(2, '0')}</div>
              <h3 style={{ color: textColor, fontSize: '1rem', fontWeight: 700, marginBottom: '10px' }}>{item.title}</h3>
              <p style={{ color: muted, lineHeight: 1.7, margin: 0 }}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────── Navbar ──────────────── */

function PortfolioNavbar({ photographerName, accentColor, textColor, navBg }) {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: navBg || 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${accentColor}22`,
      padding: '14px 32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <span style={{ fontWeight: 700, color: accentColor, fontSize: '1.05rem', letterSpacing: '0.04em' }}>
        {photographerName}
      </span>
      <Link to="/explore" style={{ color: textColor || 'rgba(255,255,255,0.65)', textDecoration: 'none', fontSize: '0.85rem' }}>
        <i className="fas fa-arrow-left me-1"></i>Back to Platform
      </Link>
    </nav>
  );
}

/* ──────────────── NOIR Template ──────────────── */

function NoirTemplate({ portfolio }) {
  const accent = portfolio.theme?.primaryColor || '#D4AF37';
  const photographer = portfolio.photographer || {};
  const brand = portfolio.brand || {};
  const hero = portfolio.hero || {};
  const about = portfolio.about || {};
  const contact = portfolio.contact || {};
  const social = portfolio.social || {};
  const media = portfolio.featuredMediaIds || [];
  const albums = portfolio.featuredAlbumIds || [];
  const stats = portfolio.stats || [];
  const services = portfolio.services || [];
  const testimonials = portfolio.testimonials || [];
  const process = portfolio.process || [];

  return (
    <div style={{ background: '#0a0a0a', color: '#fff', minHeight: '100vh' }}>
      <PortfolioNavbar
        photographerName={brand.siteTitle || photographer.username || 'Photographer'}
        accentColor={accent}
        textColor="rgba(255,255,255,0.6)"
      />

      {/* Hero */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        position: 'relative',
        background: hero.backgroundImage
          ? `linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, #0a0a0a 100%), url("${hero.backgroundImage}") center/cover no-repeat`
          : 'linear-gradient(160deg, #0a0a0a 60%, #1a1200 100%)',
        padding: '60px 20px',
      }}>
        <div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 5rem)', fontWeight: 800, color: '#fff', marginBottom: '18px', lineHeight: 1.1 }}>
            {hero.headline || photographer.username || 'Welcome'}
          </h1>
          {hero.subheadline && (
            <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.4rem)', color: 'rgba(255,255,255,0.65)', marginBottom: '32px' }}>
              {hero.subheadline}
            </p>
          )}
          {hero.ctaText && (
            <a href="#gallery" style={{
              display: 'inline-block', padding: '14px 36px',
              background: accent, color: '#000',
              fontWeight: 700, borderRadius: '4px',
              textDecoration: 'none', fontSize: '0.95rem',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              {hero.ctaText}
            </a>
          )}
        </div>
      </section>

      {(brand.tagline || brand.specialty || stats.length > 0) && (
        <section style={{ padding: '50px 40px 0', maxWidth: '1200px', margin: '0 auto' }}>
          <SectionTitle eyebrow={brand.specialty || 'Portfolio'} title={brand.tagline || 'A refined portfolio website for client-ready photography work.'} color="#fff" muted="rgba(255,255,255,0.58)" />
          <StatsStrip stats={stats} accentColor={accent} />
        </section>
      )}

      {/* Gallery */}
      {(media.length > 0 || albums.length > 0) && (
        <section id="gallery" style={{ padding: '80px 40px', maxWidth: '1200px', margin: '0 auto' }}>
          {media.length > 0 && (
            <>
              <h2 style={{ color: accent, fontSize: '1.6rem', fontWeight: 700, marginBottom: '32px', letterSpacing: '0.08em' }}>
                FEATURED WORK
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '48px' }}>
                {media.map(item => (
                  <MediaCard key={item._id || item.id} item={item} accentColor={accent} borderOnHover />
                ))}
              </div>
            </>
          )}
          {albums.length > 0 && (
            <>
              <h2 style={{ color: accent, fontSize: '1.6rem', fontWeight: 700, marginBottom: '24px', letterSpacing: '0.08em' }}>
                ALBUMS
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {albums.map(album => (
                  <div key={album._id || album.id} style={{ borderRadius: '8px', overflow: 'hidden', background: '#111' }}>
                    {album.coverImage ? (
                      <img src={album.coverImage} alt={album.name} style={{ width: '100%', height: '180px', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div style={{ height: '180px', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fas fa-folder-open" style={{ fontSize: '2.5rem', color: accent }}></i>
                      </div>
                    )}
                    <div style={{ padding: '12px 14px' }}>
                      <div style={{ color: '#fff', fontWeight: 600 }}>{album.name}</div>
                      {album.mediaCount != null && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>{album.mediaCount} photos</div>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* About */}
      {(about.bio || photographer.bio) && (
        <section style={{ padding: '80px 40px', maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            background: '#111',
            borderLeft: `4px solid ${accent}`,
            borderRadius: '0 12px 12px 0',
            padding: '32px 36px',
            display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap',
          }}>
            {(about.image || photographer.profilePicture) && (
              <img
                src={about.image || photographer.profilePicture}
                alt="Photographer"
                style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${accent}`, flexShrink: 0 }}
                onError={e => { e.target.style.display = 'none'; }}
              />
            )}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h2 style={{ color: accent, fontSize: '1.4rem', fontWeight: 700, marginBottom: '12px' }}>ABOUT ME</h2>
              <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, marginBottom: 0 }}>
                {about.bio || photographer.bio}
              </p>
              {about.experience && <p style={{ color: accent, marginTop: '14px', marginBottom: '8px', fontWeight: 600 }}>{about.experience}</p>}
              {about.approach && <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, marginBottom: 0 }}>{about.approach}</p>}
            </div>
          </div>
        </section>
      )}

      <ServicesSection services={services} accentColor={accent} textColor="#fff" muted="rgba(255,255,255,0.6)" />
      <ProcessSection process={process} accentColor={accent} textColor="#fff" muted="rgba(255,255,255,0.6)" />
      <TestimonialsSection testimonials={testimonials} accentColor={accent} textColor="#fff" muted="rgba(255,255,255,0.6)" />

      {/* Contact */}
      {(contact.email || contact.phone || contact.location || Object.values(social).some(Boolean)) && (
        <section style={{ padding: '60px 40px', maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ color: accent, fontSize: '1.4rem', fontWeight: 700, marginBottom: '28px', letterSpacing: '0.08em' }}>GET IN TOUCH</h2>
          <div style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 2, display: 'inline-block', textAlign: 'left' }}>
            <ContactRow icon="fa-envelope" value={contact.email} accentColor={accent} />
            <ContactRow icon="fa-phone" value={contact.phone} accentColor={accent} />
            <ContactRow icon="fa-map-marker-alt" value={contact.location || photographer.location} accentColor={accent} />
          </div>
          <SocialLinks social={social} accentColor={accent} />
        </section>
      )}

      {/* Reviews */}
      <section style={{ padding: '40px 40px 80px', maxWidth: '900px', margin: '0 auto', color: '#fff' }}>
        <ReviewsSection photographerId={portfolio.photographer?._id} showForm={false} />
      </section>
    </div>
  );
}

/* ──────────────── STUDIO Template ──────────────── */

function StudioTemplate({ portfolio }) {
  const accent = '#8B7355';
  const photographer = portfolio.photographer || {};
  const brand = portfolio.brand || {};
  const hero = portfolio.hero || {};
  const about = portfolio.about || {};
  const contact = portfolio.contact || {};
  const social = portfolio.social || {};
  const media = portfolio.featuredMediaIds || [];
  const albums = portfolio.featuredAlbumIds || [];
  const stats = portfolio.stats || [];
  const services = portfolio.services || [];
  const testimonials = portfolio.testimonials || [];
  const process = portfolio.process || [];

  return (
    <div style={{ background: '#f7f4f0', color: '#1a1a1a', minHeight: '100vh' }}>
      <PortfolioNavbar
        photographerName={brand.siteTitle || photographer.username || 'Photographer'}
        accentColor={accent}
        textColor="#555"
        navBg="rgba(247,244,240,0.95)"
      />

      {/* Hero */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        background: hero.backgroundImage
          ? `linear-gradient(rgba(247,244,240,0.75), rgba(247,244,240,0.95)), url("${hero.backgroundImage}") center/cover`
          : '#f7f4f0',
        padding: '80px 24px',
      }}>
        <div>
          <div style={{ color: accent, fontSize: '0.85rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Photography
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 300, color: '#1a1a1a', marginBottom: '20px', lineHeight: 1.2 }}>
            {hero.headline || photographer.username || 'Welcome'}
          </h1>
          {hero.subheadline && (
            <p style={{ fontSize: '1.1rem', color: '#555', marginBottom: '36px' }}>{hero.subheadline}</p>
          )}
          {hero.ctaText && (
            <a href="#gallery" style={{
              display: 'inline-block', padding: '13px 32px',
              border: `2px solid ${accent}`, color: accent,
              fontWeight: 600, borderRadius: '2px',
              textDecoration: 'none', letterSpacing: '0.08em',
            }}>
              {hero.ctaText}
            </a>
          )}
        </div>
      </section>

      {(brand.tagline || brand.specialty || stats.length > 0) && (
        <section style={{ padding: '40px 40px 0', maxWidth: '1100px', margin: '0 auto' }}>
          <SectionTitle eyebrow={brand.specialty || 'Studio'} title={brand.tagline || 'Built like a calm, realistic studio site for serious client work.'} color="#1a1a1a" muted="#666" />
          <StatsStrip stats={stats} accentColor={accent} bg="#ede9e4" textColor="#1a1a1a" muted="#666" />
        </section>
      )}

      {/* Gallery */}
      {(media.length > 0 || albums.length > 0) && (
        <section id="gallery" style={{ padding: '80px 40px', maxWidth: '1100px', margin: '0 auto' }}>
          {media.length > 0 && (
            <>
              <h2 style={{ color: '#1a1a1a', fontSize: '1.4rem', fontWeight: 300, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '32px', borderBottom: `1px solid ${accent}`, paddingBottom: '12px' }}>
                Portfolio
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '48px' }}>
                {media.map(item => (
                  <div key={item._id || item.id}>
                    {item.fileUrl ? (
                      <img src={item.fileUrl} alt={item.title} style={{ width: '100%', height: '280px', objectFit: 'cover', display: 'block' }} onError={e => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div style={{ height: '280px', background: '#e5e0da', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fas fa-image" style={{ fontSize: '2rem', color: '#c0b8ae' }}></i>
                      </div>
                    )}
                    {item.title && (
                      <div style={{ marginTop: '10px', color: '#555', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {item.title}
                      </div>
                    )}
                    {item.price != null && (
                      <div style={{ color: accent, fontSize: '0.85rem', fontWeight: 600, marginTop: '4px' }}>
                        KES {Number(item.price).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
          {albums.length > 0 && (
            <>
              <h2 style={{ color: '#1a1a1a', fontSize: '1.4rem', fontWeight: 300, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '24px', borderBottom: `1px solid ${accent}`, paddingBottom: '12px' }}>
                Collections
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {albums.map(album => (
                  <div key={album._id || album.id}>
                    {album.coverImage ? (
                      <img src={album.coverImage} alt={album.name} style={{ width: '100%', height: '180px', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div style={{ height: '180px', background: '#e5e0da', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fas fa-folder-open" style={{ color: accent, fontSize: '2rem' }}></i>
                      </div>
                    )}
                    <div style={{ marginTop: '8px', color: '#1a1a1a', fontWeight: 600 }}>{album.name}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* About */}
      {(about.bio || photographer.bio) && (
        <section style={{ padding: '80px 40px', maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {(about.image || photographer.profilePicture) && (
              <img
                src={about.image || photographer.profilePicture}
                alt="Photographer"
                style={{ width: '220px', height: '280px', objectFit: 'cover', flexShrink: 0 }}
                onError={e => { e.target.style.display = 'none'; }}
              />
            )}
            <div style={{ flex: 1, minWidth: '220px' }}>
              <div style={{ color: accent, fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '12px' }}>
                About
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 300, marginBottom: '20px', color: '#1a1a1a' }}>
                {photographer.username}
              </h2>
              <p style={{ color: '#444', lineHeight: 1.9, fontSize: '1rem' }}>
                {about.bio || photographer.bio}
              </p>
              {about.experience && <p style={{ color: accent, fontWeight: 600, marginTop: '12px', marginBottom: '8px' }}>{about.experience}</p>}
              {about.approach && <p style={{ color: '#555', lineHeight: 1.8, marginBottom: 0 }}>{about.approach}</p>}
            </div>
          </div>
        </section>
      )}

      <ServicesSection services={services} accentColor={accent} bg="#f2efea" cardBg="#fff" textColor="#1a1a1a" muted="#666" />
      <ProcessSection process={process} accentColor={accent} textColor="#1a1a1a" muted="#666" bg="#f7f4f0" />
      <TestimonialsSection testimonials={testimonials} accentColor={accent} textColor="#1a1a1a" muted="#666" bg="#ede9e4" />

      {/* Contact */}
      {(contact.email || contact.phone || contact.location || Object.values(social).some(Boolean)) && (
        <section style={{ padding: '60px 40px', background: '#ede9e4', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 300, marginBottom: '28px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1a1a1a' }}>
            Contact
          </h2>
          <div style={{ color: '#555', lineHeight: 2.2, display: 'inline-block', textAlign: 'left' }}>
            <ContactRow icon="fa-envelope" value={contact.email} accentColor={accent} />
            <ContactRow icon="fa-phone" value={contact.phone} accentColor={accent} />
            <ContactRow icon="fa-map-marker-alt" value={contact.location || photographer.location} accentColor={accent} />
          </div>
          <SocialLinks social={social} accentColor={accent} />
        </section>
      )}

      {/* Reviews */}
      <section style={{ padding: '40px 40px 80px', maxWidth: '900px', margin: '0 auto', color: '#1a1a1a', background: '#f7f4f0' }}>
        <ReviewsSection photographerId={portfolio.photographer?._id} showForm={false} />
      </section>
    </div>
  );
}

/* ──────────────── BOLD Template ──────────────── */

function BoldTemplate({ portfolio }) {
  const accent = '#FF3366';
  const photographer = portfolio.photographer || {};
  const brand = portfolio.brand || {};
  const hero = portfolio.hero || {};
  const about = portfolio.about || {};
  const contact = portfolio.contact || {};
  const social = portfolio.social || {};
  const media = portfolio.featuredMediaIds || [];
  const albums = portfolio.featuredAlbumIds || [];
  const stats = portfolio.stats || [];
  const services = portfolio.services || [];
  const testimonials = portfolio.testimonials || [];
  const process = portfolio.process || [];

  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <PortfolioNavbar
        photographerName={brand.siteTitle || photographer.username || 'Photographer'}
        accentColor={accent}
        textColor="rgba(255,255,255,0.55)"
        navBg="rgba(0,0,0,0.9)"
      />

      {/* Hero */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center',
        padding: '60px 48px',
        background: hero.backgroundImage
          ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url("${hero.backgroundImage}") center/cover`
          : '#000',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div>
          <div style={{ color: accent, fontSize: '0.85rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '20px' }}>
            Photography
          </div>
          <h1 style={{
            fontSize: 'clamp(3rem, 8vw, 7rem)',
            fontWeight: 900,
            textTransform: 'uppercase',
            lineHeight: 0.95,
            letterSpacing: '-0.02em',
            marginBottom: '28px',
          }}>
            {(hero.headline || photographer.username || 'BOLD VISION').toUpperCase()}
          </h1>
          {hero.subheadline && (
            <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.6)', marginBottom: '36px', maxWidth: '500px' }}>
              {hero.subheadline}
            </p>
          )}
          {hero.ctaText && (
            <a href="#gallery" style={{
              display: 'inline-block', padding: '14px 40px',
              background: accent, color: '#fff',
              fontWeight: 800, borderRadius: '0',
              textDecoration: 'none', textTransform: 'uppercase',
              letterSpacing: '0.1em', fontSize: '0.9rem',
            }}>
              {hero.ctaText}
            </a>
          )}
        </div>
      </section>

      {(brand.tagline || brand.specialty || stats.length > 0) && (
        <section style={{ padding: '42px 40px 0', maxWidth: '1200px', margin: '0 auto' }}>
          <SectionTitle eyebrow={brand.specialty || 'Bold Work'} title={brand.tagline || 'A dramatic commercial-style portfolio with agency energy.'} color="#fff" muted="rgba(255,255,255,0.58)" />
          <StatsStrip stats={stats} accentColor={accent} bg="#111" textColor="#fff" muted="rgba(255,255,255,0.55)" />
        </section>
      )}

      {/* Gallery */}
      {(media.length > 0 || albums.length > 0) && (
        <section id="gallery" style={{ padding: '80px 40px', maxWidth: '1200px', margin: '0 auto' }}>
          {media.length > 0 && (
            <>
              <h2 style={{ color: '#fff', fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase', borderBottom: `3px solid ${accent}`, paddingBottom: '12px', marginBottom: '32px', display: 'inline-block' }}>
                WORK
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', marginBottom: '48px' }}>
                {media.map((item, i) => (
                  <div key={item._id || item.id} style={{ gridColumn: i % 3 === 0 ? 'span 2' : 'span 1', position: 'relative' }}>
                    {item.fileUrl ? (
                      <img src={item.fileUrl} alt={item.title} style={{ width: '100%', height: i % 3 === 0 ? '420px' : '260px', objectFit: 'cover', display: 'block' }} onError={e => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div style={{ height: i % 3 === 0 ? '420px' : '260px', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fas fa-image" style={{ fontSize: '3rem', color: accent }}></i>
                      </div>
                    )}
                    {item.price != null && (
                      <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: accent, color: '#fff', fontWeight: 800, padding: '4px 10px', fontSize: '0.8rem' }}>
                        KES {Number(item.price).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
          {albums.length > 0 && (
            <>
              <h2 style={{ color: '#fff', fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase', borderBottom: `3px solid ${accent}`, paddingBottom: '12px', marginBottom: '24px', display: 'inline-block' }}>
                SERIES
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {albums.map(album => (
                  <div key={album._id || album.id} style={{ position: 'relative' }}>
                    {album.coverImage ? (
                      <img src={album.coverImage} alt={album.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div style={{ height: '200px', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fas fa-folder-open" style={{ color: accent, fontSize: '2rem' }}></i>
                      </div>
                    )}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.85))', padding: '30px 12px 10px', color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
                      {album.name.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* About */}
      {(about.bio || photographer.bio) && (
        <section style={{ padding: '80px 48px', background: '#0a0a0a' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 900, textTransform: 'uppercase', color: '#fff', marginBottom: '32px', lineHeight: 1 }}>
              THE VISION
            </h2>
            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              {(about.image || photographer.profilePicture) && (
                <img
                  src={about.image || photographer.profilePicture}
                  alt="Photographer"
                  style={{ width: '160px', height: '160px', objectFit: 'cover', border: `4px solid ${accent}`, flexShrink: 0 }}
                  onError={e => { e.target.style.display = 'none'; }}
                />
              )}
              <p style={{ flex: 1, minWidth: '240px', fontSize: '1.15rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.9, borderLeft: `4px solid ${accent}`, paddingLeft: '24px' }}>
                {about.bio || photographer.bio}
              </p>
            </div>
            {about.experience && <p style={{ color: accent, fontWeight: 700, marginTop: '20px', marginBottom: '8px' }}>{about.experience}</p>}
            {about.approach && <p style={{ color: 'rgba(255,255,255,0.58)', lineHeight: 1.8, marginBottom: 0, maxWidth: '780px' }}>{about.approach}</p>}
          </div>
        </section>
      )}

      <ServicesSection services={services} accentColor={accent} textColor="#fff" muted="rgba(255,255,255,0.6)" bg="#050505" />
      <ProcessSection process={process} accentColor={accent} textColor="#fff" muted="rgba(255,255,255,0.6)" bg="#000" />
      <TestimonialsSection testimonials={testimonials} accentColor={accent} textColor="#fff" muted="rgba(255,255,255,0.6)" bg="#050505" />

      {/* Contact */}
      {(contact.email || contact.phone || contact.location || Object.values(social).some(Boolean)) && (
        <section style={{ padding: '60px 48px', borderTop: `3px solid ${accent}` }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '28px', color: '#fff' }}>
            LET&apos;S WORK
          </h2>
          <div style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 2.2 }}>
            <ContactRow icon="fa-envelope" value={contact.email} accentColor={accent} />
            <ContactRow icon="fa-phone" value={contact.phone} accentColor={accent} />
            <ContactRow icon="fa-map-marker-alt" value={contact.location || photographer.location} accentColor={accent} />
          </div>
          <SocialLinks social={social} accentColor={accent} />
        </section>
      )}

      {/* Reviews */}
      <section style={{ padding: '40px 48px 80px', maxWidth: '900px', margin: '0 auto', color: '#fff' }}>
        <ReviewsSection photographerId={portfolio.photographer?._id} showForm={false} />
      </section>
    </div>
  );
}

/* ──────────────── LENS Template ──────────────── */

function LensTemplate({ portfolio }) {
  const accent = '#6BBDD0';
  const photographer = portfolio.photographer || {};
  const brand = portfolio.brand || {};
  const hero = portfolio.hero || {};
  const about = portfolio.about || {};
  const contact = portfolio.contact || {};
  const social = portfolio.social || {};
  const media = portfolio.featuredMediaIds || [];
  const albums = portfolio.featuredAlbumIds || [];
  const stats = portfolio.stats || [];
  const services = portfolio.services || [];
  const testimonials = portfolio.testimonials || [];
  const process = portfolio.process || [];

  return (
    <div style={{ background: '#0d1f33', color: '#fff', minHeight: '100vh' }}>
      <PortfolioNavbar
        photographerName={brand.siteTitle || photographer.username || 'Photographer'}
        accentColor={accent}
        textColor="rgba(255,255,255,0.6)"
        navBg="rgba(13,31,51,0.92)"
      />

      {/* Hero */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        background: hero.backgroundImage
          ? `linear-gradient(to bottom, rgba(13,31,51,0.65) 0%, #0d1f33 100%), url("${hero.backgroundImage}") center/cover`
          : 'linear-gradient(160deg, #0d1f33 50%, #0a2a3d 100%)',
        padding: '80px 24px',
      }}>
        <div>
          <div style={{ display: 'inline-block', border: `1px solid ${accent}`, padding: '4px 14px', borderRadius: '20px', fontSize: '0.78rem', color: accent, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '20px' }}>
            Photography
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4.5rem)', fontWeight: 700, color: '#fff', marginBottom: '16px', lineHeight: 1.15 }}>
            {hero.headline || photographer.username || 'Welcome'}
          </h1>
          {hero.subheadline && (
            <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.6)', marginBottom: '36px', maxWidth: '550px', margin: '0 auto 36px' }}>
              {hero.subheadline}
            </p>
          )}
          {hero.ctaText && (
            <a href="#gallery" style={{
              display: 'inline-block', padding: '13px 36px',
              background: `linear-gradient(135deg, ${accent}, #4da8c0)`,
              color: '#000', fontWeight: 700, borderRadius: '40px',
              textDecoration: 'none', fontSize: '0.95rem',
            }}>
              {hero.ctaText}
            </a>
          )}
        </div>
      </section>

      {(brand.tagline || brand.specialty || stats.length > 0) && (
        <section style={{ padding: '42px 40px 0', maxWidth: '1150px', margin: '0 auto' }}>
          <SectionTitle eyebrow={brand.specialty || 'Creative Direction'} title={brand.tagline || 'A polished modern portfolio with a premium editorial feel.'} color="#fff" muted="rgba(255,255,255,0.58)" />
          <StatsStrip stats={stats} accentColor={accent} />
        </section>
      )}

      {/* Gallery */}
      {(media.length > 0 || albums.length > 0) && (
        <section id="gallery" style={{ padding: '80px 40px', maxWidth: '1200px', margin: '0 auto' }}>
          {media.length > 0 && (
            <>
              <h2 style={{ color: accent, fontSize: '1.5rem', fontWeight: 700, marginBottom: '28px', paddingBottom: '10px', borderBottom: `1px solid rgba(107,189,208,0.2)` }}>
                Featured Work
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '48px' }}>
                {media.map(item => (
                  <MediaCard key={item._id || item.id} item={item} accentColor={accent} borderOnHover />
                ))}
              </div>
            </>
          )}
          {albums.length > 0 && (
            <>
              <h2 style={{ color: accent, fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px', paddingBottom: '10px', borderBottom: `1px solid rgba(107,189,208,0.2)` }}>
                Albums
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {albums.map(album => (
                  <div key={album._id || album.id} style={{ borderRadius: '10px', overflow: 'hidden', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(107,189,208,0.15)' }}>
                    {album.coverImage ? (
                      <img src={album.coverImage} alt={album.name} style={{ width: '100%', height: '180px', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div style={{ height: '180px', background: 'rgba(107,189,208,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fas fa-folder-open" style={{ color: accent, fontSize: '2.5rem' }}></i>
                      </div>
                    )}
                    <div style={{ padding: '12px 14px' }}>
                      <div style={{ color: '#fff', fontWeight: 600 }}>{album.name}</div>
                      {album.mediaCount != null && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>{album.mediaCount} photos</div>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* About */}
      {(about.bio || photographer.bio) && (
        <section style={{ padding: '80px 40px', maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(107,189,208,0.2)',
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            padding: '40px',
            display: 'flex', gap: '36px', alignItems: 'flex-start', flexWrap: 'wrap',
          }}>
            {(about.image || photographer.profilePicture) && (
              <img
                src={about.image || photographer.profilePicture}
                alt="Photographer"
                style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${accent}`, flexShrink: 0 }}
                onError={e => { e.target.style.display = 'none'; }}
              />
            )}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h2 style={{ color: accent, fontSize: '1.4rem', fontWeight: 700, marginBottom: '14px' }}>About Me</h2>
              <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.9, marginBottom: 0 }}>
                {about.bio || photographer.bio}
              </p>
              {about.experience && <p style={{ color: accent, fontWeight: 600, marginTop: '14px', marginBottom: '8px' }}>{about.experience}</p>}
              {about.approach && <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, marginBottom: 0 }}>{about.approach}</p>}
            </div>
          </div>
        </section>
      )}

      <ServicesSection services={services} accentColor={accent} textColor="#fff" muted="rgba(255,255,255,0.6)" />
      <ProcessSection process={process} accentColor={accent} textColor="#fff" muted="rgba(255,255,255,0.6)" bg="rgba(255,255,255,0.02)" />
      <TestimonialsSection testimonials={testimonials} accentColor={accent} textColor="#fff" muted="rgba(255,255,255,0.6)" />

      {/* Contact */}
      {(contact.email || contact.phone || contact.location || Object.values(social).some(Boolean)) && (
        <section style={{ padding: '60px 40px', maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ color: accent, fontSize: '1.5rem', fontWeight: 700, marginBottom: '28px' }}>Get In Touch</h2>
          <div style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 2.2, display: 'inline-block', textAlign: 'left' }}>
            <ContactRow icon="fa-envelope" value={contact.email} accentColor={accent} />
            <ContactRow icon="fa-phone" value={contact.phone} accentColor={accent} />
            <ContactRow icon="fa-map-marker-alt" value={contact.location || photographer.location} accentColor={accent} />
          </div>
          <div style={{ justifyContent: 'center', display: 'flex' }}>
            <SocialLinks social={social} accentColor={accent} />
          </div>
        </section>
      )}

      {/* Reviews */}
      <section style={{ padding: '40px 40px 80px', maxWidth: '900px', margin: '0 auto', color: '#fff' }}>
        <ReviewsSection photographerId={portfolio.photographer?._id} showForm={false} />
      </section>
    </div>
  );
}

/* ──────────────── Main PublicPortfolio ──────────────── */

const PublicPortfolio = () => {
  const { username } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    axios.get(API_ENDPOINTS.PORTFOLIO.GET_PUBLIC(username))
      .then(res => {
        if (res.data?.portfolio) {
          setPortfolio(res.data.portfolio);
        } else {
          setNotFound(true);
        }
      })
      .catch(err => {
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          console.error('[PublicPortfolio] fetch error:', err);
          setNotFound(true);
        }
      })
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div style={{ background: '#0d1f33', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div className="spinner-border text-info mb-3" role="status" style={{ width: '3rem', height: '3rem' }} />
          <div style={{ color: 'rgba(255,255,255,0.5)' }}>Loading portfolio...</div>
        </div>
      </div>
    );
  }

  if (notFound || !portfolio) {
    return (
      <div style={{ background: '#0d1f33', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#fff', padding: '40px' }}>
          <i className="fas fa-camera-retro" style={{ fontSize: '4rem', color: 'rgba(107,189,208,0.3)', marginBottom: '20px', display: 'block' }}></i>
          <h2 style={{ marginBottom: '12px' }}>Portfolio not found</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>
            This portfolio is not published or does not exist.
          </p>
          <Link to="/explore" style={{ color: '#6BBDD0', textDecoration: 'none' }}>
            <i className="fas fa-arrow-left me-2"></i>Back to Platform
          </Link>
        </div>
      </div>
    );
  }

  const template = portfolio.template || 'noir';
  const photographer = portfolio.photographer || {};
  const pgName = photographer.name || photographer.username || username;
  const pgBio  = photographer.bio  || `Browse ${pgName}'s photography portfolio on Relic Snap.`;
  const pgImg  = photographer.profilePictureUrl || 'https://relicsnap.onrender.com/logo512.png';
  const pgUrl  = `https://relicsnap.onrender.com/portfolio/${username}`;

  const seoHead = (
    <Helmet>
      <title>{`${pgName} — Photography Portfolio | Relic Snap`}</title>
      <meta name="description" content={pgBio.slice(0, 160)} />
      <meta property="og:title" content={`${pgName} — Photography Portfolio`} />
      <meta property="og:description" content={pgBio.slice(0, 160)} />
      <meta property="og:image" content={pgImg} />
      <meta property="og:url" content={pgUrl} />
      <meta property="og:type" content="profile" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${pgName} — Photography Portfolio`} />
      <meta name="twitter:image" content={pgImg} />
      <link rel="canonical" href={pgUrl} />
      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        "name": `${pgName} — Relic Snap`,
        "description": pgBio.slice(0, 200),
        "url": pgUrl,
        "image": pgImg,
        "author": { "@type": "Person", "name": pgName },
      })}</script>
    </Helmet>
  );

  if (template === 'studio') return <>{seoHead}<StudioTemplate portfolio={portfolio} /></>;
  if (template === 'bold')   return <>{seoHead}<BoldTemplate   portfolio={portfolio} /></>;
  if (template === 'lens')   return <>{seoHead}<LensTemplate   portfolio={portfolio} /></>;
  return <>{seoHead}<NoirTemplate portfolio={portfolio} /></>;
};

export default PublicPortfolio;
