const game = require('../game')
const station = require('../res/station')

exports.find = async (ctx, next) => {

    //ctx.request.body

}

exports.base = async (ctx) => {
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
