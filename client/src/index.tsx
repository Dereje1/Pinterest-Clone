import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import React, { lazy, Suspense } from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Loading } from './components/common/common';
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

// Lazy load react components
const Menu = lazy(() => import('./components/menu/menu'));
const Home = lazy(() => import('./components/home/home'));
const Mypins = lazy(() => import('./components/mypins/mypins'));
const Profile = lazy(() => import('./components/profile/Profile'));
const LogOut = lazy(() => import('./components/signin/logout'));

const App = (
  <Provider store={store}>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <Suspense fallback={<Loading />}>
          <Menu />
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/pins" component={Mypins} />
            <Route path="/profile/:userInfo" component={Profile} />
            <Route path="/logout" component={LogOut} />
          </Switch>
        </Suspense>
      </ThemeProvider>
    </BrowserRouter>
  </Provider>
);
// render routes
render(App, document.getElementById('app'));
