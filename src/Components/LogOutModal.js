import React from 'react'

export default function LogOutModal(props) {
  return (
    <>
      <div className='modal-overlay'></div>
      <div className='modal-wrapper'>
        <div className='modal-container card logout-modal'>
          <h3>Confirm Sign Out </h3>
          <p>You have an ongoing game that will be deleted if you sign out.</p>
          <div className='btn-container'>
            <button
              className='btn'
              onClick={() => {
                props.setLogOutWarning(false);
              }}
            >Cancel</button>
            <button
              className='btn btn-del'
              onClick={() => props.firebaseApp.auth().signOut()}
            >Sign Out</button>
          </div>
        </div>
      </div>
    </>
  )
}
