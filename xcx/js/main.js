import { Application, Graphics, Polygon } from './libs/pixi'
import { defineGrid, extendHex } from './libs/honeycomb.min'

const EventEmitter = require('./libs/EventEmitter')

function TouchCaster (el) {
    this.el = el
    this.down = false
    this.start = {}
    this.move0 = {}
    this.listen()
}

TouchCaster.prototype.listen = function () {
    this.el.addEventListener('touchstart', this.onTouchStart.bind(this))
    this.el.addEventListener('touchmove', this.onTouchMove.bind(this))
    this.el.addEventListener('touchend', this.onTouchEnd.bind(this))
}

TouchCaster.prototype.onTouchStart = function (evt) {
    this.x = evt.touches[0].clientX
    this.y = evt.touches[0].clientY
    this.start.x = this.x
    this.start.y = this.y
    this.start.time = evt.timeStamp
    this.move0.x = this.x
    this.move0.y = this.y
    this.down = true
}

TouchCaster.prototype.onTouchMove = function (evt) {
    if (this.down) {
        this.move = true
        this.move0.x = this.x
        this.move0.y = this.y
        this.x = evt.touches[0].clientX
        this.y = evt.touches[0].clientY
        evt.movementX = this.x - this.move0.x
        evt.movementY = this.y - this.move0.y
        bus.emit('move', evt)
    }
}

TouchCaster.prototype.onTouchEnd = function (evt) {
    this.down = false
    console.log(evt.timeStamp - this.start.time)
    if (evt.timeStamp - this.start.time < 200) {
        evt.x = this.x
        evt.y = this.y
        bus.emit('click', evt)
    }
}

const bus = new EventEmitter()

/**
 * 游戏主函数
 */
export default class Main {
    constructor () {
        this.app = new Application({
            width: canvas.width,
            height: canvas.height,
            //transparent: false,
            view: canvas
        })

        console.log(this.app.ticker)

        this.hex = extendHex({size: 10})
        this.size = 20

        this.gridInit()

        this.graphics = new Graphics()

        const caster = new TouchCaster(this.app.view)

        this.camera = {
            x: 0,
            y: 0,
            zoom: 3
        }

//let color = PIXI.utils.rgb2hex([Math.random(), Math.random(), Math.random()])
        this.grid.forEach(hex => this.draw(hex, 0x00ff00, this.camera.zoom))

        this.graphics.setTransform(this.camera.x, this.camera.y, this.camera.zoom, this.camera.zoom)

        this.app.stage.addChild(this.graphics)

        bus.on('move', evt => {
            this.onMove(evt.movementX, evt.movementY)
        })

        bus.on('click', evt => {
            //todo
            //console.log(evt)
            const hex = defineGrid(this.hex).pointToHex((evt.x - this.camera.x) / this.camera.zoom, (evt.y - this.camera.y) / this.camera.zoom)
            this.draw(hex, 0)

            setTimeout(() => {
                this.draw(hex, 0x00ff00)
            }, 1000)
        })

// document.body.addEventListener('keyup', function (evt) {
//     if (evt.key === '+') {
//         zoom *= 1.05
//         x = (x - app.view.width / 2) * 1.05 + app.view.width / 2
//         y = (y - app.view.height / 2) * 1.05 + app.view.height / 2
//     }
//     if (evt.key === '-') {
//         zoom /= 1.05
//         x = (x - app.view.width / 2) / 1.05 + app.view.width / 2
//         y = (y - app.view.height / 2) / 1.05 + app.view.height / 2
//     }
//     graphics.setTransform(x, y, zoom, zoom)
// })

        const interaction = this.app.renderer.plugins.interaction

        interaction.on('click', function (evt) {
            console.log(evt)
        })

//
// // interactionManager.on('pointerdown',function (evt) {
// //     console.log(evt)
// // })
// //
// // interactionManager.on('pointermove',function (evt) {
// //     console.log(evt)
// // })
//
// interactionManager.on('pointertap',function (evt) {
//     console.log(evt)
// })
//
// interactionManager.on('tap',function (evt) {
//     console.log(evt)
// })

    }

    onMove (offsetX, offsetY) {
        this.camera.x += offsetX
        this.camera.y += offsetY
        this.graphics.setTransform(this.camera.x, this.camera.y, this.camera.zoom, this.camera.zoom)
    }

    draw (hex, color) {
        // let mod = false
        // if (!hex.color) {
        //     hex.color = PIXI.utils.rgb2hex([Math.random(), Math.random(), Math.random()])
        //     mod = true
        // }
        //
        // if (Math.random() < 0.002) {
        //     mod = true
        // }
        //
        // if (!mod) {
        //     return
        // }

        //hex.color = PIXI.utils.rgb2hex([Math.random(), Math.random(), Math.random()])

        const point = hex.toPoint()
        const corners = hex.corners().map(corner => corner.add(point))

        let path = corners.reduce((arr, c) => {
            arr.push(c.x, c.y)
            return arr
        }, [])
        path.push(corners[0].x, corners[0].y)

        //if (zoom > 1) {
        this.graphics.lineStyle(1 / this.camera.zoom, 0x999999)
        //}

        //graphics.beginFill(hex.color)
        this.graphics.beginFill(color)
        this.graphics.drawShape(new Polygon(path))
        this.graphics.endFill()
        //graphics.setTransform(x, y, zoom, zoom)
    }

    gridInit () {
        const size = this.size
        const Grid = defineGrid(this.hex)
        const hsize = Math.floor(size / 2)

        let grid = Grid.triangle({start: this.hex(0, 0), size, direction: 1})
        let grid1 = Grid.triangle({start: this.hex(-size, -1), size, direction: 5})
        let grid2 = Grid.triangle({start: this.hex(-size + 1, 0), size, direction: 1})
        let grid3 = Grid.triangle({start: this.hex(-Math.floor((size - 1) / 2) - size, -size), size, direction: 5})
        let grid4 = Grid.triangle({start: this.hex(-hsize, -size + 1), size, direction: 1})
        let grid5 = Grid.triangle({start: this.hex(-Math.floor((size + 1) / 2), -size), size, direction: 5})

        this.grid = grid.concat(grid1).concat(grid2).concat(grid3).concat(grid4).concat(grid5)
    }
}
