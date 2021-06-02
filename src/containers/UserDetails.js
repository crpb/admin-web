// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import {
  Typography,
  Paper,
  Grid,
  Button,
  Tabs, Tab,
} from '@material-ui/core';
import { connect } from 'react-redux';
import { fetchUserData, editUserData, editUserRoles, fetchLdapDump } from '../actions/users';
import TopBar from '../components/TopBar';
import { fetchRolesData } from '../actions/roles';
import Sync from '@material-ui/icons/Sync';
import Detach from '@material-ui/icons/SyncDisabled';
import Dump from '@material-ui/icons/Receipt';
import { syncLdapData } from '../actions/ldap';
import DetachDialog from '../components/Dialogs/DetachDialog';
import DumpDialog from '../components/Dialogs/DumpDialog';
import Feedback from '../components/Feedback';
import Account from '../components/user/Account';
import User from '../components/user/User';
import Contact from '../components/user/Contact';
import Roles from '../components/user/Roles';
import Smtp from '../components/user/Smtp';
import ChangeUserPassword from '../components/Dialogs/ChangeUserPassword';
import FetchMail from '../components/user/FetchMail';
import AddFetchmail from '../components/Dialogs/AddFetchmail';
import EditFetchmail from '../components/Dialogs/EditFetchmail';

const styles = theme => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  base: {
    padding: theme.spacing(2, 2),
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    overflowY: 'scroll',
  },
  paper: {
    margin: theme.spacing(3, 2),
    padding: theme.spacing(2),
    borderRadius: 6,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    margin: theme.spacing(1),
  },
  toolbar: theme.mixins.toolbar,
  column: {
    margin: theme.spacing(1, 2),
  },
  syncButtons: {
    margin: theme.spacing(2, 0),
  },
  leftIcon: {
    marginRight: 4,
  },
  header: {
    marginBottom: 16,
  },
  buttonGrid: {
    margin: theme.spacing(1, 0, 0, 1),
  },
});

class UserDetails extends PureComponent {

  state = {
    adding: false,
    editing: null,
    user: {
      fetchmail: [],
      roles: [],
      properties: {},
    },
    rawData: {},
    dump: '',
    changingPw: false,
    snackbar: '',
    tab: 0,
    sizeUnits: {
      storagequotalimit: 1,
      prohibitreceivequota: 1,
      prohibitsendquota: 1,
    },
    detaching: false,
    detachLoading: false,
  };

