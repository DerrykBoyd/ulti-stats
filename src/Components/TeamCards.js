import React from 'react';

// helper functions
import { sortTeams } from '../utils';

export default function TeamCards(props) {

  const teamArr = Object.values(props.teamList).sort((a, b) => {
    return sortTeams(a.name, b.name)
  });

  const teams = teamArr.map((team, ind) =>
    <div
      className='card team-card'
      key={team.teamID}
      ind={ind}
    >
      <h2>{team.name}</h2>
      <button className='btn' onClick={() => {
        props.setCurrentEditTeam(team.teamID);
        props.setShowEditTeam(true);
      }}>Edit</button>
    </div>
  );

  return (
    <div className='team-list'>{teams}</div>
  )
}