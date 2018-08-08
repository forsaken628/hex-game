import { compassToNumberDirection, ensureXY, signedModulo } from '../utils'
import PointFactory from '../point/index'
import * as methods from './prototype'

const Point = PointFactory({ensureXY})

/**
 * @private
 *
 * The only way to prevent setting invalid items in a grid (`grid[0] = 'not a hex'`) is by using proxies.
 * A proxy can have a `set` trap that can prevent the setting of invalid hexes.
 *
 * Some approaches include:
 * 1. Wrapping the grid instance returned from GridFactory in a proxy.
 * 2. Putting a proxy in the prototype chain of Grid (this "shields" the Array prototype methods).
 * 3. Using a proxy to forward certain calls to the Array prototype (and not extending Array at all).
 */

function Grid () {}

Grid.isValidHex = function (value) {
    return (value || {}).__isHoneycombHex === true
}

Grid.prototype = Object.assign([], {

    fill () {
        throw new TypeError('Grid.prototype.fill is not implemented')
    },

    includes (point, fromIndex = 0) {
        return !!(this.indexOf(point, fromIndex) + 1)
    },

    indexOf (point, fromIndex = 0) {
        const {length} = this
        let i = Number(fromIndex)

        point = Point(point)
        i = Math.max(i >= 0 ? i : length + i, 0)

        for (i; i < length; i++) {
            if (this[i].equals(point)) {
                return i
            }
        }

        return -1
    },

    lastIndexOf (point, fromIndex = this.length - 1) {
        const {length} = this
        let i = Number(fromIndex)

        point = Point(point)
        i = i >= 0 ? Math.min(i, length - 1) : length + i

        for (i; i >= 0; i--) {
            if (this[i].equals(point)) {
                return i
            }
        }

        return -1
    },

    push (...hexes) {
        return Object.getPrototypeOf(Object.getPrototypeOf(this)).push.call(this, ...hexes.filter(Grid.isValidHex))
    },

    splice (start, deleteCount, ...hexes) {
        // when deleteCount is undefined/null, it's casted to 0, deleting 0 hexes
        // this is not according to spec: it should delete all hexes (starting from `start`)
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
        if (deleteCount == null) {
            return Object.getPrototypeOf(Object.getPrototypeOf(this)).splice.call(this, start)
        }

        return Object.getPrototypeOf(Object.getPrototypeOf(this)).splice.call(this, start, deleteCount, ...hexes.filter(Grid.isValidHex))
    },

    /**
     * Identical to {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift|Array#unshift},
     * but filters out any passed invalid hexes.
     *
     * @memberof Grid#
     * @override
     *
     * @param {...hex} [hexes]  Hexes to add to the start of the grid. Invalid hexes are ignored.
     *
     * @returns {number}        The new length of the grid.
     *
     * @example
     * const Grid = Honeycomb.defineGrid()
     * const Hex = Grid.Hex
     *
     * const grid = Grid(Hex(0))    // [{ x: 0, y: 0 }]
     * grid.unshift(Hex(1))         // 2
     * grid                         // [{ x: 1, y: 1 }, { x: 0, y: 0 }]
     *
     * grid.unshift('invalid')      // 2
     * grid                         // [{ x: 1, y: 1 }, { x: 0, y: 0 }]
     */
    unshift (...hexes) {
        return Object.getPrototypeOf(Object.getPrototypeOf(this)).unshift.call(this, ...hexes.filter(Grid.isValidHex))
    },

    get: methods.get,

    hexesBetween: methods.hexesBetween,

    neighborsOf: methods.neighborsOfFactory({
        isValidHex: Grid.isValidHex,
        signedModulo,
        compassToNumberDirection
    }),

    set: methods.setFactory({isValidHex: Grid.isValidHex})

})

export default Grid
