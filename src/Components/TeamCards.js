import React from 'react';


export default function TeamCards(props) {

    const sortTeams = (a, b) => {
        let nameA = a.toUpperCase();
        let nameB = b.toUpperCase();
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        return 0
    }

    const teamArr = Object.values(props.teamList).sort((a,b) => {
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