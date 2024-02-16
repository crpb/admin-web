// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField, Button, DialogActions,
  CircularProgress,
  Grid,
  Typography,
  MenuItem, 
} from '@mui/material';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { uploadServiceFile } from '../../actions/dbconf';

const styles = theme => ({
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
  flexTextfield: {
    flex: 1,
    margin: theme.spacing(1, 1, 0, 1),
  },
  gridTypo: {
    minWidth: 120,
    marginBottom: 2,
  },
});

class CreateDbconfFile extends PureComponent {

  constructor() {
    super();
    this.fileInputRef = React.createRef();
  }

  state = {
    data: [
      { key: 'commit_key', value: '' },
      { key: 'commit_file', value: '' },
      { key: 'commit_service', value: '' },
    ],
    service: '',
    loading: false,
  }

  commandKeys = ['key', 'file', 'service'];

  handleInput = field => event => {
    this.setState({
      [field]: event.target.value,
    });
  }

  handleDataInput = idx => e => {
    const data = [...this.state.data];
    data[idx].value = e.target.value;
    this.setState({ data });
  }

  handleUpload = () => {
    const { history, upload } = this.props;
    const { service, data } = this.state;
    this.setState({ loading: true });
    // Create service
    upload('grommunio-dbconf', service, this.formatData(data))
      .then(() => {
        // Create service file
        history.push('/dbconf/grommunio-dbconf/' + service);
      })
      .catch(error => {
        this.props.onError(error);
        this.setState({ loading: false });
      });
  }

  formatData(data) {
    const obj = {};
    data.forEach(pair => obj[pair.key] = pair.value || undefined);
    return obj;
  }

  handleTemplate = e => {
    const { value } = e.target;
    if (value === "postfix") {
      this.setState({
        service: 'postfix',
        data: [
          { key: 'commit_key', value: '#POSTCONF' },
          { key: 'commit_file', value: '#POSTCONF' },
          { key: 'commit_service', value: '#RELOAD' },
        ]
      })
    }
  }

  render() {
    const { classes, t, open, onClose, commands } = this.props;
    const { service, data, loading } = this.state;

    return (
      <Dialog
        onClose={onClose}
        open={open}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Configure grommunio-dbconf</DialogTitle>
        <DialogContent style={{ minWidth: 400 }}>
          <FormControl className={classes.form}>
            <TextField 
              className={classes.input} 
              label={t("Template")} 
              fullWidth
              onChange={this.handleTemplate}
              select
            >
              <MenuItem value="postfix">postfix</MenuItem>
            </TextField>
            <TextField 
              className={classes.input} 
              label={t("Service name")} 
              fullWidth 
              value={service || ''}
              onChange={this.handleInput('service')}
              autoFocus
              required
            />
            <Typography variant="h6">Data</Typography>
            {data.map((pair, idx) => <Grid key={idx} container alignItems="center">
              <Typography className={classes.gridTypo}>
                {pair.key}
              </Typography>
              <TextField
                label={t("Value")}
                value={pair.value}
                onChange={this.handleDataInput(idx)}
                className={classes.flexTextfield}
                select
              >
                {commands[this.commandKeys[idx]].map((command, idx) =>
                  <MenuItem key={idx} value={command}>
                    {command}
                  </MenuItem>
                )}
              </TextField>
            </Grid>
            )}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onClose}
            color="secondary"
          >
            {t('Cancel')}
          </Button>
          <Button
            onClick={this.handleUpload}
            variant="contained"
            color="primary"
            disabled={loading || !service}
          >
            {loading ? <CircularProgress size={24}/> : t('Add')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

CreateDbconfFile.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  upload: PropTypes.func.isRequired,
  commands: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

const mapStateToProps = state => {
  return {
    commands: state.dbconf.commands,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    upload: async (service, filename, file) => {
      await dispatch(uploadServiceFile(service, filename, file))
        .catch(message => Promise.reject(message));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(CreateDbconfFile)));
