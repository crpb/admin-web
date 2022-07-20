// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  ANTISPAM_DATA_FETCH,
  ANTISPAM_DATA_RECEIVED,
} from '../actions/types';
import { antispam } from '../api';
import { defaultListHandler } from './handlers';

export function fetchAntispamData() {
  return defaultListHandler(antispam, ANTISPAM_DATA_RECEIVED, ANTISPAM_DATA_FETCH);
}