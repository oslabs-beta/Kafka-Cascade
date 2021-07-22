import React, { FC } from 'react';
import {
  createStyles, makeStyles, Container,
} from '@material-ui/core';
import Features from '../components/Features';

const useStyles = makeStyles(() => createStyles({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'space-between',
  },
}));

const FeaturesContainer: FC = () => {

  const classes = useStyles();

  return (
    <Container className={classes.container}>
      <Features />
    </Container>
  );

};

export default FeaturesContainer;