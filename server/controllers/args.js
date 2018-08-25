const game = require('../game')

module.exports = async (ctx) => {
    ctx.state.data = {
        CeilSize: game.CEIL_SIZE,
    }
}
