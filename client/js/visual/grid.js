import { defineGrid, extendHex } from '../libs/honeycomb/index'
import { utils } from '../libs/pixi'
import conn from '../conn/index'

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

        const data = await conn.fetchHexs(end.x - start.x, end.y - start.y, start)

        data.hexs.forEach(hex => {
            const color = hex.value.color
            this.hexs.get(hex).value.color = utils.rgb2hex([color.r, color.g, color.b])
        })
    }
}
