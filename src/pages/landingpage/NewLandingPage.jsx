import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./NewLandingPage.css";

const NewLandingPage = () => {
  const navigate = useNavigate();
  const { guestLogin } = useAuth();

  const handleTakeATour = () => {
    // Navigate to root directory (3D green landing page)
    navigate('/');
  };

  const handleLoginSignup = () => {
    // Navigate to login/signup page
    navigate('/login');
  };

  return (
    <div className="new-landing-container">
      <div className="new-landing-main" style={{ backgroundImage: 'url(/newlanding/images/landingbg.jpg)' }}>
        <div className="new-landing-title">
          Ama Player
        </div>

        <div className="new-landing-content-box">
          <p style={{
            position: 'absolute',
            width: '287px',
            top: '93px',
            left: '29px',
            fontFamily: 'Quattrocento, Helvetica, serif',
            fontWeight: 'normal',
            color: 'white',
            fontSize: '16px',
            textAlign: 'center',
            letterSpacing: '0',
            lineHeight: 'normal'
          }}>
            " Ama Player envisions an India where <br />
            &nbsp;&nbsp;every hidden talent get global stage ,<br />
            &nbsp;&nbsp;Fueling the journey from playground
            <br />
            &nbsp;&nbsp;to podiums, and bringing home&nbsp;&nbsp;
            <br />
            &nbsp;&nbsp;Olympic Gold and World Championship
            <br />
            &nbsp;&nbsp; Glory"
          </p>

          <div style={{
            position: 'absolute',
            width: '117px',
            height: '68px',
            top: '9px',
            left: '109px'
          }}>
            <div style={{
              position: 'absolute',
              width: '53px',
              height: '53px',
              top: '0',
              left: '32px',
              background: '#45d268',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              👁️
            </div>

            <div style={{
              position: 'absolute',
              top: '46px',
              left: '0',
              fontFamily: 'Quattrocento, Helvetica, serif',
              fontWeight: 'bold',
              color: '#45d268',
              fontSize: '20px',
              letterSpacing: '0',
              lineHeight: 'normal',
              whiteSpace: 'nowrap'
            }}>
              OUR VISION
            </div>
          </div>

          <div style={{
            position: 'absolute',
            width: '310px',
            height: '273px',
            top: '277px',
            left: '19px',
            background: '#1e40af',
            borderRadius: '15px'
          }}>
            <div style={{
              position: 'absolute',
              top: '42px',
              left: '88px',
              fontFamily: 'Quattrocento, Helvetica, serif',
              fontWeight: 'bold',
              color: '#45d268',
              fontSize: '20px',
              letterSpacing: '0',
              lineHeight: 'normal',
              whiteSpace: 'nowrap'
            }}>
              OUR MISSION
            </div>

            <p style={{
              position: 'absolute',
              width: '254px',
              top: '71px',
              left: '28px',
              fontFamily: 'Quattrocento, Helvetica, serif',
              fontWeight: 'normal',
              color: 'white',
              fontSize: '16px',
              textAlign: 'center',
              letterSpacing: '0',
              lineHeight: 'normal'
            }}>
              "Our mission is to build a trusted <br />
              sport ecosystem where Players,
              <br />
              Coaches, Academies, Brands, and
              <br />
              Fans come together to discover,
              <br />
              Nurtures and Celebrate talents, <br />
              fueling India's journey to
              <br />
              Olympic Gold and World
              <br />
              Championship."
            </p>

            <div style={{
              position: 'absolute',
              width: '30px',
              height: '30px',
              top: '8px',
              left: '140px',
              background: '#45d268',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px'
            }}>
              🎯
            </div>
          </div>
        </div>

        <button 
          onClick={handleTakeATour}
          className="new-landing-tour-btn"
        >
          Take a tour
        </button>

        <button 
          onClick={handleLoginSignup}
          className="new-landing-login-btn"
        >
          Login / Sign Up
        </button>
      </div>
    </div>
  );
};

export default NewLandingPage;