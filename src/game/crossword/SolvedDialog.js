import * as React from "react";

import Typography from '@material-ui/core/Typography';

import classnames from 'classnames';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(theme => {
  const iconSize = 495;
  const elementWrapperWidth = iconSize;
  return {

    container: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      opacity: 0,
      transition: "opacity 0.3s",
      backgroundImage: `radial-gradient(${theme.palette.background.paper}, ${theme.palette.background.default})`,
      "&$visible": {
        opacity: 1
      }
    },
    visible: {},
    elementWrapper: {
      position: "absolute",
      textAlign: "center",
      top: "0%",
      width: elementWrapperWidth,
      left: `calc(50% - ${elementWrapperWidth / 2}px)`,
      margin: "auto",
      background: theme.game.text.default,
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
    big: {},
    hurray1: {
      position: "absolute",
      left: 50,
      bottom: 50
    },
    hurray2: {
      position: "absolute",
      right: 50,
      transform: "scale(-1, 1)",
      bottom: 50
    },
    hurrayTitle: {
      letterSpacing: 6,
      fontSize: '6em',
      marginBottom: 70
    },
    description: {
      fontSize: "1em"
    }
  }
});

export default function SolvedDialog({ onClose, open, hint }) {
  const classes = useStyles();

  return (
    <div className={classnames(
      classes.container,
      classes.visible
    )} onClick={onClose}>
      <img src="/hurray.png" alt="Hurray" className={classnames(classes.hurray1)} />
      <img src="/hurray.png" alt="Hurray" className={classnames(classes.hurray2)} />
      <div className={classes.elementWrapper}>
        <div className={classes.element}>
          <Typography variant="h2" className={classes.hurrayTitle}>
            <span style={{ color: "#fee597" }}>В</span>
            <span style={{ color: "#e9afaf" }}>ы</span>
            {" "}
            <span style={{ color: "#abc338" }}>п</span>
            <span style={{ color: "#89d3cd" }}>о</span>
            <span style={{ color: "#47c6ef" }}>л</span>
            <span style={{ color: "#8a66ac" }}>у</span>
            <span style={{ color: "#fee597" }}>ч</span>
            <span style={{ color: "#e9afaf" }}>и</span>
            <span style={{ color: "#abc338" }}>л</span>
            <span style={{ color: "#89d3cd" }}>и</span>
            {" "}
            <span style={{ color: "#47c6ef" }}>к</span>
            <span style={{ color: "#8a66ac" }}>л</span>
            <span style={{ color: "#fee597" }}>ю</span>
            <span style={{ color: "#e9afaf" }}>ч</span>
            <span style={{ color: "#abc338" }}>!</span>
          </Typography>
          <img src="/key_5.png" className={classnames(classes.icon)} alt="Ключ" />
        </div>
      </div>
    </div>
  )
}