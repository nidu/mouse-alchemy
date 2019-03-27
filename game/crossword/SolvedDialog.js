import * as React from "react";

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import Button from '@material-ui/core/Button';

export default function SolvedDialog({onClose, open, number}) {
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Поздравляю</DialogTitle>
      <DialogContent>
        <Typography>
          Ваше число - {number}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Ясно
        </Button>
      </DialogActions>
    </Dialog>
  )
}