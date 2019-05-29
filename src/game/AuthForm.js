import React from 'react';
import { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import firebase from "../firebase";

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Snackbar from '@material-ui/core/Snackbar';

const useStyles = makeStyles(theme => {
  return {
    container: {
      // background: theme.palette.background.default,
      height: "100vh",
      padding: 0,
      margin: 0,
      paddingTop: "calc(50vh - 100px)",
    },
    card: {
      maxWidth: 275,
      padding: 10,
      margin: "auto"
    }
  }
});

export default function AuthForm({ onAuth }) {
  const classes = useStyles();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState();

  const login = () => {
    firebase.auth().signInWithEmailAndPassword(email, password).catch((error) => {
      setError(error);
    });
  };

  return (
    <div className={classes.container}>
      <Card className={classes.card}>
        <Snackbar
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          open={error}
          autoHideDuration={6000}
          onClose={() => setError()}
          ContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">Неа</span>}
        />
        <Typography variant="h6">
          Кто там?
        </Typography>
        <CardContent>
          <TextField
            id="email"
            name="email"
            label="Почта"
            value={email}
            autoFocus
            fullWidth
            onChange={e => setEmail(e.target.value)}
          />
          <br />
          <TextField
            id="password"
            name="password"
            label="Пароль"
            value={password}
            type="password"
            fullWidth
            onChange={e => setPassword(e.target.value)}
          />
        </CardContent>
        <CardActions>
          <Button size="small" disabled={!(email && password)} onClick={login}>Войти</Button>
        </CardActions>
      </Card>
    </div>
  )
}