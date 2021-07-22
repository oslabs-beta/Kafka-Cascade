import React, {FC, useState} from 'react';
import { RadioButtonGroup } from '../components/RadioButtonGroup';
import { MessageSlider } from '../components/MessageSlider';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import socket from '../socket';
import { RetryLevelTextField } from '../components/RetryLevelTextField';
import './OptionContainer.scss';
import { colors } from '@material-ui/core';

export const OptionContainer: FC<any> = (props:any) => {
  //number of retry levels
  const [numberOfRetries, setNumberOfRetries] = useState<any>(5)
  //set the maximum number of retry level
  const [retryLevelLIMIT, setRetryLevelLimit] = useState<Number>(10);
  //retry types
  const [retryType, setRetryType] = useState<any>({
    fastRetry: true,
    timeout: false,
    batching: false,
  });
  //contains the number of messages that needs to be sent per second
  const [messagesPerSecond, setMessagesPerSecond] = useState<any>(1);
  //contains each retry level 
  const [timeoutLimitArray, setTimeoutLimitArray] = useState<Number[]>([1000, 2000, 4000, 8000, 16000]);
  const [batchLimitArray, setBatchLimitArray] = useState<Number[]>([6,6,6,6,6]);
  //Toggle visibility for retry option menu
  const [retryOptionToggle, setRetryOptionToggle] = useState<boolean>(false);
  //used to toggle option buttons when demo starts AND used to prevent user from changing retry option
  const [isStarted, setIsStarted] = useState<boolean>(false);
  //used to pause and resume demo
  const [isPaused, setIsPaused] = useState<boolean>(false);
  //defaultParams, used by resetHandler
  const [defaultParams, isDefaultParams] = useState<any>({numberOfRetries, retryType, timeoutLimitArray, batchLimitArray})


  //used by RadioButtonGroup component, changes the type of retry
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //prevents user from making change after starting the demo
    if(isStarted) return;
    let newRetryType = {...retryType};
    newRetryType = {
      fastRetry: false,
      timeout: false,
      batching: false,
    }
    newRetryType[(event.target as HTMLInputElement).value] = true;
    setRetryType(newRetryType);
  };

  //used by start button, initilize the options to the backend
  const startHandler = () => {
    if(!isStarted){
      setRetryOptionToggle(false);
      let options: any;
      if(retryType.fastRetry) options = {};
      else if(retryType.timeout) options = {timeoutLimit: timeoutLimitArray.map(t => Number(t))};
      else options = {batchLimit: batchLimitArray.map(b => Number(b))};
      socket.sendEvent('start', {retries: Number(numberOfRetries), options});
      setIsStarted(true);
    }
  }

  //pause
  const pauseHandler = () => {
    if(!isPaused){
      socket.sendEvent('pause', {});
      setIsPaused(true);
    }
  }
  //resume
  const resumeHandler = () => {

    if(isPaused){
      socket.sendEvent('resume', {});
      setIsPaused(false);
    }
  }

  //stops the current session
  const stopHandler = () => {
    if(isStarted){ 
      socket.sendEvent('stop', {});
      setIsStarted(false);
    }
  }

  //reset
  const resetHandler = () => {
    if(isStarted) return;
    setNumberOfRetries(defaultParams.numberOfRetries);
    setRetryType(defaultParams.retryType);
    setTimeoutLimitArray(defaultParams.timeoutLimitArray);
    setBatchLimitArray(defaultParams.batchLimitArray)
    setRetryOptionToggle(false);
  }

  //set the number of messages sent
  const setMessagesPerSecondHandler = (event: any, rate: number) => {
    setMessagesPerSecond(rate);
    socket.sendEvent('set_rate', {rate});
  }

  //toggles visibility of the retry option menu
  const toggleRetryOptionContainer = () => {
    setRetryOptionToggle(!retryOptionToggle);
  }

  //updates the number of retrys
  const updateNumberOfRetriesHandler = (event) => {
    //prevents user from making change after starting the demo
    let value = event.target.value;
    if(isStarted || value < 0 || value > retryLevelLIMIT || value === '-'){ 
      event.target.value = event.target.defaultValue;
    }
    else {
      event.target.defaultValue = value;
      setNumberOfRetries(event.target.value);
      if(timeoutLimitArray.length > value){
        setTimeoutLimitArray(timeoutLimitArray.slice(0,value))
        setBatchLimitArray(batchLimitArray.slice(0,value))
      }
      else{
        for(let i = timeoutLimitArray.length; i < value; i++){
          timeoutLimitArray.push(1000);
          batchLimitArray.push(1);
        }
      }
    }
  }

  //updates the value of a retry level from the option menu
  const updateLimitArrayHandler = (event, index) => {
    //prevents user from making change after starting the demo
    let value = event.target.value;
    if(isStarted || value < 0 || value === '-'){
      event.target.value = event.target.defaultValue;
      return;
    } else if(value > 0){
      event.target.defaultValue = event.target.value;
      if(retryType.timeout){
        setTimeoutLimitArray(() => {let copy = timeoutLimitArray; copy[index] = parseInt(event.target.value); return copy})
      }
      if(retryType.batching) {
        setBatchLimitArray(() => {let copy = batchLimitArray; copy[index] = parseInt(event.target.value); return copy})
      }
    }
  }

  //used to pick which type of retry level option to display
  let retryLevels:any[] = [];
  //contains rows for each retry level for timeout option
  let timeoutRetryLevel = [];
  //contains rows for each retry level for batching option
  let batchRetryLevel = [];

  //constructs each component rows for timeout and batching
  for(let i = 0; i < numberOfRetries; i++){
    timeoutRetryLevel.push(
      <RetryLevelTextField key={`${i}RetryLevelTimeout`} index={i} value={timeoutLimitArray} updateLimitArrayHandler={updateLimitArrayHandler} />
    )
    batchRetryLevel.push(
      <RetryLevelTextField key={`${i}RetryLevelBatch`} index={i} value={batchLimitArray} updateLimitArrayHandler={updateLimitArrayHandler} />
    )
  }

  //handles setting the correct retry level rows inside of retryLevels
  if(!retryType.fastRetry){
    if(retryType.timeout) retryLevels = timeoutRetryLevel;
    else retryLevels = batchRetryLevel;
  }
  else{
    retryLevels = [];
  }

  //container for retry level rows
  let retryLevelsContainer = <div></div>;
  //Makes retryLevelsContainer into a scrollable box if option is timeout or batching
  if(retryLevels.length) retryLevelsContainer = <div className='frame'>{retryLevels}</div>

  //Handles hidding and showing the option menu for retry level
  let retryOptionContainer = <div></div>;
  //if option button is clicked, retry options are added onto retryOptionContainer
  if(retryOptionToggle){
    retryOptionContainer = (
      <div className="retryOptionContainer">
        <div className="retryOptionLeftBox">
          <Box className='numberOfRetriesContainer' m={2}>
            <TextField
              className='textField'
              id="filled-number"
              label="Number of Retries"
              type="number"
              variant="outlined"
              fullWidth={true}
              InputLabelProps={{
                shrink: true,
              }}
              defaultValue = {numberOfRetries}
              inputProps={{ min: 0, max: retryLevelLIMIT}}
              onChange={updateNumberOfRetriesHandler}
              onWheel={(event:any) => {event.target.blur()}}
            />
          </Box>
          <RadioButtonGroup retryType={retryType} setRetryType={setRetryType} handleChange={handleChange}/>
        </div>
        <div className='frameContainer'>
          {retryLevelsContainer}
        </div>
      </div>
    )
  }


  let startPauseResumeToggle;
  let resetStopToggle;
  //Toggles different types of button depending on the mode of isStarted and isPaused
  if(isStarted){
    resetStopToggle = <Box m={2}><Button className='stopButton' variant="contained" color="primary" onClick={stopHandler}>Stop</Button></Box>
    if(isPaused)
      startPauseResumeToggle = <Box m={2}><Button className='resumeButton' variant="contained" color="primary" onClick={resumeHandler}>Resume</Button></Box>
    else
      startPauseResumeToggle = <Box m={2}><Button className='pauseButton' variant="contained" color="primary" onClick={pauseHandler}>Pause</Button></Box>
  }
  else{
    resetStopToggle = <Box m={2}><Button className='resetButton' variant="contained" color="primary" onClick={resetHandler}>Reset</Button></Box>
    startPauseResumeToggle = <Box m={2}><Button className='startButton' variant="contained" color="primary" onClick={startHandler}>Start</Button></Box>
  }

  return (
    <div className='optionContainer'>
      <div className='buttonsContainer'>
        {startPauseResumeToggle}
        {resetStopToggle}
        <Box m={2}>
          <Button
            className='optionButton'
            variant="contained"
            color="secondary"
            onClick={toggleRetryOptionContainer}
            >Options
          </Button>
        </Box>
      </div>
      {retryOptionContainer}
      <div className='messageSliderContainer'>
        <MessageSlider messagesPerSecond={messagesPerSecond} setMessagesPerSecondHandler={setMessagesPerSecondHandler}/>
      </div>
    </div>
  )
}