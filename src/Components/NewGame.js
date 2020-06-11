import React, { useEffect, useState } from 'react';
import Select from 'react-select';

// helper functions
import { sortTeams } from '../utils';

import '../styles/NewGame.css';

export default function NewGame(props) {

  const dbUser = props.dbUser;

  // set state
  const [teamOptions, setTeamOptions] = useState([]);

  const rsStyles = {
    container: (provided) => ({
      ...provided,
      width: '100%',
    })
  }

  useEffect(() => {
    if (dbUser) {
      setTeamOptions(teamOptions => [])
      let newTeamOptions = [];
      for (let team of Object.values(dbUser.teams)) {
        newTeamOptions.push({ value: team.name, label: team.name });
      }
      newTeamOptions.sort((a, b) => {
        return sortTeams(a.value, b.value)
      });
      setTeamOptions(teamOptions => newTeamOptions);
    }
  }, [dbUser])

  return (
    <div className='App'>
      {dbUser &&
        <div className='new-game-main'>
          <h2>Game Setup</h2>
          <div className='game-setup'>
            <h4>Team</h4>
            {teamOptions[0] && <Select
              defaultValue={teamOptions[0] || null}
              options={teamOptions}
              isSearchable={false}
              styles={rsStyles}
            ></Select>}
          </div>

        </div>
      }
    </div>
  )
}