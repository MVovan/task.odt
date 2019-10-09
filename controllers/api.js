'use strict';
const request = require('request');
const argon2 = require('argon2');
const {getToken} = require('../controllers/auth');
const models = require('../models');

const host = 'https://google.com';

const regexpEmail = /.+@.+\..+/;
const regexpPhone = /^\+?\d{12}$/;

const exp_time = 10 * 60;// 10min

function getExpTime() {
    const date = new Date();
    date.setTime(date.getTime() + (exp_time * 1000));
    return parseInt(date.getTime() / 1000, 10);
}

exports.isExpired = async (req, res, next) => {
    if (!req.tokedData.sesionId) {
        res.status(404).send('Session not found.').end();
        return;
    }
    const session = await models.Session.query().findOne('id', '=', req.tokedData.sesionId);
    if (!session) {
        res.status(404).send('Session not found.').end();
        return;
    }

    if (parseInt(getExpTime() - session.exp) > exp_time) {
        res.status(403).send('Token is expired.').end();
        return;
    }
    next();
};

async function updateSessionTime(sessionId) {
    await models.Session.query().where('id', '=', sessionId).update({exp: getExpTime()});
}

exports.extendExp = async (req, res, next) => {
    updateSessionTime(req.tokedData.sesionId);
    next();
};

function isValidId(id) {
    return regexpEmail.test(id) || regexpPhone.test(id);
}

function getIdType(id) {
    return regexpEmail.test(id) ? 'email' : 'phone';
}

async function isValidPassword(password, hash_password) {
    return await argon2.verify(hash_password, password);
}

exports.checkParam = (req, res, next) => {
    if (!req.body.id || !req.body.password) {
        res.status(400).send('Not enough parameters.').end();
        return
    }
    if (!isValidId(req.body.id)) {
        res.status(400).send('Bed parameters.').end();
        return;
    }
    next();
};

async function getUserToken(user) {
    const session = await models.Session.query().insert({user_id: user.id});
    const token = await getToken(session.id, user.id);
    updateSessionTime(session.id);
    return token;
}

exports.signin = async (req, res, next) => {
    const userID = req.body.id;
    const userPassword = req.body.password;
    let user = await models.User.query().findOne('userId', '=', userID);
    if (!user) {
        res.status(404).send('User not found.').end();
        return;
    }
    if (!await isValidPassword(userPassword, user.password)) {
        res.status(404).send('Incorrect password.').end();
        return;
    }
    res.send({
        token_type: "bearer",
        token: await getUserToken(user),
    }).end();
};

exports.signup = async (req, res, next) => {
    const userID = req.body.id;
    const userPassword = req.body.password;
    let user = await models.User.query().findOne('userId', '=', userID);
    if (!user) {
        const psw = await argon2.hash(userPassword);
        const id_type = getIdType(userID);
        user = await models.User.query().insert({userId: userID, password: psw, id_type: id_type});
    }
    if (!await isValidPassword(userPassword, user.password)) {
        res.status(404).send('Incorrect password.').end();
        return;
    }

    res.send({
        token_type: "bearer",
        token: await getUserToken(user),
    }).end();
};

exports.info = async (req, res, next) => {
    res.send({
        'user id': req.user.userId,
        'id type': req.user.id_type
    }).end();
};

exports.latency = (req, res, next) => {
    request({
        uri: host,
        method: 'GET',
        time: true
    }, (err, resp) => {
        res.send(resp.timings).end();
    })
};


exports.logout = async (req, res, next) => {
    if (!req.query.all) {
        res.status(400).send('Not enough parameters.').end();
        return
    }

    if (!req.tokedData.sesionId) {
        res.status(404).send('Session not found.').end();
        return;
    }

    if (!req.tokedData.userId) {
        res.status(404).send('User not found.').end();
        return;
    }
    const sessinId = req.tokedData.sesionId;
    const userId = req.tokedData.userId;

    if (req.query.all === 'true') {
        await models.Session.query().delete().where('user_id', '=', userId);
        res.send('OK').end();
        return;
    }

    if (req.query.all === 'false') {
        await models.Session.query().delete().where('id', '=', sessinId);
        res.send('OK').end();
        return;
    }

    res.status(400).send('Bed parameters.').end();
};
