'use strict';
const {Model} = require('objection');
const knex = require('../database/knex');

Model.knex(knex);

class User extends Model {
    static get tableName() {
        return 'users';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['userId', 'password'],
        };
    }

    static createColumn(t) {
        t.increments('id');
        t.string('userId');
        t.string('password');
        t.string('id_type');
        return t
    }
}

module.exports = User;
