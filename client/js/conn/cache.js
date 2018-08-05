export default class Cache {
    constructor () {
        this.store = {}
        this.id = 0
    }

    add (name, fn) {
        if (!name || !fn || typeof fn !== 'function') {
            return
        }
        this.store[name] = {name, fn, data: {}, wait: {}}
    }

    get (name, key) {
        if (key === undefined || key === null) {
            key = ''
        } else if (typeof key === 'object') {
            throw new Error('key can\'t be a object')
        }

        const self = this.store[name]
        if (self.data[key]) {
            return Promise.resolve(JSON.parse(self.data[key]))
        }

        if (self.wait[key]) {
            return new Promise((resolve, reject) => {
                self.wait[key].list.push({resolve, reject})
            })
        }

        const id = this.getId()
        const p = new Promise((resolve, reject) => {
            self.wait[key] = {id, list: [{resolve, reject}]}
        })

        const wait = self.wait[key]
        self.fn(key)
            .then(data => {
                    if (id !== wait.id) {
                        return
                    }
                    self.data[key] = JSON.stringify(data)
                    for (let v of wait.list) {v.resolve(data)}
                    self.wait[key] = null
                },
                err => {
                    if (id !== wait.id) {
                        return
                    }
                    for (let v of wait.list) {v.reject(err)}
                    self.wait[key] = null
                })
        return p
    }

    clear (name, key) {
        const self = this.store[name]
        self.data[key] = null

        const wait = self.wait[key]
        if (!wait) {
            return
        }

        const id = this.getId()
        wait.id = id

        self.fn(key)
            .then(data => {
                    if (id !== wait.id) {
                        return
                    }
                    self.data[key] = JSON.stringify(data)
                    for (let v of wait.list) {v.resolve(data)}
                    self.wait[key] = null
                },
                err => {
                    if (id !== wait.id) {
                        return
                    }
                    for (let v of wait.list) {v.reject(err)}
                    self.wait[key] = null
                })
    }

    clearAll (name) {
        const self = this.store[name]

        Object.keys()

        this.store[name].data = {}
    }

    getId () {
        this.id++
        return id
    }

}
