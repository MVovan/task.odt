'use strict';
const jwt = require('jsonwebtoken');
const models = require('../models');

exports.isAuthenticated = async (req, res, next) => {
    if (!req.token){
        res.status(404).send('Token not found');
        return;
    }
    jwt.verify(req.token, process.env.API_SECRET);
    req.tokedData = jwt.decode(req.token);
    if (!req.tokedData.userId) {
        res.status(404).send('User not found');
        return;
    }
    const userId = req.tokedData.userId;
    const user = await models.User.query().findOne('id', '=', userId);
    if (!user) {
        res.status(404).send('User not found');
        return;
    }
    req.user = user;
    next();
};

exports.getToken = async (sesionId, userId) => {
    return await jwt.sign({sesionId: sesionId, userId: userId}, process.env.API_SECRET);
};



