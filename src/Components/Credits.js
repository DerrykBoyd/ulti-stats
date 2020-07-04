import React from 'react'
import githubLogo from '../assets/GitHub-Mark-32px.png';

const Credits = () => {

  let loggedIn = localStorage.getItem('user');

  return (
    <div className={`credits${loggedIn ? '-user' : '-nouser'}`}>
      <span>Developed by dboydgit</span>
      <a href="https://github.com/dboydgit"
        target='_blank'
        rel='noopener noreferrer'
        id='github-link'><img src={githubLogo} alt='github-progile-link' /></a>
    </div>
  );
}

export default Credits;