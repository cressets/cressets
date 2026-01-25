'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Github, Instagram, Linkedin, ChevronDown, ExternalLink, X, Command, Menu } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import './portfolio.css';

export default function PortfolioPage() {
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

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
        setError('유효하지 않은 API 키입니다');
      }
    } catch {
      setError('연결 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="portfolio-page">
      {/* Navigation */}
      <nav className="portfolio-nav">
        <div className="nav-logo">Sojin Kim</div>
        <div className="nav-links">
          <button onClick={() => scrollToSection('about')} className="nav-link">About</button>
          <button onClick={() => scrollToSection('projects')} className="nav-link">Projects</button>
          <button onClick={() => scrollToSection('insights')} className="nav-link">Insights</button>
          <button onClick={() => scrollToSection('contact')} className="nav-link">Contact</button>
          <button onClick={() => setShowApiModal(true)} className="nav-link" style={{ color: 'var(--color-primary)' }}>
            Cressets →
          </button>
        </div>
        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ display: 'none' }}
        >
          <Menu size={24} />
        </button>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <p className="hero-tagline">Full-Stack Developer • Seoul, Korea</p>
          <h1 className="hero-title">
            Building <em>Thoughtful</em><br />
            Digital Experiences
          </h1>
          <p className="hero-description">
            I enjoy bringing ideas to life through development. With a strong interest 
            in blockchain, Web3, and security, I focus on creating robust and 
            meaningful solutions that bridge innovation with practicality.
          </p>
          <button onClick={() => scrollToSection('projects')} className="hero-cta">
            View Projects <ArrowRight size={16} />
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
                Developer
              </div>
            </div>
            <div className="hero-image-frame"></div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section about-section">
        <div className="section-header">
          <p className="section-label">About Me</p>
          <h2 className="section-title">Background & Experience</h2>
        </div>
        
        <div className="about-grid">
          <div className="about-intro">
            I take pleasure in imagining business concepts and transforming them into 
            reality. Though my professional experience is still growing, I'm actively 
            learning through training programs led by top companies in each field.
          </div>
          
          <div className="about-details">
            <div className="about-block">
              <h3>Core Skills</h3>
              <ul>
                <li>Java & Spring Boot Ecosystem</li>
                <li>Blockchain & Smart Contract Development</li>
                <li>Full-Stack Web Development (React, Next.js)</li>
                <li>Database Design & Optimization</li>
                <li>Cloud Infrastructure & DevOps</li>
              </ul>
            </div>
            
            <div className="about-block">
              <h3>Certifications</h3>
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
            Experience
          </h3>
          
          <div className="experience-list">
            <div className="experience-item">
              <div className="experience-date">2025 - Present</div>
              <div className="experience-content">
                <h4>Public Financial System Operator</h4>
                <p className="company">Korea Fiscal Information Service</p>
                <p>Financial closing and ledger management, maintaining accrual-based double-entry 
                accounting ledgers and ensuring data pipeline stability.</p>
              </div>
            </div>
            
            <div className="experience-item">
              <div className="experience-date">2024</div>
              <div className="experience-content">
                <h4>DeFi Protocol Auditor (Trainee)</h4>
                <p className="company">Dunamu & Theori</p>
                <p>Code-level analysis of Compound Protocol, Venus Protocol Isolated Pool, 
                and Cyan audit with invariant checks.</p>
              </div>
            </div>
            
            <div className="experience-item">
              <div className="experience-date">2024</div>
              <div className="experience-content">
                <h4>Freelance AI Trainer</h4>
                <p className="company">EBIT</p>
                <p>Training generative AI models through coding projects in SQL, Python, Java, 
                JavaScript, and TypeScript.</p>
              </div>
            </div>
            
            <div className="experience-item">
              <div className="experience-date">2023</div>
              <div className="experience-content">
                <h4>Solutions Developer</h4>
                <p className="company">Wooam Corporation (BlueWorks)</p>
                <p>Maintained and developed new features for Document Conference Solution 'SmartPlace'.</p>
              </div>
            </div>
            
            <div className="experience-item">
              <div className="experience-date">2022 - 2023</div>
              <div className="experience-content">
                <h4>Java Track Trainee (1600H)</h4>
                <p className="company">Samsung SW Academy For Youth (SSAFY) 8th</p>
                <p>Intensive training in algorithms, web development with Spring Boot, MySQL, 
                Vue.js, and completed 3 major team projects.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="section projects-section">
        <div className="section-header">
          <p className="section-label">Selected Work</p>
          <h2 className="section-title">Projects</h2>
        </div>

        {/* Featured Project - SoulGrid */}
        <div className="project-featured">
          <div className="project-image">
            SoulGrid
          </div>
          <div className="project-content">
            <span className="project-label">Featured Project</span>
            <h3 className="project-title">SoulGrid Platform</h3>
            <p className="project-description">
              An integrated productivity and social networking platform combining personal journaling, 
              project management, and interest-based matching. Built with a microservices architecture 
              that prioritizes scalability, security, and developer experience.
            </p>
            <div className="project-tech">
              <span className="tech-tag">Spring Cloud</span>
              <span className="tech-tag">Next.js 15</span>
              <span className="tech-tag">MySQL</span>
              <span className="tech-tag">MongoDB</span>
              <span className="tech-tag">Redis</span>
              <span className="tech-tag">RabbitMQ</span>
              <span className="tech-tag">Solidity</span>
              <span className="tech-tag">Web3</span>
            </div>
            <a 
              href="https://github.com/tail-s" 
              target="_blank" 
              rel="noopener noreferrer"
              className="project-link"
            >
              View on GitHub <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Other Projects Grid */}
        <div className="projects-grid">
          <div className="project-card">
            <h4 className="project-card-title">BirdChain</h4>
            <p className="project-card-role">Blockchain Developer / Team Leader</p>
            <p className="project-card-desc">
              NFT platform promoting endangered birds awareness. Implemented smart contracts 
              with Web3.js and managed NFT metadata on IPFS.
            </p>
            <div className="project-tech" style={{ marginTop: '1rem' }}>
              <span className="tech-tag">Solidity</span>
              <span className="tech-tag">Vue.js</span>
              <span className="tech-tag">IPFS</span>
            </div>
          </div>
          
          <div className="project-card">
            <h4 className="project-card-title">Persona</h4>
            <p className="project-card-role">Frontend Lead / Team Leader</p>
            <p className="project-card-desc">
              Community platform for AI-powered acting performance analysis using Mediapipe 
              and Tensorflow.js for real-time feedback.
            </p>
            <div className="project-tech" style={{ marginTop: '1rem' }}>
              <span className="tech-tag">React.js</span>
              <span className="tech-tag">FastAPI</span>
              <span className="tech-tag">TensorFlow</span>
            </div>
          </div>
          
          <div className="project-card">
            <h4 className="project-card-title">Plands</h4>
            <p className="project-card-role">Backend Developer</p>
            <p className="project-card-desc">
              Real-time video conference and collaborative planner with Spring Security, 
              JWT authentication, and OpenVidu integration.
            </p>
            <div className="project-tech" style={{ marginTop: '1rem' }}>
              <span className="tech-tag">Spring Boot</span>
              <span className="tech-tag">OpenVidu</span>
              <span className="tech-tag">Y.js</span>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Insights Section */}
      <section id="insights" className="section insights-section">
        <div className="section-header">
          <p className="section-label">Technical Depth</p>
          <h2 className="section-title">Design Philosophy</h2>
        </div>

        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-number">01</div>
            <h4 className="insight-title">Microservices Architecture</h4>
            <p className="insight-desc">
              Designed services around domain boundaries using DDD principles. Each service 
              (User, Post, Date, Manage) operates independently with its own data store, 
              enabling independent deployment and scaling while maintaining loose coupling.
            </p>
          </div>
          
          <div className="insight-card">
            <div className="insight-number">02</div>
            <h4 className="insight-title">Hybrid Authentication</h4>
            <p className="insight-desc">
              Implemented JWT-based stateless authentication with HttpOnly cookies for XSS 
              protection. Integrated Web3 wallet login using ECDSA signature verification, 
              bridging traditional and decentralized identity systems.
            </p>
          </div>
          
          <div className="insight-card">
            <div className="insight-number">03</div>
            <h4 className="insight-title">Polyglot Persistence</h4>
            <p className="insight-desc">
              Strategic database selection: MySQL for transactional data, MongoDB for flexible 
              schemas (chat, profiles), and Redis for caching and session management. Each 
              choice optimized for specific access patterns and consistency requirements.
            </p>
          </div>
          
          <div className="insight-card">
            <div className="insight-number">04</div>
            <h4 className="insight-title">Resilient Infrastructure</h4>
            <p className="insight-desc">
              Spring Cloud ecosystem with Eureka for service discovery, Config Server for 
              centralized configuration, and RabbitMQ Bus for hot-reload capabilities. 
              API Gateway handles cross-cutting concerns and prevents single points of failure.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section contact-section">
        <h2 className="contact-title">Let's Connect</h2>
        <p className="contact-subtitle">
          Open to discussing new opportunities and interesting projects.
        </p>
        
        <div className="contact-links">
          <a 
            href="https://github.com/tail-s" 
            target="_blank" 
            rel="noopener noreferrer"
            className="contact-link"
          >
            <div className="contact-icon">
              <Github size={22} />
            </div>
            <span className="contact-label">GitHub</span>
          </a>
          
          <a 
            href="https://www.instagram.com/dev_mode_" 
            target="_blank" 
            rel="noopener noreferrer"
            className="contact-link"
          >
            <div className="contact-icon">
              <Instagram size={22} />
            </div>
            <span className="contact-label">Instagram</span>
          </a>
          
          <a 
            href="https://www.linkedin.com/in/oliverslife" 
            target="_blank" 
            rel="noopener noreferrer"
            className="contact-link"
          >
            <div className="contact-icon">
              <Linkedin size={22} />
            </div>
            <span className="contact-label">LinkedIn</span>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="portfolio-footer">
        <span>© 2026 Sojin Kim. All rights reserved.</span>
        <span>Seoul, South Korea</span>
      </footer>

      {/* Cressets Login Modal */}
      <AnimatePresence>
        {showApiModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ 
                position: 'absolute', 
                inset: 0, 
                backgroundColor: 'rgba(0,0,0,0.7)', 
                backdropFilter: 'blur(8px)' 
              }}
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
                maxWidth: '420px',
                padding: '2.5rem',
                background: 'var(--color-bg-alt)',
                borderRadius: '1rem',
                margin: '1rem',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                zIndex: 101
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                height: '3px', 
                background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' 
              }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--color-text)', fontFamily: "'Cormorant Garamond', serif" }}>Cressets</h2>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>File Management System</p>
                </div>
                <button
                  onClick={() => setShowApiModal(false)}
                  style={{ 
                    padding: '0.5rem', 
                    background: 'transparent', 
                    border: 'none', 
                    cursor: 'pointer',
                    color: 'var(--color-text-muted)'
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '1rem 1.25rem',
                      background: 'var(--color-bg)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      fontFamily: 'monospace',
                      letterSpacing: '0.1em',
                      textAlign: 'center',
                      outline: 'none',
                      transition: 'border-color 0.3s',
                      color: 'var(--color-text)'
                    }}
                    placeholder="Enter API Key"
                    autoFocus
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      padding: '0.75rem',
                      background: '#FEF2F2',
                      border: '1px solid #FEE2E2',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#DC2626',
                      textAlign: 'center'
                    }}
                  >
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading || !apiKey}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'var(--color-primary)',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    letterSpacing: '0.05em',
                    cursor: loading || !apiKey ? 'not-allowed' : 'pointer',
                    opacity: loading || !apiKey ? 0.6 : 1,
                    transition: 'all 0.3s'
                  }}
                >
                  {loading ? 'Authenticating...' : 'Access System'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
