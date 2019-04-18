import React, { useState } from "react";
import { makeStyles } from "@material-ui/styles";
import cx from 'classnames';

import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';

import QuestionList from "./QuestionList";
import Grid from "./Grid";
import CheckButton from './CheckButton';
import SolvedDialog from './SolvedDialog';

import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles(theme => ({
  wrapper: {
    paddingLeft: 60,
    paddingRight: 60,
    width: "100%",
    background: theme.game.background.default,
    color: theme.game.text.default
  },
  title: {
    textAlign: "center"
  },
  container: {
    display: "flex"
  },
  questions: {
    flex: "1 0 200px",
    display: "flex",
    flexDirection: "column",
    height: "calc(100vh - 80px)"
  },
  grid: {
    flex: "auto",
    margin: "0 20px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    overflow: "auto"
  }
}))

function Crossword({
  crossword,
  crosswordProgress,
  crosswordSolved,
  crosswordHint,
  onSolve,
  onChange,
  onHide
}) {
  const classes = useStyles();
  const [lastFailedCheckDate, setLastFailedCheckDate] = useState();

  const horizontalQuestions = crossword.filter(c => c.orientation === "horizontal");
  const verticalQuestions = crossword.filter(c => c.orientation === "vertical");

  const onCheck = () => {
    if (checkCrossword(crossword, crosswordProgress)) {
      onSolve();
    } else {
      setLastFailedCheckDate(new Date().toISOString());
    }
  }

  return (
    <div className={classes.container}>
      {crosswordSolved && <SolvedDialog open onClose={onHide} hint={crosswordHint} />}
      <div className={cx(classes.horizontalQuestions, classes.questions)}>
        <Typography variant="h4">По горизонтали</Typography>
        <QuestionList questions={horizontalQuestions} />
      </div>

      <div className={classes.grid}>
        <CheckButton
          onCheck={onCheck}
          lastFailedCheckDate={lastFailedCheckDate}
        />
        <Grid
          crossword={crossword}
          crosswordProgress={crosswordProgress}
          onChange={onChange}
        />
      </div>

      <div className={cx(classes.verticalQuestions, classes.questions)}>
        <Typography variant="h4">По вертикали</Typography>
        <QuestionList questions={verticalQuestions} />
      </div>
    </div>
  )
}

export default function CrosswordWrapper({
  crossword,
  crosswordProgress,
  crosswordSolved,
  crosswordHint,
  onChange,
  onSolve,
  onHide
}) {
  const classes = useStyles();

  return (
    <div className={classes.wrapper}>
      <Typography variant="h2" className={classes.title}>
        Кроссворд
        <IconButton aria-label="Закрыть" onClick={onHide}>
          <CloseIcon />
        </IconButton>
      </Typography>
      <Crossword
        crossword={crossword || []}
        crosswordProgress={crosswordProgress || {}}
        crosswordSolved={crosswordSolved}
        crosswordHint={crosswordHint}
        onChange={onChange}
        onSolve={onSolve}
        onHide={onHide}
      />
    </div>
  );
}

export function checkCrossword(crossword, crosswordProgress) {
  if (!crosswordProgress) return false;

  for (const q of crossword) {
    for (let i = 0; i < q.text.length; i++) {
      let { x, y } = q;
      if (q.orientation === "horizontal") {
        x += i;
      } else {
        y += i;
      }
      const key = `${x}.${y}`;
      const c1 = q.text[i].toLowerCase();
      let c2 = crosswordProgress[key];
      c2 = c2 && c2.toLowerCase();
      if (c1 !== c2) return false;
    }
  }

  return true;
}