import React, { FC } from 'react';
import {
  Container, Typography, makeStyles,
  createStyles, Button, Card, CardContent,
} from '@material-ui/core';

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
      width: '80%',
    },
    root: {
      backgroundColor: 'rgba(211,211,211)',
      margin: '5px',
      minWidth: 'md',
    },
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
        <br />
        <Card className={classes.root}>
          <CardContent>
            <code>{'npm install kafka-cascade'}</code>
          </CardContent>
        </Card>
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
              style={{textTransform: 'lowercase'}}
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