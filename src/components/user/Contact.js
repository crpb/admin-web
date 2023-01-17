// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { PureComponent } from 'react';
import { Divider, FormControl, Grid, TextField, Tooltip, Typography } from '@mui/material';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Warning } from '@mui/icons-material';

const styles = theme => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    margin: theme.spacing(1, 1, 1, 1),
  },
  headline: {
    margin: theme.spacing(0, 0, 2, 0),
  },
  gridItem: {
    display: 'flex',
  },
  divider: {
    margin: theme.spacing(2, 0, 2, 0),
  },
  flexRow: {
    display: 'flex',
    margin: theme.spacing(0, 0, 2, 0),
  },
});

class Contact extends PureComponent {

  render() {
    const { classes, t, user, handlePropertyChange } = this.props;
    const { properties, ldapID } = user;

    const tfProps = (label, field) => ({
      variant: ldapID ? "filled" : 'outlined',
      fullWidth: true,
      onChange: handlePropertyChange(field),
      value: properties[field] || '',
      label: t(label),
      className: classes.input,
    });

    return (
      <FormControl className={classes.form}>
        <div className={classes.flexRow}>
          <Typography variant="h6">{t('Telephone')}</Typography>
          {ldapID && <Tooltip title={t("Warning") + ": " + t("Changes will be overwritten with next LDAP sync")}>
            <Warning color="warning" fontSize="inherit" style={{ fontSize: 32 }}/>  
          </Tooltip>}
        </div>
        <Grid container>
          <Grid item xs={12} className={classes.gridItem}>
            <TextField 
              {...tfProps("Business 1", 'businesstelephonenumber')}
            />
            <TextField
              {...tfProps("Privat 1", 'hometelephonenumber')}
            />
          </Grid>
          <Grid item xs={12} className={classes.gridItem}>
            <TextField
              {...tfProps("Business 2", 'business2telephonenumber')}
            />
            <TextField
              {...tfProps("Privat 2", 'home2telephonenumber')}
            />
          </Grid>
          <Grid item xs={12} className={classes.gridItem}>
            <TextField
              {...tfProps("Fax", 'primaryfaxnumber')}
            />
            <TextField
              {...tfProps("Mobile", 'mobiletelephonenumber')}
            />
          </Grid>
          <Grid item xs={12} className={classes.gridItem}>
            <TextField
              {...tfProps("Assistant", 'assistanttelephonenumber')}
            />
            <TextField
              {...tfProps("Pager", 'pagertelephonenumber')}
            />
          </Grid>
        </Grid>
        <Divider className={classes.divider}/>
        <div className={classes.flexRow}>
          <Typography variant="h6">{t('Annotation')}</Typography>
          {ldapID && <Tooltip title={t("Warning") + ": " + t("Changes will be overwritten with next LDAP sync")}>
            <Warning color="warning" fontSize="inherit" style={{ fontSize: 32 }}/>  
          </Tooltip>}
        </div>
        <TextField
          {...tfProps("", 'comment')}
          multiline
          rows={4}
        />
      </FormControl>
    );
  }
}

Contact.propTypes = {
  classes: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  handlePropertyChange: PropTypes.func.isRequired,
};

export default withTranslation()(withStyles(styles)(Contact));