  async componentDidMount() {
    const { fetch, fetchRoles } = this.props;
    const splits = window.location.pathname.split('/');
    const user = await fetch(splits[1], splits[3])
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
    fetchRoles()
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));

    this.setState(this.getStateOverwrite(user));
  }

  getStateOverwrite(user) {
    if(!user) return;
    const properties = {
      ...user.properties,
    };
    const username = user.username.slice(0, user.username.indexOf('@'));
    const roles = (user.roles && user.roles.map(role => role.ID)) || [];
    let sizeUnits = {
      storagequotalimit: 1,
      prohibitreceivequota: 1,
      prohibitsendquota: 1,
    };
    for(let quotaLimit in sizeUnits) {
      for(let i = 3; i > 0; i--) {
        if(properties[quotaLimit] === 0) break;
        let r = properties[quotaLimit] % 1024 ** i;
        if(r === 0) {
          sizeUnits[quotaLimit] = i;
          properties[quotaLimit] = properties[quotaLimit] / 1024 ** i;
          break;
        }
      }
    }
    return {
      sizeUnits,
      rawData: user,
      user: {
        ...user,
        username,
        roles,
        properties,
      },
    };
  }

  handleInput = field => event => {
    this.setState({
      user: {
        ...this.state.user,
        [field]: event.target.value,
      },
      unsaved: true,
    });
  }

  handlePropertyChange = field => event => {
    const { user } = this.state;
    this.setState({
      user: {
        ...user,
        properties: {
          ...user.properties,
          [field]: event.target.value,
        },
      },
      unsaved: true,
    });
  }

  handleIntPropertyChange = field => event => {
    const { user } = this.state;
    const value = event.target.value;
    const int = parseInt(value);
    if(!isNaN(int) || value === '') this.setState({
      user: {
        ...user,
        properties: {
          ...user.properties,
          [field]: int || value,
        },
      },
      unsaved: true,
    });
  }

  handleEdit = () => {
    const { user, sizeUnits } = this.state;
    this.props.edit(this.props.domain.ID, {
      ...user,
      domainID: undefined,
      aliases: user.aliases.filter(alias => alias !== ''),
      fetchmail: user.fetchmail.map(e => { return {
        ...e,
        date: undefined,
        sslFingerprint: e.sslFingerprint ? e.sslFingerprint.toUpperCase() : undefined,
      };}),
      properties: {
        ...user.properties,
        messagesizeextended: undefined,
        storagequotalimit: user.properties.storagequotalimit * 2 ** (10 * sizeUnits.storagequotalimit) || 0,
        prohibitreceivequota: user.properties.prohibitreceivequota * 2
          ** (10 * sizeUnits.prohibitreceivequota) || 0,
        prohibitsendquota: user.properties.prohibitsendquota * 2 ** (10 * sizeUnits.prohibitsendquota) || 0,
      },
      roles: undefined,
    })
      .then(() => this.setState({ snackbar: 'Success!' }))
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
  }

  handleSync = () => {
    const { sync, domain } = this.props;
    const { user } = this.state;
    sync(domain.ID, user.ID)
      .then(user => 
        this.setState({
          ...this.getStateOverwrite(user),
          snackbar: 'Success!',
        })
      )
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
  }

  handleDump = () => {
    const { dump } = this.props;
    dump({ ID: this.state.user.ldapID })
      .then(data => this.setState({ dump: data.data }))
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
  }

  handleKeyPress = event => {
    const { newPw, checkPw } = this.state;
    if(event.key === 'Enter' && newPw === checkPw) this.handlePasswordChange();
  }

  handleSaveRoles = () => {
    const { editUserRoles, domain } = this.props;
    const { ID, roles } = this.state.user;
    editUserRoles(domain.ID, ID, { roles: roles })
      .then(() => this.setState({ snackbar: 'Success!' }))
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
  }

  handleTabChange = (e, tab) => this.setState({ tab });

  handleAliasEdit = idx => event => {
    const { user } = this.state;
    const copy = [...user.aliases];
    copy[idx] = event.target.value;
    this.setState({ user: { ...user, aliases: copy } });
  }

  handleAddAlias = () => {
    const { user } = this.state;
    const copy = [...user.aliases];
    copy.push('');
    this.setState({ user: { ...user, aliases: copy } });
  }

  handleRemoveAlias = idx => () => {
    const { user } = this.state;
    const copy = [...user.aliases];
    copy.splice(idx, 1);
    this.setState({ user: { ...user, aliases: copy } });
  }

  handleCheckbox = field => e => this.setState({
    user: {
      ...this.state.user,
      [field]: e.target.checked,
    },
  });

  handleUnitChange = unit => event => this.setState({
    sizeUnits: {
      ...this.state.sizeUnits,
      [unit]: event.target.value,
    },
  });

  handleDetachDialog = detaching => () => this.setState({ detaching });

  handleDetach = () => {
    const { domain, edit } = this.props;
    this.setState({ detachLoading: true });
    edit(domain.ID, { ID: this.state.user.ID, ldapID: null })
      .then(() => this.setState({
        user: {
          ...this.state.user,
          ldapID: null,
        },
        snackbar: 'Success!',
        detachLoading: false,
        detaching: false,
      }))
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error', detachLoading: false }));
  }

  handleCloseDump = () => this.setState({ dump: '' });

  handlePasswordDialogToggle = changingPw => () => this.setState({ changingPw });

  handleSuccess = () => this.setState({ snackbar: 'Success!' });

  handleError = msg => this.setState({ snackbar: msg.message || 'Unknown error' });

  handleAutocomplete = (field) => (e, newVal) => {
    this.setState({
      user: {
        ...this.state.user,
        [field]: newVal.map(r => r.ID ? r.ID : r),
      },
      unsaved: true,
    });
  }

  handleFetchmailDialog = state => () => this.setState({ adding: state })

  handleFetchmailEditDialog = state => () => this.setState({ editing: state })

  handleSuccess = () => this.setState({ snackbar: 'Success!' });

  handleError = msg => this.setState({ snackbar: msg.message || 'Unknown error' });

  addFetchmail = entry => {
    const { user } = this.state;
    const fetchmail = [...user.fetchmail];
    fetchmail.push(entry);
    this.setState({
      user: {
        ...user,
        fetchmail,
      },
      adding: false,
    });
  }

  editFetchmail = entry => {
    const { user, editing } = this.state;
    const fetchmail = [...user.fetchmail];
    fetchmail[editing] = entry;
    this.setState({
      user: {
        ...user,
        fetchmail,
      },
      editing: null,
    });
  }

  handleFetchmailDelete = idx => e => {
    const { user } = this.state;
    const fetchmail = [...user.fetchmail];
    e.stopPropagation();
    fetchmail.splice(idx, 1);
    this.setState({
      user: {
        ...user,
        fetchmail,
      },
    });
  }

  render() {
    const { classes, t, domain, history } = this.props;
    const { user, changingPw, snackbar, tab, sizeUnits, detachLoading,
      detaching, adding, editing, dump, rawData } = this.state;
    const { username, properties, roles, aliases, fetchmail, ldapID } = user; //eslint-disable-line
    const usernameError = user.username && !user.username.match(/^([.0-9A-Za-z_+-]+)$/);

    return (
      <div className={classes.root}>
        <TopBar title={t("Users")}/>
        <div className={classes.toolbar}/>
        <div className={classes.base}>
          <Paper className={classes.paper} elevation={1}>
            <Grid container className={classes.header}>
              <Typography
                color="primary"
                variant="h5"
              >
                {t('editHeadline', { item: 'User' })} {properties.displayname ? ` - ${properties.displayname}` : ''}
              </Typography>
            </Grid>
            {ldapID && <Grid container className={classes.syncButtons}>
              <Button
                variant="contained"
                color="secondary"
                style={{ marginRight: 8 }}
                onClick={this.handleDetachDialog(true)}
                size="small"
              >
                <Detach fontSize="small" className={classes.leftIcon} /> Detach
              </Button>
              <Button
                size="small"
                onClick={this.handleSync}
                variant="contained"
                color="primary"
                style={{ marginRight: 8 }}
              >
                <Sync fontSize="small" className={classes.leftIcon}/> Sync
              </Button>
              <Button
                size="small"
                onClick={this.handleDump}
                variant="contained"
                color="primary"
              >
                <Dump fontSize="small" className={classes.leftIcon}/> Dump
              </Button>
            </Grid>}
            <Tabs indicatorColor="primary" value={tab} onChange={this.handleTabChange}>
              <Tab label={t("Account")} />
              <Tab label={t("User")} />
              <Tab label={t("Contact")} />
              <Tab label={t("Roles")} />
              <Tab label={t("SMTP")} />
              <Tab label={t("FetchMail")} />
            </Tabs>
            {tab === 0 && <Account
              domain={domain}
              user={user}
              usernameError={usernameError}
              sizeUnits={sizeUnits}
              handleInput={this.handleInput}
              handlePropertyChange={this.handlePropertyChange}
              handleIntPropertyChange={this.handleIntPropertyChange}
              handleCheckbox={this.handleCheckbox}
              handleUnitChange={this.handleUnitChange}
              handlePasswordChange={this.handlePasswordDialogToggle(true)}
              rawData={rawData}
            />}
            {tab === 1 && <User
              user={user}
              handlePropertyChange={this.handlePropertyChange}
            />}
            {tab === 2 && <Contact
              user={user}
              handlePropertyChange={this.handlePropertyChange}
            />}
            {tab === 3 && <Roles
              roles={roles}
              handleAutocomplete={this.handleAutocomplete}
            />}
            {tab === 4 && <Smtp
              aliases={aliases}
              handleAliasEdit={this.handleAliasEdit}
              handleAddAlias={this.handleAddAlias}
              handleRemoveAlias={this.handleRemoveAlias}
            />}
            {tab === 5 && <FetchMail
              fetchmail={fetchmail}
              handleAdd={this.handleFetchmailDialog(true)}
              handleEdit={this.handleFetchmailEditDialog}
              handleDelete={this.handleFetchmailDelete}
            />}
            <Grid container className={classes.buttonGrid}>
              <Button
                variant="contained"
                onClick={history.goBack}
                style={{ marginRight: 8 }}
              >
                {t('Back')}
              </Button>
              {tab === 3 ? 
                <Button
                  variant="contained"
                  color="primary"
                  onClick={this.handleSaveRoles}
                >
                  {t('Save')}
                </Button> :
                <Button
                  variant="contained"
                  color="primary"
                  onClick={this.handleEdit}
                  disabled={!username || usernameError}
                >
                  {t('Save')}
                </Button>}
            </Grid>
          </Paper>
          <Feedback
            snackbar={snackbar}
            onClose={() => this.setState({ snackbar: '' })}
          />
        </div>
        <DetachDialog
          open={detaching}
          loading={detachLoading}
          onClose={this.handleDetachDialog(false)}
          onDetach={this.handleDetach}
        />
        <AddFetchmail
          open={adding}
          add={this.addFetchmail}
          onClose={this.handleFetchmailDialog(false)}
        />
        <EditFetchmail
          open={editing !== null}
          entry={editing !== null ? fetchmail[editing] : editing}
          edit={this.editFetchmail}
          onClose={this.handleFetchmailEditDialog(null)}
        />
        <ChangeUserPassword
          onClose={this.handlePasswordDialogToggle(false)}
          onError={this.handleError}
          onSuccess={this.handleSuccess}
          changingPw={changingPw}
          domain={domain}
          user={user}
        />
        <DumpDialog onClose={this.handleCloseDump} open={!!dump} dump={dump} />
      </div>
    );
  }
}

UserDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  domain: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  sync: PropTypes.func.isRequired,
  edit: PropTypes.func.isRequired,
  fetch: PropTypes.func.isRequired,
  fetchRoles: PropTypes.func.isRequired,
  editUserRoles: PropTypes.func.isRequired,
  dump: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async (domainID, userID) => await dispatch(fetchUserData(domainID, userID))
      .then(user => user)
      .catch(msg => Promise.reject(msg)),
    fetchRoles: async () => {
      await dispatch(fetchRolesData({ sort: 'name,asc' })).catch(msg => Promise.reject(msg));
    },
    edit: async (domainID, user) => {
      await dispatch(editUserData(domainID, user)).catch(msg => Promise.reject(msg));
    },
    editUserRoles: async (domainID, userID, roles) => {
      await dispatch(editUserRoles(domainID, userID, roles)).catch(msg => Promise.reject(msg));
    },
    sync: async (domainID, userID) =>
      await dispatch(syncLdapData(domainID, userID))
        .then(user => Promise.resolve(user))
        .catch(msg => Promise.reject(msg)),
    dump: async params => await dispatch(fetchLdapDump(params))
      .then(data => Promise.resolve(data))
      .catch(msg => Promise.reject(msg)),
  };
};

export default connect(null, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(UserDetails)));
