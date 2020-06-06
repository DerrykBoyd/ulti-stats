import React, {useState} from 'react';

export default function Teams(props) {

    const db = props.db;
    const dbUser = props.dbUser;
    const localUser = JSON.parse(localStorage.getItem('user'));

    // set state
    const [teamList, setTeamList] = useState([]);

    return (
        <div className='App'>
            <h1>Games</h1>
            { dbUser && <h2>{dbUser.email}</h2>}
        </div>
    )
}