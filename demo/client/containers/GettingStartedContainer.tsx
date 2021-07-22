import React, { FC } from 'react';
import {
    createStyles, makeStyles, Container,
  } from '@material-ui/core';
import GettingStarted from '../components/GettingStarted'

  const useStyles = makeStyles(() => createStyles({
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignContent: 'space-between',
    },
  }));

  const GettingStartedContainer: FC = () => {
      const classes = useStyles();

      return (
        <Container className={classes.container}>
          <GettingStarted />
        </Container>
      );
  };

  export default GettingStartedContainer;