import React, { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const SplashCursor = lazy(() => import('../../components/effects/SplashCursor/SplashCursor'));
const Hyperspeed = lazy(() => import('../../components/effects/Hyperspeed/Hyperspeed'));

const LandingPage = () => {
  return (
    <div className="landing-3d-container">
      <div className="hyperspeed-wrapper">
        <Suspense fallback={<div>Loading...</div>}>
          <SplashCursor />
          <Hyperspeed
            effectOptions={{
              onSpeedUp: () => { },
              onSlowDown: () => { },
              distortion: 'turbulentDistortion',
              length: 400,
              roadWidth: 10,
              islandWidth: 2,
              lanesPerRoad: 4,
              fov: 90,
              fovSpeedUp: 150,
              speedUp: 2,
              carLightsFade: 0.4,
              totalSideLightSticks: 20,
              lightPairsPerRoadWay: 40,
              shoulderLinesWidthPercentage: 0.05,
              brokenLinesWidthPercentage: 0.1,
              brokenLinesLengthPercentage: 0.5,
              lightStickWidth: [0.12, 0.5],
              lightStickHeight: [1.3, 1.7],
              movingAwaySpeed: [60, 80],
              movingCloserSpeed: [-120, -160],
              carLightsLength: [400 * 0.03, 400 * 0.2],
              carLightsRadius: [0.05, 0.14],
              carWidthPercentage: [0.3, 0.5],
              carShiftX: [-0.8, 0.8],
              carFloorSeparation: [0, 5],
              colors: {
                roadColor: 0x000000,
                islandColor: 0x0a0a0a,
                background: 0x000000,
                shoulderLines: 0x00ff88,
                brokenLines: 0x00ff88,
                leftCars: [0x00ff88, 0x00cc6a, 0x009955],
                rightCars: [0x00ff88, 0x00cc6a, 0x009955],
                sticks: 0x00ff88,
              }
            }} />
        </Suspense>
      </div>
      <div className="main-content">
        <p className="heading">CONNECT COMPETE AND CONQUEROR</p>
        <h1 className="title">AmaPlayer</h1>
        <p className="subheading">LETS PLAY TOGETHER AND RISE</p>
        <Link to="/login" className="login-button">LOGIN</Link>
      </div>
    </div>
  );
};

export default LandingPage;