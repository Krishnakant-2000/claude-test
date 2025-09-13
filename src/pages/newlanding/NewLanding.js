import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { setPageBodyClass } from '../../utils/cssCleanup';
import './NewLanding.css';

// Import images

const NewLanding = () => {
  // Handle smooth scrolling to sections
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
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

    // Cleanup function to remove styles when component unmounts
    return () => {
      // Remove all body classes added by newlanding
      document.body.classList.remove('new-landing-page-loaded');
      document.body.classList.remove('landingpage3d-loaded');
      
      // Remove any inline styles that might have been added by scripts
      document.body.removeAttribute('style');
      
      console.log('NEW LANDING: Cleanup completed on unmount');
    };
  }, []);

  return (
    <div className="new-landing-container">
      {/* Header */}
      <header id="header" className="alt">
        <div className="logo">
          <a href="#home">Hello <span>by AmaPlayer</span></a>
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
      
      {/* Banner */}
      <section className="banner full">
        <article>
          <div style={{
            backgroundImage: `url('/newlanding/images/pic01.jpg')`,
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
        
        <article>
          <div style={{
            backgroundImage: `url('/newlanding/images/pic02.jpg')`,
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
            </header>
          </div>
        </article>
        
        <article data-position="center bottom">
          <div style={{
            backgroundImage: `url('/newlanding/images/pic03.jpg')`,
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
            </header>
          </div>
        </article>
      </section>
      
      {/* Vision & Mission Section */}
      <section id="vision-mission" className="wrapper style2">
        <div className="inner">
          <header className="align-center">
            <p className="special">Empowering Every Athlete's Journey</p>
            <h2>Our Vision & Mission</h2>
          </header>
          
          <div style={{
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '3rem', 
            margin: '3rem 0',
            padding: '2rem 0'
          }}>
            
            {/* Vision Section */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
              border: '2px solid rgba(76, 175, 80, 0.3)',
              borderRadius: '20px',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(15px)'
            }}>
              <div style={{fontSize: '4rem', marginBottom: '1.5rem'}}>👁️</div>
              
              <h2 style={{
                color: '#4CAF50',
                fontSize: '1.8rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '3px',
                marginBottom: '2rem',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                OUR VISION
              </h2>
              
              <h3 style={{
                fontSize: '1.2rem',
                lineHeight: '1.8',
                fontWeight: '400',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                textAlign: 'center',
                margin: '2rem 0 0 0',
                padding: '1.5rem',
                position: 'relative'
              }}>
                <span style={{
                  color: '#2c3e50',
                  fontSize: '1.2rem',
                  fontWeight: '500',
                  lineHeight: '1.8',
                  letterSpacing: '0.5px',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                  display: 'inline-block'
                }}>
                  "AmaPlayer envisions an India where every hidden talent gets a global stage, fueling the journey from playgrounds to podiums, and bringing home Olympic Gold and World Championship glory."
                </span>
              </h3>
            </div>
            
            {/* Mission Section */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
              border: '2px solid rgba(76, 175, 80, 0.3)',
              borderRadius: '20px',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(15px)'
            }}>
              <div style={{fontSize: '4rem', marginBottom: '1.5rem'}}>🎯</div>
              
              <h2 style={{
                color: '#4CAF50',
                fontSize: '1.8rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '3px',
                marginBottom: '2rem',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                OUR MISSION
              </h2>
              
              <h3 style={{
                fontSize: '1.2rem',
                lineHeight: '1.8',
                fontWeight: '400',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                textAlign: 'center',
                margin: '2rem 0 0 0',
                padding: '1.5rem',
                position: 'relative'
              }}>
                <span style={{
                  color: '#2c3e50',
                  fontSize: '1.2rem',
                  fontWeight: '500',
                  lineHeight: '1.8',
                  letterSpacing: '0.5px',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                  display: 'inline-block'
                }}>
                  "Our mission is to build a trusted sports ecosystem where players, coaches, academies, brands, and fans come together to discover, nurture, and celebrate talent, fueling India's journey to Olympic Golds and World Championships."
                </span>
              </h3>
            </div>
            
          </div>
          
          
          
          <footer className="align-center">
            <Link to="/search" className="button special">Find Athletes</Link>
            <button onClick={() => scrollToSection('explore')} className="button alt">Learn More</button>
          </footer>
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
            <p className="special">Nam vel ante sit amet libero scelerisque facilibus eleifend vitae urna</p>
            <h2>How I Got Discovered With AmaPlayer</h2>
          </header>
          <div className="process-cards">
            <div className="process-card">
              <div className="card-image">
                <div style={{
                  backgroundImage: `url('/newlanding/images/pic01.jpg')`,
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
                  backgroundImage: `url('/newlanding/images/pic02.jpg')`,
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
                  backgroundImage: `url('/newlanding/images/pic03.jpg')`,
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
                <h3>Organization 🏢</h3>
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
          <ul className="icons">
            <li><button onClick={handleDisabledButton} className="icon fa-twitter"><span className="label">Twitter</span></button></li>
            <li><button onClick={handleDisabledButton} className="icon fa-facebook"><span className="label">Facebook</span></button></li>
            <li><button onClick={handleDisabledButton} className="icon fa-instagram"><span className="label">Instagram</span></button></li>
            <li><button onClick={handleDisabledButton} className="icon fa-envelope-o"><span className="label">Email</span></button></li>
          </ul>
        </div>
      </footer>
    </div>
  );
};

export default NewLanding;