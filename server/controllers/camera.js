const game = require('../game')

module.exports = async (ctx) => {
    // todo check body
    game.sessions.setCamera(ctx.state.$wxInfo.id, ctx.request.body)
}
