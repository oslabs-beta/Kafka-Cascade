import React, { FC, useState } from 'react';
// import './app.scss';

interface AppProps {
  
}

interface AppState {
  message: string,
  topic: string,
}

export const App: FC<AppProps> = () => {
  const [message, setMessage] = useState<string>('');
  const [topic, setTopic] = useState<string>('');

  const submitData = () => {
    // fetch request to server delivering message, topic, and retry parameters

    // 

  }

    return (
      <div>
        <div className='app'>
          <h1>Test App</h1>
        </div>
        <div>
          <form>
            <label>
              Input Message Here
              <input
                type="text"
                onChange={(e) => setMessage(e.target.value)}
              /> 
            </label>
            <label>
              Input Topic Here 
              <input
                type = 'text'
                onChange={(e) => setTopic(e.target.value)}
              />
            </label>
          </form>
        </div>
        <div>
          <button onClick={() => submitData()}>
            Start Cascade!
          </button>
        </div>
      </div>
    );
}