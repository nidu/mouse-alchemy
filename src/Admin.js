import React from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Link, withRouter } from "react-router-dom";
import { makeStyles } from '@material-ui/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import CloseIcon from '@material-ui/icons/Close';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import Tooltip from '@material-ui/core/Tooltip';
import FormHelperText from '@material-ui/core/FormHelperText';
import classNames from 'classnames';
import Dropzone from 'react-dropzone';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';

import GameList from './admin/GameList';
import ElementSetList from './admin/ElementSetList';
import GlobalSettings from './admin/GlobalSettings';
import TextInputOnEnter from './shared/TextInputOnEnter';

import { db } from "./firebase";
import { firestoreDocsToArray } from './common';

const useStyles = makeStyles(theme => {
  return {
    container: {
      height: "calc(100vh - 20px)",
      display: "flex",
      "flex-direction": "column"
    },
    editor: {
      flex: "auto"
    },
    sidebar: {
      display: "flex",
      "flex-direction": "column",
      height: "100%"
    },
    selectElementSetContainer: {
      "maxWidth": 600,
      "margin": "auto"
    },
    elementListPaper: {
      flex: "auto",
      overflow: "auto"
    },
    marginLeft: {
      marginLeft: 20
    },
    elementList: {
      flex: "auto",
      width: '100%',
      backgroundColor: theme.palette.background.paper,
      position: 'relative',
      overflow: 'auto',
    },
    elementListWrapper: {
      overflow: 'auto'
    },
    elementListLi: {
      backgroundColor: 'inherit',
    },
    elementListUl: {
      backgroundColor: 'inherit',
      padding: 0,
    },
    elementListSubheader: {
      fontWeight: "bold",
      color: theme.palette.secondary.dark
    },
    elementDetailsPaper: {
      "padding": "0 20px",
      "margin-left": "20px",
      height: "100%"
    },
    elementSelect: {
      width: "90%"
    },
    elementIcon: {
      width: "80px",
      height: "80px",
      float: "right"
    },
    elementIconPlaceholder: {
      width: "80px",
      height: "60px",
      textAlign: "center",
      paddingTop: "20px",
      float: "right",
      border: `1px solid ${theme.palette.grey[300]}`,
    },
    iconDrop: {
      border: `1px solid ${theme.palette.grey[300]}`,
      padding: "10px",
      margin: "5px",
      "min-height": "80px",
      "border-radius": `${theme.shape.borderRadius}px`
    },
    errorOutline: {
      color: theme.palette.error.dark
    },
    addElementBtn: {
      flex: "0 0 50px"
    }
  }
});

function ElementSelect({ elements, element, exclude, onChange, name, label, error }) {
  const classes = useStyles();

  const items = elements
    .filter(e => e !== exclude)
    .map(el =>
      <MenuItem key={el.id} value={el.id}>
        {el.name}
      </MenuItem>
    );

  return (
    <FormControl className={classes.elementSelect} error={error !== undefined}>
      <InputLabel htmlFor={name}>{label}</InputLabel>
      <Select
        value={element ? element.id : ""}
        onChange={event => {
          const el = elements.find(e => e.id === event.target.value);
          onChange(el);
        }}
        autoWidth
      >
        {items}
      </Select>
      <FormHelperText>{error}</FormHelperText>
    </FormControl>
  )
}

