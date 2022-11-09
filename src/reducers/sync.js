// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  SYNC_DATA_RECEIVED,
} from '../actions/types';

const defaultState = {
  count: 0,
  Sync: [],
};

function domainsReducer(state = defaultState, action) {
  switch (action.type) {
  case SYNC_DATA_RECEIVED:
    return {
      ...state,
      Sync: action.data,
    };


  default:
    return state;
  }
}

export default domainsReducer;
