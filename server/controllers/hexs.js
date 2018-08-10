const game = require('../game')
const station = require('../res/station')

exports.rectangle = async ctx => {
    const data = ctx.request.body

    ctx.state.data = {}

    let dist = []

    for (const item of data) {

        const hexs = game.Grid.rectangle({
            width: item.width,
            height: item.height,
            start: game.Grid.Hex(item.start.x, item.start.y)
        })

        dist.push({
            ceil: `${item.start.x},${item.start.y}`,
            hexs: game.Grid.get(hexs)
        })
    }

    ctx.state.data.ceils = dist
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
