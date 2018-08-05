const game = require('../game')

const route = require('koa-route')
const {auth: {validation}} = require('../qcloud')
const {LOGIN_STATE} = require('wafer-node-sdk/lib/constants')

module.exports = route.get('/socket', async function (ctx) {

    const {loginState, userinfo} = await validation({headers: {'x-wx-skey': ctx.request.query.skey}})

    if (loginState === LOGIN_STATE.FAILED) {
        //todo

        //ctx.websocket.close()
    }

    console.log(userinfo)

    //ctx.websocket.send('Hello World')
    ctx.websocket.on('message', function (message) {
        // do something with the message from client
        console.log(message)
    })

    const push = (hex) => {
        console.log(hex, hex.value)
        ctx.websocket.send(JSON.stringify(Object.assign({}, hex, {value: hex.value})))
    }

    game.Grid.EventEmitter.on('update', push)
    ctx.websocket.on('close', () => {
        game.Grid.EventEmitter.off('update', push)
    })

})
