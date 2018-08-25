import Visual from './visual/index'
import Conn from './conn/index'

export default async function main () {
    const conn = new Conn()

    //conn.login()
    //conn.pushCamera()

    const vis = new Visual()

    const base = await conn.fetchBase()

    vis.jumpTo(base.x, base.y, 3)
}
