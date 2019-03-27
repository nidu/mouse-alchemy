import React, { useState, useMemo, useCallback, useEffect } from "react";
import { makeStyles } from "@material-ui/styles";
import cx from "classnames";
import Typography from '@material-ui/core/Typography';

const cellWidth = 32;
const cellHeight = 32;

const useStyles = makeStyles(theme => ({
  grid: {
    position: "relative",
    textAlign: "center"
  },
  cell: {
    position: "absolute",
    width: cellWidth,
    height: cellHeight,
    border: "1px solid #777",
    userSelect: "none"
  },
  questionNumber: {
    position: "absolute",
    left: 0,
    top: 0,
    fontSize: "0.8em",
    color: "#777"
  },
  cellInput: {
    position: "absolute",
    width: cellWidth,
    height: cellHeight,
    maxHeight: cellHeight,
    textAlign: "center",
    left: 0,
    top: 0
  },
  cellContent: {
    marginTop: 6,
    textAlign: "center"
  }
}))

function cellTransform(x, y) {
  return `translate(${x * (cellWidth + 1)}px,${y * (cellHeight + 1)}px)`;
}

function CellInput({
  pos,
  text,
  classes,
  onChange,
  onStopEdit
}) {
  return (
    <input
      className={classes.cellInput}
      style={{
        transform: cellTransform(pos.x, pos.y)
      }}
      value=""
      onChange={e => {}}
      maxLength={1}
      autoFocus
      onKeyDown={e => {
        console.log(e.key);
        if (e.key == "Escape") {
          onStopEdit();
        } else if (e.key == "Backspace" || e.key == "Delete" || e.key == " ") {
          onChange(null);
          onStopEdit();
        } else if (e.key.length == 1) {
          onChange(e.key.toUpperCase());
          onStopEdit();
        }
      }}
    />
  )
}

const posToKey = ({ x, y }) => `${x}.${y}`;

export default function Grid({
  crossword,
  crosswordProgress,
  onChange
}) {
  const [editingState, setEditingState] = useState({
    isEditing: false,
    editedCellPos: undefined,
    editedCell: undefined
  });
  const { editedCell, editedCellPos } = editingState;

  const classes = useStyles();

  const maxX = useMemo(() => {
    let maxX = 0;
    for (const q of crossword) {
      let { x } = q;
      if (q.orientation == "horizontal") {
        x += q.text.length - 1;
      }
      maxX = Math.max(maxX, x);
    }
    return maxX;
  }, [crossword]);

  const cellNodes = useMemo(() => {
    let nodes = [];
    let visited = new Set();

    const addCell = (cell, i) => {
      let { x, y } = cell;
      if (cell.orientation == "horizontal") {
        x += i;
      } else {
        y += i;
      }
      const key = `${x}.${y}`;
      if (visited.has(key)) return;
      visited.add(key);
      const cellContent = crosswordProgress && crosswordProgress[key];
      nodes.push(
        <div
          className={classes.cell}
          style={{ transform: cellTransform(x, y) }}
          key={key}
          onClick={e => setEditingState({
            isEditing: true,
            editedCellPos: { x, y },
            editedCell: cell
          })}>
          {i == 0 && <Typography className={classes.questionNumber}>{cell.index}</Typography>}
          <Typography className={classes.cellContent}>{cellContent}</Typography>
        </div>
      )
    }

    for (const cell of crossword) {
      addCell(cell, 0);
    }

    for (const cell of crossword) {
      for (let i = 1; i < cell.text.length; i++) {
        addCell(cell, i);
      }
    }

    return nodes;
  }, [crossword, crosswordProgress]);

  const onInput = text => {
    const { x, y } = editedCellPos
    const newProgress = {
      ...crosswordProgress,
      [`${x}.${y}`]: text
    };
    onChange(newProgress);
  };

  const width = (maxX + 1) * (cellWidth + 1);

  return (
    <div style={{ width }} className={classes.grid}>
      {cellNodes}
      {editingState.isEditing &&
        <CellInput
          pos={editedCellPos}
          text={crosswordProgress && crosswordProgress[posToKey(editedCell)]}
          classes={classes}
          onChange={onInput}
          onStopEdit={() => setEditingState({
            isEditing: false,
            editedCellPos: undefined,
            editedCell: undefined,
          })}
        />}
    </div>
  )
}