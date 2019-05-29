import React, { useState, useEffect, useCallback } from 'react';
import 'typeface-roboto';
import firebase from "./firebase";
import "./bootstrap";

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { render } from 'react-dom';
import './style.css';
import { AdminPage } from './Admin';
import AuthForm from './game/AuthForm';
import Loader from './game/Loader';
import GameWrapper from './Game';

import ThemeContext from './shared/ThemeContext';

const typography = () => ({
  fontFamily: '"Arciform Sans cyr-lat Regular", "Roboto", "Helvetica", "Arial", sans-serif',
  h2: {
    fontFamily: '"PH 300 Cond Caps", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  h3: {
    fontFamily: '"PH 300 Cond Caps", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  h4: {
    fontFamily: '"PH 300 Cond Caps", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 40
  }
});

const themes = [
  createMuiTheme({
    game: {
      background: {
        default: "#cfdfde",
        paper: "#99cac7"
      },
      text: {
        primary: "#29434f",
        secondary: "#29434f",
      }
    },
    typography: typography()
  }),
  createMuiTheme({
    game: {
      background: {
        default: "#c4b2d4",
        paper: "#8a66ac"
      },
      text: {
        primary: "#f5dbdb",
        secondary: "#f5dbdb",
      }
    },
    typography: typography()
  }),
  createMuiTheme({
    game: {
      background: {
        default: "#f5dbdb",
        paper: "#e9afaf"
      },
      text: {
        primary: "#4e2551",
        secondary: "#4e2551",
      }
    },
    typography: typography()
  }),
  createMuiTheme({
    element: {
      final: {
        background: "#ccc"
      }
    },
    game: {
      background: {
        default: "white",
        paper: "#ECEFF1"
      },
      text: {
        primary: "#4e2551",
        secondary: "#4e2551",
      }
    },
    typography: typography()
  })
]

function NoMatch() {
  return (
    <Loader message={
      <div>
        Четыреста четыре<br />
        Вас не должно здесь быть<br />
        Получите ссылку у Эмми
      </div>
    } />
  );
}

function App() {
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);
  const [themeIndex, setThemeIndex] = useState(0);
  const theme = themes[Math.min(themes.length - 1, themeIndex)];

  const nextTheme = useCallback(() => {
    console.log("next theme");
    setThemeIndex(idx => (idx + 1) % themes.length);
  }, []);

  useEffect(() => {
    firebase.auth().onAuthStateChanged(user => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <Loader message="Вход..." />;
  } else if (!user) {
    return (
      <MuiThemeProvider theme={theme}>
        <AuthForm onAuth={setUser} />
      </MuiThemeProvider>
    );
  } else {
    return (
      <Router>
        <MuiThemeProvider theme={theme}>
          <ThemeContext.Provider value={{ 
            nextTheme, 
            currentThemeIndex: themeIndex,
            nextThemeIndex: (themeIndex + 1) % themes.length,
            setTheme: setThemeIndex
          }}>
            <div>
              <Switch>
                <Route path="/admin" component={AdminPage} />
                <Route path="/games/:elementSetId" exact component={GameWrapper} />
                <Route component={NoMatch} />
              </Switch>
            </div>
          </ThemeContext.Provider>
        </MuiThemeProvider>
      </Router>
    );
  }
}

render(<App />, document.getElementById('root'));
