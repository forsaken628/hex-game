import { Application, Graphics, Polygon } from './libs/pixi'
import { defineGrid, extendHex } from './libs/honeycomb.min'

const EventEmitter = require('./libs/EventEmitter')

function TouchCaster (el, graphics, camera) {
    this.el = el
    this.graphics = graphics
    this.camera = camera

    this.state = this.STATE.NONE

    this.startTime = 0
    this.panStart = {}
    this.dollyStart = 0
    this.move0 = {}
    this.listen()
}

TouchCaster.prototype.STATE = {NONE: -1, TOUCH_ROTATE: 1, TOUCH_DOLLY: 2, TOUCH_PAN: 3}

TouchCaster.prototype.listen = function () {
    this.el.addEventListener('touchstart', this.onTouchStart.bind(this))
    this.el.addEventListener('touchmove', this.onTouchMove.bind(this))
    this.el.addEventListener('touchend', this.onTouchEnd.bind(this))
}

TouchCaster.prototype.onTouchStart = function (evt) {
    this.x = evt.touches[0].clientX
    this.y = evt.touches[0].clientY
    this.move0.x = this.x
    this.move0.y = this.y

    switch (evt.touches.length) {
        case 1:
            this.state = this.STATE.TOUCH_PAN

            this.startTime = evt.timeStamp

            this.panStart.x = this.x
            this.panStart.y = this.y
            break
        case 2:
            this.state = this.STATE.TOUCH_DOLLY

            const dx = evt.touches[0].pageX - evt.touches[1].pageX
            const dy = evt.touches[0].pageY - evt.touches[1].pageY
            this.dollyStart = Math.sqrt(dx * dx + dy * dy)
            break
        default:
            this.state = this.STATE.NONE
    }
}

TouchCaster.prototype.onTouchMove = function (evt) {
    this.move0.x = this.x
    this.move0.y = this.y
    this.x = evt.touches[0].clientX
    this.y = evt.touches[0].clientY

    switch (evt.touches.length) {

        case 1:
            if (this.state !== this.STATE.TOUCH_PAN)
                return

            evt.movementX = this.x - this.move0.x
            evt.movementY = this.y - this.move0.y
            this.camera.x += evt.movementX
            this.camera.y += evt.movementY
            this.graphics.setTransform(this.camera.x, this.camera.y, this.camera.zoom, this.camera.zoom)

            return

        case 2:
            if (this.state !== this.STATE.TOUCH_DOLLY)
                return

            const dx = evt.touches[0].pageX - evt.touches[1].pageX
            const dy = evt.touches[0].pageY - evt.touches[1].pageY
            const distance = Math.sqrt(dx * dx + dy * dy)

            const dollyDelta = distance - this.dollyStart

            if (Math.abs(dollyDelta) < 1) return

            if (dollyDelta > 0) {
                this.camera.zoom *= 1.05
                this.camera.x = (this.camera.x - this.el.width / 2) * 1.05 + this.el.width / 2
                this.camera.y = (this.camera.y - this.el.height / 2) * 1.05 + this.el.height / 2
            } else {
                this.camera.zoom /= 1.05
                this.camera.x = (this.camera.x - this.el.width / 2) / 1.05 + this.el.width / 2
                this.camera.y = (this.camera.y - this.el.height / 2) / 1.05 + this.el.height / 2
            }
            this.graphics.setTransform(this.camera.x, this.camera.y, this.camera.zoom, this.camera.zoom)

            this.dollyStart = distance

            return

        default:
            this.state = this.STATE.NONE
    }

    // if (this.down) {
    //     this.move = true
    //     this.move0.x = this.x
    //     this.move0.y = this.y
    //     this.x = evt.touches[0].clientX
    //     this.y = evt.touches[0].clientY
    //     evt.movementX = this.x - this.move0.x
    //     evt.movementY = this.y - this.move0.y
    //     this.camera.x += evt.movementX
    //     this.camera.y += evt.movementY
    //     this.graphics.setTransform(this.camera.x, this.camera.y, this.camera.zoom, this.camera.zoom)
    // }
}

TouchCaster.prototype.onTouchEnd = function (evt) {

    if (evt.timeStamp - this.startTime < 200) {
        evt.x = this.x
        evt.y = this.y
        bus.emit('click', evt)
    }

    this.state = this.STATE.NONE
}

const bus = new EventEmitter()

/**
 * 游戏主函数
 */
export default class Main {
    constructor() {
        this.app = new Application({
            width: canvas.width,
            height: canvas.height,
            //transparent: false,
            view: canvas
        })

        //console.log(this.app.ticker)

        this.hex = extendHex({size: 10})
        this.size = 20

        this.gridInit()

        this.graphics = new Graphics()

        this.camera = {
            x: 0,
            y: 0,
            zoom: 2
        }

        const caster = new TouchCaster(this.app.view, this.graphics, this.camera)

        //let color = PIXI.utils.rgb2hex([Math.random(), Math.random(), Math.random()])
        this.grid.forEach(hex => this.draw(hex, 0x00ff00))

        this.graphics.setTransform(this.camera.x, this.camera.y, this.camera.zoom, this.camera.zoom)

        this.app.stage.addChild(this.graphics)

        bus.on('click', evt => {
            //todo
            //console.log(evt)
            const hex = defineGrid(this.hex).pointToHex((evt.x - this.camera.x) / this.camera.zoom, (evt.y - this.camera.y) / this.camera.zoom)
            this.draw(hex, 0)

            setTimeout(() => {
                this.draw(hex, 0x00ff00)
            }, 1000)
        })

        // const interaction = this.app.renderer.plugins.interaction
        //
        // interaction.on('pointerdown', function (evt) {
        //     console.log('pointerdown', evt)
        // })
        //
        // interaction.on('pointerup', function (evt) {
        //     console.log('pointerup', evt)
        // })
        //
        // interaction.on('pointermove', function (evt) {
        //     console.log('pointermove', evt)
        // })

    }

    draw(hex, color) {
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
        this.graphics.lineStyle(1 / this.camera.zoom, 0x999999, 1, 0)
        //}

        //graphics.beginFill(hex.color)
        this.graphics.beginFill(color)
        this.graphics.drawShape(new Polygon(path))
        this.graphics.endFill()
        //graphics.setTransform(x, y, zoom, zoom)
    }

    gridInit() {
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
