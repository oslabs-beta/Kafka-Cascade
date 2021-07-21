import * as React from 'react';
import { FC, useState, useEffect } from 'react';
import {
  createStyles, makeStyles, AppBar, Toolbar, IconButton,
  Button, Icon, Drawer,
} from '@material-ui/core';
import MenuIcon from "@material-ui/icons/Menu";
import { Link } from 'react-scroll';

const useStyles = makeStyles(() => createStyles({
  root: {
    width: '80vw',
    padding: 0,
  },
  landingButtons: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  drawerButtons: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  logo: {
    alignSelf: 'flex-start',
  },
  button: {
    margin: '1rem 1rem 1rem 1rem',
  },
}));

const iconStyle = makeStyles(() => createStyles({
  root:{
    overflow: 'visible',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  }
}));

const goToDocs = () => {
  window.location.href = '/doc/index.html';
}

const NavBar: FC = () => {
  const classes = useStyles();
  const iconClass = iconStyle();

  const [state, setState] = useState({
    mobileView: false,
    drawerOpen: false,
  });

  const { mobileView, drawerOpen } = state;

  useEffect(() => {
    const setResponsiveness = () => {
      return window.innerWidth < 600 || screen.availWidth < 600
        ? setState((prevState) => ({ ...prevState, mobileView: true }))
        : setState((prevState) => ({ ...prevState, mobileView: false }));
    };

    setResponsiveness();
    window.addEventListener("resize", () => setResponsiveness());

    return () => {
      window.removeEventListener("resize", () => setResponsiveness());
    }
  }, []);

  const displayDesktop = () => {
    return (
      <Toolbar className={classes.landingButtons}>
        <IconButton className={classes.button}>
          <Icon
          className={iconClass.root}
            component={Link}
            to="landing"
            activeClass="active"
            smooth="easeInOutQuint"
          >
            <img 
            alt="icon" 
            style={{
              height: '5vh',
            }}
            src="favIconLarger.png" />
          </Icon>
        </IconButton>
        <Button
          className={classes.button}
          component={Link}
          to="features"
          activeClass="active"
          offset={-75}
          color="inherit"
          smooth="easeInOutQuint"
        >
          Features
        </Button>
        <Button
          className={classes.button}
          component={Link}
          to="getting started"
          activeClass="active"
          offset={-75}
          color="inherit"
          smooth="easeInOutQuint"
        >
          Getting Started
        </Button>
        <Button
          className={classes.button}
          component={Link}
          to="web demo"
          activeClass="active"
          offset={-75}
          color="inherit"
          smooth="easeInOutQuint"
        >
          Web Demo
        </Button>
        <Button
          className={classes.button}
          component={Link}
          to="about"
          activeClass="active"
          offset={-75}
          color="inherit"
          smooth="easeInOutQuint"
        >
          About
        </Button>
        <Button
          className={classes.button}
          component={Link}
          activeClass="active"
          offset={-75}
          color="inherit"
          smooth="easeInOutQuint"
          onClick={goToDocs}
        >
          Documentation
        </Button>
      </Toolbar>
    );
  };

  const displayMobile = () => {
    const handleDrawerOpen = () =>
      setState((prevState) => ({ ...prevState, drawerOpen: true }));
    const handleDrawerClose = () =>
      setState((prevState) => ({ ...prevState, drawerOpen: false }));

    return (
      <Toolbar className={classes.landingButtons}>
        <IconButton
          {...{
            edge: "start",
            color: "inherit",
            "aria-label": "menu",
            "aria-haspopup": "true",
            onClick: handleDrawerOpen,
          }}
        >
          <MenuIcon />
        </IconButton>
        <Drawer
          {...{
            anchor: "left",
            open: drawerOpen,
            onClose: handleDrawerClose,
          }}
        >
          <div className={classes.drawerButtons}>
            <Button
              className={classes.button}
              component={Link}
              to="features"
              activeClass="active"
              color="inherit"
              smooth="easeInOutQuint"
            >
              Features
            </Button>
            <Button
              className={classes.button}
              component={Link}
              to="getting started"
              activeClass="active"
              color="inherit"
              smooth="easeInOutQuint"
            >
              Getting Started
            </Button>
            <Button
              className={classes.button}
              component={Link}
              to="web demo"
              activeClass="active"
              color="inherit"
              smooth="easeInOutQuint"
            >
              Web Demo
            </Button>
            <Button
              className={classes.button}
              component={Link}
              to="about"
              activeClass="active"
              color="inherit"
              smooth="easeInOutQuint"
            >
              About
            </Button>
            <Button
              className={classes.button}
              component={Link}
              activeClass="active"
              color="inherit"
              smooth="easeInOutQuint"
              onClick={goToDocs}
            >
              Documentation
            </Button>
          </div>
        </Drawer>
        <IconButton className={classes.button}>
          <Icon
          className={iconClass.root}
            component={Link}
            to="landing"
            activeClass="active"
            smooth="easeInOutQuint"
          >
            <img 
            alt="icon" 
            style={{
              height: '3vh',
            }}
            src="favIconLarger.png" />
          </Icon>
        </IconButton>
      </Toolbar>
    );
  };

  return (
    <div className={classes.root}>
      <AppBar>
        {mobileView ? displayMobile() : displayDesktop()}
      </AppBar>
    </div>
  );
};

export default NavBar;