function ElementList({ elements, currentElement, onDelete, getElementUrl }) {
  const classes = useStyles();

  function isMiddle(element) {
    for (const e of elements) {
      if (!e.isPrimitive
        && e !== element
        && e.madeOf
        && e.madeOf.some(pair =>
          pair.first.id === element.id || pair.second.id === element.id
        )
      )
        return true;
    }
  }

  const primitives = [];
  const middles = [];
  const finals = [];
  for (const element of elements) {
    if (element.isPrimitive) {
      primitives.push(element);
    } else {
      if (isMiddle(element)) {
        middles.push(element);
      } else {
        finals.push(element);
      }
    }
  }

  const listItems = elementGroup => elementGroup.map(el => {
    let secondary;
    if (el.isPrimitive) {
      secondary = "Базовый";
    } else if (el.madeOf && el.madeOf.length > 0) {
      if (el.madeOf.length === 1) {
        const { first, second } = el.madeOf[0];
        const firstEl = elements.find(e => e.id === first.id);
        const secondEl = elements.find(e => e.id === second.id);
        secondary = `${firstEl.name} + ${secondEl.name}`;
      } else {
        secondary = "Несколько";
      }
    }

    return (
      <ListItem key={el.id}
        component={Link}
        button={true}
        selected={currentElement && currentElement.id === el.id}
        to={getElementUrl(el.id)}>
        <ListItemText
          primary={el.name}
          secondary={secondary}
        />
        {(!el.isPrimitive && !el.code && (!el.madeOf || el.madeOf.length === 0)) &&
          <ListItemIcon>
            <Tooltip title="Нельзя сделать, не базовый и без кода">
              <ErrorOutlineIcon className={classes.errorOutline} />
            </Tooltip>
          </ListItemIcon>}
        <ListItemSecondaryAction>
          <IconButton aria-label="Удалить" onClick={() => onDelete(el)}>
            <DeleteIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    );
  })

  const spec = [
    ["Базовые", primitives],
    ["Промежуточные", middles],
    ["Финальные", finals]
  ];

  return (
    <Paper className={classes.elementListPaper}>
      <List className={classes.elementList}>
        {spec.map(([title, elements]) =>
          <li key={title} className={classes.elementListLi}>
            <ul className={classes.elementListUl}>
              <ListSubheader className={classes.elementListSubheader}>{title}</ListSubheader>
              {listItems(elements)}
            </ul>
          </li>
        )}
      </List>
    </Paper>
  )
}

function ElementLink({ element, currentElement, url }) {
  return (currentElement && element.id === currentElement.id) ?
    <span>{element.name}</span> :
    <Link to={url}>{element.name}</Link>
}

