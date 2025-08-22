import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './NewLanding.css';

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
    
    // Add body class to identify new landing page
    document.body.classList.add('new-landing-page-loaded');
    document.body.classList.remove('landingpage3d-loaded');
    
    console.log('NEW LANDING: Setup complete');
    
    // Load external scripts after component mounts
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    // Load all required scripts in sequence
    const loadScripts = async () => {
      try {
        await loadScript('/newlanding/assets/js/jquery.min.js');
        await loadScript('/newlanding/assets/js/jquery.scrollex.min.js');
        await loadScript('/newlanding/assets/js/skel.min.js');
        await loadScript('/newlanding/assets/js/util.js');
        await loadScript('/newlanding/assets/js/main.js');
        
        // Remove loading class after scripts are loaded
        setTimeout(() => {
          document.body.classList.remove('is-loading');
        }, 100);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('Some scripts failed to load:', error);
        // Even if scripts fail, remove loading class
        document.body.classList.remove('is-loading');
      }
    };

    // Add loading class initially
    document.body.classList.add('is-loading');
    
    loadScripts();

    // Cleanup function to remove scripts when component unmounts
    return () => {
      const scripts = document.querySelectorAll('script[src*="/newlanding/"]');
      scripts.forEach(script => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
      document.body.classList.remove('is-loading');
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
          <li><a href="/newlanding/coaches.html" target="_blank" rel="noopener noreferrer">View Coaches</a></li>
          <li><a href="/newlanding/organizations.html" target="_blank" rel="noopener noreferrer">View Organizations</a></li>
          <li><Link to="/app-landing">App</Link></li>
        </ul>
      </nav>
      
      {/* Banner */}
      <section className="banner full">
        <article>
          <img src="/newlanding/images/slide01.jpg" alt="" width="1440" height="961" />
          <div className="inner">
            <header>
              <p>We Welcome you to <span>Platform</span></p>
              <h2>AmaPlayer</h2>
              <div className="hero-buttons">
                <button onClick={() => scrollToSection('explore')} className="button special">Explore</button>
                <Link to="/app-landing" className="button alt">App</Link>
              </div>
            </header>
          </div>
        </article>
        
        <article>
          <img src="/newlanding/images/stadium.jpg" alt="" width="1440" height="961" />
          <div className="inner">
            <header>
              <h2>Where Talent Meets Opportunity</h2>
            </header>
          </div>
        </article>
        
        <article data-position="center bottom">
          <img src="/newlanding/images/action.jpg" alt="" width="1440" height="962" />
          <div className="inner">
            <header>
              <p>Your Journey, Our Stage.</p>
              <h2>Let's Conquer Together</h2>
            </header>
          </div>
        </article>
      </section>
      
      {/* One */}
      <section id="one" className="wrapper style2">
        <div className="inner">
          <div className="grid-style">
            <div>
              <div className="box">
                <div className="image fit">
                  <img src="/newlanding/images/weight.jpg" alt="" width="300" height="50" />
                </div>
                <div className="content">
                  <header className="align-center">
                    <p>How I Got Discovered with Talent Hunt</p>
                    <h2>Sports-Only Community Forum</h2>
                  </header>
                  <p>Success in sports is built on consistent training, discipline, and the right opportunities. At AmaPlayer, we connect aspiring athletes with the resources they need to excel. Whether you're a player looking to showcase your talent or a coach seeking promising athletes, our platform bridges the gap between potential and opportunity. Share your journey, track your progress, and get discovered by organizations looking for talent just like yours.</p>
                  <footer className="align-center">
                    <Link to="/app-landing" className="button alt">Learn More</Link>
                  </footer>
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
              <Link to="/app-landing" className="button alt">Join Today's Challenge</Link>
            </div>
            <div className="challenge-card">
              <div className="challenge-icon">
                <i className="fa fa-star"></i>
              </div>
              <h3>Weekly Tournaments</h3>
              <p>Compete against athletes nationwide in our weekly tournaments with amazing prizes.</p>
              <Link to="/app-landing" className="button alt">View Leaderboard</Link>
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
                <img src="/newlanding/images/upload.jpg" alt="Upload" />
              </div>
              <div className="card-content">
                <h3>UPLOAD</h3>
                <p>Share your best moments, stats, & achievements</p>
              </div>
            </div>
            <div className="process-arrow">→</div>
            <div className="process-card">
              <div className="card-image">
                <img src="/newlanding/images/connect.jpg" alt="Connect" />
              </div>
              <div className="card-content">
                <h3>CONNECT</h3>
                <p>Network with selectors, coaches, and fellow athletes</p>
              </div>
            </div>
            <div className="process-arrow">→</div>
            <div className="process-card">
              <div className="card-image">
                <img src="/newlanding/images/medals.jpg" alt="Get Recognized" />
              </div>
              <div className="card-content">
                <h3>GET RECOGNIZED</h3>
                <p>Get scouted by selectors & receive trial invitations</p>
              </div>
            </div>
          </div>
          <div className="process-footer">
            <p>Motivated? <Link to="/app-landing">Join Talent Hunt Today!</Link></p>
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
                <h3>Explore Athletes</h3>
                <p>Browse inspiring profiles, achievements, and highlight reels from athletes across all sports. Connect, compete, and get noticed! Dive into a world of talent ready to be recognized.</p>
                <Link to="/app-landing" className="button special">See Athletes</Link>
              </div>
            </div>
            <div className="explore-card coach-card">
              <div className="card-image-bg" style={{backgroundImage: "url('/newlanding/images/coaches.jpg')"}}>
                <div className="card-overlay"></div>
              </div>
              <div className="card-content">
                <h3>Meet the Coaches</h3>
                <p>Discover top coaches, mentors, and trainers driving athlete progress. Find coaching tips, connect for guidance, or partner for professional development—all inside a supportive sports network.</p>
                <a href="/newlanding/coaches.html" target="_blank" rel="noopener noreferrer" className="button special">View Coaches</a>
              </div>
            </div>
            <div className="explore-card organization-card">
              <div className="card-image-bg" style={{backgroundImage: "url('/newlanding/images/organisation.jpg')"}}>
                <div className="card-overlay"></div>
              </div>
              <div className="card-content">
                <h3>Join Clubs & Organizations</h3>
                <p>Explore sports clubs, academies, and organizations scouting new talent and hosting competitions. Find your local club, stay updated on events, or get recruited for the next big opportunity.</p>
                <a href="/newlanding/organizations.html" target="_blank" rel="noopener noreferrer" className="button special">Explore Clubs</a>
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