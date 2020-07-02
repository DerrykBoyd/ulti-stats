import React, { useState, useEffect } from 'react'

import { db } from '../App';

import '../styles/Profile.css';

export default function Profile(props) {

  const [displayName, setDisplayName] = useState(props.dbUser.name || '');
  const [isChanged, setIsChanged] = useState(false);
  const [profileURLs, setProfileURLs] = useState(JSON.parse(sessionStorage.getItem('profileURLs')) || [])
  const [urlsLoaded, setUrlsLoaded] = useState(false);

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
          let urlArr = doc.data().defaultProfileURLs;
          setProfileURLs(urlArr);
          sessionStorage.setItem('profileURLs', JSON.stringify(urlArr))
          setUrlsLoaded(true);
        })
        .catch(e => console.log('Error getting profile URLs', e))
    } else {
      setUrlsLoaded(true);
    }
  }, [profileURLs])

  return (
    <div className='App btm-nav-page'>
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
        <div className='profile-img-grid'>
          {urlsLoaded ?
            profileURLs.map(url => {
              return (
                <img
                  className='profile-display'
                  key={url}
                  src={url}
                  alt='default profile'
                >
                </img>)
            })
            :
            <div className="img-loader"><div></div><div></div><div></div><div></div></div>
          }
        </div>
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
