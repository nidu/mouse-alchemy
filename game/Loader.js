import React from 'react';
import { makeStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
  container: {
    background: 'theme.palette.background.default',
    position: "absolute",
    width: '100%',
    height: '100%'
  },
  loader: {
    position: "absolute",
    width: "100%",
    textAlign: "center",
    top: "40%"
  }
}));

export default function Loader({ message }) {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <div className={classes.loader}>
        <Typography>{message}</Typography>
      </div>
    </div>
  );
}