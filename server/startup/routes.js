const cookieParser = require('cookie-parser');
const express = require('express');
const morgan = require('morgan');
const userRouter = require('../routes/userRoute');




module.exports = function(app) {
  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(morgan('dev'));
  app.use(express.json({
    limit: '50mb'
  }));
  app.use(express.urlencoded({extended: true}));
  app.use(cookieParser(process.env.JWT_SECRET));
  app.use('/', userRouter);
};
