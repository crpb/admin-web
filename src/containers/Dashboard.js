// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { Component } from "react";
import { withStyles } from "@mui/styles";
import PropTypes from "prop-types";
import TopBar from "../components/TopBar";
import ServicesChart from "../components/ServicesChart";
import AntispamStatistics from "../components/AntispamStatistics";
import { IconButton, Paper, Typography } from "@mui/material";
import { connect } from "react-redux";
import { fetchDashboardData } from "../actions/dashboard";
import { fetchAntispamData } from "../actions/antispam";
import { withTranslation } from "react-i18next";
import { fetchServicesData } from "../actions/services";
import Feedback from "../components/Feedback";
import { HelpOutline } from "@mui/icons-material";
import { fetchAboutData } from "../actions/about";
import About from "../components/About";
import CPULine from "../components/charts/CPULine";
import CPUPie from "../components/charts/CPUPie";
import MemoryLine from "../components/charts/MemoryLine";
import MemoryPie from "../components/charts/MemoryPie";
import Load from "../components/charts/Load";
import Disks from "../components/charts/Disks";

const styles = (theme) => ({
  root: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    overflowX: "hidden",
  },
  dashboardLayout: {
    display: 'grid',
    [theme.breakpoints.up("xs")]: {
      gridTemplateColumns: "1fr",
      gridTemplateAreas: `"antispam"
                          "antispam"
                          "antispam"
                          "antispam"
                          "headline"
                          "headline"
                          "services"
                          "services"
                          "cpu"
                          "cpu"
                          "memory"
                          "memory"
                          "swap"
                          "swap"
                          "disk"
                          "disk"`,
    }, 
    [theme.breakpoints.up("sm")]: {
      gridTemplateColumns: "1fr 1fr",
      gridTemplateAreas: `"antispam antispam"
                          "headline headline"
                          "services services" 
                          "cpu      cpu"
                          "memory   memory"
                          "swap     swap  "
                          "disk     disk"`,
    }, 
    [theme.breakpoints.up("md")]: {
      gridTemplateColumns: '540px 1fr 1fr 1fr',
      gridTemplateAreas: `"antispam antispam antispam antispam"
                          "headline headline headline headline"
                          "services cpu      cpu      cpu     " 
                          "services memory   memory   memory  "
                          "services swap     swap     swap    "
                          "services disk     disk     disk    "`,
    },           
  },
  antispam: {
    gridArea: 'antispam',
  },
  services: {
    display: 'flex',
    flexDirection: 'column',
    gridArea: 'services',
  },
  cpu: {
    gridArea: 'cpu',
  },
  memory: {
    gridArea: 'memory',
  },
  disk: {
    gridArea: 'disk',
  },
  swap: {
    gridArea: 'swap',
  },
  headline: {
    display: 'grid',
  },
  donutAndLineChart: {
    display: 'grid',
    [theme.breakpoints.up("xs")]: {
      gridTemplateColumns: "1fr 1fr",
    },  
    [theme.breakpoints.up("sm")]: {
      gridTemplateColumns: '300px 1fr 1fr',
    },
  },
  donutChart: {
    [theme.breakpoints.up("xs")]: {
      gridColumn: '1 / 3',
    },   
    [theme.breakpoints.up("sm")]: {
      gridColumn: '1 / 2',
    },
  },
  lineChart: {
    display: 'flex',
    [theme.breakpoints.up("xs")]: {
      gridColumn: '1 / 3',
    }, 
    [theme.breakpoints.up("sm")]: {
      gridColumn: '2 / 4',
    },   
  },
  fullChart: {
    display: 'flex',
    [theme.breakpoints.up("xs")]: {
      gridColumn: '1 / 3',
    }, 
    [theme.breakpoints.up("sm")]: {
      gridColumn: '1 / 4',
    },  
  },
  toolbar: theme.mixins.toolbar,
  iconButton: {
    color: "black",
  },
  pageTitle: {
    margin: theme.spacing(2, 2, 1, 2),
  },
  subtitle: {
    margin: theme.spacing(0, 2, 2, 2),
  },
  chartTitle: {
    margin: theme.spacing(1, 0, 0, 2),
  },
});

class Dashboard extends Component {
  componentDidMount() {
    const { fetch, fetchServices, fetchAntispam, fetchAbout, config } = this.props;
    fetch().catch((msg) => this.setState({ snackbar: msg }));
    fetchServices().catch((msg) => this.setState({ snackbar: msg }));
    if(config?.loadAntispamData) fetchAntispam().catch((msg) => this.setState({ snackbar: msg }));
    fetchAbout().catch((msg) => this.setState({ snackbar: msg }));
    this.fetchDashboard();
  }

  state = {
    snackbar: null,
  };

  fetchInterval = null;

