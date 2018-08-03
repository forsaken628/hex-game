import {Application, Graphics} from './libs/pixi'
import {extendHex} from "./libs/honeycomb.min";

let instance

/**
 * 全局状态管理器
 */
export default class DataBus {
    constructor() {
        if (instance)
            return instance

        instance = this

        //this.pool = new Pool()

        //this.reset()
    }

    init() {
        this.app = new Application({
            width: canvas.width,
            height: canvas.height,
            //transparent: false,
            view: canvas
        })

        this.graphics = new Graphics()
        this.app.stage.addChild(this.graphics)

        this.camera = {
            x: 0,
            y: 0,
            zoom: 3
        }

        this.updateCamera()

        this.hex = extendHex({size: 10})

        const caster = new TouchCaster(this.app.view, this.graphics, this.camera)

    }

    updateCamera() {
        this.graphics.setTransform(this.camera.x, this.camera.y, this.camera.zoom, this.camera.zoom)
    }

    // reset() {
    //   this.frame      = 0
    //   this.score      = 0
    //   this.bullets    = []
    //   this.enemys     = []
    //   this.animations = []
    //   this.gameOver   = false
    // }
}

function TouchCaster(dataBus) {
    this.ctx = dataBus

    this.state = this.STATE.NONE

    this.startTime = 0
    this.panStart = {}
    this.dollyStart = 0
    this.move0 = {}
    this.listen()
}

TouchCaster.prototype.STATE = {NONE: -1, TOUCH_ROTATE: 1, TOUCH_DOLLY: 2, TOUCH_PAN: 3}

TouchCaster.prototype.listen = function () {
    const view = this.ctx.app.view
    view.addEventListener('touchstart', this.onTouchStart.bind(this))
    view.addEventListener('touchmove', this.onTouchMove.bind(this))
    view.addEventListener('touchend', this.onTouchEnd.bind(this))
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
            this.ctx.updateCamera()

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
                camera.zoom *= 1.05
                camera.x = (camera.x - view.width / 2) * 1.05 + view.width / 2
                camera.y = (camera.y - view.height / 2) * 1.05 + view.height / 2
            } else {
                camera.zoom /= 1.05
                camera.x = (camera.x - view.width / 2) / 1.05 + view.width / 2
                camera.y = (camera.y - view.height / 2) / 1.05 + view.height / 2
            }
            this.ctx.updateCamera()

            this.dollyStart = distance

            return

        default:
            this.state = this.STATE.NONE
    }
}

TouchCaster.prototype.onTouchEnd = function (evt) {

    if (evt.timeStamp - this.startTime < 200) {
        evt.x = this.x
        evt.y = this.y
        //bus.emit('click', evt)
    }

    this.state = this.STATE.NONE
}
