import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/styles";
import cx from 'classnames';

import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';

import QuestionList from "./QuestionList";
import Grid from "./Grid";
import CheckButton from './CheckButton';
import SolvedDialog from './SolvedDialog';
import CrosswordDialog from './CrosswordDialog';

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
    overflow: "auto",
    position: "relative"
  },
  crosswordDialog: {
    textAlign: "left",
    position: "absolute",
    right: 5,
    width: 400,
    top: 5,
  }
}));

const allPosts = {
  empty: [
    { personIndex: 0, text: 'Привет, путник! У меня есть кое-что для тебя, вот…' },
    { personIndex: 1, text: 'Погодите! Если ты отдашь это так быстро – не будет интри-и-и-иги!' },
    { personIndex: 0, text: 'Хм... верно. Тогда, господин путник, попробуй решить этот кроссворд. Если решение окажется верным, ты получишь кое-что ценное.' },
    { personIndex: 1, text: 'В конце не забудь нажать кнопку «Прове-е-е-ерить»' },
  ],
  onSuccessfullCheck: [
    { personIndex: 0, text: 'Ура! Ты справился!' },
    { personIndex: 1, text: 'Поздравля-я-я-яю!' },
    { personIndex: 0, text: 'Держи свой ПРИЗ!' },
  ],
  onFailedCheck: [
    { personIndex: 0, text: 'Не не не.' },
    { personIndex: 1, text: 'Кажется не вышло.' },
    { personIndex: 0, text: 'Камбарэ!' },
  ],
  smalltalk: [
    [{ personIndex: 0, text: "Говорят, где-то есть подвал доверху забитый сладостями!" },
    { personIndex: 1, text: "Возможно, мы найдем его в нашем путешествии." }],

    [{ personIndex: 0, text: "Думаешь, господин путник всё разгадает?" },
    { personIndex: 1, text: "Конечно! Ведь всем интересно узнать, что будет в конце..." }],

    [{ personIndex: 0, text: "Апчхи!" },
    { personIndex: 1, text: "Будь здорова." }],

    [{ personIndex: 0, text: "Котик скачет на лошадке," },
    { personIndex: 0, text: "И сверкают только пятки." },
    { personIndex: 1, text: "Шерсть вздымает выше гривы," },
    { personIndex: 1, text: "Потому что конь ретивый!" }],

    [{ personIndex: 0, text: "Может, дать подсказку…" },
    { personIndex: 1, text: "Эй! Путник справится, верь в него!" },
    { personIndex: 0, text: "Ты прав." }],

    [{ personIndex: 0, text: "А что, если мы всего лишь картинки на экране умной машины? И в этот раз нам даже тела не нарисовали?" },
    { personIndex: 1, text: "…" },
    { personIndex: 0, text: "…", delay: 1000 },
    { personIndex: 1, text: "Да не-е-е-е-е…", delay: 1000 }],
  ]
};

const crosswordDialogImages = {
  default: "/talk_crossword_2.png",
  good: "/talk_crossword_2_good.png",
  bad: "/talk_crossword_2_bad.png",
};

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
  const [posts, setPosts] = useState(allPosts.empty);
  const [crosswordDialogImage, setCrosswordDialogImage] = useState(crosswordDialogImages.default);

  const horizontalQuestions = crossword.filter(c => c.orientation === "horizontal");
  const verticalQuestions = crossword.filter(c => c.orientation === "vertical");

  const onCheck = () => {
    if (checkCrossword(crossword, crosswordProgress)) {
      // setPosts(allPosts.onSuccessfullCheck);
      onSolve();
    } else {
      setPosts(allPosts.onFailedCheck);
      setCrosswordDialogImage(crosswordDialogImages.bad);
      setLastFailedCheckDate(new Date().toISOString());
    }
  }

  useEffect(() => {
    if (crosswordSolved) {
      setPosts(allPosts.onSuccessfullCheck);
      setCrosswordDialogImage(crosswordDialogImages.good);
    }
  }, [crosswordSolved]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!crosswordSolved) {
        const index = Math.round(Math.random() * (allPosts.smalltalk.length - 1));
        console.log("Smalltalk", index, allPosts.smalltalk[index]);
        setPosts(allPosts.smalltalk[index]);
        setCrosswordDialogImage(crosswordDialogImages.default);
      }
    }, 30000 + Math.random() * 60000);

    return () => clearTimeout(timeout);
  }, [crosswordSolved, posts]);

  return (
    <div className={classes.container}>
      {crosswordSolved && <SolvedDialog open onClose={onHide} hint={crosswordHint} />}
      <div className={cx(classes.horizontalQuestions, classes.questions)}>
        <Typography variant="h4">По горизонтали</Typography>
        <QuestionList questions={horizontalQuestions} />
      </div>

      <div className={classes.grid}>
        <CrosswordDialog 
          posts={posts} 
          className={classes.crosswordDialog}
          image={crosswordDialogImage}
        ></CrosswordDialog>
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