import React from 'react'

export default function OffenseButtons(props) {
    let mustTouch = false;
    let noThrowaway = true;
    let noTouch = false;
    let noDrop = false;

    if (!props.prevEntry.action || props.prevEntry.turnover) mustTouch = true;
    if (!props.prevEntry.turnover && props.prevEntry.playerID === props.player.playerID) {
        noTouch = true;
        noThrowaway = false;
        noDrop = true;
    }

    return (
        <div className='stat-btns'>
            <button
                className={`btn stat-btn ${noTouch ? 'btn-inactive' : ''}`}
                name='touch'
                onClick={(e) => props.handleStatClick(e, props.player, false)}>
                Touch
                    <div className='score-badge'>{props.player.touch}</div>
                {props.player.assist !== 0 &&
                    <div className='score-badge assist'>{`${props.player.assist}-A`}</div>}
            </button>
            <button
                className={`btn stat-btn ${mustTouch ? 'btn-inactive' : ''}`}
                name='point'
                onClick={(e) => props.handleStatClick(e, props.player, true)}>
                Point
                    <div className='score-badge'>{props.player.point}</div>
            </button>
            <button
                className={`btn stat-btn ${mustTouch || noDrop ? 'btn-inactive' : ''}`}
                name='drop'
                onClick={(e) => props.handleStatClick(e, props.player, true)}>
                Drop
                    <div className='score-badge'>{props.player.drop}</div>
            </button>
            <button
                className={`btn stat-btn t-away-btn ${mustTouch || noThrowaway ? 'btn-inactive' : 'btn'}`}
                name='throwAway'
                onClick={(e) => props.handleStatClick(e, props.player, true)}>
                T-Away
                    <div className='score-badge'>{props.player.throwAway}</div>
            </button>
        </div>
    )
}
