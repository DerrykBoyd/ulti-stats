import React from 'react'

export default function DefenceButtons(props) {
    
    return (
        <div className='stat-btns'>
            <button
                className='btn stat-btn'
                name='dPlay'
                onClick={(e) => props.handleStatClick(e, props.player, true)}>
                D-Play
                    <div className='score-badge'>{props.player.dPlay}</div>
            </button>
            <button
                className='btn stat-btn'
                name='dError'
                onClick={(e) => props.handleStatClick(e, props.player)}>
                D-Error
                    <div className='score-badge'>{props.player.dError}</div>
            </button>
        </div>
    )
}
