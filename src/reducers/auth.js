// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import {
  AUTH_AUTHENTICATED,
  AUTH_ERROR,
} from '../actions/types';

const defaultState = {
  error: false,
  authenticated: false,
  capabilities: [],
  csrf: '',
};

function authReducer(state = defaultState, action) {
  switch (action.type) {

  case AUTH_AUTHENTICATED:
    return {
      ...state,
      authenticated: action.authenticated,
      capabilities: action.capabilities || [],
      error: false,
      csrf: action.authenticated ? action.csrf : '',
    };
    
  case AUTH_ERROR: {
    return {
      ...state,
      authenticated: false,
      error: action.error || true,
    };
  }

  default:
    return state;
  }
}

export default authReducer;
