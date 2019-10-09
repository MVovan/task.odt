'use strict';
const knex = require('knex')(process.env.DATABASE_URL);

if (process.env.DBlog) {
    knex.on('query', function (queryData) {
        console.log(queryData.sql);
    });
}

module.exports = knex;
