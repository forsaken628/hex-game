const game = require('../game')

module.exports = async (ctx, next) => {
    // todo check body
    game.sessions.setCamera(ctx.state.$wxInfo.userinfo.openId, ctx.request.body)
}
