import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// React components
import Menu from './components/menu/menu';
import Home from './components/home/home';
import Mypins from './components/mypins/mypins';
import Profile from './components/profile/Profile';
// redux
import reducers from './reducers/index';
// css
import './index.scss';
// redux config (add logger to middleware here)
const middleware = applyMiddleware(thunk);
const store = createStore(reducers, middleware);
// mui theme config
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

const App = (
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
render(App, document.getElementById('app'));

export default store;
