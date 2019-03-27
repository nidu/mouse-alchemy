import * as React from "react";

import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/styles';

import {useShaker} from '../../common';

const useStyles = makeStyles(theme => ({
  button: {
    transition: "transform 0.1s"
  }
}))

export default function CheckButton({
  onCheck,
  lastFailedCheckDate
}) {
  const classes = useStyles();

  const shaker = useShaker({
    steps: 10,
    interval: 50,
    shakeOnMount: false,
    shake: lastFailedCheckDate
  });
  const shift = shaker * (shaker % 2 == 0 ? 1 : -1);
  // console.log(shaker, shift);
  const transform = `translate(${shift}px,${shift}px)`

  return (
    <Button className={classes.button} style={{transform}} onClick={onCheck}>
      Проверить
    </Button>
  )
}