  fetchDashboard() {
    this.fetchInterval = setInterval(() => {
      this.props.fetch().catch((msg) => this.setState({ snackbar: msg }));
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.fetchInterval);
  }

  render() {
    const {
      classes,
      t,
      cpuPercent,
      cpuPie,
      memory,
      memoryPie,
      disks,
      load,
      timer,
      statistics,
      config,
    } = this.props;
    const { snackbar } = this.state;

    const totalCpuUsage = cpuPie.values.slice(0, 4).reduce((pv, cv) => pv + cv, 0).toFixed(1);

    return (
      <div className={classes.root}>
        <TopBar />
        <div className={classes.toolbar} />
        {config?.loadAntispamData && <Typography variant="h2" className={classes.pageTitle}>
          {t("Mail filter statistics")}
          <IconButton
            size="small"
            href="https://docs.grommunio.com/admin/administration.html#antispam"
            target="_blank"
          >
            <HelpOutline fontSize="small"/>
          </IconButton>
        </Typography>}
        {config?.loadAntispamData && <Typography variant="caption" className={classes.subtitle}>
          {t("mailfilter_sub")}
        </Typography>}
        <div className={classes.dashboardLayout}>
          {config?.loadAntispamData && <div className={classes.antispam}>
            <AntispamStatistics data={statistics}/>
          </div>}
          <div className={classes.services}>
            <ServicesChart/>
          </div>
          <div className={classes.headline}>
            <Typography variant="h2" className={classes.pageTitle}>
              {t("Performance")}
              <IconButton
                size="small"
                href="https://docs.grommunio.com/admin/administration.html#services"
                target="_blank"
              >
                <HelpOutline fontSize="small"/>
              </IconButton>
            </Typography>
            <Typography variant="caption" className={classes.subtitle}>
              {t("performance_sub")}
            </Typography>
          </div>
          <div className={classes.cpu}>
            <Paper elevation={1} className={classes.donutAndLineChart}>
              <div className={classes.donutChart}>
                <Typography className={classes.chartTitle}>
                  {`${t("CPU")}: ${totalCpuUsage || 0}%`}
                </Typography>
                <CPUPie cpuPie={cpuPie} />
              </div>
              <div className={classes.lineChart}>
                <CPULine cpuPercent={cpuPercent}/>
              </div>
            </Paper>
          </div>
          <div className={classes.memory}>
            <Paper elevation={1} className={classes.donutAndLineChart}>
              <div className={classes.donutChart}>
                <Typography className={classes.chartTitle}>
                  {`${t("Memory")}: ${memory.percent[memory.percent.length - 1] || 0}%`}
                </Typography>
                <MemoryPie memoryPie={memoryPie}/>
              </div>
              <div className={classes.lineChart}>
                <MemoryLine memory={memory}/>
              </div>
            </Paper>
          </div>
          <div className={classes.swap}>
            <Paper elevation={1} className={classes.donutAndLineChart}>
              <div className={classes.fullChart}>
                <Disks disks={disks} timer={timer}/>
              </div>
            </Paper>
          </div>
          <div className={classes.disk}>
            <Load load={load}/>
          </div>
        </div>
        <Typography variant="h2" className={classes.pageTitle}>
          {t("Versions")}
        </Typography>
        <About />
        <Feedback
          snackbar={snackbar}
          onClose={() => this.setState({ snackbar: "" })}
        />
      </div>
    );
  }
}

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  fetch: PropTypes.func.isRequired,
  fetchServices: PropTypes.func.isRequired,
  fetchAntispam: PropTypes.func.isRequired,
  fetchAbout: PropTypes.func.isRequired,
  cpuPercent: PropTypes.object.isRequired,
  cpuPie: PropTypes.object.isRequired,
  disks: PropTypes.array.isRequired,
  memory: PropTypes.object.isRequired,
  memoryPie: PropTypes.object.isRequired,
  statistics: PropTypes.object.isRequired,
  config: PropTypes.object.isRequired,
  load: PropTypes.array.isRequired,
  timer: PropTypes.number,
};

const mapStateToProps = (state) => {
  const { load, disks, Dashboard, timer } = state.dashboard;
  const { cpuPercent, cpuPie, memory, memoryPie } = Dashboard;
  return {
    cpuPercent, cpuPie, disks, memory, memoryPie, load, timer,
    ...state.antispam,
    config: state.config,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetch: async () =>
      await dispatch(fetchDashboardData()).catch((error) =>
        Promise.reject(error)
      ),
    fetchServices: async () =>
      await dispatch(fetchServicesData()).catch((error) =>
        Promise.reject(error)
      ),
    fetchAntispam: async () =>
      await dispatch(fetchAntispamData()).catch((error) =>
        Promise.reject(error)
      ),
    fetchAbout: async () => await dispatch(fetchAboutData())
      .catch(err => Promise.reject(err)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(withStyles(styles)(Dashboard)));
