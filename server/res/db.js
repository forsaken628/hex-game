const config = require('../config')
const knex = require('knex')

let db = null

module.exports = function () {
    if (db) {
        return db
    }

    db = knex({
        client: 'mysql',
        connection: {
            host: config.mysql.host,
            port: config.mysql.port,
            user: config.mysql.user,
            password: config.mysql.pass,
            database: config.mysql.db,
            charset: config.mysql.char
        }
    })

    return db
}
