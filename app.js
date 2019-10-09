'use strict';
const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const bearerToken = require('express-bearer-token');

const apiRouter = require('./routes/api');

const app = express();
app.use(bearerToken());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.options('*', cors());
app.use(logger('dev'));

app.use('/', apiRouter);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  console.log(JSON.stringify(err));
  res.status(err.status || 500).send(err.message);
});

module.exports = app;
