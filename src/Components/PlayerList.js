import React from 'react';

export default function PlayerList(props) {

    const currentEditTeam = props.dbUser.teams[props.currentEditTeam];
    const playerArr = Object.values(props.players);

    const sortByName = (a, b) => {
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

    playerArr.sort((a, b) => {
        switch (currentEditTeam.playerSortOrder) {
            case 'Number':
                return a.number - b.number
            case 'First Name':
                return sortByName(a.firstName, b.firstName)
            case 'Last Name':
                return sortByName(a.lastName, b.lastName)
            default:
                console.log('No sort order')
                return 0
        }
    })

    const deletePlayer = (playerID) => {
        let newDbUser = { ...props.dbUser };
        delete newDbUser.teams[`${currentEditTeam.teamID}`].players[`${playerID}`];
        props.setDbUser(newDbUser);
    }

    const handlePlayerChange = (playerID, e) => {
        e.preventDefault();
        let newDbUser = { ...props.dbUser };
        switch (e.target.name) {
            case 'player-number':
                newDbUser.teams[`${currentEditTeam.teamID}`].players[`${playerID}`].number = e.target.value;
                props.setDbUser(newDbUser)
                break;
            case 'player-first-name':
                newDbUser.teams[`${currentEditTeam.teamID}`].players[`${playerID}`].firstName = e.target.value;
                props.setDbUser(newDbUser)
                break;
            case 'player-last-name':
                newDbUser.teams[`${currentEditTeam.teamID}`].players[`${playerID}`].lastName = e.target.value;
                props.setDbUser(newDbUser)
                break;
            default:
                console.log('State not updated!');
        }
    }

    return (
        playerArr.map((player, index) => (
            <form
                className='player-list-item'
                key={player.playerID}
            >
                <input
                    className='player-num-input'
                    name='player-number'
                    value={currentEditTeam.players[`${player.playerID}`].number}
                    onChange={(e) => handlePlayerChange(player.playerID, e)}
                />
                <input
                    className='player-name-input player-input'
                    name='player-first-name'
                    placeholder='First Name'
                    value={currentEditTeam.players[`${player.playerID}`].firstName}
                    onChange={(e) => handlePlayerChange(player.playerID, e)}
                />
                <input
                    className='player-name-input player-input'
                    name='player-last-name'
                    placeholder='Last Name'
                    value={currentEditTeam.players[`${player.playerID}`].lastName}
                    onChange={(e) => handlePlayerChange(player.playerID, e)}
                />
                <i
                    className='material-icons text-del point'
                    onClick={() => {
                        if (window.confirm(`Delete Player (${player.firstName} ${player.lastName})`)) {
                            deletePlayer(player.playerID);
                        }
                    }}
                >delete</i>
            </form>
        ))
    )
}