import * as React from 'react';
import { FC } from 'react';
import {
  createStyles, makeStyles, withStyles, createTheme, AppBar, Toolbar, IconButton, Button, Icon, ThemeProvider,
} from '@material-ui/core';
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
  return (
    <div className={classes.root}>
      <AppBar>
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
                height: '7vh',
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
      </AppBar>
    </div>
  );
};

export default NavBar;