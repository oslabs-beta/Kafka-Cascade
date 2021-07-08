import React, {FC, useState} from 'react';
import { RadioButtonGroup } from '../components/RadioButtonGroup';
import { MessageSlider } from '../components/messageSlider'
import socket from '../socket';;


export const OptionContainer: FC<any> = (props:any) => {
  const [numberOfRetries, setNumberOfRetries] = useState<any>(5)
  const [retryType, setRetryType] = useState<any>({
    fastRetry: true,
    timeout: false,
    batching: false,
  });
  const [messagesPerSecond, setMessagesPerSecond] = useState<any>(1);

  const startHandler = () => {
    let type: any;
    if(retryType.fastRetry) type = {};
    else if(retryType.timeout) type = {timeout: [1000, 2000, 4000, 8000, 16000, 32000]};
    else type = {batch: 6}
    socket.sendEvent('start', {retries: numberOfRetries, type});
  }

  const endHandler = () => {
    socket.sendEvent('stop', {});
  }

  const setMessagesPerSecondHandler = (event: any, value: number) => {
    setMessagesPerSecond(value);
  }


  return (
    <div className='optionContainer'>
      <div className='buttonsContainer'>
        <button className='startButton' onClick={startHandler}>Start</button>
        <button className='endButton' onClick={endHandler}>End</button>
        <RadioButtonGroup retryType={retryType} setRetryType={setRetryType}/>
      </div>
      <div className='messageSliderContainer'>
        <MessageSlider messagesPerSecond={messagesPerSecond} setMessagesPerSecondHandler={setMessagesPerSecondHandler}/>
      </div>
    </div>
  )
}