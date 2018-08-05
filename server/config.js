const CONF = {
    port: '8001',
    rootPathname: '',

    // 微信小游戏 App ID
    appId: 'wx984cd170430179aa',

    // 微信小游戏 App Secret
    appSecret: 'ea65f4637dff129be00e494a59a1030d',

    // 是否使用腾讯云代理登录小游戏
    useQcloudLogin: false,

    /**
     * MySQL 配置，用来存储 session 和用户信息
     * 若使用了腾讯云微信小游戏解决方案
     * 开发环境下，MySQL 的初始密码为您的微信小游戏 appid
     */
    mysql: {
        host: 'localhost',
        port: 3306,
        user: 'root',
        db: 'cAuth',
        pass: '',
        char: 'utf8mb4'
    },

    cos: {
        /**
         * 地区简称
         * @查看 https://cloud.tencent.com/document/product/436/6224
         */
        region: 'ap-guangzhou',
        // Bucket 名称
        fileBucket: 'qcloudtest',
        // 文件夹
        uploadFolder: ''
    },

    // 微信登录态有效期
    wxLoginExpires: 720000,
    wxMessageToken: 'abcdefgh',

    serverHost:'',
    tunnelServerUrl:'',
    tunnelSignatureKey:'',
    qcloudAppId:'',
    qcloudSecretId:'',
    qcloudSecretKey:'',
}

module.exports = CONF
