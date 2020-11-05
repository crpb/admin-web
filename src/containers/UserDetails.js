import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import {
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Button,
  DialogTitle,
  DialogContent, Dialog, DialogActions, Select, FormLabel, Snackbar, InputLabel, Input, Tabs, Tab,
} from '@material-ui/core';
import { connect } from 'react-redux';
import { fetchUserData, editUserData, editUserRoles } from '../actions/users';
import TopBar from '../components/TopBar';
import { changeUserPassword } from '../api';
import { timezones } from '../res/timezones';
import { fetchAreasData } from '../actions/areas';
import { fetchRolesData } from '../actions/roles';
import Alert from '@material-ui/lab/Alert';

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
    marginBottom: theme.spacing(2),
  },
  toolbar: theme.mixins.toolbar,
  gird: {
    display: 'flex',
  },
  select: {
    minWidth: 60,
  },
});

class UserDetails extends PureComponent {

  state = {
    user: {},
    changingPw: false,
    newPw: '',
    checkPw: '',
    snackbar: '',
    sizeUnit: 0,
    tab: 0,
  };

  types = [
    { name: 'Normal', ID: 0 },
    { name: 'Room', ID: 1 },
    { name: 'Equipment', ID: 2 },
  ]

  statuses = [
    { name: 'Normal', ID: 0 },
    { name: 'Suspended', ID: 1 },
    { name: 'Out of date', ID: 2 },
    { name: 'Deleted', ID: 3 },
  ]

  expires = [
    { name: '1 week', ID: 0 },
    { name: '1 month', ID: 1 },
    { name: '1 year', ID: 2 },
    { name: '100 years', ID: 3 },
    { name: 'Never', ID: 4 },
  ]

