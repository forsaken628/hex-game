import * as qcloud from '../libs/wafer2-client-sdk/index'
import * as util from '../utils/util.js'
import Cache from './cache'
import Session from '../libs/wafer2-client-sdk/lib/session'
import EventEmitter from '../libs/EventEmitter'

//const host = 'nftmahoo.qcloud.la'
const host = '127.0.0.1:5757'
//const host = '192.168.4.11:5757'
const tls = ''

let instance

class Conn {
    constructor () {
        if (instance)
            return instance

        instance = this

        this.isLogin = false
        this.userInfo = null

        qcloud.setLoginUrl(`http${tls}://${host}/weapp/login`)

        this.EventEmitter = new EventEmitter()

        this.ws = this.socket()

        this.cache = new Cache()
        this.cache.add('fetchUser', function () {
            return new Promise((resolve, reject) => {
                qcloud.request({
                    url: `http${tls}://${host}/weapp/user`,
                    //login: true,
                    success (result) {
                        util.showSuccess('登录成功')
                        resolve(result.data.data)
                        // that.isLogin = true
                        // that.userInfo = result.data.data
                    },
                    fail (error) {
                        util.showModel('请求失败', error)
                        reject(error)
                        //console.log('request fail', error)
                    }
                })

            })
        })
    }

    login () {
        if (this.isLogin) return

        const that = this

        util.showBusy('正在登录')
        qcloud.login({
            success (result) {
                if (result) {
                    util.showSuccess('登录成功')
                    this.isLogin = true
                    this.userInfo = result
                } else {
                    // 如果不是首次登录，不会返回用户信息，请求用户信息接口获取
                    qcloud.request({
                        url: `http${tls}://${host}/weapp/user`,
                        login: true,
                        success (result) {
                            util.showSuccess('登录成功')
                            that.isLogin = true
                            that.userInfo = result.data.data
                        },
                        fail (error) {
                            util.showModel('请求失败', error)
                            console.log('request fail', error)
                        }
                    })
                }
            },
            fail (error) {
                util.showModel('登录失败', error)
                console.log('登录失败', error)
            }
        })
    }

    socket () {
        let skey = Session.get()
        if (!skey) {
            //todo
        }

        const ws = new WebSocket(`ws${tls}://${host}/socket?skey=${skey}`)

        ws.onopen = function (e) {
            console.log('连接服务器成功')
            //ws.send('game1')
        }

        ws.onclose = e => {
            console.log('服务器关闭', e)
            const socket = this.socket.bind(this)
            wx.showModal({
                content: 'websocket断开',
                showCancel: false,
                confirmText: '重连',
                success: () => {
                    socket()
                }
            })
        }

        ws.onerror = function () {
            console.log('连接出错')
        }

        ws.onmessage = e => {
            this.EventEmitter.emit('message', JSON.parse(e.data))
        }

        return ws
    }

    fetchUser () {
        return this.cache.get('fetchUser')
    }

    // todo 错误内部处理
    pushCamera (data) {
        return new Promise((resolve, reject) => {
            qcloud.request({
                method: 'put',
                url: `http${tls}://${host}/weapp/camera`,
                data,
                login: true,
                success (result) {
                    resolve(result.data.data)
                },
                fail (error) {
                    reject(error)
                }
            })
        })
    }

    fetchBase () {
        return new Promise((resolve, reject) => {
            qcloud.request({
                url: `http${tls}://${host}/weapp/hexs/base`,
                //login: true,
                success (result) {
                    console.log(result.data)
                    //util.showSuccess('登录成功')
                    resolve(result.data.data)
                    // that.isLogin = true
                    // that.userInfo = result.data.data
                },
                fail (error) {
                    //util.showModel('请求失败', error)
                    reject(error)
                    //console.log('request fail', error)
                }
            })
        })
    }

    fetchHexs (data) {
        return new Promise((resolve, reject) => {
            qcloud.request({
                url: `http${tls}://${host}/weapp/hexs/rectangle`,
                method: 'post',
                data,
                //login: true,
                success (result) {
                    //util.showSuccess('登录成功')
                    resolve(result.data.data)
                    // that.isLogin = true
                    // that.userInfo = result.data.data
                },
                fail (error) {
                    //util.showModel('请求失败', error)
                    reject(error)
                    //console.log('request fail', error)
                }
            })
        })
    }
}

export default Conn
