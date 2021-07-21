require('dotenv').config();
const express = require('express');
import cascadeController from './controllers/cascadeController';
const path = require ('path');
const favicon = require('serve-favicon');
const https = require('https');
const fs = require('fs');

const PORT = process.env.APP_PORT;
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
app.use(favicon(path.resolve(__dirname, '../assets/favicon.ico')));

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

// 404 handler
app.use('*', (req, res) => {
  res.status(404).send('Cannot find ' + req.baseUrl);
});

// global error handler
app.use((err, req, res, next) => {
  console.log('Error: ' + (err.log || 'unknown error occured'));
  res.status(err.status || 500).send(err.message || 'unknown error');
});

// start server
var server = https.createServer({
  key: fs.readFileSync(process.env.SERVER_KEY),
  cert: fs.readFileSync(process.env.SERVER_CERT),
}, app).listen(PORT, () => {
  console.log('Listening to PORT ', PORT);
});
