import React, { useEffect } from 'react'
import { useParams, Redirect } from 'react-router-dom'

import '../styles/GameDetails.css';
import Scoreboard from './Scoreboard';
import StatTable from './StatTable';
import StatTableMobile from './StatTableMobile';

export default function GameDetails(props) {

  // set the page title
  useEffect(() => {
    document.title = `Ultimate Stats - ${props.title}`
  }, [props.title])

  const fetchedGames = props.fetchedGames;
  const gameID = useParams().gameID;
  let game = fetchedGames.find(game => game.gameID === gameID)
    || JSON.parse(localStorage.getItem('gameDetails'));
  let gameDate = new Date(game.createdTime);

  // load game detailed into localStorage so will be available on page refresh
  useEffect(() => {
    localStorage.setItem('gameDetails', JSON.stringify(game));
  }, [game]);

  function avgPointLength() {
    let points = Object.values(game.pointHistory);
    let total = 0;
    for (let point of points) {
      total += (point.end - point.start);
    }
    return parseInt(total / points.length) || 0
  }

  function filterOffence(isOffence) {
    let AllPoints = Object.values(game.pointHistory);
    let filteredPoints = AllPoints.filter(point => point.isOffence === isOffence);
    let pointsScored = filteredPoints.filter(point => point.scored);
    let percentScored = parseInt(pointsScored.length / filteredPoints.length * 100) || 0;
    return `${pointsScored.length} / ${filteredPoints.length} (${percentScored}%)`
  }

  return (
    <div className={`App btm-nav-page ${props.currentGame ? 'pad-btm-alert' : ''}`}>
      {game ?
        <>
          <div className='game-details-grid'>
            <div className='game-details-card card'>
              <h4 className='game-card-title'>Game Overview</h4>
              <div className='game-card-section'>
                <span className='game-card-subtitle'>Game Date</span>
                <span>{gameDate.toDateString()}</span>
              </div>
              <div className='game-card-section'>
                <span className='game-card-subtitle'>Time Started</span>
                <span>{`${gameDate.getHours()}:${gameDate.getMinutes()}`}</span>
              </div>
              <div className='game-card-section'>
                <span className='game-card-subtitle'>Started on</span>
                <span>{game.startingOn}</span>
              </div>
              <div className='game-card-section'>
                <span className='game-card-subtitle'>Game Format</span>
                <span>{`${game.gameFormat} vs ${game.gameFormat}`}</span>
              </div>
              <span className='game-card-subtitle'>Final Score</span>
              <Scoreboard game={game} />
            </div>
            <div className='game-details-card card'>
              <h4 className='game-card-title'>Game Stats</h4>
              <div className='game-card-section'>
                <span className='game-card-subtitle'>Total points</span>
                <span>{Object.keys(game.pointHistory).length}</span>
              </div>
              <div className='game-card-section'>
                <span className='game-card-subtitle'>Avg. point length</span>
                <span>{`${avgPointLength()} seconds`}</span>
              </div>
              <div className='game-card-section'>
                <span className='game-card-subtitle'>Offence points scored</span>
                <span>{filterOffence(true)}</span>
              </div>
              <div className='game-card-section'>
                <span className='game-card-subtitle'>Defence points scored</span>
                <span>{`${filterOffence(false)}`}</span>
              </div>
              <div className='game-card-section'>
                <span className='game-card-subtitle'>Timeouts taken</span>
                <span>{game.timeOuts[game.teamName].length}</span>
              </div>
              <div className='game-card-section'>
                <span className='game-card-subtitle'>Timeouts taken opposition</span>
                <span>{game.timeOuts[game.opponent].length}</span>
              </div>
            </div>
            <div className='player-stats game-details-card card'>
              <h4 className='game-card-title play-title'>Player Stats</h4>
              <span className='stat-table-title'>Touch headers to sort</span>
              {props.isMobile ?
                <StatTableMobile stats={Object.values(game.playerStats).sort((a, b) => {
                  return a.number - b.number;
                })} />
                :
                <StatTable stats={Object.values(game.playerStats).sort((a, b) => {
                  return a.number - b.number;
                })} />
              }
            </div>
          </div>
        </>
        :
        <Redirect to='/games' />
      }
    </div>
  )
}
