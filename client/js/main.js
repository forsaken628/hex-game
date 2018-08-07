import Visual from './visual/index'
import Conn from './conn/index'

/**
 * 游戏主函数
 */
export default class Main {
    constructor () {


        //conn.login()
        //conn.pushCamera()

        const vis = new Visual()

        vis.conn.fetchBase()

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

}


