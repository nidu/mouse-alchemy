import * as React from "react";
import { makeStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(() => ({
  container: {
    position: "absolute",
    top: "40%",
    width: "100%",
    textAlign: "center"
  },
  title: {
    fontSize: "4em",
    fontWeight: "bold"
  }
}));

export default function TheEnd() {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <Typography className={classes.title}>Конец</Typography>
      <Typography className={classes.link}>
        <a href="https://youtu.be/ng_cgYFa62s">Ссылка</a>
      </Typography>
    </div>
  )
}