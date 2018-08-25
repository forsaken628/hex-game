const {extendHex, defineGrid} = require('honeycomb-grid')
const EventEmitter = require('events')

const CEIL_SIZE = 10

const Grid = defineGrid(extendHex({
    size: 10,
    value: null,
    init () {
        this.value = {}
    },
}))
Grid.EventEmitter = new EventEmitter()
Grid.hexs = Grid()
Grid.map = {}
Grid.ceils = {}

;(function () {
    const size = 40

    Grid.hexs = Grid.hexagon({
        radius: size,
        onCreate (hex) {
            hex.init()

            hex.value.color = rgb2hex([
                (hex.q / 2 / size + 0.5),
                (hex.r / 2 / size + 0.5),
                (hex.s / 2 / size + 0.5)
            ])
        }
    })

    Grid.hexs.forEach(hex => {
        Grid.map[hex.y] = Grid.map[hex.y] || {}
        Grid.map[hex.y][hex.x] = hex
    })

    // ceils2Fetch (start, end) {
    //     const startCeil = {
    //         x: Math.floor(start.x / CEIL_SIZE) * CEIL_SIZE,
    //         y: Math.floor(start.y / CEIL_SIZE) * CEIL_SIZE,
    //     }
    //
    //     const endCeil = {
    //         x: Math.ceil(end.x / CEIL_SIZE) * CEIL_SIZE,
    //         y: Math.ceil(end.y / CEIL_SIZE) * CEIL_SIZE,
    //     }
    //
    //     const dist = []
    //
    //     for (let i = startCeil.y; i <= endCeil.y; i += CEIL_SIZE) {
    //         for (let j = startCeil.x; j <= endCeil.x; j += CEIL_SIZE) {
    //             if (!this.ceil[`${j},${i}`]) {
    //                 dist.push({
    //                     height: CEIL_SIZE,
    //                     width: CEIL_SIZE,
    //                     start: {x: j, y: i},
    //                 })
    //             }
    //         }
    //     }
    //
    //     return dist
    // }
    //

})()

Grid.get = function (hexs) {
    const dist = []

    for (const hex of hexs) {
        if (!this.map[hex.y]) {
            continue
        }

        if (!this.map[hex.y][hex.x]) {
            continue
        }

        dist.push(this.map[hex.y][hex.x])
    }

    return dist
}

Grid.getCeil = function (start) {
    const hexs = Grid.rectangle({
        width: CEIL_SIZE,
        height: CEIL_SIZE,
        start: Grid.Hex(start.x, start.y)
    })

    return Grid.get(hexs)
}

function rgb2hex (rgb) {
    return (rgb[0] * 255 << 16) + (rgb[1] * 255 << 8) + (rgb[2] * 255 | 0)
}

setInterval(() => {
    return

    const hex = Grid.hexs[Math.floor(Math.random() * Grid.hexs.length)]
    hex.value.color = rgb2hex([Math.random(), Math.random(), Math.random()])
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

exports.Grid = Grid
exports.sessions = sessions
exports.CEIL_SIZE = CEIL_SIZE
