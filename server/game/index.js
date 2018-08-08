const {extendHex, defineGrid} = require('honeycomb-grid')
const EventEmitter = require('events')

const Grid = defineGrid(extendHex({
    size: 10,
    value: null,
    init () {
        this.value = {}
    },
}))
Grid.EventEmitter = new EventEmitter()
Grid.hexs = Grid()
exports.Grid = Grid

;(function () {
    const size = 20

    Grid.hexs = Grid.hexagon({
        radius: size,
        onCreate (hex) {
            hex.init()
            const r = Math.floor(256 * Math.random())
            const b = Math.floor(256 * Math.random())
            const g = Math.floor(256 * Math.random())
            hex.value.color = {r, g, b}
        }
    })

    Grid.hexs.forEach(hex => {
        console.log(hex)
    })

    // const hsize = Math.floor(size / 2)
    //
    // let grid = Grid.triangle({start: Grid.Hex(0, 0), size, direction: 1})
    // let grid1 = Grid.triangle({start: Grid.Hex(-size, -1), size, direction: 5})
    // let grid2 = Grid.triangle({start: Grid.Hex(-size + 1, 0), size, direction: 1})
    // let grid3 = Grid.triangle({start: Grid.Hex(-Math.floor((size - 1) / 2) - size, -size), size, direction: 5})
    // let grid4 = Grid.triangle({start: Grid.Hex(-hsize, -size + 1), size, direction: 1})
    // let grid5 = Grid.triangle({start: Grid.Hex(-Math.floor((size + 1) / 2), -size), size, direction: 5})
    //
    // for (const hex of grid) {
    //     hexs.push(hex)
    // }
    // for (const hex of grid1) {
    //     hexs.push(hex)
    // }
    // for (const hex of grid2) {
    //     hexs.push(hex)
    // }
    // for (const hex of grid3) {
    //     hexs.push(hex)
    // }
    // for (const hex of grid4) {
    //     hexs.push(hex)
    // }
    // for (const hex of grid5) {
    //     hexs.push(hex)
    // }

})()

setInterval(() => {
    return
    const r = Math.floor(256 * Math.random())
    const b = Math.floor(256 * Math.random())
    const g = Math.floor(256 * Math.random())

    const hex = Grid.hexs[Math.floor(Math.random() * Grid.hexs.length)]
    hex.value.color = {r, b, g}
    Grid.EventEmitter.emit('update', hex)
}, 2000)

const sessions = {}

sessions.getSession = function (id) {
    let session = this[id]
    if (!session) {
        this[id] = {}
        session = this[id]
    }
    return session
}

sessions.setCamera = function (id, camera) {
    sessions.getSession(id).camera = camera
}

sessions.checkSocket = function (id, socket) {
    const session = this.getSession(id)
    if (!session.socket) {
        session.socket = socket
        return
    }
    if (session.socket.readyState !== 1) {
        session.socket = socket
        return
    }
    const s = session.socket
    session.reDial = true
    session.socket = socket
    s.close()
}

sessions.clean = function (id) {
    const session = this.getSession(id)
    if (session.reDial) {
        return
    }
    delete sessions[id]
}

exports.sessions = sessions
