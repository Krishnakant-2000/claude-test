import React from "react";
import { useNavigate } from "react-router-dom";
// Icon imports from assets/images/landing/backgrounds
import arrow1 from "../../assets/images/landing/backgrounds/Arrow 1.svg";
import arrow2 from "../../assets/images/landing/backgrounds/Arrow 2.svg";
import frame96 from "../../assets/images/landing/backgrounds/Frame 36.svg";
import image from "../../assets/images/landing/backgrounds/mingcute_target-line.svg";
import line6 from "../../assets/images/landing/backgrounds/gridicons_trophy.svg";
import line7 from "../../assets/images/landing/backgrounds/material-symbols-light_trophy-outline-rounded.svg";
import line8 from "../../assets/images/landing/backgrounds/solar_star-broken.svg";
import line9 from "../../assets/images/landing/backgrounds/fluent-color_people-community-16.svg";
import vector from "../../assets/images/landing/backgrounds/uiw_eye.svg";
import vector2 from "../../assets/images/landing/backgrounds/streamline-color_industry-innovation-and-infrastructure.svg";
import vector3 from "../../assets/images/landing/backgrounds/Vector.svg";
import vector4 from "../../assets/images/landing/backgrounds/solar_star-broken.svg";

// Background image imports from assets/images/landing/backgrounds
import rectangle55 from "../../assets/images/landing/backgrounds/rectangle-55.png";
import rectangle133 from "../../assets/images/landing/backgrounds/rectangle-133.png";
import rectangle135 from "../../assets/images/landing/backgrounds/rectangle-135.png";
import rectangle137 from "../../assets/images/landing/backgrounds/rectangle-137.png";
import rectangle143 from "../../assets/images/landing/backgrounds/rectangle-143.png";
import rectangle145 from "../../assets/images/landing/backgrounds/rectangle-145.png";
import rectangle147 from "../../assets/images/landing/backgrounds/rectangle-147.png";

import "./style.css";

