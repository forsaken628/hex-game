import { defineGrid, extendHex, Point } from '../libs/honeycomb/index'
import Conn from '../conn/index'

const CEIL_SIZE = 10

export default class Grid {
    constructor (size) {
        this.conn = new Conn()

        this.size = size
        this.Grid = defineGrid(extendHex({
            size: 10,
            value: null,
            init () {
                this.value = {}
            },
        }))
        this.hexs = this.Grid()
        this.hexsCache = {}

        this.ceil = {}
    }

    init () {
        const size = this.size
        const Grid = this.Grid

        this.hexs = Grid.hexagon({
            radius: size,
            onCreate (hex) {
                hex.init()
            },
        })

        for (const hex of this.hexs) {
            this.hexsCache[`${hex.x},${hex.y}`] = hex
        }
    }

    pointToHex () {
        return this.get(this.Grid.pointToHex.apply(this, arguments))
    }

    get (hex) {
        hex = Point(hex)
        return this.hexsCache[`${hex.x},${hex.y}`]
    }

    async fetchHexs (start, end) {
        const ceils = this.ceils2Fetch(start, end)
        if (!ceils.length)
            return

        const data = await this.conn.fetchHexs(ceils)

        data.ceils.forEach(ceil => {
            this.ceil[ceil.ceil] = true

            ceil.hexs.forEach(p => {
                this.get(p).value = p.value
            })
        })
    }

    ceils2Fetch (start, end) {
        const startCeil = {
            x: Math.floor(start.x / CEIL_SIZE) * CEIL_SIZE,
            y: Math.floor(start.y / CEIL_SIZE) * CEIL_SIZE,
        }

        const endCeil = {
            x: Math.ceil(end.x / CEIL_SIZE) * CEIL_SIZE,
            y: Math.ceil(end.y / CEIL_SIZE) * CEIL_SIZE,
        }

        const dist = []

        for (let i = startCeil.y; i <= endCeil.y; i += CEIL_SIZE) {
            for (let j = startCeil.x; j <= endCeil.x; j += CEIL_SIZE) {
                if (!this.ceil[`${j},${i}`]) {
                    dist.push({
                        height: CEIL_SIZE,
                        width: CEIL_SIZE,
                        start: {x: j, y: i},
                    })
                }
            }
        }

        return dist
    }
}
