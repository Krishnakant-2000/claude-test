import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { setPageBodyClass } from '../../utils/cssCleanup';
import './NewLanding.css';

// Import images

const NewLanding = () => {
  // Carousel state management
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 3;
  // Handle smooth scrolling to sections
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Carousel navigation functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (slideIndex) => {
    setCurrentSlide(slideIndex);
  };

  // Handle button clicks that should do nothing
  const handleDisabledButton = (e) => {
    e.preventDefault();
    // Do nothing - button is disabled
  };

  useEffect(() => {
    // Conservative new landing page setup
    const currentVersion = '2.1.0';
    
    console.log('NEW LANDING: Component mounted, setting up new landing page...');
    
    // Set document title
    document.title = 'AmaPlayer - Sports Social Media Platform - New Landing v2.1';
    
    // Set version information (don't clear anything)
    try {
      localStorage.setItem('amaplayer-version', currentVersion);
      localStorage.setItem('amaplayer-newlanding-load', Date.now().toString());
    } catch (e) {}
    
    // Update meta version
    const metaVersion = document.querySelector('meta[name="app-version"]');
    if (metaVersion) {
      metaVersion.setAttribute('content', currentVersion);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'app-version';
      meta.content = currentVersion;
      document.head.appendChild(meta);
    }
    
    // Set page class using the utility
    setPageBodyClass('new-landing-page-loaded');
    
    console.log('NEW LANDING: Setup complete');

    // Set up auto-play carousel
    const intervalId = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000); // Change slide every 5 seconds

    // Cleanup function to remove styles when component unmounts
    return () => {
      // Remove all body classes added by newlanding
      document.body.classList.remove('new-landing-page-loaded');
      document.body.classList.remove('landingpage3d-loaded');
      
      // Remove any inline styles that might have been added by scripts
      document.body.removeAttribute('style');
      
      // Clear carousel interval
      clearInterval(intervalId);
      
      console.log('NEW LANDING: Cleanup completed on unmount');
    };
  }, []);

  return (
    <div className="new-landing-container">
      {/* Header */}
      <header id="header" className="alt">
        <div className="logo">
          <a href="#home">Hello <span>from AmaPlayer</span></a>
        </div>
        <a href="#menu">Menu</a>
      </header>
      
      {/* Nav */}
      <nav id="menu">
        <ul className="links">
          <li><a href="#home">Home</a></li>
          <li><button onClick={() => scrollToSection('vision-mission')}>About Us</button></li>
          <li><a href="/newlanding/coaches.html" target="_blank" rel="noopener noreferrer">View Coaches</a></li>
          <li><a href="/newlanding/organizations.html" target="_blank" rel="noopener noreferrer">View Organizations</a></li>
          <li><Link to="/profile">Profile</Link></li>
        </ul>
      </nav>
      
      {/* Banner Carousel */}
      <section className="banner full" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Slide 1: Stadium - Hero with buttons */}
        <article style={{
          opacity: currentSlide === 0 ? 1 : 0,
          visibility: currentSlide === 0 ? 'visible' : 'hidden',
          transition: 'opacity 0.8s ease-in-out, visibility 0.8s ease-in-out',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: currentSlide === 0 ? 2 : 1
        }}>
          <div style={{
            backgroundImage: `url('/newlanding/images/stadium.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0
          }} />
          <div className="inner">
            <header>
              <p>We Welcome you to <span>Platform</span></p>
              <h2>AmaPlayer</h2>
              <div className="hero-buttons">
                <button onClick={() => scrollToSection('explore')} className="button special">Explore</button>
                <Link to="/login" className="button alt">App</Link>
              </div>
            </header>
          </div>
        </article>
        
        {/* Slide 2: Cycling - Talent */}
        <article style={{
          opacity: currentSlide === 1 ? 1 : 0,
          visibility: currentSlide === 1 ? 'visible' : 'hidden',
          transition: 'opacity 0.8s ease-in-out, visibility 0.8s ease-in-out',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: currentSlide === 1 ? 2 : 1
        }}>
          <div style={{
            backgroundImage: `url('/newlanding/images/cycling.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0
          }} />
          <div className="inner">
            <header>
              <h2>Where Talent Meets Opportunity</h2>
              <p>Connect with coaches, scouts, and organizations looking for your unique skills</p>
              <div className="hero-buttons">
                <Link to="/search" className="button special">Find Coaches</Link>
                <Link to="/login" className="button alt">Join Now</Link>
              </div>
            </header>
          </div>
        </article>
        
        {/* Slide 3: Action - Motivation */}
        <article style={{
          opacity: currentSlide === 2 ? 1 : 0,
          visibility: currentSlide === 2 ? 'visible' : 'hidden',
          transition: 'opacity 0.8s ease-in-out, visibility 0.8s ease-in-out',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: currentSlide === 2 ? 2 : 1
        }}>
          <div style={{
            backgroundImage: `url('/newlanding/images/action.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0
          }} />
          <div className="inner">
            <header>
              <p>Your Journey, Our Stage.</p>
              <h2>Let's Conquer Together</h2>
              <div className="hero-buttons">
                <Link to="/events" className="button special">View Challenges</Link>
                <Link to="/login" className="button alt">Start Journey</Link>
              </div>
            </header>
          </div>
        </article>

        {/* Carousel Navigation Arrows */}
        <button 
          onClick={prevSlide}
          style={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            zIndex: 10,
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.4)';
            e.target.style.transform = 'translateY(-50%) scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            e.target.style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          ‹
        </button>
        
        <button 
          onClick={nextSlide}
          style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            zIndex: 10,
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.4)';
            e.target.style.transform = 'translateY(-50%) scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            e.target.style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          ›
        </button>

      </section>
      
      {/* Vision & Mission Section */}
      <section id="vision-mission" className="wrapper style2" style={{ 
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #1e3c72 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          opacity: 0.1
        }} />
        
        <div className="inner" style={{ 
          position: 'relative', 
          zIndex: 2,
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '32px',
          padding: '4rem 2rem',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <header className="align-center" style={{ marginBottom: '4rem' }}>
            <p className="special" style={{ 
              color: 'rgba(255, 255, 255, 0.8)', 
              fontSize: '1.1rem',
              fontWeight: '300'
            }}>
              🏆 Empowering Every Athlete's Journey 🏆
            </p>
            <h2 style={{ 
              color: '#ffffff', 
              fontSize: '3rem',
              fontWeight: '700',
              textShadow: '0 4px 8px rgba(0,0,0,0.3)',
              marginBottom: '1rem'
            }}>
              Our Vision & Mission
            </h2>
            <div style={{
              width: '100px',
              height: '4px',
              background: 'linear-gradient(90deg, #ff6b35, #f7931e)',
              margin: '0 auto',
              borderRadius: '2px'
            }} />
          </header>
          
          <div style={{
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '4rem', 
            margin: '4rem 0',
            padding: '0'
          }}>
            
            {/* Vision Card */}
            <div style={{
              position: 'relative',
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '24px',
              padding: '0',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden',
              transform: 'perspective(1000px) rotateX(2deg)',
              transition: 'all 0.4s ease',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(20px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) translateY(-10px)';
              e.currentTarget.style.boxShadow = '0 30px 80px rgba(0, 0, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'perspective(1000px) rotateX(2deg) translateY(0px)';
              e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.3)';
            }}>
              
              {/* Vision Image Header */}
              <div style={{
                height: '180px',
                background: `linear-gradient(135deg, rgba(255, 107, 53, 0.9), rgba(247, 147, 30, 0.9)), url('/newlanding/images/Medal.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 255, 255, 0.3)'
                }}>
                  <span style={{ fontSize: '2.5rem' }}>🏅</span>
                </div>
              </div>
              
              {/* Vision Content */}
              <div style={{ padding: '2.5rem 2rem' }}>
                <h2 style={{
                  color: '#ff6b35',
                  fontSize: '1.8rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  marginBottom: '1.5rem',
                  textAlign: 'center',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  OUR VISION
                </h2>
                
                <p style={{
                  fontSize: '1.1rem',
                  lineHeight: '1.7',
                  color: 'rgba(255, 255, 255, 0.95)',
                  textAlign: 'center',
                  fontWeight: '400',
                  margin: '0',
                  fontStyle: 'italic',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                  "AmaPlayer envisions an India where every hidden talent gets a global stage, fueling the journey from playgrounds to podiums, and bringing home Olympic Gold and World Championship glory."
                </p>

                {/* Vision Stats */}
                <div style={{
                  marginTop: '2rem',
                  display: 'flex',
                  justifyContent: 'space-around',
                  padding: '1rem 0',
                  borderTop: '1px solid rgba(255, 107, 53, 0.2)'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff6b35' }}>🌟</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.8)', marginTop: '0.25rem' }}>Global Stage</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff6b35' }}>🏆</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.8)', marginTop: '0.25rem' }}>Olympic Gold</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff6b35' }}>🌍</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.8)', marginTop: '0.25rem' }}>World Glory</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mission Card */}
            <div style={{
              position: 'relative',
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '24px',
              padding: '0',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden',
              transform: 'perspective(1000px) rotateX(2deg)',
              transition: 'all 0.4s ease',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(20px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) translateY(-10px)';
              e.currentTarget.style.boxShadow = '0 30px 80px rgba(0, 0, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'perspective(1000px) rotateX(2deg) translateY(0px)';
              e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.3)';
            }}>
              
              {/* Mission Image Header */}
              <div style={{
                height: '180px',
                background: `linear-gradient(135deg, rgba(76, 175, 80, 0.9), rgba(56, 142, 60, 0.9)), url('/newlanding/images/people.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 255, 255, 0.3)'
                }}>
                  <span style={{ fontSize: '2.5rem' }}>🤝</span>
                </div>
              </div>
              
              {/* Mission Content */}
              <div style={{ padding: '2.5rem 2rem' }}>
                <h2 style={{
                  color: 'rgba(255, 255, 255, 0.95)',
                  fontSize: '1.8rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  marginBottom: '1.5rem',
                  textAlign: 'center',
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
                }}>
                  OUR MISSION
                </h2>
                
                <p style={{
                  fontSize: '1.1rem',
                  lineHeight: '1.7',
                  color: 'rgba(255, 255, 255, 0.95)',
                  textAlign: 'center',
                  fontWeight: '400',
                  margin: '0',
                  fontStyle: 'italic',
                  textShadow: '1px 1px 3px rgba(0, 0, 0, 0.8)'
                }}>
                  "Our mission is to build a trusted sports ecosystem where players, coaches, academies, brands, and fans come together to discover, nurture, and celebrate talent, fueling India's journey to Olympic Golds."
                </p>

                {/* Mission Stats */}
                <div style={{
                  marginTop: '2rem',
                  display: 'flex',
                  justifyContent: 'space-around',
                  padding: '1rem 0',
                  borderTop: '1px solid rgba(76, 175, 80, 0.2)'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4CAF50' }}>🏃‍♂️</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.8)', marginTop: '0.25rem', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>Athletes</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4CAF50' }}>👨‍🏫</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.8)', marginTop: '0.25rem', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>Coaches</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4CAF50' }}>🏢</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.8)', marginTop: '0.25rem', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>Organizations</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </section>
      
      {/* Two */}
      <section id="two" className="wrapper style3">
        <div className="inner">
          <header className="align-center">
            <h2>Daily & Weekly Challenges</h2>
            <p>Compete, improve, and win exciting rewards!</p>
          </header>
          <div className="challenges-container">
            <div className="challenge-card">
              <div className="challenge-icon">
                <i className="fa fa-trophy"></i>
              </div>
              <h3>Daily Challenges</h3>
              <p>Test your skills with new challenges every day and win exclusive sport kits and gear.</p>
              <Link to="/events" className="button alt">Join Today's Challenge</Link>
            </div>
            <div className="challenge-card">
              <div className="challenge-icon">
                <i className="fa fa-star"></i>
              </div>
              <h3>Weekly Tournaments</h3>
              <p>Compete against athletes nationwide in our weekly tournaments with amazing prizes.</p>
              <Link to="/events" className="button alt">View Leaderboard</Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Three */}
      <section id="three" className="wrapper style2">
        <div className="inner">
          <header className="align-center">
            
            <h2>How I Got Discovered With AmaPlayer</h2>
          </header>
          <div className="process-cards">
            <div className="process-card">
              <div className="card-image">
                <div style={{
                  backgroundImage: `url('/newlanding/images/upload.jpg')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  width: '100%',
                  height: '200px',
                  borderRadius: '8px'
                }} />
              </div>
              <div className="card-content">
                <h3>UPLOAD</h3>
                <p>Share your best moments, stats, & achievements</p>
              </div>
            </div>
            <div className="process-arrow">→</div>
            <div className="process-card">
              <div className="card-image">
                <div style={{
                  backgroundImage: `url('/newlanding/images/connect.jpg')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  width: '100%',
                  height: '200px',
                  borderRadius: '8px'
                }} />
              </div>
              <div className="card-content">
                <h3>CONNECT</h3>
                <p>Network with selectors, coaches, and fellow athletes</p>
              </div>
            </div>
            <div className="process-arrow">→</div>
            <div className="process-card">
              <div className="card-image">
                <div style={{
                  backgroundImage: `url('/newlanding/images/medals.jpg')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  width: '100%',
                  height: '200px',
                  borderRadius: '8px'
                }} />
              </div>
              <div className="card-content">
                <h3>GET RECOGNIZED</h3>
                <p>Get scouted by selectors & receive trial invitations</p>
              </div>
            </div>
          </div>
          <div className="process-footer">
            <p>Motivated? <Link to="/add-post">Share Your Talent Today!</Link></p>
          </div>
        </div>
      </section>

      {/* Explore the Env Section */}
      <section id="explore" className="wrapper style1">
        <div className="inner">
          <header className="align-center">
            <h2>Explore the Environment</h2>
            <p>Discover your path in the sports community - whether you're an athlete, coach, or organization</p>
          </header>
          <div className="explore-cards">
            <div className="explore-card athlete-card">
              <div className="card-image-bg" style={{backgroundImage: "url('/newlanding/images/athlete.jpg')"}}>
                <div className="card-overlay"></div>
              </div>
              <div className="card-content">
                <h3>Athlete </h3>
                <p>Join as a player to showcase your skills and connect with coaches. Create your profile, share your achievements, and get discovered by teams and organizations.</p>
                <Link to="/login?type=athlete" className="button special">Join as Athlete</Link>
              </div>
            </div>
            <div className="explore-card coach-card">
              <div className="card-image-bg" style={{backgroundImage: "url('/newlanding/images/coaches.jpg')"}}>
                <div className="card-overlay"></div>
              </div>
              <div className="card-content">
                <h3>Coaches </h3>
                <p>Join as a coach to train and mentor athletes. Share your expertise, connect with talented players, and help shape the next generation of sports stars.</p>
                <Link to="/login?type=coach" className="button special">Join as Coach</Link>
              </div>
            </div>
            <div className="explore-card organization-card">
              <div className="card-image-bg" style={{backgroundImage: "url('/newlanding/images/organisation.jpg')"}}>
                <div className="card-overlay"></div>
              </div>
              <div className="card-content">
                <h3>Organization </h3>
                <p>Join as an organization to manage teams, host events, and discover talent. Connect with athletes and coaches to build your sports community.</p>
                <Link to="/login?type=organization" className="button special">Join as Organization</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer id="footer">
        <div className="container">
          {/* Enhanced Social Media Section */}
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <h3 style={{
              color: 'var(--text-primary)',
              marginBottom: '1rem',
              fontSize: '1.5rem'
            }}>
              Follow AmaPlayer
            </h3>
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: '2rem',
              maxWidth: '400px',
              margin: '0 auto 2rem auto'
            }}>
              Stay connected with the latest sports news, athlete stories, and platform updates
            </p>
          </div>

          <ul className="icons" style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            listStyle: 'none',
            padding: 0,
            flexWrap: 'wrap'
          }}>
            <li>
              <a 
                href="https://twitter.com/amaplayer" 
                target="_blank" 
                rel="noopener noreferrer"
                className="icon fa-twitter"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: '#1DA1F2',
                  color: 'white',
                  fontSize: '20px',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(29, 161, 242, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px) scale(1.1)';
                  e.target.style.boxShadow = '0 8px 25px rgba(29, 161, 242, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 4px 15px rgba(29, 161, 242, 0.3)';
                }}
              >
                <span className="label" style={{ display: 'none' }}>Twitter</span>
              </a>
            </li>
            <li>
              <a 
                href="https://instagram.com/amaplayer" 
                target="_blank" 
                rel="noopener noreferrer"
                className="icon fa-instagram"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #F56040, #E1306C, #C13584, #833AB4)',
                  color: 'white',
                  fontSize: '20px',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(225, 48, 108, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px) scale(1.1)';
                  e.target.style.boxShadow = '0 8px 25px rgba(225, 48, 108, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 4px 15px rgba(225, 48, 108, 0.3)';
                }}
              >
                <span className="label" style={{ display: 'none' }}>Instagram</span>
              </a>
            </li>
            <li>
              <a 
                href="https://facebook.com/amaplayer" 
                target="_blank" 
                rel="noopener noreferrer"
                className="icon fa-facebook"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: '#1877F2',
                  color: 'white',
                  fontSize: '20px',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(24, 119, 242, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px) scale(1.1)';
                  e.target.style.boxShadow = '0 8px 25px rgba(24, 119, 242, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 4px 15px rgba(24, 119, 242, 0.3)';
                }}
              >
                <span className="label" style={{ display: 'none' }}>Facebook</span>
              </a>
            </li>
            <li>
              <a 
                href="https://youtube.com/@amaplayer" 
                target="_blank" 
                rel="noopener noreferrer"
                className="icon fa-youtube"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: '#FF0000',
                  color: 'white',
                  fontSize: '20px',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(255, 0, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px) scale(1.1)';
                  e.target.style.boxShadow = '0 8px 25px rgba(255, 0, 0, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 4px 15px rgba(255, 0, 0, 0.3)';
                }}
              >
                <span className="label" style={{ display: 'none' }}>YouTube</span>
              </a>
            </li>
            <li>
              <a 
                href="https://linkedin.com/company/amaplayer" 
                target="_blank" 
                rel="noopener noreferrer"
                className="icon fa-linkedin"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: '#0077B5',
                  color: 'white',
                  fontSize: '20px',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(0, 119, 181, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px) scale(1.1)';
                  e.target.style.boxShadow = '0 8px 25px rgba(0, 119, 181, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 4px 15px rgba(0, 119, 181, 0.3)';
                }}
              >
                <span className="label" style={{ display: 'none' }}>LinkedIn</span>
              </a>
            </li>
            <li>
              <a 
                href="mailto:contact@amaplayer.com" 
                className="icon fa-envelope-o"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: '#34495e',
                  color: 'white',
                  fontSize: '20px',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(52, 73, 94, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px) scale(1.1)';
                  e.target.style.boxShadow = '0 8px 25px rgba(52, 73, 94, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 4px 15px rgba(52, 73, 94, 0.3)';
                }}
              >
                <span className="label" style={{ display: 'none' }}>Email</span>
              </a>
            </li>
          </ul>

          {/* Additional Footer Info */}
          <div style={{
            marginTop: '2rem',
            padding: '1rem 0',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center'
          }}>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              margin: 0
            }}>
              © 2024 AmaPlayer. Empowering Athletes. Building Champions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NewLanding;