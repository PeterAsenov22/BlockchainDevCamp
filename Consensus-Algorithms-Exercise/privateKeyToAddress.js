const elliptic = require('elliptic')
const RIPEMD160 = require('ripemd160')

let ec = new elliptic.ec('secp256k1')

// let keyPair = ec.genKeyPair()
let keyPair = ec.keyFromPrivate('fe549dbcccfbd11e255f6037e1e640efaca0e19966ac77a592fdf06d295952a4')
let privKey = keyPair.getPrivate('hex')
let pubKey = keyPair.getPublic()
let pubKeyCompressed = `${pubKey.x.toString('hex')}${(Number(pubKey.y) % 2 === 0) ? '1' : '0'}`

console.log(`Private key: ${privKey}`)
console.log('Public key:', pubKey.encode('hex').substr(2))
console.log('Public key (compressed):', pubKeyCompressed)

let address = new RIPEMD160().update(pubKeyCompressed).digest('hex')
console.log('Address:', address)
