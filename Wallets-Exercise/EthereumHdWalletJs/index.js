const ethers = require('ethers')

function restoreHdNode (mnemonic) {
  return ethers.HDNode.fromMnemonic(mnemonic)
}

function restoreHdWallet (mnemonic) {
  return ethers.Wallet.fromMnemonic(mnemonic)
}

function generateRandomHdWallet () {
  return ethers.Wallet.createRandom()
}

function saveWalletAsJson (wallet, password) {
  return wallet.encrypt(password)
}

function decryptWalletFromJson (json, password) {
  return ethers.Wallet.fromEncryptedJson(json, password)
}

function deriveFiveWalletsFromHdNode (mnemonic, derivationPath) {
  let wallets = []

  for (let i = 0; i < 5; i++) {
    let hdNode = ethers.HDNode.fromMnemonic(mnemonic).derivePath(derivationPath + i)
    console.log(hdNode)
    let wallet = new ethers.Wallet(hdNode.privateKey)
    wallets.push(wallet)
  }

  return wallets
}

function signTransaction (wallet, toAddress, value) {
  let transaction = {
    nonce: 0,
    gasLimit: 21000,
    gasPrice: ethers.utils.bigNumberify('2000000000'),
    to: toAddress,
    value: ethers.utils.parseEther(value),
    data: '0x'
  }

  return wallet.sign(transaction)
}

let mnemonic = 'upset fuel enhance depart portion hope core animal innocent will athlete snack'
console.log(restoreHdNode(mnemonic))
console.log('----------------------------------------------------------')

console.log(restoreHdWallet(mnemonic))
console.log('----------------------------------------------------------')

let derivationPath = "m/44'/60'/0'/0/"
let wallets = deriveFiveWalletsFromHdNode(mnemonic, derivationPath)
let firstWallet = wallets[1]
let recipient = '0x933b946c4fec43372c5580096408d25b3c7936c5'
let value = '1.0'

signTransaction(firstWallet, recipient, value)
  .then(signedTransaction => console.log('Signed transaction:\n' + signedTransaction))

let wallet = generateRandomHdWallet()
let password = 'p@$$word'

console.log('----------------------------------------------------------')
console.log('----------------------------------------------------------')
console.log(JSON.stringify(wallet))
console.log('----------------------------------------------------------')
console.log('----------------------------------------------------------')

saveWalletAsJson(wallet, password)
  .then(json => {
    console.log('----------------------------------------------------------')
    console.log('----------------------------------------------------------')
    console.log(json)
    console.log('----------------------------------------------------------')
    console.log('----------------------------------------------------------')
    decryptWalletFromJson(json, password)
      .then(decrypted => console.log(JSON.stringify(decrypted)))
  })


