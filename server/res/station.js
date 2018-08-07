const debug = require('debug')('res/station')
const mysql = require('./db')()

async function insert (station) {
    const rows = await mysql('station').insert(station)
    return rows[0]
}

async function getByID (id) {
    return mysql('station').select('*').where({id})
}

async function getByAccountID (id) {
    return mysql('station').select('*').where({account_id: id})
}

async function getByCoor (x, y) {
    return mysql('station').select('*').where({x, y})
}

module.exports = {
    insert,
    getByID,
    getByCoor,
    getByAccountID
}
