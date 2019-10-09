'use strict';
const express = require('express');
const router = express.Router();
const controllers = require('../controllers/api');
const {isAuthenticated} = require('../controllers/auth');
const isExpired = controllers.isExpired;
const isValidParams = controllers.checkParam;
const extendExpTime = controllers.extendExp;

router.post('/signin', isValidParams, controllers.signin);
router.post('/signup', isValidParams, controllers.signup);
router.get('/info', isAuthenticated, isExpired, extendExpTime, controllers.info);
router.get('/latency', isAuthenticated, isExpired, extendExpTime, controllers.latency);
router.get('/logout', isAuthenticated, isExpired, controllers.logout);

module.exports = router;
