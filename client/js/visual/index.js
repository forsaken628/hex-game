import { Application, Graphics, Polygon, utils } from '../libs/pixi'
import Grid from './grid'
import Conn from '../conn/index'
import EventEmitter from '../libs/EventEmitter'

let instance

export default class Visual {
    constructor () {
        if (instance)
            return instance

        instance = this

        this.EventEmitter = new EventEmitter()

        this.EventEmitter.on('click', hex => {

            console.log(hex)

            const color = hex.value.color
            hex.value.color = 0
            this.drawOne(hex)

            setTimeout(() => {
                hex.value.color = color
                this.drawOne(hex)
            }, 1000)

        })

        this.app = new Application({
            width: canvas.width,
            height: canvas.height,
            //transparent: false,
            view: canvas
        })

        this.graphics = new Graphics()

        this.camera = {
            x: 0,
            y: 0,
            zoom: 1,
            center: null,
        }

        //this.updateCamera()

        this.caster = new TouchCaster(this)

        this.grid = new Grid(40)
        this.grid.init()

        this.conn = new Conn()

        this.conn.EventEmitter.on('message', msg => {
            const hex = this.grid.Grid.Hex(msg.x, msg.y)
            //console.log(hex)
            const color = msg.value.color
            hex.value.color = utils.rgb2hex([color.r, color.g, color.b])
            this.drawOne(hex, hex.value.color)

            // setTimeout(() => {
            //     const hex = this.grid.Grid.Hex(msg.x, msg.y)
            //     console.log(hex, hex.value)
            // }, 1000)
        })

        for (const hex of this.grid.hexs) {
            this.drawOne(hex, 0x999999)
        }

        this.app.stage.addChild(this.graphics)
    }

    setCamera (x, y, zoom) {
        const view = this.app.view
        const camera = this.camera

        camera.x = x
        camera.y = y
        camera.zoom = zoom

        const center = this.grid.pointToHex(
            (view.width / 2 - x) / zoom,
            (view.height / 2 - y) / zoom)

        if (!center) //todo 优化
            return

        this.graphics.setTransform(camera.x, camera.y, camera.zoom, camera.zoom)

        const offsetX = Math.floor(view.width * 2 / zoom / center.width())
        const offsetY = Math.floor(view.height / zoom / center.height())

        const start = this.grid.Grid.Hex({
            x: center.x - offsetX,
            y: center.y - offsetY
        })

        const end = this.grid.Grid.Hex({
            x: center.x + offsetX,
            y: center.y + offsetY
        })

        this.pushCamera(center)

        this.draw(start, end)
    }

    async pushCamera (center) {
        if (this.camera.center && center.distance(this.camera.center) < 10)
            return

        this.camera.center = center
        return this.conn.pushCamera(center)
    }

    jumpTo (x, y, zoom) {
        const hex = this.grid.Grid.Hex({x, y})
        const center = hex.center()
        const p = hex.toPoint()

        const {width, height} = this.app.view

        zoom = zoom || this.camera.zoom

        this.setCamera(
            width / 2 - (center.x + p.x) * zoom,
            height / 2 - (center.y + p.y) * zoom,
            zoom)
    }

    async draw (start, end) {
        await this.grid.fetchHexs(start, end)

        for (let j = start.y; j <= end.y; j++) {
            for (let i = start.x; i <= end.x; i++) {
                const hex = this.grid.get({x: i, y: j})
                hex && this.drawOne(hex)
            }
        }
    }

    drawOne (hex) {
        try {
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
            this.graphics.beginFill(hex.value.color)
            this.graphics.drawShape(new Polygon(path))
            this.graphics.endFill()
        } catch (e) {
            console.error(e, hex)
        }
    }
}

class TouchCaster {
    constructor (ctx) {
        this.ctx = ctx

        this.state = this.STATE.NONE

        this.startTime = 0
        this.panStart = {}
        this.dollyStart = 0
        this.move0 = {}
        this.listen()
    }

    STATE = {NONE: -1, TOUCH_ROTATE: 1, TOUCH_DOLLY: 2, TOUCH_PAN: 3}

    listen () {
        const view = this.ctx.app.view
        view.addEventListener('touchstart', this.onTouchStart.bind(this))
        view.addEventListener('touchmove', this.onTouchMove.bind(this))
        view.addEventListener('touchend', this.onTouchEnd.bind(this))
    }

    onTouchStart (evt) {
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

    onTouchMove (evt) {
        const camera = this.ctx.camera
        const view = this.ctx.app.view

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
                camera.x += evt.movementX
                camera.y += evt.movementY
                this.ctx.setCamera(
                    camera.x + evt.movementX,
                    camera.y + evt.movementY,
                    camera.zoom)

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
                    this.ctx.setCamera(
                        (camera.x - view.width / 2) * 1.05 + view.width / 2,
                        (camera.y - view.height / 2) * 1.05 + view.height / 2,
                        camera.zoom * 1.05)
                    // camera.zoom *= 1.05
                    // camera.x = (camera.x - view.width / 2) * 1.05 + view.width / 2
                    // camera.y = (camera.y - view.height / 2) * 1.05 + view.height / 2
                } else {
                    this.ctx.setCamera(
                        (camera.x - view.width / 2) / 1.05 + view.width / 2,
                        (camera.y - view.height / 2) / 1.05 + view.height / 2,
                        camera.zoom / 1.05)
                    // camera.zoom /= 1.05
                    // camera.x = (camera.x - view.width / 2) / 1.05 + view.width / 2
                    // camera.y = (camera.y - view.height / 2) / 1.05 + view.height / 2
                }
                //this.ctx.updateCamera()

                this.dollyStart = distance

                return

            default:
                this.state = this.STATE.NONE
        }
    }

    onTouchEnd (evt) {
        if (evt.timeStamp - this.startTime < 200) {
            evt.x = this.x
            evt.y = this.y

            const hex = this.ctx.grid.pointToHex(
                (evt.x - this.ctx.camera.x) / this.ctx.camera.zoom,
                (evt.y - this.ctx.camera.y) / this.ctx.camera.zoom)

            if (hex) {
                this.ctx.EventEmitter.emit('click', hex)
            }
        }

        this.state = this.STATE.NONE
    }
}