  timeZones = [-12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, 1, 0,
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  async componentDidMount() {
    const { fetch, fetchAreas, fetchRoles } = this.props;
    const splits = window.location.pathname.split('/');
    const user = await fetch(splits[1], splits[3]);
    fetchAreas()
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
    fetchRoles()
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
    const maxSize = user.maxSize;
    if(maxSize % 1048576 === 0) {
      this.setState({
        user: {
          ...user,
          username: user.username.slice(0, user.username.indexOf('@')),
          roles: (user.roles && user.roles.map(role => role.ID)) || [],
          maxSize: maxSize / 1048576,
        },
        sizeUnit: 2,
      });
    } else if (maxSize % 1024 === 0) {
      this.setState({
        user: {
          ...user,
          username: user.username.slice(0, user.username.indexOf('@')),
          roles: (user.roles && user.roles.map(role => role.ID)) || [],
          maxSize: maxSize / 1024,
        },
        sizeUnit: 1,
      });
    } else {
      this.setState({
        user: {
          ...user,
          username: user.username.slice(0, user.username.indexOf('@')),
          roles: (user.roles && user.roles.map(role => role.ID)) || [],
        },
      });
    }
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

  handleCheckbox = field => event => this.setState({
    user: {
      ...this.state.user,
      [field]: event.target.checked,
    },
    unsaved: true,
  });

  handleNumberInput = field => event => {
    let input = event.target.value;
    if(input && input.match("^\\d*?$")) input = parseInt(input);
    this.setState({
      user: {
        ...this.state.user,
        [field]: input,
      },
    });
  }

  handleEdit = () => {
    const { user, sizeUnit } = this.state;
    this.props.edit(this.props.domain.ID, {
      ...user,
      password: undefined,
      maxSize: user.maxSize << (10 * sizeUnit),
      roles: undefined,
      addressStatus: undefined,
      addressType: undefined,
    })
      .then(() => this.setState({ snackbar: 'Success!' }))
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
  }

  handlePasswordChange = async () => {
    const { user, newPw } = this.state;
    await changeUserPassword(this.props.domain.ID, user.ID, newPw);
    this.setState({ changingPw: false });
  }

  handleKeyPress = event => {
    const { newPw, checkPw } = this.state;
    if(event.key === 'Enter' && newPw === checkPw) this.handlePasswordChange();
  }

  handleUnitChange = event => this.setState({ sizeUnit: event.target.value });

  handleMultiSelect = event => {
    this.setState({
      user: {
        ...this.state.user,
        roles: event.target.value,
      },
    });
  };

  handleSaveRoles = () => {
    const { editUserRoles, domain } = this.props;
    const { ID, roles } = this.state.user;
    editUserRoles(domain.ID, ID, { roles: roles })
      .then(() => this.setState({ snackbar: 'Success!' }))
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
  }

  handleTabChange = (e, tab) => this.setState({ tab });

  render() {
    const { classes, t, domain, Roles } = this.props;
    const { user, changingPw, newPw, checkPw, sizeUnit, snackbar, tab } = this.state;
    return (
      <div className={classes.root}>
        <TopBar title={t("Users")}/>
        <div className={classes.toolbar}/>
        <div className={classes.base}>
          <Paper className={classes.paper} elevation={1}>
            <Grid container>
              <Typography
                color="primary"
                variant="h5"
              >
                {t('editHeadline', { item: 'User' })}
              </Typography>
            </Grid>
            <Tabs value={tab} onChange={this.handleTabChange}>
              <Tab label="System info" />
              <Tab label="User info" />
              <Tab label="Permissions" />
              <Tab label="Roles" />
            </Tabs>
            <FormControl className={classes.form}>
              {tab === 0 && <React.Fragment>
                <Grid container className={classes.input}>
                  <TextField 
                    label={t("Username")}
                    value={user.username || ''}
                    autoFocus
                    onChange={this.handleInput('username')}
                    style={{ flex: 1, marginRight: 8 }}
                    InputProps={{
                      endAdornment: <div>@{domain.domainname}</div>,
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={() => this.setState({ changingPw: true })}
                    size="small"
                  >
                    {t('Change password')}
                  </Button>
                </Grid>
                <TextField
                  select
                  className={classes.input}
                  label={t("Password expiration time")}
                  fullWidth
                  value={user.expire || 0}
                  onChange={this.handleInput('expire')}
                >
                  {this.expires.map((expire, key) => (
                    <MenuItem key={key} value={expire.ID}>
                      {expire.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  className={classes.input}
                  label={t("Status")}
                  fullWidth
                  value={user.addressStatus || 0}
                  onChange={this.handleInput('addressStatus')}
                >
                  {this.statuses.map((status, key) => (
                    <MenuItem key={key} value={status.ID}>
                      {status.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  className={classes.input}
                  label={t("Data area")}
                  fullWidth
                  value={user.maildir || ''}
                  onChange={this.handleInput('areaID')}
                  disabled
                />
                <TextField 
                  className={classes.input} 
                  label={t("Maximum space")} 
                  fullWidth 
                  value={user.maxSize || ''}
                  onChange={this.handleNumberInput('maxSize')}
                  InputProps={{
                    endAdornment:
                    <FormControl>
                      <Select
                        onChange={this.handleUnitChange}
                        value={sizeUnit}
                        className={classes.select}
                      >
                        <MenuItem value={0}>MiB</MenuItem>
                        <MenuItem value={1}>GiB</MenuItem>
                        <MenuItem value={2}>TiB</MenuItem>
                      </Select>
                    </FormControl>,
                  }}
                />
                <TextField
                  select
                  className={classes.input}
                  label={t("Type")}
                  fullWidth
                  value={user.subType || 0}
                  onChange={this.handleInput('subType')}
                >
                  {this.types.map((type, key) => (
                    <MenuItem key={key} value={type.ID}>
                      {type.name}
                    </MenuItem>
                  ))}
                </TextField>
              </React.Fragment>}
              {tab === 1 && <React.Fragment>
                <TextField
                  select
                  className={classes.input}
                  label={t("Language")}
                  fullWidth
                  value={user.lang || 0}
                  onChange={this.handleInput('lang')}
                >
                  <MenuItem value={0}>
                    {t('english')}
                  </MenuItem>
                </TextField>
                <FormControl>
                  <FormLabel>{t("Timezone")}</FormLabel>
                  <Select
                    className={classes.input}
                    fullWidth
                    native
                    value={user.timezone || 427} // Default: Berlin
                    onChange={this.handleInput('timezone')}
                  >
                    {timezones.map((zone, key) => (
                      <option key={key} value={key}>
                        {zone.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <TextField 
                  className={classes.input}
                  label={t("Job title")}
                  fullWidth
                  value={user.title || ''}
                  onChange={this.handleInput('title')}
                />
                <TextField 
                  className={classes.input}
                  label={t("Display name")}
                  fullWidth
                  value={user.realName || ''}
                  onChange={this.handleInput('realName')}
                />
                <TextField 
                  className={classes.input} 
                  label={t("Nickname")} 
                  fullWidth 
                  value={user.nickname || ''}
                  onChange={this.handleInput('nickname')}
                />
                <TextField 
                  className={classes.input} 
                  label={t("Telephone")} 
                  fullWidth 
                  value={user.tel || ''}
                  onChange={this.handleInput('tel')}
                />
                <TextField 
                  className={classes.input} 
                  label={t("Mobile phone")} 
                  fullWidth 
                  value={user.mobilePhone || ''}
                  onChange={this.handleInput('mobilePhone')}
                />
                <TextField 
                  className={classes.input} 
                  label={t("Home address")} 
                  fullWidth 
                  value={user.homeaddress || ''}
                  onChange={this.handleInput('homeaddress')}
                />
                <TextField 
                  className={classes.input} 
                  label={t("Memo")} 
                  fullWidth
                  value={user.memo || ''}
                  onChange={this.handleInput('memo')}
                />
              </React.Fragment>}
              {tab === 2 && <React.Fragment>
                <Grid container className={classes.input}>
                  <FormControlLabel
                    label={t('Allow pop3 or imap downloading')}
                    control={
                      <Checkbox
                        checked={user.pop3_imap || false}
                        onChange={this.handleCheckbox('pop3_imap')}
                      />
                    }
                  />
                  <FormControlLabel
                    label={t('Allow smtp sending')}
                    control={
                      <Checkbox
                        checked={user.smtp || false}
                        onChange={this.handleCheckbox('smtp')}
                      />
                    }
                  />
                  <FormControlLabel
                    label={t('Allow change password')}
                    control={
                      <Checkbox
                        checked={user.changePassword || false}
                        onChange={this.handleCheckbox('changePassword')}
                      />
                    }
                  />
                  <FormControlLabel
                    label={t('Public user information')}
                    control={
                      <Checkbox
                        checked={user.publicAddress || false}
                        onChange={this.handleCheckbox('publicAddress')}
                      />
                    }
                  />
                </Grid>
              </React.Fragment>}
              {tab === 3 && <React.Fragment>
                <FormControl className={classes.input}>
                  <InputLabel id="demo-mutiple-chip-label">{t('Roles')}</InputLabel>
                  <Select
                    labelId="demo-mutiple-chip-label"
                    id="demo-mutiple-chip"
                    multiple
                    fullWidth
                    value={user.roles || []}
                    onChange={this.handleMultiSelect}
                    input={<Input id="select-multiple-chip" />}
                  >
                    {(Roles || []).map((Role, key) => (
                      <MenuItem
                        selected={user.roles.find(role => role === Role.ID)}
                        key={key}
                        value={Role.ID}
                      >
                        {Role.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </React.Fragment>}
            </FormControl>
            <Button
              variant="text"
              color="secondary"
              onClick={this.props.history.goBack}
              style={{ marginRight: 8 }}
            >
              {t('Back')}
            </Button>
            {[0, 1, 2].includes(tab) ? <Button
              variant="contained"
              color="primary"
              onClick={this.handleEdit}
            >
              {('Save')}
            </Button> :
              <Button
                variant="contained"
                color="primary"
                onClick={this.handleSaveRoles}
              >
                {('Save')}
              </Button>}
          </Paper>
          <Snackbar
            open={!!snackbar}
            onClose={() => this.setState({ snackbar: '' })}
            autoHideDuration={snackbar === 'Success!' ? 1000 : 6000}
            transitionDuration={{ appear: 250, enter: 250, exit: 0 }}
          >
            <Alert
              onClose={() => this.setState({ snackbar: '' })}
              severity={snackbar === 'Success!' ? "success" : "error"}
              elevation={6}
              variant="filled"
            >
              {snackbar}
            </Alert>
          </Snackbar>
        </div>
        <Dialog open={!!changingPw}>
          <DialogTitle>{t('Change password')}</DialogTitle>
          <DialogContent>
            <TextField 
              className={classes.input} 
              label={t("New password")} 
              fullWidth
              type="password"
              value={newPw}
              onChange={event => this.setState({ newPw: event.target.value })}
              autoFocus
              onKeyPress={this.handleKeyPress}
            />
            <TextField 
              className={classes.input} 
              label={t("Repeat new password")} 
              fullWidth
              type="password"
              value={checkPw}
              onChange={event => this.setState({ checkPw: event.target.value })}
              onKeyPress={this.handleKeyPress}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ changingPw: false })}>
              {t('Cancel')}
            </Button>
            <Button
              color="primary"
              onClick={this.handlePasswordChange}
              disabled={checkPw !== newPw}
            >
              {t('Save')}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

UserDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  Roles: PropTypes.array.isRequired,
  userAreas: PropTypes.array.isRequired,
  domain: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  edit: PropTypes.func.isRequired,
  fetch: PropTypes.func.isRequired,
  fetchAreas: PropTypes.func.isRequired,
  fetchRoles: PropTypes.func.isRequired,
  editUserRoles: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    userAreas: state.areas.Areas.user || [],
    Roles: state.roles.Roles || [],
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async (domainID, userID) => await dispatch(fetchUserData(domainID, userID))
      .then(user => user)
      .catch(msg => Promise.reject(msg)),
    fetchAreas: async () => {
      await dispatch(fetchAreasData()).catch(msg => Promise.reject(msg));
    },
    fetchRoles: async () => {
      await dispatch(fetchRolesData()).catch(msg => Promise.reject(msg));
    },
    edit: async (domainID, user) => {
      await dispatch(editUserData(domainID, user)).catch(msg => Promise.reject(msg));
    },
    editUserRoles: async (domainID, userID, roles) => {
      await dispatch(editUserRoles(domainID, userID, roles)).catch(msg => Promise.reject(msg));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(UserDetails)));