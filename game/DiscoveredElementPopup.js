import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';
import classnames from 'classnames';
import { usePulse } from '../common';

const useStyles = makeStyles(theme => {
  const iconSize = 495;
  const elementWrapperWidth = iconSize;
  return {

  container: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "calc(100% * 5 / 6)",
    height: "100%",
    opacity: 0,
    transition: "opacity 0.3s",
    backgroundImage: "radial-gradient(rgba(0,0,0,0.5), white)",
    "&$visible": {
      opacity: 1
    }
  },
  visible: {},
  elementWrapper: {
    position: "absolute",
    textAlign: "center",
    top: "20%",
    width: elementWrapperWidth,
    left: `calc(50% - ${elementWrapperWidth / 2}px)`,
    margin: "auto",
    background: "white",
    padding: 20,
    borderRadius: 10
  },
  icon: {
    width: iconSize,
    height: iconSize,
    transition: "transform 5s",
    '&$big': {
      transform: "scale(1.02)"
    }
  },
  big: {}
  }
});

export default function DiscoveredElementPopup({ element, onHide }) {
  const classes = useStyles();
  const pulse = usePulse({ min: 0, max: 1, immediate: true, interval: 5000 });

  return (
    <div className={classnames(
      classes.container,
      { [classes.visible]: element }
    )} onClick={onHide}>
      {element &&
        <div className={classes.elementWrapper}>
          <div className={classes.element}>
            <Typography variant="h4">
              {element.name}
            </Typography>
            <img src={element.icon} className={classnames(classes.icon, {
              [classes.big]: pulse == 1
            })} />
            <Typography>
              {element.description}
            </Typography>
          </div>
        </div>}
    </div>
  )
}