import React, {FC, useState} from 'react';
import { RadioButtonGroup } from '../components/RadioButtonGroup';
import { MessageSlider } from '../components/messageSlider'
import socket from '../socket';;


export const OptionContainer: FC<any> = (props:any) => {
  const [numberOfRetries, setNumberOfRetries] = useState<any>(5)
  const [retryTypes, setRetryTypes] = useState<any>({
    fastRetry: true,
    timeout: false,
    batching: false,
  });
  const [messagesPerSecond, setMessagesPerSecond] = useState<any>(1);

  const startHandler = () => {
    //checking option
    // let type = retryTypes.fastRetry ? {} : retryTypes.timeout ? 
    //   {timeout: [2000, 4000, 8000, 16000, 32000]} : {batching: 5};

    // socket.sendEvent('start', {retries: numberOfRetries, type})
    
    
  }

  const endHandler = () => {

  }

  const setMessagesPerSecondHandler = (event: any) => {
    console.log(event.target.value);
  }


  return (
    <div className='optionContainer'>
      <div className='buttonsContainer'>
        <button className='startButton' onClick={startHandler}>Start</button>
        <button className='endButton' onClick={endHandler}>End</button>
        <RadioButtonGroup retryTypes={retryTypes} setRetryTypes={setRetryTypes}/>
      </div>
      <div className='messageSliderContainer'>
        <MessageSlider messagesPerSecond={messagesPerSecond} setMessagesPerSecondHandler={setMessagesPerSecondHandler}/>
      </div>
    </div>
  )
}