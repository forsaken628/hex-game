const game = require('../game')

const route = require('koa-route')

const {LOGIN_STATE} = require('../constants')
const {validation} = require('../middlewares/auth')

module.exports = route.get('/socket', async function (ctx) {
    const {loginState, userinfo, id} = await validation({headers: {'x-wx-skey': ctx.request.query.skey}})

    if (loginState === LOGIN_STATE.FAILED) {
        //todo
        ctx.websocket.close()
    }

    game.sessions.checkSocket(id, ctx.websocket)// todo callback 踢线

    ctx.websocket.on('message', function (message) {
        console.log(message)
    })

    const push = (hex) => {
        console.log(hex, hex.value)
        ctx.websocket.send(JSON.stringify(Object.assign({}, hex, {value: hex.value})))
    }

    game.Grid.EventEmitter.on('update', push)
    ctx.websocket.on('close', () => {
        game.Grid.EventEmitter.off('update', push)
        game.sessions.clean(id)
    })
})
