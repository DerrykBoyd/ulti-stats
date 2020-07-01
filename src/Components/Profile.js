import React, { useState } from 'react'

export default function Profile(props) {

    const [displayName, setDisplayName] = useState(props.dbUser.name || '');
    const [isChanged, setIsChanged] = useState(false);

    const handleChange = (e) => {
        setDisplayName(e.target.value);
        if (!isChanged) setIsChanged(true);
    }

    return (
        <div className='App'>
            <h2>TODO - Edit Profile</h2>
    <span>Display Name</span>
    <input
        value={displayName}
        onChange={handleChange}
    ></input>
        </div>
    )
}
