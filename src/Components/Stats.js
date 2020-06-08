import React from 'react';

export default function Teams(props) {

    const dbUser = props.dbUser;

    // set state

    return (
        <div className='App'>
            <h1>New Game</h1>
            { dbUser && <h2>{dbUser.email}</h2>}
        </div>
    )
}