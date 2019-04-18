import React from 'react';

import { useState, useEffect, useContext } from 'react';
import { makeStyles } from '@material-ui/styles';
import classnames from 'classnames';

import SettingsContext from '../shared/SettingsContext';

import ElementIcon from './ElementIcon';

const useStyles = makeStyles(() => ({
  container: {
    position: "absolute",
    // "&$moving": {
    //   transition: "top 1s, opacity 1s",
    // }
  },
  moving: {}
}))

export default function ElementSoul({lastRepeatedElement}) {
  const {element, targetNode} = lastRepeatedElement || {};
  const classes = useStyles();
  const [visible, setVisible] = useState(false);
  const [moving, setMoving] = useState(false);
  const context = useContext(SettingsContext);

  useEffect(() => {
    if (!lastRepeatedElement) return;
    
    setVisible(true);
    setMoving(false);
    setTimeout(() => setMoving(true));
    setTimeout(() => {
      setVisible(false);
      setMoving(false);
    }, context.elementSoulFadeDuration);
  }, [lastRepeatedElement]);

  const transform = (targetNode && moving) ? 
    `translate(${targetNode.x + (moving ? context.elementSoulOffsetX : 0)}px,${targetNode.y + (moving ? context.elementSoulOffsetY : 0)}px)` :
    `translate(${targetNode ? targetNode.x : 0}px,${targetNode ? targetNode.y : 0}px)`;

  return (
    <div 
      className={classnames(
        classes.container,
        {[classes.moving]: moving}
      )}
      style={{
        opacity: !moving ? (visible ? 1 : 0) : 0,
        zIndex: visible >= 1 ? 1 : -1,
        transition: moving ? `transform ${context.elementSoulFadeDuration}ms, opacity ${context.elementSoulFadeDuration}ms` : undefined,
        transform: transform
      }}>
      {element && <ElementIcon element={element} />}
    </div>
  )
}