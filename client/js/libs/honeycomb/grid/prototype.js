import { isString, isNumber } from '../axis.js'

import { DIRECTION_COORDINATES, DIAGONAL_DIRECTION_COORDINATES } from '../hex/constants'

/**
 * Get a hex from a grid.
 *
 * @memberof Grid#
 * @instance
 *
 * @param {(number|point)} keyOrPoint   An index/key or a point.
 * @returns {hex}                       The found hex or `undefined`.
 *
 * @example
 * const Grid = Honeycomb.defineGrid()
 * const Hex = Grid.Hex
 * const grid = Grid.rectangle({ width: 2, height: 2 })
 *
 * grid.get(0)              // { x: 0, y: 0 }
 * grid.get(Hex(0, 1))      // { x: 0, y: 1 }
 * grid.get({ x: 0, y: 1 }) // { x: 0, y: 1 }
 * grid.get([0, 1])         // { x: 0, y: 1 }
 *
 * grid.get(42)             // undefined
 * grid.get(Hex(6, -2))     // undefined
 */
export function get(keyOrPoint) {
    if (isNumber(keyOrPoint)) {
        return this[keyOrPoint]
    } else {
        return this[this.indexOf(keyOrPoint)]
    }
}

export function setFactory({ isValidHex }) {
    /**
     * Replace a hex with another hex. This is a safe alternative to using bracket notation (`grid[0] = 'invalid'`).
     *
     * If the target hex isn't present in the grid, the new hex is added (using {@link Grid#push}) to the grid.
     * If the new hex is invalid, nothing changes.
     *
     * @memberof Grid#
     * @instance
     *
     * @param {(number|point)} keyOrPoint   The coordinates of the hex that must be replaced.
     * @param {hex} newHex                  The replacing hex.
     *
     * @returns {grid}                      Itself.
     *
     * @example
     * const Grid = Honeycomb.defineGrid()
     * const Hex = Grid.Hex
     * const grid = Grid(Hex(0, 0)) // [ { x: 0, y: 0 } ]
     *
     * // replace a hex:
     * grid.set(0, Hex(1, 1))
     * grid                         // [ { x: 1, y: 1 } ]
     * // the target hex can also be a point:
     * grid.set([1, 1], Hex(2, 2))
     * grid                         // [ { x: 2, y: 2 } ]
     *
     * // invalid replace values are ignored:
     * grid.set(0, 'invalid')
     * grid                         // [ { x: 2, y: 2 } ]
     *
     * // when the target hex isn't present in the grid, the replacing hex is added instead:
     * grid.set({ x: 9, y: 9 }, Hex(3, 3))
     * grid                         // [ { x: 2, y: 2 }, { x: 3, y: 3 } ]
     */
    return function set(keyOrPoint, newHex) {
        if (!isValidHex(newHex)) {
            return this
        }

        const index = isNumber(keyOrPoint) ? keyOrPoint : this.indexOf(keyOrPoint)

        if (index < 0) {
            this.push(newHex)
        } else {
            this[index] = newHex
        }

        return this
    }
}

/**
 * @memberof Grid#
 * @see {@link https://www.redblobgames.com/grids/hexagons/#line-drawing|redblobgames.com}
 *
 * @param {hex} firstHex    The first hex.
 * @param {hex} lastHex     The last hex.
 *
 * @returns {hex[]}         Array (not a {@link grid}) of hexes in a straight line from `firstHex` to (and including) `lastHex`.
 *
 * @example
 * const Grid = Honeycomb.defineGrid()
 * const Hex = Grid.Hex
 * const grid = Grid.rectangle({ width: 4, height: 4 })
 *
 * grid.hexesBetween(Hex(), Hex(3)) // [
 *                                  //    { x: 0, y: 0 },
 *                                  //    { x: 0, y: 1 },
 *                                  //    { x: 1, y: 1 },
 *                                  //    { x: 2, y: 2 },
 *                                  //    { x: 3, y: 2 },
 *                                  //    { x: 3, y: 3 },
 *                                  // ]
 */
