import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import {
  Hidden,
  Drawer,
} from '@material-ui/core';
import {
  setDrawerSelected, setDrawerExpansion,
} from '../actions/drawer';
import DomNavigationLinks from './DomNavigationLinks';
import NavigationLinks from './NavigationLinks';

const drawerWidth = 260;

const styles = theme => ({
  /* || Top Bar */
  appBar: {
    [theme.breakpoints.up('md')]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  },
  burgerButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  profileMenu: {
    marginRight: theme.spacing(2),
  },
  dropdownMenu: {
    float: 'right',
  },

  /* || Side Bar */
  drawer: {
    [theme.breakpoints.up('lg')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  drawerPaper: {
    width: drawerWidth,
    backgroundColor: 'black',
    color: '#e6e6e6',
    boxShadow: '0 10px 30px -12px #000',
    overflowX: 'hidden',
    overflowY: 'scroll',
  },
});

class ResponsiveDomDrawer extends Component {

    state = {
      path: '',

      menuOpen: false,
      MenuAnchor: null,

      dropdownOpen: false,
      dropdownAnchor: null,
    };

  handleMoveAssetClick = (event) => {
    const { history, setDrawerSelected } = this.props;
    setDrawerSelected('assets');
    this.setState({
      dropdownOpen: false,
    });

    event.preventDefault();
    history.push(`/moveAsset`);
  }

  handleAddAssetClick = event => {
    const { history, setDrawerSelected } = this.props;
    setDrawerSelected('assets');
    this.setState({
      dropdownOpen: false,
    });

    event.preventDefault();
    history.push(`/addAsset`);
  }

  handleProfileClick = (event) => {
    this.setState({
      menuOpen: !this.state.menuOpen,
      menuAnchor: event.currentTarget,
    });
  }

  handleDropdownMenu = (event) => {
    this.setState({
      dropdownOpen: !this.state.menuOpen,
      dropdownAnchor: event.currentTarget,
    });
  }

  handleCloseProfileMenu = () => {
    this.setState({
      menuOpen: false,
    });
  }

  handleCloseDropdownMenu = () => {
    this.setState({
      dropdownOpen: false,
    });
  }

  handleNavigation = path => event => {
    const { history, setDrawerSelected } = this.props;
    setDrawerSelected(path);
    event.preventDefault();
    history.push(`/${path}`);
    this.setState({
      menuOpen: false,
    });
  }

  render() {
    const { classes, domains, role, expanded, view } = this.props;

    return(
      <nav className={classes.drawer} aria-label="navigation">
        <Hidden mdUp implementation="css">
          <Drawer
            variant="temporary"
            anchor={"left"}
            open={expanded}
            onClose={this.props.toggleExpansion}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            {role === 'sys' && view === 'sys' ? <NavigationLinks domains={domains}/>
              : <DomNavigationLinks domains={domains}/>}
          </Drawer>
        </Hidden>
        <Hidden mdDown implementation="css">
          <Drawer
            classes={{
              paper: classes.drawerPaper,
            }}
            variant="permanent"
            open
          >
            {role === 'sys' ? <NavigationLinks domains={domains}/> : <DomNavigationLinks domains={domains}/>}
          </Drawer>
        </Hidden>
      </nav>
    );
  }
}

ResponsiveDomDrawer.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  setDrawerSelected: PropTypes.func.isRequired,
  toggleExpansion: PropTypes.func.isRequired,
  domains: PropTypes.array.isRequired,
  role: PropTypes.string,
  view: PropTypes.string,
  expanded: PropTypes.bool,
};

const mapStateToProps = state => {
  const { drawer } = state;

  return {
    ...drawer,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setDrawerSelected: async page => {
      await dispatch(setDrawerSelected(page));
    },
    toggleExpansion: async () => {
      await dispatch(setDrawerExpansion());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withRouter(withTranslation()(withStyles(styles)(ResponsiveDomDrawer))));