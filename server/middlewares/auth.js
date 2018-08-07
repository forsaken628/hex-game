const debug = require('debug')('middlewares:auth')
const http = require('axios')
const moment = require('moment')
const config = require('../config')
const auth = require('../res/sessionInfo')
const {sha1, aesDecrypt} = require('../utils')
const {ERRORS, LOGIN_STATE} = require('../constants')

/**
 * 授权模块
 * @return {Promise}
 * @example 基于 Express
 * authorization(this.req).then(userinfo => { // ...some code })
 */
async function authorization (req) {
    const {
        'x-wx-code': code,
        'x-wx-encrypted-data': encryptedData,
        'x-wx-iv': iv
    } = req.headers

    // 检查 headers
    if ([code, encryptedData, iv].every(v => !v)) {
        debug(ERRORS.ERR_HEADER_MISSED)
        throw new Error(ERRORS.ERR_HEADER_MISSED)
    }

    debug('Auth: code: %s', code)

    debug('Auth: encryptedData: %s, iv: %s', encryptedData, iv)

    // 获取 session key
    const {session_key} = await getSessionKey(code)
    // 生成 3rd_session
    const skey = sha1(session_key)

    // 解密数据
    let decryptedData
    try {
        decryptedData = aesDecrypt(session_key, iv, encryptedData)
        decryptedData = JSON.parse(decryptedData)
    } catch (e) {
        debug('Auth: %s: %o', ERRORS.ERR_IN_DECRYPT_DATA, e)
        throw new Error(`${ERRORS.ERR_IN_DECRYPT_DATA}\n${e}`)
    }

    // 存储到数据库中
    const id = await auth.saveUserInfo(decryptedData, skey, session_key)
    return {
        id,
        skey,
        loginState: LOGIN_STATE.SUCCESS,
        userinfo: decryptedData,
    }
}

/**
 * 鉴权模块
 * @return {Promise}
 * @example 基于 Express
 * validation(this.req).then(loginState => { // ...some code })
 */
async function validation (req) {
    const {'x-wx-skey': skey} = req.headers
    if (!skey) throw new Error(ERRORS.ERR_SKEY_INVALID)

    debug('Valid: skey: %s', skey)

    const rows = await auth.getUserInfoBySKey(skey)

    if (!rows.length)
        throw new Error(ERRORS.ERR_SKEY_INVALID)

    const {last_visit_time: lastVisitTime, user_info: userInfo, id} = rows[0]
    //const expires = config.wxLoginExpires && !isNaN(parseInt(config.wxLoginExpires)) ? parseInt(config.wxLoginExpires) * 1000 : 7200 * 1000

    // if (moment(lastVisitTime, 'YYYY-MM-DD HH:mm:ss').valueOf() + expires < Date.now()) {
    //     debug('Valid: skey expired, login failed.')
    //     return {
    //         loginState: LOGIN_STATE.FAILED,
    //         userinfo: {}
    //     }
    // } else {
    debug('Valid: login success.')
    return {
        id,
        loginState: LOGIN_STATE.SUCCESS,
        userinfo: JSON.parse(userInfo)
    }
    //}
}

/**
 * Koa 授权中间件
 * 基于 authorization 重新封装
 * @return {Promise}
 */
async function authorizationMiddleware (ctx, next) {
    ctx.state.$wxInfo = await authorization(ctx.req)
    return next()
}

/**
 * Koa 鉴权中间件
 * 基于 validation 重新封装
 * @return {Promise}
 */
async function validationMiddleware (ctx, next) {
    ctx.state.$wxInfo = await validation(ctx.req)
    return next()
}

/**
 * session key 交换
 * @param {string} code
 * @return {Promise}
 */
async function getSessionKey (code) {
    const appid = config.appId
    const appsecret = config.appSecret

    let res = await http({
        url: 'https://api.weixin.qq.com/sns/jscode2session',
        method: 'GET',
        params: {
            appid: appid,
            secret: appsecret,
            js_code: code,
            grant_type: 'authorization_code'
        }
    })

    res = res.data
    if (res.errcode || !res.openid || !res.session_key) {
        debug('%s: %O', ERRORS.ERR_GET_SESSION_KEY, res.errmsg)
        throw new Error(`${ERRORS.ERR_GET_SESSION_KEY}\n${JSON.stringify(res)}`)
    }

    debug('openid: %s, session_key: %s', res.openid, res.session_key)
    return res
}

module.exports = {
    authorization,
    validation,
    authorizationMiddleware,
    validationMiddleware
}
