import React from 'react'

export default function DefenceButtons(props) {
    
    return (
        <div className='stat-btns'>
            <button
                className='btn stat-btn'
                name='D-Play'
                onClick={(e) => props.handleStatClick(e, props.player.playerID)}>
                D-Play
                    <div className='score-badge'>{props.player.dPlay}</div>
            </button>
            <button
                className='btn stat-btn'
                name='D-Error'
                onClick={(e) => props.handleStatClick(e, props.player.playerID)}>
                D-Error
                    <div className='score-badge'>{props.player.dError}</div>
            </button>
        </div>
    )
}
