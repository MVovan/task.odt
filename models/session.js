'use strict';
const {Model} = require('objection');
const knex = require('../database/knex');

Model.knex(knex);

class Session extends Model {
    static get tableName() {
        return 'session';
    }

    static get jsonSchema() {
        return {
            type: 'object',
        };
    }

    static createColumn(t) {
        t.increments('id');
        t.integer('exp');
        t.integer('user_id');
        return t
    }
}

module.exports = Session;
