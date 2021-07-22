require('dotenv').config();
const express = require('express');
import { heartbeat } from './controllers/cascadeController';
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
https.createServer({
  key: fs.readFileSync(process.env.SERVER_KEY),
  cert: fs.readFileSync(process.env.SERVER_CERT),
}, app).listen(PORT, () => {
  console.log(`Listening to PORT ${PORT}...`);
});


const httpApp = express();
const HTTP_PORT = process.env.HTTP_PORT;
httpApp.get('/', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.status(301).send(Buffer.from('<html><head></head><body><script>window.location.replace("https://' + process.env.DOMAIN + ':' + PORT + '");</script></body><html>'));
});

httpApp.listen(HTTP_PORT, () => {
  console.log(`http redirect listening on port ${HTTP_PORT}...`);
});

heartbeat();