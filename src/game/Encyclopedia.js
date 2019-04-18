import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import ElementIcon from './ElementIcon';

const useStyles = makeStyles(theme => {
  const width = 800;
  const height = 400;

  return {
    container: {
      position: "absolute",
      left: 0,
      top: 0,
      width: "100%",
      height: "100%",
      zIndex: 100,
      background: "rgba(0, 0, 0, 0.3)"
    },
    content: {
      position: "absolute",
      background: "white",
      left: `calc(50% - ${width / 2}px)`,
      top: `calc(50% - ${height / 2}px)`,
      width: width,
      height: height,
      padding: 20,
      borderRadius: 20,
      display: "flex",
      flexDirection: "column"
    },
    listWrapper: {
      overflow: "auto"
    },
    header: {
      display: "flex",
      alignItems: "center"
    },
    title: {
      flex: "auto"
    },
    details: {
      paddingTop: 20,
      textAlign: "center"
    },
    madeOfHeader: {
      marginTop: 20
    },
    openElements: {
      textAlign: "center"
    },
    grid: {
      flex: "auto"
    }
  };
});

function ElementList({ elements, currentElement, onClick }) {
  const listItems = elements.map(e => {
    return (
      <ListItem
        key={e.id}
        button
        selected={e === currentElement}
        onClick={() => onClick(e)}>
        <ListItemText primary={e.name} />
      </ListItem>
    )
  });

  return (
    <List >
      {listItems}
    </List>
  );
}

function ElementDetails({ elementInfo, elements, onSelect }) {
  const classes = useStyles();
  const { element, madeOf } = elementInfo;

  const madeOfList = element.madeOf && element.madeOf.map(({ first, second }, i) => {
    const firstEl = elements.find(e => e.id === first.id);
    const secondEl = elements.find(e => e.id === second.id);

    const isFound = madeOf.some(pair =>
      (first.id === pair.first.id && second.id === pair.second.id) ||
      (first.id === pair.second.id && second.id === pair.first.id)
    );

    return isFound ? (
      <Typography key={i}>
        <Button onClick={() => onSelect(first.id)}>{firstEl.name}</Button>
        {' + '}
        <Button onClick={() => onSelect(second.id)}>{secondEl.name}</Button>
      </Typography>
    ) : (
        <Typography key={i}>
          ??? + ???
      </Typography>
      );
  });

  return (
    <div className={classes.details}>
      <ElementIcon element={element} size={495} />
      <Typography>
        {element.description}
      </Typography>
      <Typography variant="h6" className={classes.madeOfHeader}>
        {(element.isPrimitive || element.code) ? '' : 'Получается из'}
      </Typography>
      {madeOfList}
    </div>
  );
}

function SearchField({ filter, onChange }) {
  return (
    <TextField
      label="Фильтр"
      value={filter}
      onChange={e => {
        e.stopPropagation();
        e.preventDefault();
        onChange(e.target.value);
      }}
      margin="normal"
    />
  );
}

function Encyclopedia({
  discoveredElements,
  elements,
  onClose,
  currentElement,
  setCurrentElement
}) {
  // const [currentElement, setCurrentElement] = useState(discoveredElements[0]);
  const [filter, setFilter] = useState("");
  const classes = useStyles();

  const filterLc = filter.toLowerCase();
  const discoveredElementList = discoveredElements
    .filter(e => !filter || e.element.name.toLowerCase().startsWith(filterLc))
    .map(e => e.element);

  discoveredElementList.sort((a, b) => {
    if (a.name < b.name) return -1;
    else if (a.name > b.name) return 1;
    return 0;
  });

  return (
    <Dialog open={true} onClose={onClose} aria-labelledby="form-dialog-title"
      fullWidth={true} maxWidth="md">
      <DialogTitle id="form-dialog-title">
        <div style={{ display: "flex" }}>
          <div style={{ flex: "auto" }}>
            <Typography variant="h2" style={{ textAlign: 'center' }}>
              Энциклопедия
            </Typography>
            <Typography className={classes.openElements}>
              {discoveredElements.length}/{elements.length} элементов открыто
            </Typography>
          </div>
          <div>
            <IconButton aria-label="Закрыть" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </div>
        </div>
      </DialogTitle>
      <DialogContent>
        <Grid container className={classes.grid}>
          <Grid item xs={4} className={classes.listWrapper}>
            <SearchField
              filter={filter}
              onChange={setFilter}
            />
            <ElementList
              elements={discoveredElementList}
              currentElement={currentElement.element}
              onClick={e => {
                setCurrentElement(discoveredElements.find(r => r.element.id === e.id))
              }}
            />
          </Grid>
          <Grid item xs={8}>
            <ElementDetails
              elementInfo={currentElement}
              elements={elements}
              onSelect={id => {
                setCurrentElement(discoveredElements.find(e => e.element.id === id))
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
      </DialogActions>
    </Dialog>
  );
}

export default React.memo(Encyclopedia);
