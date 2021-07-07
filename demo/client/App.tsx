import React, { FC, useState } from 'react';
import { OptionContainer } from './containers/OptionContainer';
import { CascadeChart } from './components/CascadeChart';

// import './app.scss';

interface AppProps {
  
}

interface AppState {

}

export const App: FC<AppProps> = () => {

    return (
      <div className='app'>
        <h1>Kafka Cascade Demo</h1>
        <OptionContainer />
        <CascadeChart /> 
      </div>
    );
}