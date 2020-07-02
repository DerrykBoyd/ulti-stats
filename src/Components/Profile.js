import React, { useState } from 'react'

import '../styles/Profile.css';

export default function Profile(props) {

  const [displayName, setDisplayName] = useState(props.dbUser.name || '');
  const [isChanged, setIsChanged] = useState(false);

  const handleChange = (e) => {
    setDisplayName(e.target.value);
    if (!isChanged) setIsChanged(true);
  }

  return (
    <div className='App'>
      <h2>TODO - Edit Profile</h2>
      <div className='profile-main'>
        <div className='profile-section'>
          <span className='input-title'>Name</span>
          <input className='profile-input'
            value={displayName}
            onChange={handleChange}
          ></input>
        </div>
        <img
          className='profile-display'
          src='https://firebasestorage.googleapis.com/v0/b/ultimate-stats-3bdf2.appspot.com/o/default-profiles%2F001-modern.png?alt=media'
          alt='default profile'
          >
        </img>
        <div>Profile icons by <a 
          href="https://www.flaticon.com/authors/freepik"
          title="Freepik"
          target='_blank'
          rel='noopener noreferrer'
          >Freepik</a></div>
      </div>
    </div>
  )
}
