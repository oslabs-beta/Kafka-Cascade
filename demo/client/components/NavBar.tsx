import * as React from 'react';
import { FC } from 'react';
import {
  createStyles, makeStyles, withStyles, AppBar, Toolbar, IconButton, Button, Icon,
} from '@material-ui/core';
import { Link } from 'react-scroll';

const useStyles = makeStyles(() => createStyles({
  root: {
    width: '80vw',
    padding: 0,
  },
  landingButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  logo: {
    alignSelf: 'flex-start',
  },
  button: {
    margin: '1rem 1rem 1rem 1rem',
  },
}));

const NavBar: FC = () => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <AppBar>
        <Toolbar className={classes.landingButtons}>
          <IconButton className={classes.button}>
            <Icon
              component={Link}
              to="landing"
              activeClass="active"
              smooth="easeInOutQuint"
            >
              <img alt="icon" src="./../assets/favIcon.png" />
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
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default NavBar;