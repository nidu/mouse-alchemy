import React from 'react';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';

import Button from '@material-ui/core/Button';

function About({onClose, open}) {
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">
        <Typography variant="h2">
          Об игре
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography>
          Сделали котик и компания
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default React.memo(About);