const {extendHex, defineGrid} = require('honeycomb-grid')
const EventEmitter = require('events')

const Grid = defineGrid(extendHex({
    size: 10,
    value: {}
}))
Grid.EventEmitter = new EventEmitter()
Grid.hexs = Grid()
exports.Grid = Grid

;(function () {
    const size = 20
    const hexs = Grid.hexs

    const hsize = Math.floor(size / 2)

    let grid = Grid.triangle({start: Grid.Hex(0, 0), size, direction: 1})
    let grid1 = Grid.triangle({start: Grid.Hex(-size, -1), size, direction: 5})
    let grid2 = Grid.triangle({start: Grid.Hex(-size + 1, 0), size, direction: 1})
    let grid3 = Grid.triangle({start: Grid.Hex(-Math.floor((size - 1) / 2) - size, -size), size, direction: 5})
    let grid4 = Grid.triangle({start: Grid.Hex(-hsize, -size + 1), size, direction: 1})
    let grid5 = Grid.triangle({start: Grid.Hex(-Math.floor((size + 1) / 2), -size), size, direction: 5})

    for (const hex of grid) {
        hexs.push(hex)
    }
    for (const hex of grid1) {
        hexs.push(hex)
    }
    for (const hex of grid2) {
        hexs.push(hex)
    }
    for (const hex of grid3) {
        hexs.push(hex)
    }
    for (const hex of grid4) {
        hexs.push(hex)
    }
    for (const hex of grid5) {
        hexs.push(hex)
    }

})()

setInterval(() => {
    const r = Math.floor(256 * Math.random())
    const b = Math.floor(256 * Math.random())
    const g = Math.floor(256 * Math.random())

    const hex = Grid.hexs[Math.floor(Math.random() * Grid.hexs.length)]
    hex.value.color = {r, b, g}
    Grid.EventEmitter.emit('update', hex)
}, 2000)

const sessions = {}
sessions.setCamera = function (openid, camera) {
    let session = this[openid]
    if (!session) {
        this[openid] = {}
        session = this[openid]
    }
    session.camera = camera
}
exports.sessions = sessions
