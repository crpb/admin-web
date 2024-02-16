// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import { withTranslation } from 'react-i18next';
import {
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  Button,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Tabs,
  Tab,
  List,
  ListItem,
  IconButton,
} from '@mui/material';
import { connect } from 'react-redux';
import { editGroupData, fetchGroupData } from '../actions/groups';
import { getStringAfterLastSlash } from '../utils';
import Feedback from '../components/Feedback';
import { DOMAIN_ADMIN_WRITE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import ViewWrapper from '../components/ViewWrapper';
import { editUserData, fetchUsersData } from '../actions/users';
import MagnitudeAutocomplete from '../components/MagnitudeAutocomplete';
import User from '../components/user/User';
import Contact from '../components/user/Contact';
import { Badge, ContactMail, ContactPhone, Delete, SwitchAccount } from '@mui/icons-material';

const styles = theme => ({
  paper: {
    margin: theme.spacing(3, 2, 3, 2),
    padding: theme.spacing(2, 2, 2, 2),
    borderRadius: 6,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    marginBottom: theme.spacing(3),
  },
  select: {
    minWidth: 60,
  },
  tabContainer: {
    marginTop: 8,
  },
  listItem: {
    padding: theme.spacing(1, 0),
  },
  listTextfield: {
    flex: 1,
  },
});

// eslint-disable-next-line react/prop-types
const GroupTab = ({ icon: Icon, ...props}) => <Tab
  {...props}
  sx={{ minHeight: 48 }}
  iconPosition='start'
  icon={<Icon fontSize="small"/>}
/>

class GroupDetails extends PureComponent {

  state = {
    listname: '',
    displayname: '',
    hidden: 0,
    listType: 0,
    listPrivilege: 0,
    associations: [],
    specifieds: [],
    tab: window.location.hash ?
      (parseInt(window.location.hash.slice(1)) || 0) : 0,
    loading: true,
    user: {
      properties: {},
    },
    userDirty: false,
  }

  async componentDidMount() {
    const { domain, fetch, fetchUsers } = this.props;
    const group = await fetch(domain.ID, getStringAfterLastSlash())
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
    fetchUsers(domain.ID)
      .then(() => {
        const { Users } = this.props;
        const table = {};
        Users.forEach(u => table[u.username] = u);
        if(group?.ID) {
          const associations = [];
          group.associations.forEach(groupUsername => {
            if(groupUsername in table) associations.push(table[groupUsername]);
          });

          const specifieds = [];
          group.specifieds.forEach(groupUsername => {
            if(groupUsername in table) specifieds.push(table[groupUsername]);
          });
          
          this.setState({
            loading: false,
            ...group,
            associations: associations,
            specifieds: specifieds,
          });
        }
      })
      .catch(message => {
        this.setState({ snackbar: message || 'Unknown error' });
      });
  }

  listTypes = [
    { ID: 0, name: "Normal" },
    { ID: 2, name: "Domain" },
  ]

  listPrivileges = [
    { ID: 0, name: "All" },
    { ID: 1, name: "Internal" },
    { ID: 2, name: "Domain" },
    { ID: 3, name: "Specific" },
    { ID: 4, name: "Outgoing (deprecated)" },
  ]

  handlePrivilegeChange = event => {
    const { specifieds } = this.state;
    const val = event.target.value;
    this.setState({
      listPrivilege: val,
      specifieds: val === 3 ? specifieds : [],
    });
  }

  handleInput = field => event => {
    this.setState({
      [field]: event.target.value,
    });
  }

  handleEdit = () => {
    const { edit, domain, editUser } = this.props;
    const { ID, listname, hidden, displayname, listType, listPrivilege, associations, specifieds,
      user, userDirty } = this.state;
    edit(domain.ID, {
      ID,
      listname,
      listType,
      listPrivilege,
      displayname,
      hidden,
      associations: associations.map(user => user.username),
      specifieds: specifieds.map(user => user.username),
    })
      .then(() => {
        if(userDirty) editUser(domain.ID, user)
          .then(() => this.setState({ snackbar: 'Success!' }))
          .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
        else this.setState({ snackbar: 'Success!' });
      })
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
  }

  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  }

  handleCheckbox = field => (e) => this.setState({ [field]: e.target.checked ? 1 : 0 });

  handleAutocomplete = (field) => (e, newVal) => {
    this.setState({
      [field]: newVal || '',
    });
  }

  handleTabChange = (_, tab) => {
    location.hash = '#' + tab;
    this.setState({ tab });
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
      userDirty: true,
    });
  }

  handleAliasEdit = (editType, idx) => event => {
    const { user } = this.state;
    const copy = [...user.aliases];
    switch(editType) {
    case "edit":
      copy[idx] = event.target.value;
      break;
    case "add":
      copy.push('');
      break;
    case "remove":
      copy.splice(idx, 1);
      break;
    default:
      return;
    }
    this.setState({
      user: {
        ...user,
        aliases: copy
      },
      userDirty: true,
    });
  }

  render() {
    const { classes, t, domain, Users } = this.props;
    const writable = this.context.includes(DOMAIN_ADMIN_WRITE);
    const { tab, snackbar, listname, listType, displayname, hidden, listPrivilege, associations, specifieds,
      loading, user } = this.state;

    return (
      <ViewWrapper
        topbarTitle={t('Groups')}
        snackbar={snackbar}
        onSnackbarClose={() => this.setState({ snackbar: '' })}
        loading={loading}
      >
        <Paper className={classes.paper} elevation={1}>
          <Grid container>
            <Typography
              color="primary"
              variant="h5"
            >
              {t('editHeadline', { item: 'Group' })}
            </Typography>
          </Grid>
          <div className={classes.tabContainer}>
            <Tabs
              indicatorColor="primary"
              value={tab}
              onChange={this.handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              classes={{
                scroller: classes.scroller,
              }}
            >
              <GroupTab label={t("Group")} icon={SwitchAccount}/>
              <GroupTab label={t("Details")} icon={Badge}/>
              <GroupTab label={t("Contact")} icon={ContactPhone}/>
              <GroupTab label={t("SMTP")} icon={ContactMail}/>
            </Tabs>
          </div>
          {tab === 0 && <FormControl className={classes.form}>
            <TextField 
              className={classes.input} 
              label={t("Group name")} 
              fullWidth 
              value={listname}
              autoFocus
              required
              inputProps={{
                disabled: true,
              }}
            />
            <TextField 
              className={classes.input} 
              label={t("Displayname")} 
              fullWidth 
              value={displayname}
              onChange={this.handleInput('displayname')}
            />
            <FormControlLabel
              className={classes.input} 
              control={
                <Checkbox
                  checked={hidden === 1}
                  onChange={this.handleCheckbox('hidden')}
                  color="primary"
                />
              }
              label={t('Hide from addressbook')}
            />
            <TextField
              select
              className={classes.input}
              label={t("Type")}
              fullWidth
              value={listType}
              inputProps={{
                disabled: true,
              }}
            >
              {this.listTypes.map((status, key) => (
                <MenuItem key={key} value={status.ID}>
                  {t(status.name)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              className={classes.input}
              label={t("Privilege")}
              fullWidth
              value={listPrivilege}
              onChange={this.handlePrivilegeChange}
            >
              {this.listPrivileges.map((status, key) => (
                <MenuItem key={key} value={status.ID}>
                  {t(status.name)}
                </MenuItem>
              ))}
            </TextField>
            {listType === 0 && <MagnitudeAutocomplete
              multiple
              value={associations || []}
              filterAttribute={'username'}
              onChange={this.handleAutocomplete('associations')}
              className={classes.input} 
              options={Users || []}
              placeholder={t("Search users") +  "..."}
              label={t('Recipients')}
              getOptionLabel={user => {
                // Contact
                if(user.status === 5) {
                  const properties = user.properties || {};
                  return properties["smtpaddress"] || properties["displayname"] || "";
                } else {
                  return user.username
                }
              }}
            />}
            {listPrivilege === 3 && <MagnitudeAutocomplete
              multiple
              value={specifieds || []}
              filterAttribute={'username'}
              onChange={this.handleAutocomplete('specifieds')}
              className={classes.input} 
              options={Users || []}
              placeholder={t("Search users") +  "..."}
              label={t('Senders')}
              getOptionLabel={user => {
                // Contact
                if(user.status === 5) {
                  const properties = user.properties || {};
                  return properties["smtpaddress"] || properties["displayname"] || "";
                } else {
                  return user.username
                }
              }}
            />}
          </FormControl>}
          {tab === 1 && <User
            user={user}
            handlePropertyChange={this.handlePropertyChange}
          />}
          {tab === 2 && <Contact
            user={user}
            handlePropertyChange={this.handlePropertyChange}
          />}
          {tab === 3 && <FormControl className={classes.form}>
            <Typography variant="h6">{t('E-Mail Addresses')}</Typography>
            <List className={classes.list}>
              {(user?.aliases || []).map((alias, idx) => <ListItem key={idx} className={classes.listItem}>
                <TextField
                  className={classes.listTextfield}
                  value={alias}
                  label={t("Alias") + ' ' + (idx + 1)}
                  onChange={this.handleAliasEdit("edit", idx)}
                />
                <IconButton onClick={this.handleAliasEdit("remove", idx)} size="large">
                  <Delete color="error" />
                </IconButton>
              </ListItem>
              )}
            </List>
            <Grid container justifyContent="center">
              <Button variant="contained" onClick={this.handleAliasEdit("add")}>{t('addHeadline', { item: 'E-Mail' })}</Button>
            </Grid>
          </FormControl>}
          <Button
            color="secondary"
            onClick={this.handleNavigation(domain.ID + '/groups')}
            style={{ marginRight: 8 }}
          >
            {t('Back')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleEdit}
            disabled={!writable}
          >
            {t('Save')}
          </Button>
        </Paper>
        <Feedback
          snackbar={snackbar}
          onClose={() => this.setState({ snackbar: '' })}
        />
      </ViewWrapper>
    );
  }
}

GroupDetails.contextType = CapabilityContext;
GroupDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  fetchUsers: PropTypes.func.isRequired,
  edit: PropTypes.func.isRequired,
  editUser: PropTypes.func.isRequired,
  domain: PropTypes.object.isRequired,
  Users: PropTypes.array.isRequired,
};

const mapStateToProps = state => {
  return {
    Users: state.users.Users,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    edit: async (domainID, group) => {
      await dispatch(editGroupData(domainID, group)).catch(message => Promise.reject(message));
    },
    editUser: async (domainID, group) =>
      await dispatch(editUserData(domainID, group)).catch(message => Promise.reject(message)),
    fetch: async (domainID, id) => await dispatch(fetchGroupData(domainID, id))
      .then(group => group)
      .catch(message => Promise.reject(message)),
    fetchUsers: async (domainID) =>
      await dispatch(fetchUsersData(domainID, { limit: 100000, sort: "username,asc" }))
        .catch(message => Promise.reject(message)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(GroupDetails)));
