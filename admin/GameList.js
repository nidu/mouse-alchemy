import React from 'react';
import { useEffect, useState } from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import { makeStyles } from '@material-ui/styles';
import { Link } from "react-router-dom";

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListSubheader from '@material-ui/core/ListSubheader';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Typography from '@material-ui/core/Typography';

import {db} from '../firebase';

const useStyle = makeStyles(theme => ({
  container: {
    "maxWidth": 600,
    "margin": "auto"
  }
}))

export default function GameList() {
  const [games, setGames] = useState([]);
  const classes = useStyle();

  useEffect(() => {
    return db.collection("games")
      .onSnapshot(snapshot => {
        const receivedGames = [];
        snapshot.forEach(doc => {
          receivedGames.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setGames(receivedGames);
      });
  }, []);

  const deleteGame = id => {
    db.collection("games")
      .doc(id)
      .delete()
      .catch(error => {
        console.error("Error deleting game", id, error);
      });
  }

  const listItems = games.map(game => {
    return (
      <ListItem key={game.id}>
        <ListItemText primary={
          <span>
            {game.userName} - <Link to={`/admin/elementSets/${game.elementSet.id}/elements`}>{game.elementSetName}</Link>
          </span>
        } />
        <ListItemSecondaryAction>
          <IconButton aria-label="Delete" onClick={() => deleteGame(game.id)}>
            <DeleteIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    )
  });

  console.log("Game list", games);

  return (
    <div className={classes.container}>
      <Typography variant="h2">
        Список игр
      </Typography>
      <Typography>
        <Link to="/admin">Список шаблонов</Link>
      </Typography>
      <List>
        {listItems}
      </List>
    </div>
  )
}