let instance

export default class Socket {
    constructor() {
        if (instance)
            return instance

        instance = this

        this.init()
    }

    init() {
        const ws = new WebSocket('ws://192.168.17.80:8001');
        this.ws = ws

        ws.onopen = function (e) {
            console.log("连接服务器成功");
            ws.send("game1");
        }
        ws.onclose = function (e) {
            console.log("服务器关闭");
        }
        ws.onerror = function () {
            console.log("连接出错");
        }

        ws.onmessage = function (e) {
           console.log(e)
        }
    }
}