export function hexesBetween(firstHex, lastHex) {
    const distance = firstHex.distance(lastHex)
    const step = 1.0 / Math.max(distance, 1)
    let hexes = []

    for (let i = 0; i <= distance; i++) {
        const hex = firstHex.nudge().lerp(lastHex.nudge(), step * i).round()
        hexes.push(this.get(hex))
    }

    return hexes
}

export function neighborsOfFactory({ isValidHex, signedModulo, compassToNumberDirection }) {
    /**
     * @memberof Grid#
     * @instance
     * @see {@link https://www.redblobgames.com/grids/hexagons/#neighbors|redblobgames.com}
     *
     * @param {hex} hex
     * A hex to get 1 or more neighbors from.
     * @param {((COMPASS_DIRECTION|number)[]|COMPASS_DIRECTION|number|all)} [directions=all]
     * 1 or more directions. Either (an array of) {@link COMPASS_DIRECTION|compass directions} or numbers or the string `'all'`.
     * @param {boolean} [diagonal=false]
     * Whether to get the diagonal neighbor. See {@link https://www.redblobgames.com/grids/hexagons/#neighbors-diagonal|redblobgames.com}.
     *
     * @returns {hex[]}
     * An array of 0 up to 6 neighboring hexes. Only hexes that are present in the grid are returned.
     *
     * @throws {Error} When no valid hex is passed.
     * @throws {Error} When the direction is invalid for the hex.
     *
     * @example
     * const Hex = Honeycomb.extendHex({ orientation: 'pointy' })
     * const Grid = Honeycomb.defineGrid(Hex)
     * // conveniently creates a grid consisting of a hex surrounded by 6 hexes:
     * const grid = Grid.hexagon({ radius: 1 })
     *
     * // all neighbors:
     * grid.neighborsOf(Hex())          // [
     *                                  //    { x: 1, y: 0 },
     *                                  //    { x: 0, y: 1 },
     *                                  //    { x: -1, y: 1 },
     *                                  //    { x: -1, y: 0 },
     *                                  //    { x: -1, y: -1 },
     *                                  //    { x: 0, y: -1 },
     *                                  // ]
     * // specific neighbor:
     * grid.neighborsOf(Hex(), 'NW')    // [{ x: -1, y: -1 }]
     * grid.neighborsOf(Hex(), 4)       // [{ x: -1, y: -1 }]
     *
     * // multiple neighbors:
     * grid.neighborsOf(Hex(), ['SE', 'SW'])    // [
     *                                          //    { x: 0, y: 1 },
     *                                          //    { x: -1, y: 1 }
     *                                          // ]
     *
     * grid.neighborsOf(Hex(), [1, 2])          // [
     *                                          //    { x: 0, y: 1 },
     *                                          //    { x: -1, y: 1 }
     *                                          // ]
     * // diagonal neighbor:
     * grid.neighborsOf(Hex(-1, 0), 'E', true)  // [{ x: 0, y: -1 }]
     *
     * // only returns hexes that exist in the grid:
     * grid.neighborsOf(Hex(-1, -1), 'NW')      // []
     */
    return function neighborsOf(hex, directions = 'all', diagonal = false) {
        if (!isValidHex(hex)) {
            throw new Error(`Invalid hex: ${hex}.`)
        }

        const coordinates = diagonal ? DIAGONAL_DIRECTION_COORDINATES : DIRECTION_COORDINATES

        if (directions === 'all') {
            directions = [0, 1, 2, 3, 4, 5]
        }

        return directions = []
            // ensure directions is an array
            .concat(directions)
            .map(direction => {
                // todo: move this to a util, also grid/statics.js#277
                if (isString(direction)) {
                    direction = compassToNumberDirection(direction, hex.orientation)
                }

                if (direction < 0 || direction > 5) {
                    direction = signedModulo(direction, 6)
                }

                const { q, r } = coordinates[direction]
                return this.get(hex.cubeToCartesian({ q: hex.q + q, r: hex.r + r }))
            })
            .filter(Boolean)
    }
}
