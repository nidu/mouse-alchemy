import React from 'react';
import { useEffect, useState } from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import { makeStyles } from '@material-ui/styles';
import { Link } from "react-router-dom";
import { Link, withRouter } from "react-router-dom";

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import DeleteIcon from '@material-ui/icons/Delete';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';

import { db } from '../firebase';
import { firestoreDocsToArray } from '../common';

const useStyles = makeStyles(theme => ({
  selectElementSetContainer: {
    "maxWidth": 600,
    "margin": "auto"
  }
}));

function ElementSetList({ match, history }) {
  const [elementSets, setElementSets] = useState([]);

  const classes = useStyles();

  useEffect(() => {
    db
      .collection("elementSets")
      .orderBy("name")
      .get()
      .then(firestoreDocsToArray)
      .then(setElementSets);
  }, []);

  const onAdd = () => {
    db.collection("elementSets")
      .add({
        name: "Новый шаблон"
      })
      .then(docRef => {
        const id = docRef.id;
        history.push(`/admin/elementSets/${id}/elements`);
      })
      .catch(error => {
        console.error(error);
      })
  }

  const onDelete = el => {
    if (confirm(`Удалить шаблон ${el.name}?`)) {
      db.collection("elementSets")
        .doc(el.id)
        .delete()
        .then(() => {
          setElementSets(elementSets.filter(e => e != el));
        })
        .catch(console.error);
    }
  }

  const listItems = elementSets.map(elementSet =>
    <ListItem key={elementSet.id}
      component={Link}
      button={true}
      to={`${match.path}/elementSets/${elementSet.id}/elements`}>
      <ListItemText primary={elementSet.name} />
      <ListItemSecondaryAction>
        <IconButton aria-label="Delete" onClick={e => onDelete(elementSet)}>
          <DeleteIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );

  return (
    <div className={classes.selectElementSetContainer}>
      <Typography variant="h2">Шаблоны игр</Typography>
      <Typography>
        <Link to="/admin/games">Список игр</Link>
        <br/>
        <Link to="/admin/settings">Настройки</Link>
      </Typography>
      <Button onClick={onAdd} color="primary">
        Создать
      </Button>
      <List component="nav">
        {listItems}
      </List>
    </div>
  );
}

export default withRouter(ElementSetList);