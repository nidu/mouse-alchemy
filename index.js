import React, { Component, useState, useEffect, useCallback } from 'react';
import 'typeface-roboto';
require("./bootstrap");

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import purple from '@material-ui/core/colors/purple';
import green from '@material-ui/core/colors/green';
import CssBaseline from '@material-ui/core/CssBaseline';
import { BrowserRouter as Router, Switch, Route, Redirect, Link } from "react-router-dom";
import { render } from 'react-dom';
import './style.css';
import { AdminPage } from './Admin';
import AuthForm from './game/AuthForm';
import Loader from './game/Loader';
import GameWrapper from './Game';

import ThemeContext from './shared/ThemeContext'

const themes = [
  createMuiTheme({
    palette: {
      background: {
        default: "#cfdfde",
        paper: "#99cac7"
      }
    },
    typography: {
      fontFamily: '"Arciform Sans cyr-lat Regular", "Roboto", "Helvetica", "Arial", sans-serif'
    }
  }),
  createMuiTheme({
    palette: {
      background: {
        default: "#c4b2d4",
        paper: "#8a66ac"
      }
    },
    typography: {
      fontFamily: '"Hangyaboly", "Roboto", "Helvetica", "Arial", sans-serif'
    }
  }),
  createMuiTheme({
    palette: {
      background: {
        default: "#f5dbdb",
        paper: "#e9afaf"
      }
    },
    typography: {
      fontFamily: '"Kurale", "Helvetica", "Arial", sans-serif'
    }
  }),
  createMuiTheme({
    element: {
      final: {
        background: "#ccc"
      }
    },
    typography: {
      fontFamily: '"PH 300 Cond Caps", "Roboto", "Helvetica", "Arial", sans-serif'
    }
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
  const theme = themes[Math.min(themes.length - 1), themeIndex];

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
