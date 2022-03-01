// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  AUTH_AUTHENTICATED,
  SERVERS_DATA_ADD,
  SERVERS_DATA_DELETE,
  SERVERS_DATA_ERROR,
  SERVERS_DATA_FETCH,
  SERVERS_DATA_RECEIVED,
  SERVERS_POLICY_RECEIVED,
} from '../actions/types';
import { addItem } from '../utils';

const defaultState = {
  loading: false,
  error: null,
  Servers: [],
  policy: "round-robin",
  count: 0,
};

function serversReducer(state = defaultState, action) {
  switch (action.type) {
    case SERVERS_DATA_FETCH:
      return {
        ...state,
        loading: true,
      };

    case SERVERS_DATA_RECEIVED:
      return {
        ...state,
        loading: false,
        error: null,
        Servers: action.data.data,
        count: action.data.count,
      };
    
    case SERVERS_DATA_ERROR:
      return {
        ...state,
        loading: false,
        error: action.error,
      };

    case SERVERS_DATA_ADD:
      return {
        ...state,
        Servers: addItem(state.Servers, action.data),
        count: state.count + 1,
      };

    case SERVERS_DATA_DELETE:
      return {
        ...state,
        Servers: state.Servers.filter(s => s.ID !== action.id),
        count: state.count - 1,
      };

    case SERVERS_POLICY_RECEIVED:
      return {
        ...state,
        policy: action.data.data?.policy || 'round-robin',
      };

    case AUTH_AUTHENTICATED:
      return action.authenticated ? {
        ...state,
      } : {
        ...defaultState,
      };

    default:
      return state;
  }
}

export default serversReducer;
