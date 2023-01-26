// primary module that ties store actions with reducers

// redux modules
import { applyMiddleware, createStore } from 'redux';
// eslint-disable-next-line import/no-extraneous-dependencies
// import logger from 'redux-logger';
import thunk from 'redux-thunk';
// react modules
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Import all Created react components that are associated with the router
// standard menu (non-authenticated) components
import Menu from './components/menu/menu';
import Home from './components/home/home.tsx';
import Mypins from './components/mypins/mypins';
import Profile from './components/profile/Profile';
// import combined reducer to pass to store here
import reducers from './reducers/index';

import './index.scss';
// use logger for debugging only
// const middleware = applyMiddleware(thunk,logger)
const middleware = applyMiddleware(thunk);
const store = createStore(reducers, middleware);

const theme = createTheme({
  typography: {
    fontFamily: [
      'Nunito',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});
// decalre all routes of application below
const Routes = (

  <Provider store={store}>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <Menu />
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/pins" component={Mypins} />
          <Route path="/profile/:userInfo" component={Profile} />
        </Switch>
      </ThemeProvider>
    </BrowserRouter>
  </Provider>
);
// render routes
render(Routes, document.getElementById('app'));

export default store;
