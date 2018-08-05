import * as qcloud from '../libs/wafer2-client-sdk/index'
import * as util from '../utils/util.js'
import Cache from './cache'
import Session from '../libs/wafer2-client-sdk/lib/session'
import EventEmitter from '../libs/EventEmitter'

export default class Conn {
    constructor () {
        this.isLogin = false
        this.userInfo = null

        qcloud.setLoginUrl('http://127.0.0.1:8001/weapp/login')

        this.EventEmitter = new EventEmitter()

        this.ws = this.socket()

        this.cache = new Cache()
        this.cache.add('fetchUser', function () {
            return new Promise((resolve, reject) => {
                qcloud.request({
                    url: 'http://127.0.0.1:8001/weapp/user',
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
                        url: 'http://127.0.0.1:8001/weapp/user',
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

        //const ws = new WebSocket('wss://nftmahoo.ws.qcloud.la')
        const ws = new WebSocket(`ws://127.0.0.1:8001/socket?skey=${skey}`)

        ws.onopen = function (e) {
            console.log('连接服务器成功')
            //ws.send('game1')
        }
        ws.onclose = function (e) {
            console.log('服务器关闭')
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
                url: 'http://127.0.0.1:8001/weapp/camera',
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
}
