const WebSocket = require('ws')
const {extendHex, defineGrid} = require('honeycomb-grid')
const wss = new WebSocket.Server({
    port: 8001,
    perMessageDeflate: {
        zlibDeflateOptions: { // See zlib defaults.
            chunkSize: 1024,
            memLevel: 7,
            level: 3,
        },
        zlibInflateOptions: {
            chunkSize: 10 * 1024
        },
        // Other options settable:
        clientNoContextTakeover: true, // Defaults to negotiated value.
        serverNoContextTakeover: true, // Defaults to negotiated value.
        clientMaxWindowBits: 10,       // Defaults to negotiated value.
        serverMaxWindowBits: 10,       // Defaults to negotiated value.
        // Below options specified as default values.
        concurrencyLimit: 10,          // Limits zlib concurrency for perf.
        threshold: 1024,               // Size (in bytes) below which messages
                                       // should not be compressed.
    }
})

const Hex = extendHex({size: 10})
const Grid = defineGrid(Hex)

// wss.on('connection', function connection (ws) {
//     ws.on('message', function incoming (message) {
//         console.log('received: %s', message)
//     })
//
//     ws.send('something')
// })

// const https = require('https');
// const WebSocket = require('ws');
//
// const server = new https.createServer({
//     cert: fs.readFileSync('/path/to/cert.pem'),
//     key: fs.readFileSync('/path/to/key.pem')
// });
