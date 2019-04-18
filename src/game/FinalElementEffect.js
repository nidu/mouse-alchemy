import React, {useContext} from 'react';
import {makeStyles} from '@material-ui/styles';

import SettingsContext from '../shared/SettingsContext';

import {usePulse} from '../common';

const useStyles = makeStyles(theme => ({
  container1: {
    position: "absolute",
    borderRadius: 100,
    backgroundImage: "radial-gradient(rgba(0,0,0,0.2), white)",
    transition: "opacity 3s, box-shadow 3s"
  },
  container2: {
    position: "absolute",
    borderRadius: 100,
    backgroundImage: "radial-gradient(white, rgba(0,0,0,0.3))",
    transition: "opacity 3s, box-shadow 3s"
  },
}));

export default function FinalElementEffect() {
  const classes = useStyles();
  const {elementIconSize} = useContext(SettingsContext);
  const offset = 10;
  const size = elementIconSize + offset * 2;
  const width = size;
  const height = size;
  const pulse = usePulse({
    interval: 3000,
    immediate: true
  });
  // const pulse = 0

  const transform = `translate(${-offset}px,${-offset}px)`;

  return [
    <div 
      key="1"
      className={classes.container1} 
      style={{
        transform,
        width,
        height,
        opacity: 1 - pulse,
        boxShadow: `inset 0 0 ${(1 - pulse) * 10}px 0px white`
      }}
    />,
    <div
      key="2"
      className={classes.container2} 
      style={{
        transform,
        width,
        height,
        opacity: pulse,
        boxShadow: `0 0 ${pulse * 10}px 0px #777`
      }}
    />
  ]
}