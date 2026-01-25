'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Github, Instagram, Linkedin, ChevronDown, ExternalLink, X, Command, Lock, Globe } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import './portfolio.css';
import { translations } from './translations';

export default function PortfolioPage() {
  const [lang, setLang] = useState<'en' | 'ko'>('en'); // Default to English
  const [activeSoulGridImg, setActiveSoulGridImg] = useState('/images/soulgrid_landing.png');
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const t = translations[lang];

  // Experience Data Handling
  const experienceData = {
    en: [
      {
        id: 1, date: '2025 - Present', title: 'Public Financial System Operator', company: 'Korea Fiscal Information Service',
        desc: 'Financial closing and ledger management, maintaining accrual-based double-entry accounting ledgers and ensuring data pipeline stability.'
      },
      {
        id: 2, date: '2024', title: 'DeFi Protocol Auditor (Trainee)', company: 'Dunamu & Theori',
        desc: 'Code-level analysis of Compound Protocol, Venus Protocol Isolated Pool, and Cyan audit with invariant checks.'
      },
      {
        id: 3, date: '2024', title: 'Freelance AI Trainer', company: 'EBIT',
        desc: 'Training generative AI models through coding projects in SQL, Python, Java, JavaScript, and TypeScript.'
      },
      {
        id: 4, date: '2023', title: 'Solutions Developer', company: 'Wooam Corporation (BlueWorks)',
        desc: "Maintained and developed new features for Document Conference Solution 'SmartPlace'."
      },
      {
        id: 5, date: '2022 - 2023', title: 'Java Track Trainee (1600H)', company: 'Samsung SW Academy For Youth (SSAFY) 8th',
        desc: 'Intensive training in algorithms, web development with Spring Boot, MySQL, Vue.js, and completed 3 major team projects.'
      }
    ],
    ko: [
      {
        id: 1, date: '2025 - 현재', title: '공공 재정 시스템 운영', company: '한국재정정보원',
        desc: '발생주의 복식부기 회계 원장 관리 및 재정 마감 업무 수행, 데이터 파이프라인 안정성 확보 및 원장 데이터 무결성 관리.'
      },
      {
        id: 2, date: '2024', title: 'DeFi 프로토콜 오디터 (교육생)', company: '두나무 & 티오리',
        desc: 'Compound Protocol, Venus Protocol Isolated Pool 코드 레벨 분석 및 불변성(Invariant) 체크를 포함한 Cyan 감사 실습.'
      },
      {
        id: 3, date: '2024', title: '프리랜서 AI 트레이너', company: 'EBIT',
        desc: 'SQL, Python, Java 등 다양한 언어로 코딩 프로젝트를 수행하며 생성형 AI 모델 학습 데이터 구축 및 품질 검증.'
      },
      {
        id: 4, date: '2023', title: '솔루션 개발자', company: '우암코퍼레이션 (BlueWorks)',
        desc: "문서 없는 회의 솔루션 'SmartPlace'의 유지보수 및 신규 기능 개발 참여."
      },
      {
        id: 5, date: '2022 - 2023', title: 'Java 트랙 교육생 (1600시간)', company: '삼성 청년 SW 아카데미 (SSAFY) 8기',
        desc: '알고리즘, Spring Boot, MySQL, Vue.js 등 웹 개발 심화 과정 수료 및 3회의 대규모 팀 프로젝트 완수.'
      }
    ]
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });

      if (res.ok) {
        router.push('/dashboard');
      } else {
        setError(t.modal.error_invalid);
      }
    } catch {
      setError(t.modal.error_connection);
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const soulGridImages = [
    { src: '/images/soulgrid_landing.png', alt: 'Landing Page', title: 'Landing' },
    { src: '/images/soulgrid_workflow.png', alt: 'Workflow Dashboard', title: 'Workflow' },
    { src: '/images/soulgrid_kanban.png', alt: 'Kanban Board', title: 'Kanban' },
    { src: '/images/soulgrid_issue_create.png', alt: 'Issue Management', title: 'Issue Creation' },
    { src: '/images/soulgrid_backlog.png', alt: 'Project Backlog', title: 'Backlog' }
  ];

  return (
    <div className="portfolio-page">
      {/* Navigation */}
      <nav className="portfolio-nav">
        <div className="nav-logo">Sojin Kim</div>

        <div className="nav-links">
          <button onClick={() => scrollToSection('about')} className="nav-link-btn">{t.nav.about}</button>
          <button onClick={() => scrollToSection('projects')} className="nav-link-btn">{t.nav.projects}</button>
          <button onClick={() => scrollToSection('insights')} className="nav-link-btn">{t.nav.insights}</button>
          <button onClick={() => scrollToSection('contact')} className="nav-link-btn">{t.nav.contact}</button>
        </div>

        <div className="flex items-center gap-6">
          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
            className="lang-toggle-btn"
            title="Switch Language"
          >
            <Globe size={16} />
            <span className={`lang-text ${lang === 'ko' ? 'active' : ''}`}>KR</span>
            <span className="lang-divider">|</span>
            <span className={`lang-text ${lang === 'en' ? 'active' : ''}`}>EN</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <p className="hero-tagline">{t.hero.tagline}</p>
          <h1 className="hero-title">
            {t.hero.title_prefix && <>{t.hero.title_prefix} <br /></>}
            <em>{t.hero.title_accent}</em><br />
            {t.hero.title_suffix}
          </h1>
          <p className="hero-description">
            {t.hero.description}
          </p>
          <button onClick={() => scrollToSection('projects')} className="hero-cta">
            {t.hero.cta} <ArrowRight size={16} />
          </button>
        </div>
        <div className="hero-visual">
          <div className="hero-image-container">
            <div
              className="hero-image"
              style={{
                background: 'linear-gradient(135deg, #8B7355 0%, #A68B6A 50%, #6B5744 100%)',
                height: '500px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontFamily: "'Cormorant Garamond', serif"
              }}
            >
              <div style={{ fontSize: '4rem', fontWeight: 300, marginBottom: '1rem' }}>SK</div>
              <div style={{ fontSize: '0.9rem', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.8 }}>
                {t.hero.role}
              </div>
            </div>
            <div className="hero-image-frame"></div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section about-section">
        <div className="section-header">
          <p className="section-label">{t.about.label}</p>
          <h2 className="section-title">{t.about.title}</h2>
        </div>

        <div className="about-grid">
          <div className="about-intro">
            {t.about.intro}
          </div>

          <div className="about-details">
            <div className="about-block">
              <h3>{t.about.skills}</h3>
              <ul>
                <li>Java & Spring Boot Ecosystem</li>
                <li>Blockchain & Smart Contract Development</li>
                <li>Full-Stack Web Development (React, Next.js)</li>
                <li>Database Design & Optimization</li>
                <li>On-Premise Infrastructure & Container Orchestration (Mac Mini M4)</li>
                <li>Cloud Infrastructure & DevOps</li>
              </ul>
            </div>

            <div className="about-block">
              <h3>{t.about.certifications}</h3>
              <ul>
                <li>정보처리기사 (Engineer Information Processing)</li>
                <li>블록체인 통합 기본과정 II 수료</li>
                <li>Samsung SW Academy For Youth (SSAFY)</li>
              </ul>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '4rem' }}>
          <h3 style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--color-primary)',
            marginBottom: '2rem'
          }}>
            {t.about.experience}
          </h3>

          <div className="experience-list">
            {experienceData[lang].map((exp) => (
              <div key={exp.id} className="experience-item">
                <div className="experience-date">{exp.date}</div>
                <div className="experience-content">
                  <h4>{exp.title}</h4>
                  <p className="company">{exp.company}</p>
                  <p>{exp.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="section projects-section">
        <div className="section-header">
          <p className="section-label">{t.projects.label}</p>
          <h2 className="section-title">{t.projects.title}</h2>
        </div>

        {/* Featured Project - SoulGrid */}
        <div className="project-featured">
          <div className="project-image">
            <div className="project-gallery">
              <div className="project-main-container">
                <Image
                  src={activeSoulGridImg}
                  alt="SoulGrid Feature"
                  className="project-main-img"
                  width={800}
                  height={500}
                  unoptimized
                />
              </div>
              <div className="project-sub-imgs">
                {soulGridImages.map((img) => (
                  <div
                    key={img.src}
                    className={`thumb-container ${activeSoulGridImg === img.src ? 'active' : ''}`}
                    onClick={() => setActiveSoulGridImg(img.src)}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      title={img.title}
                      width={200}
                      height={120}
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="project-content">
            <span className="project-label">{t.projects.featured_label}</span>
            <h3 className="project-title">{t.projects.soulgrid.title}</h3>
            <p className="project-description">
              {t.projects.soulgrid.desc_prefix}
              <br /><br />
              <b>{t.projects.soulgrid.desc_deploy}</b> {t.projects.soulgrid.desc_deploy_text}
            </p>
            <div className="project-tech">
              <span className="tech-tag" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>On-Premise</span>
              <span className="tech-tag">Mac Mini M4</span>
              <span className="tech-tag">Docker</span>
              <span className="tech-tag">CI/CD</span>
              <span className="tech-tag">Spring Cloud</span>
              <span className="tech-tag">Next.js 15</span>
              <span className="tech-tag">MySQL</span>
              <span className="tech-tag">MongoDB</span>
              <span className="tech-tag">Redis</span>
              <span className="tech-tag">RabbitMQ</span>
              <span className="tech-tag">Web3</span>
            </div>
            <a
              href="https://github.com/tail-s"
              target="_blank"
              rel="noopener noreferrer"
              className="project-link"
            >
              {t.projects.soulgrid.link} <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Other Projects Grid */}
        <div className="projects-grid">
          <div className="project-card">
            <h4 className="project-card-title">{t.projects.birdchain.title}</h4>
            <p className="project-card-role">{t.projects.birdchain.role}</p>
            <p className="project-card-desc">{t.projects.birdchain.desc}</p>
            <div className="project-tech" style={{ marginTop: '1rem' }}>
              <span className="tech-tag">Solidity</span>
              <span className="tech-tag">Vue.js</span>
              <span className="tech-tag">IPFS</span>
            </div>
          </div>

          <div className="project-card">
            <h4 className="project-card-title">{t.projects.persona.title}</h4>
            <p className="project-card-role">{t.projects.persona.role}</p>
            <p className="project-card-desc">{t.projects.persona.desc}</p>
            <div className="project-tech" style={{ marginTop: '1rem' }}>
              <span className="tech-tag">React.js</span>
              <span className="tech-tag">FastAPI</span>
              <span className="tech-tag">TensorFlow</span>
            </div>
          </div>

          <div className="project-card">
            <h4 className="project-card-title">{t.projects.plands.title}</h4>
            <p className="project-card-role">{t.projects.plands.role}</p>
            <p className="project-card-desc">{t.projects.plands.desc}</p>
            <div className="project-tech" style={{ marginTop: '1rem' }}>
              <span className="tech-tag">Spring Boot</span>
              <span className="tech-tag">OpenVidu</span>
              <span className="tech-tag">Y.js</span>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Insights Section ... (unchanged) */}
      <section id="insights" className="section insights-section">
        {/* ... */}
        <div className="section-header">
          <p className="section-label">{t.insights.label}</p>
          <h2 className="section-title">{t.insights.title}</h2>
        </div>

        <div className="insights-grid">
          {t.insights.items.map((item, idx) => (
            <div key={idx} className="insight-card">
              <div className="insight-number">0{idx + 1}</div>
              <h4 className="insight-title">{item.title}</h4>
              <p className="insight-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section ... (unchanged) */}
      <section id="contact" className="section contact-section">
        {/* ... */}
        <h2 className="contact-title">{t.contact.title}</h2>
        <p className="contact-subtitle">
          {t.contact.subtitle}
        </p>

        <div className="contact-links">
          <a href="https://github.com/tail-s" target="_blank" rel="noopener noreferrer" className="contact-link">
            <div className="contact-icon"><Github size={22} /></div>
            <span className="contact-label">{t.contact.github}</span>
          </a>
          <a href="https://www.instagram.com/dev_mode_" target="_blank" rel="noopener noreferrer" className="contact-link">
            <div className="contact-icon"><Instagram size={22} /></div>
            <span className="contact-label">{t.contact.instagram}</span>
          </a>
          <a href="https://www.linkedin.com/in/oliverslife" target="_blank" rel="noopener noreferrer" className="contact-link">
            <div className="contact-icon"><Linkedin size={22} /></div>
            <span className="contact-label">{t.contact.linkedin}</span>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="portfolio-footer">
        <span>{t.footer.rights}</span>
        <span>{t.footer.location}</span>
      </footer>

      {/* Cressets Login Modal */}
      <AnimatePresence>
        {showApiModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowApiModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '400px',
                padding: '3rem 2.5rem',
                background: '#F5F0E8',
                borderRadius: '4px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                zIndex: 101,
                border: '1px solid #E0D8CC',
                fontFamily: "'Inter', sans-serif"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowApiModal(false)}
                style={{
                  position: 'absolute',
                  top: '1.5rem',
                  right: '1.5rem',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9B9B9B',
                  transition: 'color 0.2s'
                }}
              >
                <X size={20} />
              </button>

              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <div style={{ marginBottom: '1rem', color: '#8B7355', display: 'flex', justifyContent: 'center' }}>
                  <Lock size={32} strokeWidth={1.5} />
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: 400, color: '#2C2C2C', fontFamily: "'Cormorant Garamond', serif", marginBottom: '0.5rem' }}>
                  {t.modal.title}
                </h2>
                <p style={{ fontSize: '0.75rem', color: '#9B9B9B', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  {t.modal.subtitle}
                </p>
              </div>

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      background: '#FFFFFF',
                      border: '1px solid #E0D8CC',
                      borderRadius: '2px',
                      fontSize: '0.9rem',
                      fontFamily: 'monospace',
                      textAlign: 'center',
                      outline: 'none',
                      color: '#2C2C2C',
                    }}
                    placeholder={t.modal.placeholder}
                    autoFocus
                  />
                </div>

                {error && <div style={{ fontSize: '0.8rem', color: '#DC2626', textAlign: 'center' }}>{error}</div>}

                <button
                  type="submit"
                  disabled={loading || !apiKey}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: '#2C2C2C',
                    border: 'none',
                    borderRadius: '2px',
                    color: 'white',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    cursor: loading || !apiKey ? 'not-allowed' : 'pointer',
                    opacity: loading || !apiKey ? 0.7 : 1,
                    transition: 'all 0.3s'
                  }}
                >
                  {loading ? t.modal.button_auth : t.modal.button_access}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hidden Lock Button */}
      <button
        onClick={() => setShowApiModal(true)}
        style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          opacity: 0.1,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          zIndex: 99,
          color: 'var(--color-text)',
          transition: 'opacity 0.3s'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.1')}
        title={t.nav.dashboard}
      >
        <Lock size={14} />
      </button>
    </div>
  );
}
