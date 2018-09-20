let crypto = require('crypto')
let scrypt = require('scryptsy')

// let message = 'blockchain'
// let hmac = crypto.createHmac('sha512', 'devcamp')
// let signed = hmac.update(message).digest('hex')

// let key = 'p@$$w0rd~3'
// let salt = '7b07a2977a473e84fc30d463a2333bcfea6cb3400b16bec4e17fe981c925ba4f'
// let data = scrypt(key, salt, 16384, 16, 1, 32)

let password = 'p@$$w0rd~3'
let message = 'exercise-cryptography'
let salt = '7b07a2977a473e84fc30d463a2333bcfea6cb3400b16bec4e17fe981c925ba4f'

let data = scrypt(password, salt, 16384, 16, 1, 512)

let dataHex = data.toString('hex')
let encrKey = dataHex.slice(0, 256)
let hmacKey = dataHex.slice(256, 512)

console.log(encrKey)
console.log('--------------------------')
console.log(hmacKey)
console.log('--------------------------')

let hmac = crypto.createHmac('sha256', hmacKey)
let mac = hmac.update(message).digest('hex')

console.log('MAC: ' + mac)
