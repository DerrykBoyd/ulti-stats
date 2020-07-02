import React, { useState, useEffect } from 'react'

import { db } from '../App';

import '../styles/Profile.css';

export default function Profile(props) {

  const [displayName, setDisplayName] = useState(props.dbUser.name || '');
  const [isChanged, setIsChanged] = useState(false);
  const [profileURLs, setProfileURLs] = useState(JSON.parse(sessionStorage.getItem('profileURLs')) || [])

  const handleChange = (e) => {
    setDisplayName(e.target.value);
    if (!isChanged) setIsChanged(true);
  }

  useEffect(() => {
    // get the profile URLs from the db if not in session storage
    if (profileURLs && !profileURLs.length) {
      db.collection('public').doc('settings')
        .get()
        .then(doc => {
          console.log('urls fetched')
          let urlArr = doc.data().defaultProfileURLs;
          setProfileURLs(urlArr);
          sessionStorage.setItem('profileURLs', JSON.stringify(urlArr))
        })
        .catch(e => console.log('Error getting profile URLs', e))
    }
  }, [profileURLs])

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
        <div><p>TODO - Change Profile Photo</p></div>
        <img
          className='profile-display'
          src={profileURLs[1]}
          alt='default profile'
        >
        </img>
      </div>
    </div>
  )
}
