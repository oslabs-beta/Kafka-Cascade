import React, { FC } from 'react';
import {
  createStyles, makeStyles, Container,
} from '@material-ui/core';
import About from '../components/About'

const useStyles = makeStyles(() => createStyles({
  container: {
    display: 'flex',
  }
}));

const AboutContainer: FC = () => {

  const classes = useStyles();

  return (
    <Container className={classes.container}>
      <About />
    </Container>
  );
};

export default AboutContainer;