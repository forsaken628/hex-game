import { defineGrid, extendHex } from '../libs/honeycomb/index'
import conn from '../conn/index'

const CEIL_SIZE = 5 //todo

export default class Grid {
    constructor (size) {
        this.size = size
        this.Grid = defineGrid(extendHex({
            size: 10,
            value: null,
            init () {
                this.value = {}
            },
        }))
        this.hexs = this.Grid()
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

        // const hsize = Math.floor(size / 2)
        //
        // let grid = Grid.triangle({start: Grid.Hex(0, 0), size, direction: 1})
        // let grid1 = Grid.triangle({start: Grid.Hex(-size, -1), size, direction: 5})
        // let grid2 = Grid.triangle({start: Grid.Hex(-size + 1, 0), size, direction: 1})
        // let grid3 = Grid.triangle({start: Grid.Hex(-Math.floor((size - 1) / 2) - size, -size), size, direction: 5})
        // let grid4 = Grid.triangle({start: Grid.Hex(-hsize, -size + 1), size, direction: 1})
        // let grid5 = Grid.triangle({start: Grid.Hex(-Math.floor((size + 1) / 2), -size), size, direction: 5})
        //
        // this.hexs = grid.concat(grid1).concat(grid2).concat(grid3).concat(grid4).concat(grid5)
    }

    pointToHex (x, y) {
        return this.Grid.pointToHex(x, y)
        //.pointToHex((evt.x - this.camera.x) / this.camera.zoom, (evt.y - this.camera.y) / this.camera.zoom)
    }

    async fetchHexs (start, end) {
        const ceils = this.ceils2Fetch(start, end)
        if (!ceils.length)
            return

        const data = await conn.fetchHexs(ceils)

        data.ceils.forEach(ceil => {
            this.ceil[ceil.ceil] = true

            ceil.hexs.forEach(hex => {
                this.hexs.get(hex).value = hex.value
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
