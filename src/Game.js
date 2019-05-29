import React from 'react';

import { useRef, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { makeStyles } from '@material-ui/styles';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

import { db } from './firebase';
import firebase from './firebase';

import { firestoreDocsToArray } from './common';
import Sidebar from './game/Sidebar';
import MixingArea from './game/MixingArea';
import Loader from './game/Loader';
import SearchField from './game/SearchField';
import Music from './game/Music';
import About from './game/About';
import Cat from './game/Cat';
import DiscoveredElementPopup from './game/DiscoveredElementPopup';
import Encyclopedia from './game/Encyclopedia';
import KeyInputForm from './game/KeyInputForm';
import TheEnd from './game/TheEnd';
import CustomDragLayer from './game/CustomDragLayer';
import CrosswordWrapper from './game/crossword/Crossword';

import SettingsContext from './shared/SettingsContext';
import ThemeContext from './shared/ThemeContext';

import {debounce} from "lodash";

const useStyles = makeStyles(theme => ({
  game: {
    height: "100vh",
    overflow: "hidden",
    background: theme.palette.background.default
  },
  hud: {
    position: "absolute",
    zIndex: 2,
    left: 0,
    top: 0
  },
  tooltip: {
    fontSize: 14
  }
}))

function GameInner({ user, elementSetId }) {
  const [elements, setElements] = useState();
  const [crossword, setCrossword] = useState();
  const [crosswordHint, setCrosswordHint] = useState();
  const [gameId, setGameId] = useState();
  const [game, setGame] = useState();
  const [settings, setSettings] = useState();
  const [userSettings, setUserSettings] = useState();
  const [search, setSearch] = useState("");
  const [{ catShown, alternateMusic }, setCatState] = useState({
    catShown: false,
    alternateMusic: false
  });
  const [lastDiscoveredElements, setLastDiscoveredElements] = useState([]);
  const [lastRepeatedElement, setLastRepeatedElement] = useState();
  const [encyclopediaVisible, setEncyclopediaVisible] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);
  const [lastBadMixInfo, setLastBadMixInfo] = useState();
  const [musicOn, setMusicOnInner] = useState(true);
  const [keyInputVisible, setKeyInputVisible] = useState(false);
  const [encyclopediaCurrentElement, setEncyclopediaCurrentElement] = useState();
  const [isShowingCrossword, setIsShowingCrossword] = useState(false);
  const maxIdRef = useRef(0);

  const setMusicOn = on => {
    setMusicOnInner(on);
    updateUserSettings({musicOn: on});
  }

  const {nextTheme, currentThemeIndex, nextThemeIndex, setTheme} = useContext(ThemeContext)

  const classes = useStyles();

  const crosswordProgress = game && game.crosswordProgress;
  const crosswordSolved = game && game.crosswordSolved;

  const updateUserSettings = (upd) => {
    setUserSettings({
      ...userSettings,
      ...upd
    })
    db.collection("userSettings")
      .doc(user.uid)
      .update(upd)
      .catch(console.error)
  }

  const discoveredElements = useMemo(() => game && elements && game.discoveredElements
    .map(coll => ({
      ...coll,
      element: elements.find(e => e.id === coll.element.id)
    }))
    .filter(e => !search || e.element.name.toLowerCase().indexOf(search) !== -1),
    [game && game.discoveredElements, elements, search]
  );

  const isAllOpen = elements && discoveredElements &&
    elements.length === discoveredElements.length;

  function setElementsWithCalc(elements) {

    for (const element of elements) {
      element.isFinal = !elements.some(e => {
        if (element === e || !e.madeOf) return false;
        return e.madeOf.some(({ first, second }) =>
          first.id === element.id || second.id === element.id
        );
      });
    }
    setElements(elements);
  }

  function madeOfIdFilter(id) {
    return ({first, second}) => id === first.id || id === second.id;
  }

  function canBeHiddenBecauseProducedEverything(element, elements, discoveredElements) {
    if (element.isPrimitive || element.code) return false;

    for (const e of elements) {
      if (e.id !== element.id && e.madeOf) {
        const canProduceE = e.madeOf.some(madeOfIdFilter(element.id));
        if (canProduceE) {
          const de = discoveredElements.find(de => de.element.id === e.id);
          if (de && de.madeOf) {
            if (!de.madeOf.some(madeOfIdFilter(element.id))) {
              return false;
            }
          } else {
            return false;
          }
        }
      }
    }

    return true;
  }

  const nonFinalDiscoveredElements = useMemo(() =>
    discoveredElements &&
    discoveredElements
      .filter(e => !e.element.isFinal && !e.hidden)
      .map(de => {
        if (canBeHiddenBecauseProducedEverything(de.element, elements, discoveredElements)) {
          return {...de, canBeHidden: true};
        } else {
          return de;
        }
      }),
    [discoveredElements, elements]
  );

  let elementsOnBoard = ((game && game.elementsOnBoard) || []).map((node, index) => {
    const element = elements.find(e => e.id === node.element.id);
    return {
      ...node,
      index,
      producedEverything: canBeHiddenBecauseProducedEverything(element, elements, discoveredElements),
      // producedEverything: !element.isPrimitive && !element.code && !elements.some(e => {
        // if (e.id === element.id || !e.madeOf) return false;

        // const canProduceE = e.madeOf.some(({first, second}) => element.id === first.id || element.id === second.id);
        // if (canProduceE) {
        //   const de2 = discoveredElementsById[e.id];
        //   if (de2 && de2.madeOf) {
        //     return !de2.madeOf.some(({first, second}) => element.id === first.id || element.id === second.id);
        //   } else {
        //     return true;
        //   }
        // }
        // return false;
      // }),
      element
    }
  });

  const elementColl = db.collection(`elementSets/${elementSetId}/elements`)
  const elementRef = (id) =>
    elementColl.doc(id)
  const updateGame = upd => {
    return db.collection("games")
      .doc(gameId)
      .update(upd)
  };

  useEffect(() => {
    return db.collection("settings")
      .doc("default")
      .onSnapshot(doc => setSettings(doc.data()));
  }, []);

  const updateCrossword = useCallback(debounce(crosswordProgress => {
    updateGame({crosswordProgress});
  }, 3000), [updateGame]);

  const onCrosswordChange = crosswordProgress => {
    updateCrossword(crosswordProgress);
    setGame({...game, crosswordProgress});
  };

  const onCrosswordSolve = () => {
    updateGame({crosswordSolved: true});
    setGame({...game, crosswordSolved: true});
  };

  useEffect(() => {
    if (!user) return;

    const gameId = `${user.uid}+${elementSetId}`;
    setGameId(gameId);
    setGame();

    Promise.all([
      db.collection(`elementSets`)
        .doc(elementSetId)
        .get()
        .then(doc => doc.data()),
      db.collection(`elementSets/${elementSetId}/elements`)
        .orderBy("name")
        .get()
        .then(firestoreDocsToArray),
      db.collection(`games`)
        .doc(gameId)
        .get(),
      db.collection("settings")
        .doc("default")
        .get()
        .then(doc => doc.data()),
      db.collection("userSettings")
        .doc(user.uid)
        .get()
        .then(doc => doc.data())
    ]).then(([elementSet, elements, gameDoc, settings, userSettings]) => {
      setElementsWithCalc(elements);
      setCrossword(elementSet.crosswordQuestions);
      setCrosswordHint(elementSet.crosswordHint);
      setSettings(settings);

      if (userSettings) {
        setUserSettings({...userSettings})
        setTheme(userSettings.theme);
        setMusicOnInner(userSettings.musicOn);
      } else {
        userSettings = {
          musicOn: true,
          theme: currentThemeIndex
        };
        setUserSettings(userSettings);
        db.collection("userSettings")
          .doc(user.uid)
          .set(userSettings)
      }

      let game;
      if (gameDoc.exists) {
        game = gameDoc.data();
        setGame(game);
        maxIdRef.current = game.elementsOnBoard.length > 0 ?
          Math.max(...game.elementsOnBoard.map(e => e.id)) :
          0;
      } else {
        game = {
          elementSet: db.collection(`elementSets`).doc(elementSetId),
          discoveredElements: elements
            .filter(e => e.isPrimitive && !e.code)
            .map(e => ({
              element: elementRef(e.id),
              madeOf: []
            })),
          elementsOnBoard: [],
          elementSetName: elementSet.name,
          userName: user.displayName || user.email
        };
        db.collection("games")
          .doc(gameId)
          .set(game)
          .then(setGame(game));
      }
      const firstDiscovered = game.discoveredElements[0];
      setEncyclopediaCurrentElement({
        ...firstDiscovered,
        element: elements.find(e => e.id === firstDiscovered.element.id)
      });
    }).catch(error => {
      console.error("Error getting game", error);
    });

  }, [elementSetId, user]);

  const onCatClick = () => {
    setCatState(() => ({
      catShown: false,
      alternateMusic: true
    }));
    setTimeout(() => {
      setCatState(st => ({ ...st, alternateMusic: false }))
    }, 30000);
  }

  function showCat(settings) {
    if (Math.random() <= settings.showCatProbablity) {
      setCatState(st => {
        if (!st.alternateMusic && !st.catShown) {
          setTimeout(() => {
            setCatState(st2 =>
              st2.catShown ? { ...st2, catShown: false } : st2
            );
          }, 5000);
          return { ...st, catShown: true };
        } else {
          return st;
        }
      });
    }
  }

  useEffect(() => {
    if (!settings) return;

    const k = setInterval(() => showCat(settings), 10000);
    return () => clearInterval(k);
  }, [settings]);

  const addElement = ({ element, node, x, y }) => {

    if (element) {
      maxIdRef.current += 1;
      elementsOnBoard = [
        ...game.elementsOnBoard,
        {
          element: elementRef(element.id),
          x,
          y,
          id: maxIdRef.current
        }
      ]
    } else {
      const idx = elementsOnBoard.findIndex(e => e === node)
      maxIdRef.current += 1;
      elementsOnBoard = game.elementsOnBoard.map((e, i) => i === idx ? {
        element: elementRef(node.element.id),
        x,
        y,
        id: maxIdRef.current
      } : e)
    }

    setGame({ ...game, elementsOnBoard });
    updateGame({ elementsOnBoard });
  }

  const cloneElement = useCallback((node) => {
    setGame(game => {
      maxIdRef.current += 1;

      const newElementsOnBoard = [
        ...game.elementsOnBoard,
        {
          element: node.element,
          x: node.x + settings.cloneElementShiftX,
          y: node.y + settings.cloneElementShiftY,
          id: maxIdRef.current
        }
      ];
      updateGame({ elementsOnBoard: newElementsOnBoard });
      return {
        ...game,
        elementsOnBoard: newElementsOnBoard
      }
    });
  }, [game]);

  const clearBoard = useCallback(() => {
    setGame(game => {
      updateGame({ elementsOnBoard: [] })
      return {
        ...game,
        elementsOnBoard: []
      }
    });
  }, [game]);

  const removeNodeFromBoard = useCallback((node, hide) => {
    setGame(game => {
      const upd = {
        elementsOnBoard: game.elementsOnBoard.filter((e, i) => i !== node.index),
        discoveredElements: hide ?
          game.discoveredElements.map(e => {
            if (e.element.id === node.element.id) {
              return {...e, hidden: true};
            } else {
              return e;
            }
          }) :
          game.discoveredElements
      };
      updateGame(upd);
      return {...game, ...upd};
    });
  }, [game]);

  const mixElements = ({ droppedElement, droppedNode, receivingNode, x, y }) => {
    const receivingElement = receivingNode.element;

    const newElements = elements.filter(el =>
      el.madeOf && el.madeOf.find(({ first, second }) =>
        (first.id === droppedElement.id && second.id === receivingElement.id) ||
        (first.id === receivingElement.id && second.id === droppedElement.id)
      )
    );

    if (!newElements.length) {
      if (droppedNode) {
        setLastBadMixInfo({
          id1: droppedNode.id,
          id2: receivingNode.id,
          date: new Date().toISOString()
        });
      } else {
        addElement({
          element: droppedElement,
          x,
          y
        });
        setLastBadMixInfo({
          id1: maxIdRef.current,
          id2: receivingNode.id,
          date: new Date().toISOString()
        });
      }
      return;
    }
    let isNewPair = false;

    const newElementIds = newElements.map(e => e.id);

    const alreadyFound = discoveredElements.some(e => {
      if (newElementIds.indexOf(e.element.id) !== -1) {
        const hasPair = e.madeOf.some(({ first, second }) =>
          (first.id === droppedElement.id && second.id === receivingElement.id) ||
          (first.id === receivingElement.id && second.id === droppedElement.id)
        );
        isNewPair = !hasPair;
        return hasPair;
      }
      return undefined;
    });
    
    if (isNewPair || alreadyFound) {
      if (!droppedNode) {
        addElement({
          element: droppedElement,
          x,
          y
        });
      }
      setLastRepeatedElement({
        targetNode: receivingNode,
        element: newElements[0]
      });
    }

    if (alreadyFound) {
      return;
    }

    const newDiscoveredElements = isNewPair ?
      game.discoveredElements.map(e => {
        if (newElementIds.indexOf(e.element.id) !== -1) {
          return {
            ...e,
            madeOf: [...e.madeOf, {
              first: elementRef(droppedElement.id),
              second: elementRef(receivingElement.id)
            }]
          }
        } else {
          return e;
        }
      }) : [
        ...game.discoveredElements,
        ...newElements.map(newElement => ({
          element: elementRef(newElement.id),
          madeOf: [{
            first: elementRef(droppedElement.id),
            second: elementRef(receivingElement.id)
          }]
        }))
      ];

    let newElementsOnBoard;
    if (isNewPair) {
      newElementsOnBoard = elementsOnBoard;
    } else {
      newElementsOnBoard = [];
      for (const node of elementsOnBoard) {
        if (node !== droppedNode) {
          if (node === receivingNode) {
            newElements.forEach((newElement, i) => {
              const rowWidth = settings.elementIconSize * newElements.length;
              const x = Math.floor(receivingNode.x - rowWidth / 2
                + settings.elementIconSize * i);
              maxIdRef.current += 1;
              const newNode = {
                id: maxIdRef.current,
                element: newElement,
                x: x,
                y: receivingNode.y,
              };
              newElementsOnBoard.push(newNode);
            })
          } else {
            newElementsOnBoard.push(node);
          }
        }
      }
    }

    setGame({
      ...game,
      discoveredElements: newDiscoveredElements,
      elementsOnBoard: newElementsOnBoard
    });

    if (!isNewPair) {
      setLastDiscoveredElements(newElements);
    }

    updateGame({
      discoveredElements: newDiscoveredElements,
      elementsOnBoard: newElementsOnBoard.map(e => ({
        ...e,
        element: elementRef(e.element.id)
      }))
    }).catch(error => {
      console.error("Error mixing elements", error);
    });
  }

  const discoverSecretElement = code => {
    const newElement = elements.find(e => e.code === code);

    if (!newElement) return false;
    if (discoveredElements.some(e => e.element.id === newElement.id)) return;

    const newDiscoveredElement = {
      element: elementRef(newElement.id),
      madeOf: []
    };

    setGame({
      ...game,
      discoveredElements: [
        ...game.discoveredElements,
        newDiscoveredElement
      ]
    });
    setLastDiscoveredElements([newElement]);
    db.collection("games")
      .doc(gameId)
      .update({
        discoveredElements: [
          ...game.discoveredElements,
          newDiscoveredElement
        ]
      })
      .catch(console.error);

    setKeyInputVisible(false);

    return true;
  }

  const showEncyclopedia = useCallback(node => {
    const discovered = discoveredElements.find(e => e.element === node.element);
    setEncyclopediaCurrentElement(discovered);
    setEncyclopediaVisible(true);
  }, [discoveredElements]);

  const hideLastDiscoveredElement = () => {
    setLastDiscoveredElements(lastDiscoveredElements.slice(1));
  }

  const setNextTheme = () => {
    updateUserSettings({theme: nextThemeIndex})
    nextTheme();
  }

  const onHideElement = element => {
    const discoveredElements = game.discoveredElements.map(e => {
      if (e.element.id === element.id) {
        return {...e, hidden: true};
      } else {
        return e;
      }
    });
    const newElementsOnBoard = elementsOnBoard.filter(e => 
      e.element.id !== element.id
    );

    setGame({
      ...game, 
      discoveredElements,
      elementsOnBoard: newElementsOnBoard
    });
    updateGame({
      discoveredElements,
      elementsOnBoard: newElementsOnBoard
    });
  };

  if (!game) {
    return <Loader message="Загрузка игры..." />;
  } else {
    return (
      <SettingsContext.Provider value={settings}>
        <Grid container className={classes.game}>
          <SearchField
            value={search}
            onChange={setSearch}
            active={!encyclopediaVisible && !keyInputVisible && !isShowingCrossword}
          />
          {isShowingCrossword ?
            <CrosswordWrapper
              crossword={crossword}
              crosswordProgress={crosswordProgress}
              crosswordSolved={crosswordSolved}
              crosswordHint={crosswordHint}
              onChange={onCrosswordChange}
              onSolve={onCrosswordSolve}
              onHide={() => setIsShowingCrossword(false)}
            /> : [
            <Grid item xs={isAllOpen ? 12 : 10} key="1">
              <MixingArea
                onAdd={addElement}
                onDrop={mixElements}
                onClone={cloneElement}
                elements={elementsOnBoard}
                lastRepeatedElement={lastRepeatedElement}
                lastBadMixInfo={lastBadMixInfo}
                onShowEncyclopedia={showEncyclopedia}
                onRemoveFinal={removeNodeFromBoard}
              />
              <CustomDragLayer />
            </Grid>,
            isAllOpen ? undefined :
              <Grid item xs={2} key="2">
                <Sidebar
                  elements={nonFinalDiscoveredElements}
                  onDrop={removeNodeFromBoard}
                  onHideElement={onHideElement}
                />
            </Grid>]}
          {isAllOpen && !isShowingCrossword && <TheEnd />}
          <Cat shown={catShown} onClick={onCatClick} />
          <Music active={musicOn} alternate={alternateMusic} />
          {encyclopediaVisible &&
            <Encyclopedia
              discoveredElements={discoveredElements}
              elements={elements}
              onClose={() => setEncyclopediaVisible(false)}
              currentElement={encyclopediaCurrentElement}
              setCurrentElement={setEncyclopediaCurrentElement}
            />}
          <div className={classes.hud}>
            <Tooltip title="Очистить поле" placement="right" classes={{tooltip: classes.tooltip}}>
              <IconButton aria-label="Очистить" onClick={() => clearBoard()}>
                <span className="left-menu-btn clear-btn" />
              </IconButton>
            </Tooltip>
            <br />
            <Tooltip title="Энциклопедия" placement="right" classes={{tooltip: classes.tooltip}}>
              <IconButton aria-label="Энциклопедия" onClick={() => setEncyclopediaVisible(true)}>
                <span className="left-menu-btn encyclopedia-btn" />
              </IconButton>
            </Tooltip>
            <br />
            <Tooltip title="Включить/выключить музыку" placement="right" classes={{tooltip: classes.tooltip}}>
              <IconButton aria-label="Звук" onClick={() => setMusicOn(!musicOn)}>
                {musicOn ?
                  <span className="left-menu-btn music-on-btn" /> :
                  <span className="left-menu-btn music-off-btn" />}
              </IconButton>
            </Tooltip>
            <br />
            <Tooltip title="Код тайного элемента" placement="right" classes={{tooltip: classes.tooltip}}>
              <IconButton aria-label="Ключ" onClick={() => setKeyInputVisible(true)}>
                <span className="left-menu-btn key-btn" />
              </IconButton>
            </Tooltip>
            <br />
            <Tooltip title="Следующая тема" placement="right" classes={{tooltip: classes.tooltip}}>
              <IconButton aria-label="Следующая тема" onClick={setNextTheme}>
                <span className="left-menu-btn back-btn" />
              </IconButton>
            </Tooltip>
            <br />
            <Tooltip title="Об игре" placement="right" classes={{tooltip: classes.tooltip}}>
              <IconButton aria-label="Об игре" onClick={() => setAboutVisible(true)}>
                <span className="left-menu-btn about-btn" />
              </IconButton>
            </Tooltip>
          </div>
          {lastDiscoveredElements.length > 0 &&
            <DiscoveredElementPopup
              element={lastDiscoveredElements[0]}
              onHide={hideLastDiscoveredElement}
            />}
          <KeyInputForm
            onOk={discoverSecretElement}
            onClose={() => setKeyInputVisible(false)}
            startCrossword={() => {
              setIsShowingCrossword(true);
              setSearch("");
              setKeyInputVisible(false);
            }}
            open={keyInputVisible}
          />
          <About
            onClose={() => setAboutVisible(false)}
            open={aboutVisible}
          />
        </Grid>
      </SettingsContext.Provider>
    );
  }
}

// Hack until this ticket is fixed https://github.com/react-dnd/react-dnd/issues/894
window.__DragDropContext = window.__DragDropContext || DragDropContext(HTML5Backend);

const Game = window.__DragDropContext(GameInner)

export default function GameWrapper({ match }) {
  const user = firebase.auth().currentUser;

  const { elementSetId } = match.params;

  return (
    <Game user={user} elementSetId={elementSetId} />
  );
}