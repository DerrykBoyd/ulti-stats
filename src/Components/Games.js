import React, { useEffect } from 'react';

export default function Games(props) {

  const db = props.db;
  const dbUser = props.dbUser;
  const fetchedGames = props.fetchedGames;
  const lastGameDoc = props.lastGameDoc;
  const setFetchedGames = props.setFetchedGames;
  const setLastGameDoc = props.setLastGameDoc;

  // set state

  useEffect(() => {
    if (dbUser && fetchedGames && !fetchedGames.length) {
      db.collection('users').doc(dbUser.uid)
        .collection('games')
        .orderBy('createdTime', 'desc')
        .limit(10)
        .get()
        .then((snapshot) => {
          if (!snapshot.docs.length) {
            setFetchedGames(null);
            console.log('No games in the db');
            return;
          }
          let games = [];
          for (let doc of snapshot.docs) games.push(doc.data());
          setFetchedGames(games);
          if (snapshot.docs.length === 10) setLastGameDoc(snapshot.docs[snapshot.docs.length - 1]);
          console.log('Games Fetched');
        })
        .catch(e => console.error('Error getting games', e))
    }
  }, [db, dbUser, fetchedGames, setFetchedGames, setLastGameDoc])

  const loadMore = () => {
    db.collection('users').doc(dbUser.uid)
      .collection('games')
      .orderBy('createdTime', 'desc')
      .limit(10)
      .startAfter(lastGameDoc)
      .get()
      .then((snapshot) => {
        let games = [...fetchedGames];
        for (let doc of snapshot.docs) games.push(doc.data());
        setFetchedGames(games);
        if (snapshot.docs.length === 10) setLastGameDoc(snapshot.docs[snapshot.docs.length - 1]);
        else (setLastGameDoc(null));
        console.log('Additional Games Fetched');
      })
      .catch(e => console.error('Error getting games', e))
  }

  return (
    <div className={`App ${props.currentGame && 'pad-btm-alert'}`}>
      <h1>Games</h1>
      {!fetchedGames &&
        <>
          <h3>You don't have any saved games.</h3>
          <h3>Saved games will show up here.</h3>
        </>
      }
      {fetchedGames && fetchedGames.map(game => {

        let date = new Date(game.createdTime).toString();

        return (
          <h3 key={date}>{date}</h3>
        )

      })}
      {lastGameDoc &&
        <div className='btn-container'>
          <button
            className='btn'
            onClick={loadMore}
          >Load More</button>
        </div>
      }
    </div>
  )
}