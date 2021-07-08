import React, { FC, useState } from 'react';
import { OptionContainer } from './containers/OptionContainer';
import { CascadeChart } from './components/CascadeChart';
import socket from './socket';

// import './app.scss';

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
  else return (
    <div className='app'>
      <h1>Kafka Cascade Demo</h1>
      <OptionContainer />
      <CascadeChart /> 
    </div>
  );
}