// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  FOLDERS_DATA_ERROR,
  FOLDERS_DATA_FETCH,
  FOLDERS_DATA_RECEIVED,
  FOLDER_DATA_ADD,
  FOLDER_DATA_DELETE,
  OWNERS_DATA_RECEIVED,
  FOLDERS_NEXT_SET,
} from './types';
import { folders, folderDetails, addFolder, editFolder, deleteFolder, owners, addOwner,
  putFolderPermissions, deleteOwner } from '../api';

export function fetchFolderData(domainID, params) {
  return async dispatch => {
    await dispatch({ type: FOLDERS_DATA_FETCH });
    try {
      const response = await dispatch(folders(domainID, params));
      if(!params?.offset) await dispatch({ type: FOLDERS_DATA_RECEIVED, data: response });
      else await dispatch({ type: FOLDERS_NEXT_SET, data: response });
    } catch(error) {
      await dispatch({ type: FOLDERS_DATA_ERROR, error});
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function fetchFolderDetails(domainID, folderID) {
  return async dispatch => {
    try {
      const folder = await dispatch(folderDetails(domainID, folderID));
      return Promise.resolve(folder);
    } catch(error) {
      await dispatch({ type: FOLDERS_DATA_ERROR, error});
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function addFolderData(domainID, folder) {
  return async dispatch => {
    const owners = folder.owners;
    delete folder.owners;
    try {
      const folderData = await dispatch(addFolder(domainID, folder));
      await dispatch({ type: FOLDER_DATA_ADD, data: folderData });
      for(let i = 0; i < owners.length; i++) {
        await dispatch(addOwner(domainID, folderData.folderid, { username: owners[i].username }));
      }
    } catch(error) {
      await dispatch({ type: FOLDERS_DATA_ERROR, error });
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function editFolderData(domainID, folder) {
  return async dispatch => {
    try {
      await dispatch(editFolder(domainID, folder));
    } catch(error) {
      await dispatch({ type: FOLDERS_DATA_ERROR, error});
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function deleteFolderData(domainID, id, params) {
  return async dispatch => {
    try {
      const resp = await dispatch(deleteFolder(domainID, id, params));
      if(resp?.taskID) return resp;
      else await dispatch({ type: FOLDER_DATA_DELETE, id });
    } catch(error) {
      await dispatch({ type: FOLDERS_DATA_ERROR, error});
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function fetchOwnersData(domainID, folderID, params) {
  return async dispatch => {
    await dispatch({ type: FOLDERS_DATA_FETCH });
    try {
      const response = await dispatch(owners(domainID, folderID, params));
      await dispatch({ type: OWNERS_DATA_RECEIVED, data: response });
    } catch(error) {
      await dispatch({ type: FOLDERS_DATA_ERROR, error});
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function addOwnerData(domainID, folderID, ownersData) {
  return async dispatch => {
    try {
      for(let i = 0; i < ownersData.length; i++) {
        await dispatch(addOwner(domainID, folderID, { username: ownersData[i].username }));
      }
      const response = await dispatch(owners(domainID, folderID, { limit: 1000000, level: 0 }));
      await dispatch({ type: OWNERS_DATA_RECEIVED, data: response });
    } catch(error) {
      await dispatch({ type: FOLDERS_DATA_ERROR, error});
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function setFolderPermissions(domainID, folderID, memberID, permissions) {
  return async dispatch => {
    try {
      await dispatch(putFolderPermissions(domainID, folderID, memberID, permissions));
      const response = await dispatch(owners(domainID, folderID, { limit: 1000000, level: 0 }));
      await dispatch({ type: OWNERS_DATA_RECEIVED, data: response });
    } catch(error) {
      await dispatch({ type: FOLDERS_DATA_ERROR, error});
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function deleteOwnerData(domainID, folderID, memberID) {
  return async dispatch => {
    try {
      await dispatch(deleteOwner(domainID, folderID, memberID));
      const response = await dispatch(owners(domainID, folderID, { limit: 1000000, level: 0 }));
      await dispatch({ type: OWNERS_DATA_RECEIVED, data: response });
    } catch(error) {
      await dispatch({ type: FOLDERS_DATA_ERROR, error});
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}