export const LandingPage = () => {
    const navigate = useNavigate();

    const handleExploreClick = () => {
        navigate('/');
    };

    const handleLoginClick = () => {
        navigate('/login');
    };

    const handleViewCoachesClick = () => {
        window.location.href = '/newlanding/coaches.html';
    };

    const handleViewClubsClick = () => {
        window.location.href = '/newlanding/organizations.html';
    };

    const handleRegisterNowClick = () => {
        navigate('/login');
    };

    return (
        <div className="landing-page">
            <div className="div">
                <div className="overlap">
                    <p className="hello-by-amaplayer">
                        <span className="text-wrapper">
                            Hello, by <br />
                        </span>

                        <span className="span">AmaPlayer</span>
                    </p>

                    <p className="p">We welcome you to platform</p>

                    <div className="text-wrapper-2">Ama Player</div>

                    <div className="overlap-group" onClick={handleExploreClick} style={{cursor: 'pointer'}}>
                        <div className="frame">
                            <div className="rectangle" />
                        </div>

                        <div className="text-wrapper-3">Explore</div>
                    </div>

                    <div className="overlap-2" onClick={handleLoginClick} style={{cursor: 'pointer'}}>
                        <div className="rectangle-2" />

                        <div className="text-wrapper-4">Login</div>
                    </div>
                </div>

                <div className="div-wrapper">
                    <div className="text-wrapper-5">Where Talent Meets Opportunity</div>
                </div>

                <div className="overlap-3">
                    <img className="img" alt="Rectangle" src={rectangle55} />

                    <div className="lets-conquer">
                        Lets, Conquer
                        <br />
                        Together
                    </div>

                    <p className="text-wrapper-6">Empower every sports man journey</p>
                </div>

                <div className="frame-2" />

                <div className="frame-3" />

                <div className="our-vision-mission">Our Vision &amp; Mission</div>

                <div className="overlap-4">
                    <p className="ama-player-envision">
                        "Ama Player envision an indian <br />
                        where every hidden talent get
                        <br />a global stage fueling the <br />
                        journey from playground to <br />
                        podiums, and bringing home
                        <br />
                        Olympic Gold and <br />
                        World Championship"
                    </p>

                    <div className="overlap-5">
                        <div className="text-wrapper-7">OUR VISION</div>

                        <div className="uiw-eye">
                            <img className="vector" alt="Vector" src={vector} />
                        </div>
                    </div>
                </div>

                <div className="overlap-6">
                    <p className="our-mission-is-to">
                        "Our mission is to build a trusted sports ecosystem where players,
                        coaches, academies, brands, and fans come together to discover,
                        nurture, and celebrate talent, fueling India&#39;s journey to
                        Olympic Golds and World Championships."
                    </p>

                    <div className="overlap-7">
                        <div className="text-wrapper-8">OUR MISSION</div>

                        <div className="mingcute-target-line">
                            <div className="group">
                                <img className="vector-2" alt="Vector" src={image} />

                                <img className="vector-3" alt="Vector" src={vector2} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-wrapper-9">CORE VALUES</div>

                <div className="core-values-container">
                    <div className="core-value-item">
                        <div className="core-value-icon">🏆</div>
                        <div className="text-wrapper-10">EXCELLENCE</div>
                    </div>

                    <div className="core-value-item">
                        <div className="core-value-icon">🤝</div>
                        <div className="text-wrapper-10">COMMUNITY</div>
                    </div>

                    <div className="core-value-item">
                        <div className="core-value-icon">🎯</div>
                        <div className="text-wrapper-10">OPPORTUNITY</div>
                    </div>

                    <div className="core-value-item">
                        <div className="core-value-icon">💡</div>
                        <div className="text-wrapper-10">INNOVATION</div>
                    </div>
                </div>

                <div className="overlap-8">
                    <div className="overlap-9">
                        <img className="rectangle-3" alt="Rectangle" src={rectangle133} />

                        <div className="text-wrapper-11">Explore Athletes</div>

                        <p className="text-wrapper-12">
                            Browse inspiring profiles, achievements, and highlight reels from
                            athletes across all sports. Connect, compete, and get noticed!
                            Dive into a world of talent ready to be recognized.
                        </p>

                        <div className="frame-7">
                            <div className="text-wrapper-13">SEE ATHELETES</div>
                        </div>
                    </div>

                    <div className="overlap-10">
                        <img className="rectangle-3" alt="Rectangle" src={rectangle135} />

                        <div className="MEET-THE-COACHES">
                            MEET&nbsp;&nbsp; THE&nbsp;&nbsp;COACHES
                        </div>

                        <p className="text-wrapper-14">
                            Discover top coaches, mentors, and trainers driving athlete
                            progress. Find coaching tips, connect for guidance, or partner for
                            professional development—all inside a supportive sports network.
                        </p>

                        <div className="frame-7" onClick={handleViewCoachesClick} style={{cursor: 'pointer'}}>
                            <div className="text-wrapper-13">VIEW COACHES</div>
                        </div>
                    </div>

                    <div className="overlap-11">
                        <img className="rectangle-3" alt="Rectangle" src={rectangle137} />

                        <div className="join-clubs">
                            Join Clubs
                            <br /> &amp; Organizations
                        </div>

                        <p className="text-wrapper-15">
                            Explore sports clubs, academies, and organizations scouting new
                            talent and hosting competitions. Find your local club, stay
                            updated on events, or get recruited for the next big opportunity.
                        </p>

                        <div className="frame-8" onClick={handleViewClubsClick} style={{cursor: 'pointer'}}>
                            <div className="text-wrapper-13">EXPLORE CLUBS</div>
                        </div>
                    </div>

                    <div className="overlap-12">
                        <div className="text-wrapper-16">Explore the Environment</div>

                        <p className="discover-your-path">
                            Discover your path in the sports community - whether you&#39;re an
                            athlete, coach, or organization
                        </p>
                    </div>
                </div>

                <div className="overlap-13">
                    <div className="daily-weekly">Daily &amp; Weekly Challenges</div>

                    <p className="text-wrapper-17">
                        Compete, improve, and win exciting rewards!
                    </p>

                    <img className="line" alt="Line" src={line6} />

                    <div className="overlap-14">
                        <p className="text-wrapper-18">
                            Test your skills with new challenges every day and win exclusive
                            sport kits and gear
                        </p>

                        <div className="overlap-15">
                            <div className="text-wrapper-19">Daily Challenges</div>

                            <div className="material-symbols">
                                <img className="vector-4" alt="Vector" src={vector3} />
                            </div>
                        </div>

                        <img className="line-2" alt="Line" src={line7} />

                        <div className="frame-9">
                            <div className="text-wrapper-20">JOIN TODAY'S CHALLENGE</div>
                        </div>
                    </div>

                    <div className="overlap-16">
                        <p className="text-wrapper-18">
                            Compete against athletes nationwide in our weekly tournaments with
                            amazing prizes.
                        </p>

                        <div className="overlap-17">
                            <div className="text-wrapper-21">Weekly Tournaments</div>

                            <div className="solar-star-broken">
                                <img className="vector-5" alt="Vector" src={vector4} />
                            </div>
                        </div>

                        <img className="line-2" alt="Line" src={line8} />

                        <div className="frame-9">
                            <div className="text-wrapper-20">VIEW LEADERBOARD</div>
                        </div>
                    </div>
                </div>

                <p className="text-wrapper-22">
                    Test your skills with new challenges every day and win exclusive sport
                    kits and gear
                </p>

                <div className="overlap-group-2">
                    <p className="text-wrapper-23">How I Got Discovered With AmaPlayer</p>

                    <img className="line-3" alt="Line" src={line9} />

                    <div className="overlap-18">
                        <img className="rectangle-4" alt="Rectangle" src={rectangle143} />

                        <div className="text-wrapper-24">UPLOAD</div>

                        <p className="share-your-best">
                            Share your best moments, stats, &amp; achievements
                        </p>
                    </div>

                    <div className="overlap-19">
                        <img className="rectangle-4" alt="Rectangle" src={rectangle145} />

                        <div className="text-wrapper-25">CONNECT</div>

                        <p className="text-wrapper-26">
                            Network with selectors, coaches, and fellow athletes
                        </p>
                    </div>

                    <div className="overlap-20">
                        <img className="rectangle-5" alt="Rectangle" src={rectangle147} />

                        <div className="text-wrapper-24">GET DISCOVERED</div>

                        <p className="share-your-best-2">
                            Get noticed by scouts, coaches, and talent hunters worldwide
                        </p>
                    </div>

                    <img className="arrow" alt="Arrow" src={arrow1} />

                    <img className="arrow-2" alt="Arrow" src={arrow2} />
                </div>

                {/* Register Now Button */}
                <div className="register-now-section">
                    <button
                        onClick={handleRegisterNowClick}
                        style={{
                            background: 'linear-gradient(233deg, rgba(48, 97, 39, 1) 0%, rgba(97, 199, 79, 1) 100%)',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            padding: '15px 40px',
                            fontSize: '18px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 4px 15px rgba(48, 97, 39, 0.3)',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(1.05)';
                            e.target.style.boxShadow = '0 6px 20px rgba(48, 97, 39, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)';
                            e.target.style.boxShadow = '0 4px 15px rgba(48, 97, 39, 0.3)';
                        }}
                    >
                        Register Now
                    </button>
                </div>
            </div>
        </div>
    );
};