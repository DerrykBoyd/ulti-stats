import React from 'react'
import githubLogo from '../assets/GitHub-Mark-32px.png';

const Credits = () => {

  let loggedIn = localStorage.getItem('user');

  return (
    <div className={`credits${loggedIn ? '-user' : '-nouser'}`}>
      <a href="https://github.com/dboydgit"
        target='_blank'
        rel='noopener noreferrer'
        id='github-link'>
        <span id='credit-text'>Developed by dboydgit</span>
        <img id="github-mark" src={githubLogo} alt='github-progile-link' />
      </a>
    </div>
  );
}

export default Credits;