function ElementPairList({ elements, element, pairList, onDelete, getElementUrl }) {
  let listItems;
  if (elements && pairList) {
    listItems = pairList.map(({ first, second, result }, i) => {
      const firstEl = elements.find(e => e.id === first.id);
      const secondEl = elements.find(e => e.id === second.id);
      const resultEl = result && elements.find(e => e.id === result.id);
      return (
        <ListItem key={i}>
          <ListItemText
            primary={
              <div>
                <ElementLink
                  currentElement={element}
                  element={firstEl}
                  url={getElementUrl(first.id)}
                />
                {' + '}
                <ElementLink
                  currentElement={element}
                  element={secondEl}
                  url={getElementUrl(second.id)}
                />
                {result && ' = '}
                {result &&
                  <ElementLink
                    currentElement={element}
                    element={resultEl}
                    url={getElementUrl(result.id)}
                  />}
              </div>
            }
          />
          {onDelete ?
            <ListItemSecondaryAction>
              <IconButton aria-label="Удалить" onClick={() => onDelete(i)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction> :
            undefined}
        </ListItem>
      )
    });
  } else {
    listItems = [];
  }

  return (
    <List>
      {listItems}
    </List>
  );
}

function ElementProducesList({ element, elements, getElementUrl }) {
  const pairList = [];
  for (const el of elements) {
    if (el.madeOf && el.madeOf.length) {
      for (const { first, second } of el.madeOf) {
        if (first.id === element.id || second.id === element.id) {
          pairList.push({
            first, second, result: el
          });
        }
      }
    }
  }

  return (
    <ElementPairList
      elements={elements}
      element={element}
      pairList={pairList}
      getElementUrl={getElementUrl}
    />
  )
}

function ElementMadeOfEditor({ element, elements, onChange, getElementUrl }) {
  const [first, setFirst] = useState();
  const [second, setSecond] = useState();

  const madeOf = element.madeOf || [];

  const add = second => {
    setSecond(second);
    onChange({
      madeOf: [...madeOf, { first, second }]
    });
  }

  let firstError, secondError;
  
  if (!first) {
    firstError = "Не выбран";
  }

  if (!second) {
    secondError = "Не выбран";
  }

  if (!(firstError || secondError)) {
    const samePair = madeOf.find(({ first: f, second: s }) =>
      (first.id === f.id && second.id === s.id) || (first.id === s.id && second.id === f.id)
    );
    if (samePair) {
      firstError = "Такая пара уже есть";
    }
  }

  const deleteRow = index => onChange({
    madeOf: element.madeOf.filter((e, i) => i !== index)
  });

  const addRow = () => onChange({
    madeOf: [...madeOf, { first, second }]
  });


  return (
    <div>
      <Typography variant="h5">Получается из</Typography>
      <Grid container>
        <Grid item xs={4}>
          <ElementSelect
            name="first-element"
            label="Первый"
            elements={elements}
            element={first}
            exclude={element}
            onChange={setFirst}
            error={firstError}
          />
        </Grid>
        <Grid item xs={4}>
          <ElementSelect
            name="second-element"
            label="Второй"
            elements={elements}
            element={second}
            exclude={element}
            onChange={add}
            error={secondError}
          />
        </Grid>
        { undefined && <Grid item xs={4}>
          <IconButton aria-label="Добавить" variant="outlined" onClick={addRow} disabled={firstError !== null || secondError !== null}>
            <AddIcon />
          </IconButton>
        </Grid>}
      </Grid>
      <ElementPairList
        elements={elements}
        pairList={madeOf}
        onDelete={deleteRow}
        getElementUrl={getElementUrl}
      />
    </div>
  )
}

function ElementIconEditor({ element, onChange }) {
  const classes = useStyles();

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      onChange({
        icon: reader.result
      });
    }
  }

  return (
    <Dropzone onDrop={onDrop} accept="image/png">
      {({ getRootProps, getInputProps, isDragActive }) => {
        return (
          <div
            {...getRootProps()}
            className={classNames(classes.iconDrop, 'dropzone', { 'dropzone--isActive': isDragActive })}
          >
            <div style={{ "textAlign": "right" }}>
              {element.icon ?
                <img src={element.icon} alt={element.name} className={classes.elementIcon} /> :
                <Typography variant="body1" className={classes.elementIconPlaceholder}>
                  Нет иконки
                </Typography>
              }
            </div>
            <input {...getInputProps()} />
            <Typography>
              {
                isDragActive ?
                  `Бросай уже.` :
                  `Бросьте сюда иконку.`
              }
            </Typography>
          </div>
        )
      }}
    </Dropzone>
  )
}

function ElementDetails({ element, elements, onChange, getElementUrl }) {
  const classes = useStyles();

  const handleChange = field => value => {
    onChange({ [field]: value });
  }

  return (
    <Paper className={classes.elementDetailsPaper}>
      <Grid container>
        <Grid item xs={8}>
          <TextInputOnEnter
            id="name"
            label="Имя"
            value={element.name}
            onChange={handleChange('name')}
            margin="normal"
            error={element.name.trim() === ""}
          />
          <br />
          <TextInputOnEnter
            id="description"
            label="Описание"
            value={element.description || ""}
            onChange={handleChange('description')}
            margin="normal"
            fullWidth
          />
          <br />
          <FormControlLabel
            control={
              <Checkbox
                checked={element.isPrimitive}
                onChange={event =>
                  onChange({ isPrimitive: event.target.checked })
                }
                value="isPrimitive"
                color="primary"
              />
            }
            label="Базовый?"
          />
          <br/>
          <TextInputOnEnter
            id="name"
            label="Код"
            value={element.code || ""}
            helperText="4 цифры"
            onChange={handleChange('code')}
            margin="normal"
          />
        </Grid>
        <Grid item xs={4}>
          <ElementIconEditor
            element={element}
            onChange={onChange}
          />
        </Grid>
      </Grid>
      {element.isPrimitive ?
        undefined :
        <ElementMadeOfEditor
          element={element}
          elements={elements}
          onChange={onChange}
          getElementUrl={getElementUrl}
        />}
      <Typography variant="h5">Даёт</Typography>
      <ElementProducesList
        element={element}
        elements={elements}
        getElementUrl={getElementUrl}
      />
    </Paper>
  )
}

