import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import './CompleteProfile.css';

const CompleteProfile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [userType, setUserType] = useState('');
  const [sport, setSport] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userType) {
      setError('Please select a role.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        role: userType,
        sport: sport,
        profileComplete: true
      });
      navigate('/home');
    } catch (err) {
      console.error("Error updating profile: ", err);
      setError('Failed to update profile. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="complete-profile-container">
      <div className="complete-profile-form">
        <h2>Complete Your Profile</h2>
        <p>Tell us a bit more about yourself to get started.</p>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label htmlFor="userType">What is your role?</label>
            <select 
              id="userType" 
              value={userType} 
              onChange={(e) => setUserType(e.target.value)}
              required
            >
              <option value="" disabled>Select a role...</option>
              <option value="athlete">Athlete</option>
              <option value="coach">Coach</option>
              <option value="organization">Organization</option>
            </select>
          </div>

          {userType && (
            <div className="form-group">
              <label htmlFor="sport">What is your primary sport?</label>
              <input 
                type="text" 
                id="sport" 
                value={sport} 
                onChange={(e) => setSport(e.target.value)}
                placeholder="E.g., Cricket, Football, etc."
                required
              />
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save and Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
