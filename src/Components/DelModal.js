import React from 'react'

export default function DelModal(props) {

  const header = props.header;
  const message = props.message;
  const onConfirm = props.onConfirm;

  return (
    <>
      <div className='modal-overlay'></div>
      <div className='modal-wrapper'>
        <div className='modal-container card logout-modal'>
          <h3>{header}</h3>
          <p>{message}</p>
          <div className='btn-container'>
            <button
              className='btn'
              onClick={() => {
                props.setDelModal(false);
              }}
            >Cancel</button>
            <button
              className='btn btn-del'
              onClick={onConfirm}
            >Delete</button>
          </div>
        </div>
      </div>
    </>
  )
}