function withoutId(element) {
  const e = { ...element };
  delete e.id;
  return e;
}

function ElementSetEditorInner({ match, history }) {
  const classes = useStyles();
  const [elementSet, setElementSet] = useState();
  let [elements, setElementsInner] = useState([]);
  const [lastDeleted, setLastDeleted] = useState();

  const setElements = elements => {
    elements.sort((a, b) => {
      const p1 = a.name;
      const p2 = b.name;
      if (p1 < p2) return -1;
      if (p1 > p2) return 1;
      return 0;
    });
    setElementsInner(elements);
  }

  const getElementUrl = id =>
    `/admin/elementSets/${elementSetId}/elements/${id}`;

  const goToElement = id => {
    history.push(getElementUrl(id));
  }

  const elementSetId = match.params.id;
  const elementId = match.params.elementId;
  const currentElement = elements.find(e => e.id === elementId);


  const elementRef = id => db.collection(`elementSets/${elementSetId}/elements`)
    .doc(id);

  useEffect(() => {
    db
      .collection("elementSets")
      .doc(elementSetId)
      .get()
      .then(doc => setElementSet(doc.data()));

    db
      .collection(`elementSets/${elementSetId}/elements`)
      .orderBy("name")
      .get()
      .then(firestoreDocsToArray)
      .then(setElements);
  }, [elementSetId]);

  const addElement = () => {
    const newElement = {
      name: "Элемент",
      isPrimitive: false
    };

    db
      .collection(`elementSets/${elementSetId}/elements`)
      .add(newElement)
      .then(docRef => {
        setElements([
          ...elements, {
            id: docRef.id,
            ...newElement
          }
        ]);
        goToElement(docRef.id);
      })
      .catch(error => {
        console.error("Error adding element", error);
      });
  }

  const updateElement = upd => {
    if (upd.madeOf) {
      for (const pair of upd.madeOf) {
        if (pair.first.name) {
          pair.first = elementRef(pair.first.id)
        }
        if (pair.second.name) {
          pair.second = elementRef(pair.second.id)
        }
      }
    }
    const newElement = { ...currentElement, ...upd };
    console.log("Update element", newElement, upd);

    const prevElements = elements;
    setElements(elements.map(e =>
      e.id === newElement.id ? newElement : e
    ));

    db
      .collection(`elementSets/${elementSetId}/elements`)
      .doc(newElement.id)
      .update(upd)
      .then(() => {
      })
      .catch(error => {
        console.error("Error updating element", error);
        setElements(prevElements);
      });
  }

  const deleteElement = element => {
    console.log("Delete element", element);

    const batch = db.batch();

    const madeOf = [];
    const newElements = elements
      .filter(e => e !== element)
      .map(e => {
        if (e.madeOf) {
          const filteredPairs = [];
          for (const pair of e.madeOf) {
            const { first, second } = pair;
            if (first.id === element.id || second.id === element.id) {
              madeOf.push({
                element: e,
                pair
              });
            } else {
              filteredPairs.push(pair);
            }
          }

          if (e.madeOf.length !== filteredPairs) {
            batch.update(
              db.collection(`elementSets/${elementSetId}/elements`)
                .doc(e.id),
              { madeOf: filteredPairs }
            );
            return { ...e, madeOf: filteredPairs };
          }
        }
        return e;
      });

    batch.delete(
      db.collection(`elementSets/${elementSetId}/elements`)
        .doc(element.id)
    );

    let newElement;
    if (currentElement.id === element.id) {
      if (elements.length > 1) {
        const index = elements.indexOf(element);
        if (index === elements.length - 1) {
          newElement = elements[elements.length - 2];
        } else {
          newElement = elements[index + 1];
        }
      }
    }

    console.log("delete element batch", batch, madeOf);
    batch.commit().then(() => {
      // Promise.resolve().then(() => {
      setElements(newElements);
      setLastDeleted({
        element,
        madeOf
      });
      if (newElement) {
        goToElement(newElement.id);
      }
    }).catch(() => {
      console.error("Error deleting element", element);
    });
  }

  const restoreLastDeleted = () => {
    if (!lastDeleted) return;

    console.log("Restore", lastDeleted);

    const { element, madeOf } = lastDeleted;

    const batch = db.batch();

    batch.set(
      db.collection(`elementSets/${elementSetId}/elements`)
        .doc(element.id),
      withoutId(element)
    );

    const newElements = [];
    for (const target of elements) {
      const pairs = madeOf.filter(e => e.element.id === target.id).map(e => e.pair);
      if (pairs.length > 0) {
        const newMadeOf = [...target.madeOf, ...pairs];
        const newTarget = { ...target, madeOf: newMadeOf };
        batch.update(
          db.collection(`elementSets/${elementSetId}/elements`)
            .doc(target.id),
          { madeOf: newMadeOf }
        );
        newElements.push(newTarget);
      } else {
        newElements.push(target);
      }
    }
    newElements.push(element);

    console.log("Restore element batch", batch);

    batch.commit().then(() => {
      // Promise.resolve().then(() => {
      setElements(newElements);
      setLastDeleted(undefined);
      goToElement(element.id);
    }).catch(() => {
      console.error("Error restoring", lastDeleted);
    });
  }

  const updateElementSet = upd => {
    db.collection("elementSets")
      .doc(elementSetId)
      .update(upd)
      .catch(console.error);
    setElementSet({
      ...elementSet,
      ...upd
    });
  }

  const playableLink = `${window.location.origin}/games/${elementSetId}`

  return (
    <div className={classes.container}>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={lastDeleted !== undefined}
        onClose={(event, reason) => reason !== "clickaway" && setLastDeleted(undefined)}
        ContentProps={{
          'aria-describedby': 'message-id',
        }}

        autoHideDuration={15000}
        message={<span id="message-id">Удалён {lastDeleted && lastDeleted.element.name}</span>}
        action={[
          <Button key="undo" color="secondary" size="small" onClick={restoreLastDeleted}>
            UNDO
          </Button>,
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            className={classes.close}
            onClick={() => setLastDeleted(undefined)}
          >
            <CloseIcon />
          </IconButton>
        ]}
      />
      <Typography variant="h2">
        <TextInputOnEnter
          id="elementSetName"
          label="Шаблон игры"
          value={elementSet ? elementSet.name : ""}
          onChange={name => updateElementSet({name})}
          margin="normal"
        />
        <TextInputOnEnter
          id="crosswordHint"
          label="Подсказка от кроссворда"
          className={classes.marginLeft}
          value={elementSet ? elementSet.crosswordHint : ""}
          onChange={crosswordHint => updateElementSet({crosswordHint})}
          margin="normal"
        />
      </Typography>
      <Typography>
        <Link to="/admin">Выбрать другой шаблон</Link>
        <div style={{ float: 'right' }}>
          Ссылка на игру <a href={playableLink}>{playableLink}</a>
        </div>
      </Typography>
      <Grid container className={classes.editor}>
        <Grid item xs={4} className={classes.sidebar}>
          <Button color="primary" onClick={addElement} className={classes.addElementBtn}>
            Добавить элемент
          </Button>
          <ElementList
            elements={elements}
            currentElement={currentElement}
            elementSetId={elementSetId}
            onDelete={deleteElement}
            getElementUrl={getElementUrl}
          />
        </Grid>
        <Grid item xs={8}>
          {currentElement ?
            <ElementDetails
              element={currentElement}
              elements={elements}
              onChange={updateElement}
              getElementUrl={getElementUrl}
            /> :
            undefined}
        </Grid>
      </Grid>
    </div>
  )
}

const ElementSetEditor = withRouter(ElementSetEditorInner);

export function AdminPage({ match }) {
  return (
    <Router>
      <div>
        <Route path={`${match.url}/games`} exact component={GameList} />
        <Route path={`${match.url}`} exact component={ElementSetList} />
        <Route path={`${match.url}/elementSets/:id/elements/:elementId?`} component={ElementSetEditor} />
        <Route path={`${match.url}/settings`} component={GlobalSettings} />
      </div>
    </Router>
  )
}