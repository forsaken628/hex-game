const debug = require('debug')('res/sessionInfo')
//const uuidGenerator = require('uuid/v4')
const moment = require('moment')
const mysql = require('./db')()

/**
 * 储存用户信息
 * @return {Promise}
 */
async function saveUserInfo (userInfo, skey, session_key) {
    const create_time = moment().format('YYYY-MM-DD HH:mm:ss')
    const last_visit_time = create_time
    const open_id = userInfo.openId
    const user_info = JSON.stringify(userInfo)

    // 查重并决定是插入还是更新数据
    const rows = await mysql('session_info').select('id').where({open_id})

    if (rows.length) {
        await mysql('session_info').update({
            skey, last_visit_time, session_key, user_info
        }).where({
            open_id
        })
        return rows[0].id
    } else {
        const rows = await mysql('session_info').insert({
            skey, create_time, last_visit_time, open_id, session_key, user_info
        })
        return rows[0]
    }
}

/**
 * 通过 skey 获取用户信息
 * @param {string} skey 登录时颁发的 skey 为登录态标识
 */
function getUserInfoBySKey (skey) {
    return mysql('session_info').select('*').where({skey})
}

/**
 * 通过 id 获取用户信息
 */
function getUserInfoByID (id) {
    return mysql('session_info').select('*').where({id: id})
}

function getUserInfoByOpenId (openId) {
    return mysql('session_info').select('*').where({open_id: openId})
}

module.exports = {
    saveUserInfo,
    getUserInfoBySKey,
    getUserInfoByID,
    getUserInfoByOpenId
}
