import React from 'react';
import { makeStyles } from '@material-ui/styles';
import classnames from 'classnames';

const useStyles = makeStyles(theme => ({
  cat: {
    position: "absolute",
    left: -256,
    width: 256,
    bottom: 30,
    transition: "left 0.2s",
    userSelect: "none",
    '&$shown': {
      left: 30
    }
  },
  image: {

  },
  shown: {}
}));

export default function Cat({shown, onClick}) {
  const classes = useStyles();

  return (
    <div 
      className={classnames(classes.cat, {[classes.shown]: shown})} 
      onClick={onClick}>
      <img src="/cat.png" alt="Cat" className={classes.image} />
    </div>
  )
}