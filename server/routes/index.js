/**
 * ajax 服务路由集合
 */
const router = require('koa-router')({
    prefix: '/weapp'
})
const controllers = require('../controllers')
const {authorizationMiddleware, validationMiddleware} = require('../middlewares/auth')

router.get('/login', authorizationMiddleware, controllers.login)
// 用户信息接口（可以用来验证登录态）
//router.get('/user', validationMiddleware, controllers.user)

router.put('/camera', validationMiddleware, controllers.camera)

router.post('/hexs/find', validationMiddleware, controllers.hexs.find)

router.get('/hexs/base', validationMiddleware, controllers.hexs.base)

module.exports = router
