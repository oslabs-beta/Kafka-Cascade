const express = require('express');
import cascadeController from './controllers/cascadeController';
const path = require ('path');

const PORT = 3000;
const app = express();

app.use(express.json());

app.get('/', (req, res)=>{
  res.status(200).sendFile(path.join(__dirname, '../index.html'));
});

app.get('/dist/bundle.js', (req, res)=>{
  res.status(200).sendFile(path.join(__dirname, '../dist/bundle.js'));
});

app.use(express.static('assets'));
app.use('/doc', express.static(path.join(__dirname, '../../docs')));

// start service
app.post('/start', cascadeController.startService, (req, res) => {
  res.status(200).send(res.locals);
});

// send message
app.post('/send',cascadeController.sendMessage, (req, res) => {
  res.status(200).json(res.locals);
});

// stop server
app.post('/stop', cascadeController.stopService, (req, res) => {
  console.log('Shutting down server...');
  res.status(200).send('Server closed');
  /**
   * Kafka-Cascade library currently has no way to shut itself down
   */
  server.close();
});

app.get('/favicon.ico', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, '../assets/favicon.ico'));
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).send('Not found');
});

// global error handler
app.use((err, req, res, next) => {
  console.log('Error: ' + (err.log || 'unknown error occured'));
  res.status(err.status || 500).send(err.message || 'unknown error');
});

// start server
const server = app.listen(PORT, () => {
  console.log('Listening to PORT ', PORT);
});
