import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { useShaker } from '../common';

const useStyles = makeStyles(theme => ({
  dialog: {
    transition: "transform 0.2s"
  },
  okCanelBtn: {
    color: theme.palette.text.primary
  },
  crosswordBtn: {
    color: "#f25e5e"
  }
}));

function DigitSelect({ value, onChange }) {
  return (
    <Select
      value={value}
      onChange={e => onChange(e.target.value)}>
      {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map(i =>
        <MenuItem key={i} value={i}>{i}</MenuItem>
      )}
    </Select>
  )
}

function KeyInputForm({ onClose, onOk, startCrossword, open }) {
  const classes = useStyles();
  
  const [code, setCode] = useState(['0', '0', '0', '0']);
  const [counter, setCounter] = useState(0);
  const shaker = useShaker({
    shake: counter,
    steps: 10,
    interval: 50,
    shakeOnMount: false
  });
  const shift = shaker % 2 === 0 ? shaker : -shaker;

  const ok = () => {
    if (!onOk(code.join(''))) {
      setCounter(counter + 1);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="form-dialog-title"
      PaperProps={{
        style: {
          transform: `translate(${-shift / 2}px, ${shift / 2}px)`
        }
      }}>
      <DialogTitle id="form-dialog-title">
        <Typography variant="h2">
          Код тайного элемента
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={8}>
          {[0, 1, 2, 3].map(i => {
            return <Grid key={i} item xs={3}>
              <DigitSelect
                value={code[i]}
                onChange={d => {
                  const a = code.slice();
                  a[i] = d;
                  setCode(a);
                }}
              />
            </Grid>
          })}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={startCrossword} color="primary" className={classes.crosswordBtn}>
          Кроссворд
        </Button>
        <Button onClick={onClose} color="primary" className={classes.okCanelBtn}>
          Отмена
        </Button>
        <Button onClick={ok} color="primary" className={classes.okCanelBtn}>
          Ок
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default React.memo(KeyInputForm);