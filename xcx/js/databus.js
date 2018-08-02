import { Application, Graphics } from './libs/pixi'

let instance

/**
 * 全局状态管理器
 */
export default class DataBus {
    constructor () {
        if (instance)
            return instance

        instance = this

        //this.pool = new Pool()

        //this.reset()
    }

    init () {
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
            zoom: 1
        }

        this.caster = new TouchCaster(this.app.view)

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
