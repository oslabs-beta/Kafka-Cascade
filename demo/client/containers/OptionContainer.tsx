import React, {FC, useState} from 'react';
import { RadioButtonGroup } from '../components/RadioButtonGroup';
import { MessageSlider } from '../components/messageSlider';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import socket from '../socket';

import './OptionContainer.scss';

export const OptionContainer: FC<any> = (props:any) => {
  const [numberOfRetries, setNumberOfRetries] = useState<any>(5)
  const [retryType, setRetryType] = useState<any>({
    fastRetry: true,
    timeout: false,
    batching: false,
  });
  const [messagesPerSecond, setMessagesPerSecond] = useState<any>(1);

  const startHandler = () => {
    let options: any;
    if(retryType.fastRetry) options = {};
    else if(retryType.timeout) options = {timeoutLimit: [1000, 2000, 4000, 8000, 16000, 32000]};
    else options = {batchLimit: [6,6,6,6,6,6]}
    socket.sendEvent('start', {retries: numberOfRetries, options});
  }

  const endHandler = () => {
    socket.sendEvent('stop', {});
  }

  const setMessagesPerSecondHandler = (event: any, rate: number) => {
    setMessagesPerSecond(rate);
    socket.sendEvent('set_rate', {rate});
  }


  return (
    <div className='optionContainer'>
      <div className='buttonsContainer'>
        <Box m={2}>
          <Button
            className='startButton'
            variant="contained"
            color="primary"
            onClick={startHandler}
            >Start
          </Button>
        </Box>
        <Box m={2}>
          <Button
            className='endButton'
            variant="contained"
            color="secondary"
            onClick={endHandler}
            >End
          </Button>
        </Box>
        <div className='spacer'></div>
        <RadioButtonGroup retryType={retryType} setRetryType={setRetryType}/>
      </div>
      <div className='messageSliderContainer'>
        <MessageSlider messagesPerSecond={messagesPerSecond} setMessagesPerSecondHandler={setMessagesPerSecondHandler}/>
      </div>
    </div>
  )
}