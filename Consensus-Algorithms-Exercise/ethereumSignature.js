let elliptic = require('elliptic')
let sha3 = require('js-sha3')

let ec = new elliptic.ec('secp256k1')
let message = 'exercise-cryptography'

let keyPair = ec.keyFromPrivate('97ddae0f3a25b92268175400149d65d6887b9cefaf28ea2c078e05cdc15a3c0a')
let privKey = keyPair.getPrivate('hex')
let pubKey = keyPair.getPublic()

console.log(`Private key: ${privKey}`)
console.log('Public key:', pubKey.encode('hex').substr(2))
console.log('Public key (compressed):', pubKey.encodeCompressed('hex'))

let messageHash = sha3.keccak256(message)
let signature = ec.sign(messageHash, privKey, 'hex', { canonical: true })
let pubKeyYCoordCompressed = (Number(pubKey.y) % 2 === 0) ? '01' : '00'

let result = {
  signature: `0x${signature.r.toString('hex')}${signature.s.toString('hex')}${pubKeyYCoordCompressed}`,
  v: signature.recoveryParam,
  r: signature.r.toString('hex'),
  s: signature.s.toString('hex')
}

console.log('MessageHash: ' + messageHash)
console.log('Signature: ' + result.signature)

let hexToDecimal = (x) => ec.keyFromPrivate(x, 'hex').getPrivate().toString(10)
let pubKeyRecovered = ec.recoverPubKey(hexToDecimal(messageHash), result, signature.recoveryParam, 'hex')
console.log('Public key recovered (compressed):', pubKeyRecovered.encodeCompressed('hex'))

let validSig = ec.verify(messageHash, signature, pubKeyRecovered)
console.log('Signature valid?', validSig)

let address = sha3.keccak_256(pubKey.encode('hex').substr(2)).slice(-40)
console.log('Ethereum Address: ' + '0x' + address)
