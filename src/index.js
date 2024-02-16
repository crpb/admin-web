// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import Loadable from 'react-loadable';
import { BrowserRouter as Router } from "react-router-dom";
import { StyledEngineProvider } from '@mui/material/styles';
import './index.css';
import { store } from './store';
import Loading from './components/Loading';
import './i18n';
import './config';
import ToggleColorMode from './components/ToggleColorMode';
//import * as serviceWorker from './serviceWorker';
//import { serviceWorkerNewContent } from './actions/common';

// Root function
function main() {
  const loader = async () => {
    return import('./App');
  };

  // Async loading support.
  const LoadableApp = Loadable({
    loader,
    loading: Loading,
    timeout: 20000,
    delay: 300,
  });

  ReactDOM.render(
    <Provider store={store}>
      <StyledEngineProvider injectFirst>
        <ToggleColorMode>
          <Router>
            <LoadableApp />
          </Router>
        </ToggleColorMode>
      </StyledEngineProvider>
    </Provider>,
    document.getElementById('root')
  );

  /*serviceWorker.register({
    onUpdate: () => {
      // A new service worker has been installed. Show update notification.
      store.dispatch(serviceWorkerNewContent());
    },
    onOffline: () => {
      // Service worker reported offline.
      console.info('serviceWorker onOffline'); // eslint-disable-line no-console
    },
  });*/
}

main();
