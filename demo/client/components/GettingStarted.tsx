import React, { FC } from 'react';
import {
  Container, Typography, Divider, makeStyles,
  createStyles, Button, Theme, FormHelperText,
} from '@material-ui/core';
import { shadows } from '@material-ui/system';

const GettingStarted: FC = () => {

  const useStyles = makeStyles(() => createStyles({
    button: {
      margin: '1rem 1rem 1rem 1rem',
    },
    buttonsContainer: {
      display: 'flex',
      justifyContent: 'center',
    },
    wrapper: {
      display: 'flex',
      flexDirection: 'column',
      justifyItems: 'center',
      alignItems: 'center',
    },
    card: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      alignContent: 'center',
      justifyContent: 'space-between',
      marginTop: '3vh',
      backgroundColor: 'rgba(225, 218, 232)',
      paddingTop: '2vh',
      paddingBottom: '2vh',
      width: '75%',
    }
  }))

  const classes = useStyles();

  return (
    <Container className={classes.wrapper}>
      <Typography
        variant="h4"
        color="textPrimary"
        align="center"
        gutterBottom
      >
        Getting Started
      </Typography>
      <Container className={classes.card}>
        <Typography color="textSecondary" gutterBottom>
            Install the Kafka-Cascade library from npm to add message retry
            handling to your KafkaJS project
        </Typography>
        <Container className={classes.buttonsContainer}>
          <Button
              className={classes.button}
              variant="contained"
              color="primary"
              target="_blank"
              href="https://github.com/oslabs-beta/Kafka-Cascade"
            >
              Github
          </Button>
          <Button
              className={classes.button}
              variant="contained"
              color="primary"
              target="_blank"
              href="https://www.npmjs.com/package/kafka-cascade"
            >
              npm
          </Button>
        </Container>
      </Container>
    </Container>
  );

}

export default GettingStarted;