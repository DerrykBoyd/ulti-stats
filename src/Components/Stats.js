import React, {useState} from 'react';

export default function Teams(props) {

    const dbUser = props.dbUser;
    const localUser = JSON.parse(localStorage.getItem('user'));

    // set state
    const [teamList, setTeamList] = useState([]);

    return (
        <div className='App'>
            <h1>New Game</h1>
            { dbUser && <h2>{dbUser.email}</h2>}
        </div>
    )
}