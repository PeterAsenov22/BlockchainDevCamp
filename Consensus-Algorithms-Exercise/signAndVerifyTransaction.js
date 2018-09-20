const CryptoJs = require('crypto-js')
const EC = require('elliptic').ec
// const sha3 = require('js-sha3')

let secp256k1 = EC('secp256k1')

function signData (data, privKey) {
  let keyPair = secp256k1.keyFromPrivate(privKey)
  let signature = keyPair.sign(data)
  return [signature.r.toString(16), signature.s.toString(16)]
}

function decompressPublicKey (pubKeyCompressed) {
  let pubKeyX = pubKeyCompressed.substring(0, 64)
  let pubKeyY = pubKeyCompressed.substring(64)
  let pubKeyPoint = secp256k1.curve.pointFromX(pubKeyX, pubKeyY)

  return pubKeyPoint
}

function verifySignature (data, publicKey, signature) {
  let pubKeyPoint = decompressPublicKey(publicKey)
  let keyPair = secp256k1.keyPair({ pub: pubKeyPoint })
  return keyPair.verify(data, { r: signature[0], s: signature[1] })
}

class Transaction {
  constructor (from, to, value, fee, dateCreated, data, senderPubKey) {
    this.from = from
    this.to = to
    this.value = value
    this.fee = fee
    this.dateCreated = dateCreated
    this.data = data
    this.senderPubKey = senderPubKey
  }

  calculateTransactionHash () {
    let transactionDataJson = JSON.stringify(this)

    this.transactionHash = CryptoJs.SHA256(transactionDataJson).toString()
  }

  sign (privateKey) {
    this.senderSignature = signData(this.transactionHash, privateKey)
  }

  verify () {
    return verifySignature(this.transactionHash, this.senderPubKey, this.senderSignature)
  }
}

// let privKey = '97ddae0f3a25b92268175400149d65d6887b9cefaf28ea2c078e05cdc15a3c0a'
// let message = 'Message for signing'
// let messageHash = sha3.keccak256(message)
// console.log(signData(messageHash, privKey))

let transaction = new Transaction(
  'c3293572dbe6ebc60de4a20ed0e21446cae66b17',
  'f51362b7351ef62253a227a77751ad9b2302f911',
  25000,
  10,
  '2018-02-10T17:53:48.972Z',
  'Send to Bob',
  'c74a8458cd7a7e48f4b7ae6f4ae9f56c5c88c0f03e7c59cb4132b9d9d1600bba1'
)

transaction.calculateTransactionHash()
transaction.sign('7e4670ae70c98d24f3662c172dc510a085578b9ccc717e6c2f4e547edd960a34')
console.log(transaction.senderSignature)
console.log(transaction.verify())
