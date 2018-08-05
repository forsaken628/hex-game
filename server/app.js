const Koa = require('koa')
const debug = require('debug')('koa-weapp-demo')
const response = require('./middlewares/response')
const app = require('koa-websocket')(new Koa())
const bodyParser = require('koa-bodyparser')
const config = require('./config')

// 使用响应处理中间件
app.use(response)

// 解析请求体
app.use(bodyParser())

// 引入路由分发
const router = require('./routes')
app.use(router.routes())

const socket = require('./socket')
app.ws.use(socket)

// 启动程序，监听端口
app.listen(config.port, () => debug(`listening on port ${config.port}`))
