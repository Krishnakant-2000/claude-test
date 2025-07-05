import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageSelector from '../common/LanguageSelector';
import ThemeToggle from '../common/ThemeToggle';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const { guestLogin } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const handleGuestLogin = async () => {
    try {
      setIsLoading(true);
      await guestLogin();
      navigate('/home');
    } catch (error) {
      console.error('Guest login failed:', error);
      alert('Failed to login as guest. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const legendaryQuotes = [
    {
      quote: "Enjoy the game and chase your dreams. Dreams do come true. But more than anything else, it is about enjoying your cricket and being true to yourself.",
      author: "Sachin Tendulkar",
      sport: "Cricket",
      image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&h=300&fit=crop"
    },
    {
      quote: "Hockey is a game where you need to have complete control over the ball, your mind, and your emotions. The moment you lose any of these, you lose the game.",
      author: "Dhyan Chand",
      sport: "Hockey",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"
    },
    {
      quote: "I believe that if you work hard and stay dedicated, anything is possible. The javelin taught me that dreams can fly as far as you dare to throw them.",
      author: "Neeraj Chopra",
      sport: "Athletics",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"
    },
    {
      quote: "The way a team plays as a whole determines its success. You may have the greatest bunch of individual stars in the world, but if they don't play together, the club won't be worth a dime.",
      author: "Babe Ruth",
      sport: "Baseball",
      image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400&h=300&fit=crop"
    },
    {
      quote: "I've missed more than 9000 shots in my career. I've lost almost 300 games. 26 times, I've been trusted to take the game winning shot and missed. I've failed over and over and over again in my life. And that is why I succeed.",
      author: "Michael Jordan",
      sport: "Basketball",
      image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop"
    },
    {
      quote: "It's not whether you get knocked down; it's whether you get up.",
      author: "Vince Lombardi",
      sport: "Football",
      image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=300&fit=crop"
    },
    {
      quote: "The more difficult the victory, the greater the happiness in winning.",
      author: "Pelé",
      sport: "Football",
      image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop"
    },
    {
      quote: "Champions keep playing until they get it right.",
      author: "Billie Jean King",
      sport: "Tennis",
      image: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400&h=300&fit=crop"
    },
    {
      quote: "You have to expect things of yourself before you can do them.",
      author: "Muhammad Ali",
      sport: "Boxing",
      image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400&h=300&fit=crop"
    }
  ];

  const olympicImages = [
    {
      url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&w=600&h=400&fit=crop&auto=format",
      caption: "Olympic Rings - Symbol of Unity"
    },
    {
      url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&w=600&h=400&fit=crop&auto=format",
      caption: "Athletic Excellence"
    },
    {
      url: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&w=600&h=400&fit=crop&auto=format",
      caption: "Victory Celebration"
    },
    {
      url: "https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.0.3&w=600&h=400&fit=crop&auto=format",
      caption: "Swimming Championships"
    }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-controls">
          <LanguageSelector />
          <ThemeToggle />
        </div>
        <div className="hero-background">
          <img 
            src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&w=1920&h=1080&fit=crop&auto=format" 
            alt="Olympic Games"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/1920x1080/0f1419/00ff88?text=AmaPlayer+Olympic+Spirit";
            }}
          />
        </div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">{t('hero_title')}</h1>
          <p className="hero-subtitle">{t('hero_subtitle')}</p>
          <p className="hero-description">
            {t('hero_description')}
          </p>
          <div className="hero-buttons">
            <button 
              className="cta-button primary"
              onClick={() => navigate('/login')}
            >
              {t('join_champions')}
            </button>
            <button 
              className="cta-button secondary"
              onClick={handleGuestLogin}
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : t('continue_guest')}
            </button>
          </div>
        </div>
      </section>

      {/* Olympic Gallery */}
      <section className="olympic-gallery">
        <div className="container">
          <h2 className="section-title">Olympic Spirit</h2>
          <div className="gallery-grid">
            {olympicImages.map((image, index) => (
              <div key={index} className="gallery-item">
                <img 
                  src={image.url} 
                  alt={image.caption}
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/600x400/1a2332/00ff88?text=${encodeURIComponent(image.caption)}`;
                  }}
                />
                <div className="gallery-overlay">
                  <p>{image.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quotes Section */}
      <section className="quotes-section">
        <div className="container">
          <h2 className="section-title">Words of Champions</h2>
          <div className="quotes-grid">
            {legendaryQuotes.map((item, index) => (
              <div key={index} className="quote-card">
                <div className="quote-image">
                  <img 
                    src={item.image} 
                    alt={item.sport}
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/400x300/2d3748/00ff88?text=${encodeURIComponent(item.sport)}`;
                    }}
                  />
                </div>
                <div className="quote-content">
                  <blockquote>
                    "{item.quote}"
                  </blockquote>
                  <div className="quote-author">
                    <strong>{item.author}</strong>
                    <span className="sport">{item.sport} Legend</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why AmaPlayer?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Share Your Victories</h3>
              <p>Post your athletic achievements and inspire others with your journey to success.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Connect with Athletes</h3>
              <p>Build a community with fellow athletes and sports enthusiasts from around the world.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Get Motivated</h3>
              <p>Find daily inspiration from legendary quotes and amazing sports moments.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📸</div>
              <h3>Capture Moments</h3>
              <p>Document your training, competitions, and victories with our easy-to-use platform.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="final-cta">
        <div className="container">
          <h2>Ready to Join the Champions?</h2>
          <p>Start sharing your athletic journey today and be part of the AmaPlayer community.</p>
          <button 
            className="cta-button primary large"
            onClick={() => navigate('/login')}
          >
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <p>&copy; 2024 AmaPlayer. Inspiring Athletes Worldwide.</p>
        </div>
      </footer>
    </div>
  );
}