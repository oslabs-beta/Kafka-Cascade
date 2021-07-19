import React, { FC, useState } from 'react';
import { OptionContainer } from './containers/OptionContainer';
import FeaturesContainer from './containers/FeaturesContainer';
import AboutContainer from './containers/AboutContainer';
import GettingStartedContainer from './containers/GettingStartedContainer';
import { CascadeChart } from './components/CascadeChart';
import NavBar from './components/NavBar';
import socket from './socket';
import { Element } from 'react-scroll';
import {
  createStyles, makeStyles, Typography, Container,
} from '@material-ui/core';
import { createTheme, ThemeProvider } from '@material-ui/core/styles'

import './App.scss';

const theme = createTheme({
    palette: {
      primary: {
        main:'#440057'
      },
      secondary: {
        main: '#efde46'
      },
    },
});

const useStyles = makeStyles(() => createStyles({
  landing: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '20vh',
    paddingBottom: '10vh',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '3vh',
    paddingBottom: '3vh',
  },
}));

interface AppProps {
  
}

interface AppState {
  loading:string,
}

export const App: FC<AppProps> = () => {
  const [state, setState] = useState<AppState>({loading:'start'})

  if(state.loading === 'start') {
    socket.connect()
      .then(res => setState({loading:'ready'}))
      .catch(error => {
        console.log('Error connecting to websocket server:', error);
        setState({loading:'error'});
      });
    setState({loading:'loading'});
  }

  if(state.loading === 'loading') {
    return (
      <h1>Loading...</h1>
    );
  }
  else if(state.loading === 'error') {
    return (
      <p>Error occured connecting to websocket server, make sure the server port is accessible</p>
    );
  }
  else {
    const classes = useStyles();
    return (
  <ThemeProvider theme={theme}>    
    <Container className="app" maxWidth="lg">
      <NavBar />
      <Container className={classes.landing} component={Element} name="landing">
        <Typography
          variant="h2"
          align="center"
          color="textPrimary"
          gutterBottom
        >
          Kafka Cascade
        </Typography>
        <Typography
          variant="h4"
          align="center"
          color="textSecondary"
          gutterBottom
        >
          Message Reprocessing Library for KafkaJS
        </Typography>
      </Container>
      <Container className={classes.container} component={Element} name="features">
        <FeaturesContainer/>
      </Container>
      <Container className={classes.container} component={Element} name="getting started">
        <GettingStartedContainer/>
      </Container>
      <Container className={classes.container} component={Element} name="web demo">
        <Typography
          variant="h3"
          align="center"
          color="textPrimary"
          gutterBottom
        >
          Web Demo
        </Typography>
        <OptionContainer />
        <CascadeChart />
      </Container>
      <Container className={classes.container} component={Element} name="about">
        <AboutContainer/>
      </Container>
    </Container>
  </ThemeProvider>
  );
  }
}