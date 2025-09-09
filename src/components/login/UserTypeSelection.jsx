import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserTypeSelection.css';

const UserTypeSelection = ({ onSelectType, fromExplore = false }) => {
  const [selectedType, setSelectedType] = useState(null);
  const navigate = useNavigate();

  const userTypes = [
    {
      id: 'athlete',
      title: 'Athlete',
      description: 'Join as a player to showcase your skills and connect with coaches',
      icon: '🏆',
      color: '#4CAF50'
    },
    {
      id: 'coach',
      title: 'Coach',
      description: 'Join as a coach to train and mentor athletes',
      icon: '👨‍🏫',
      color: '#2196F3'
    },
    {
      id: 'organization',
      title: 'Organization',
      description: 'Join as an organization to manage teams and events',
      icon: '🏢',
      color: '#9C27B0'
    }
  ];

  const handleSelectType = (type) => {
    setSelectedType(type);
    // Navigate to login with the selected user type
    navigate(`/login?type=${type}`);
  };

  return (
    <div className="user-type-selection">
      <h2>Join as</h2>
      <div className="user-type-cards">
        {userTypes.map((type) => (
          <div 
            key={type.id}
            className="user-type-card"
            onClick={() => onSelectType(type.id, fromExplore)}
            style={{ '--card-color': type.color }}
          >
            <div className="card-icon">{type.icon}</div>
            <h3>{type.title}</h3>
            <p>{type.description}</p>
            {fromExplore && (
              <button 
                className="explore-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectType(type.id, true);
                }}
              >
                Explore as {type.title}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserTypeSelection;
