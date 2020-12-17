// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import {
  DOMAIN_DATA_FETCH,
  DOMAIN_DATA_RECEIVED,
  DOMAIN_DATA_ERROR,
  DOMAIN_DATA_ADD,
  DOMAIN_NEXT_SET,
} from '../actions/types';
import { addItem, append } from '../utils';

const defaultState = {
  loading: false,
  error: null,
  count: 0,
  Domains: [],
};

function domainsReducer(state = defaultState, action) {
  switch (action.type) {
    case DOMAIN_DATA_FETCH:
      return {
        ...state,
        loading: true,
      };

    case DOMAIN_DATA_RECEIVED:
      return {
        ...state,
        loading: false,
        error: null,
        Domains: action.data.data,
        count: action.data.count,
      };

    case DOMAIN_NEXT_SET:
      return {
        ...state,
        loading: false,
        error: null,
        Domains: append(state.Domains, action.data.data),
        count: action.data.count,
      };
    
    case DOMAIN_DATA_ERROR:
      return {
        ...state,
        error: action.error,
        loading: false,
      };

    case DOMAIN_DATA_ADD:
      return {
        ...state,
        Domains: addItem(state.Domains, action.data),
      };

    default:
      return state;
  }
}

export default domainsReducer;
