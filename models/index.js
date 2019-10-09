'use strict';
const fs = require('fs');
const path = require('path');
const knex = require('../database/knex');

const db_name = process.env.DATABASE_NAME;

knex.raw('select 1+1 as result').catch(err => {
    console.log(err);
    process.exit(1);
});

let db = {};

knex.raw(`CREATE DATABASE IF NOT EXISTS ${db_name}`).then(
    fs
        .readdirSync(__dirname)
        .filter(function (file) {
            return (file.indexOf('.') !== 0) && (file !== 'index.js');
        })
        .forEach(async function (file) {
            try {
                let model = require(path.join(__dirname, file));
                let table = model.tableName;
                await knex.raw(`USE ${db_name}`);
                if (!await knex.schema.hasTable(table)) {
                    await knex.schema.createTable(table, function (table) {
                        table = model.createColumn(table)
                    })
                }
                db[model.name] = model;
            } catch (error) {
                console.error('Model creation error: ' + error);
            }
        })
);

module.exports = db;
