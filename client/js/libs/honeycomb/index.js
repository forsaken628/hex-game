import { ensureXY } from './utils'
import extendHexFactory from './hex/index'
import defineGridFactory from './grid/index'
import Grid from './grid/class'
import PointFactory from './point/index'

const Point = PointFactory({ ensureXY })
const extendHex = extendHexFactory({ ensureXY, Point })
const defineGrid = defineGridFactory({ extendHex, Grid, Point })

/**
 * @namespace {Object} Honeycomb
 */
export {
    extendHex,
    defineGrid,
    Point
}
