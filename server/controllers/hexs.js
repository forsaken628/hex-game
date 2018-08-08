const game = require('../game')
const station = require('../res/station')

exports.rectangle = async ctx => {
    const data = ctx.request.body
    // const data = {
    //     width: 5,
    //     height: 10,
    //     start: {
    //         x: 0,
    //         y: 0,
    //     }
    // }
    const hexs = game.Grid.rectangle({
        width: data.width,
        height: data.height,
        start: game.Grid.Hex(data.start.x, data.start.y)
    })

    ctx.state.data = {}
    ctx.state.data.hexs = hexs.filter(hex => game.Grid.hexs.includes(hex)).map(hex => game.Grid.hexs.get(hex))

}

exports.base = async ctx => {
    const accountID = ctx.state.$wxInfo.id

    const rows = await station.getByAccountID(accountID)
    if (rows.length) {
        ctx.state.data = rows[0]
        return
    }

    const id = await station.insert({
        x: 0,
        y: 0,
        account_id: accountID,
        value: '',
    })

    ctx.state.data = {
        id,
        x: 0,
        y: 0,
        account_id: accountID,
        value: '',
    }
}
