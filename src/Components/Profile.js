import React, { useState, useEffect } from 'react'

import { db } from '../App';
import { updateUser } from '../Utils/dbUtils';

import '../styles/Profile.css';

export default function Profile(props) {

  const OrigDispName = props.dbUser.name || '';
  const userURL = props.user.photoURL;

  const [displayName, setDisplayName] = useState(props.dbUser.name);
  const [isChanged, setIsChanged] = useState(false);
  const [newProfile, setNewProfile] = useState(props.dbUser.profileURL);
  const [profileURLs, setProfileURLs] = useState(JSON.parse(sessionStorage.getItem('profileURLs')) || [])
  const [urlsLoaded, setUrlsLoaded] = useState(false);

  const updateChanged = (name, profile) => {
    setIsChanged(OrigDispName !== name ||
      props.dbUser.profileURL !== profile ? true : false);
  }

  const handleChange = (e) => {
    setDisplayName(e.target.value);
    updateChanged(e.target.value, newProfile);
  }

  const handleImgClick = (e) => {
    setNewProfile(e.target.src);
    updateChanged(displayName, e.target.src);
  }

  const saveUser = () => {
    // update user in state
    let newDbUser = { ...props.dbUser };
    newDbUser.name = displayName;
    newDbUser.profileURL = newProfile;
    props.setDbUser(newDbUser);
    // save changes to the database
    updateUser(newDbUser.uid, newDbUser);
    setIsChanged(false);
  }

  // update the dbUser details for remote changes
  useEffect(() => {
    setDisplayName(props.dbUser.name);
    setNewProfile(props.dbUser.profileURL);
  }, [props.dbUser.name, props.dbUser.profileURL])

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
      <h2>Edit Profile</h2>
      <div className='profile-main'>
        <div className='profile-section'>
          <span className='input-title'>Name</span>
          <input className='profile-input'
            value={displayName}
            onChange={handleChange}
          ></input>
        </div>
        {isChanged ?
          <button
            className={`btn btn-green`}
            onClick={() => {
              saveUser();
            }}
          >Save Changes</button>
          :
          <button
            className={`btn btn-inactive`}
          >Save Changes</button>}
        <h3>Change Profile Photo</h3>
        <div className='profile-img-grid'>
          {userURL &&
            <img
              className={`profile-display ${userURL === newProfile ? 'img-selected' : ''}`}
              src={userURL}
              alt='default profile'
              onClick={handleImgClick}
            >
            </img>}
          {urlsLoaded ?
            profileURLs.map(url => {
              return (
                <img
                  className={`profile-display ${url === newProfile ? 'img-selected' : ''}`}
                  key={url}
                  src={url}
                  alt='default profile'
                  onClick={handleImgClick}
                >
                </img>)
            })
            :
            <div className="img-loader"></div>
          }
        </div>
        <div>Profile avatars by <a
          href="https://www.flaticon.com/authors/freepik"
          title="Freepik"
          target='_blank'
          rel='noopener noreferrer'
        >Freepik</a></div>
      </div>
    </div>
  )
}
