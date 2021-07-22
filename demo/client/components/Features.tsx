import React, { FC } from 'react';
import {
    Container, Typography, makeStyles, createStyles,
  } from '@material-ui/core';
import FastForwardIcon from '@material-ui/icons/FastForward';
import TimerIcon from '@material-ui/icons/Timer';
import ViewComfyIcon from '@material-ui/icons/ViewComfy';

const Features: FC = () => {
  const useStyles = makeStyles(() => createStyles ({
    wrapper: {
      display: 'flex',
      flexDirection: 'column',
      justifyItems: 'center',
      alignItems: 'center',
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      alignContent: 'center',
      justifyContent: 'space-between',
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
    icon: {
      fontSize: '2vh',
      padding: '2vh',
    }
  }))
  
  const classes = useStyles();

  const descriptionText = 'Kafka-Cascade is a lightweight npm library that adds message reprocessing and DLQ handling to KafkaJS.'
  const fastText = 'Fast retry will resend failed messages as quickly as possible until the retry limit is reached.'
  const timeText = 'Time delay allows the user to define an array of time delays for every retry level.'
  const batchText = 'Batch retry will accumulate messages to a user-defineable limit and then resend all messages as a batch.'
  
  return (
    <Container className={classes.wrapper}>
      <Typography 
        variant="h4"
        color="textPrimary"
        align="center"
        gutterBottom
      >
        Features
      </Typography>
      <Container className={classes.container}>
        <Container className={classes.card}>
          <Typography color="textPrimary">
            {descriptionText}
          </Typography>
        </Container>
        <Container className={classes.card}>
          <Typography color="textPrimary">
            Fast Retry Strategy
          </Typography>
          <FastForwardIcon className={classes.icon}/>
          <Typography color="textSecondary">
            {fastText}
          </Typography>
        </Container>
        <Container className={classes.card}>
          <Typography color="textPrimary">
            Time Delay Strategy
          </Typography>
          <TimerIcon className={classes.icon}/>
          <Typography color="textSecondary">
            {timeText}
          </Typography>
        </Container>
        <Container className={classes.card}>
          <Typography color="textPrimary">
            Batch Retry Strategy
          </Typography>
          <ViewComfyIcon className={classes.icon}/>
          <Typography color="textSecondary">
            {batchText}
          </Typography>
        </Container>
      </Container>
    </Container>    
  )
}

export default Features; 