import React from "react";
import { makeStyles } from "@material-ui/styles";
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => {
  console.log("Theme", theme);
  return {
    container: {
      overflow: "auto"
    },
    questionList: {
      fontFamily: theme.typography.fontFamily,
      fontSize: theme.typography.fontSize
    },
    listItem: {
      color: theme.palette.text.primary
    }
  }
});

export default function QuestionList({ questions }) {
  const classes = useStyles();

  const listItems = questions.map(({ question, index }) => {
    return (
      <li value={index} key={index} className={classes.listItem}>
        <Typography>{question}</Typography>
      </li>
    )
  });

  return (
    <div className={classes.container}>
      <ol className={classes.questionList}>
        {listItems}
      </ol>
    </div>
  )
}