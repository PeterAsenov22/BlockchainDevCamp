const express = require('express')
const bodyParser = require('body-parser')
const app = express()

const fs = require('fs')

const util = require('util')

const ethers = require('ethers')
const provider = ethers.providers.getDefaultProvider('ropsten')

const walletDirectory = 'Wallets/'

if (!fs.existsSync(walletDirectory)){
     fs.mkdirSync(walletDirectory)
}

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.set('view engine', 'ejs')
app.engine('html', require('ejs').renderFile)

app.use(express.static('public'))

//Home page
app.get('/', (req, res) => {
    res.render(__dirname + '/views/index.html')
})


//Page for creating a wallet
app.get('/create', (req, res) => {
    res.render(__dirname + '/views/create.html')
})

// Create endpoint
app.post('/create', (req, res) => {
    let password = req.body.password
    let confirmPassword = req.body.confirmPassword

    if (password !== confirmPassword) { 
        res.render(__dirname + '/views/create.html', {
            error: 'Passwords do not match.'
        })

        return
    }

    let randomEntropyBytes = ethers.utils.randomBytes(16)
    let mnemonic = ethers.HDNode.entropyToMnemonic(randomEntropyBytes)
    let wallet = ethers.Wallet.fromMnemonic(mnemonic)

    wallet.encrypt(password).then((jsonWallet) => {
        let filename  = "UTC_JSON_WALLET_" + Math.round(+ new Date() / 1000)
                                           + "_" + Math.random(10000, 10000)
                                           + ".json"

        fs.writeFile(walletDirectory + filename, jsonWallet, 'utf8', (err) => {
            if (err) {
                res.render(__dirname + '/views/create.html', {
                    mnemonic: mnemonic,
                    jsonWallet: jsonWallet,
                    filename: filename,
                    error: 'Problem with writing'
                })

                return
            }

            drawView(res, 'create', {
                mnemonic: mnemonic,
                jsonWallet: jsonWallet,
                filename: filename
            })
        })
    })
})

app.get('/send', (req, res) => {
    res.render(__dirname + '/views/send.html')
})

app.post('/send', (req, res) => {
    let recipient = req.body.recipient
    let privateKey = req.body.privateKey
    let amount = req.body.amount

    if (!recipient || !privateKey || !amount || parseFloat(amount) <= 0) {
        drawView(res, "send", { 
            error : 'Check the form for errors.'
        })
        return
    }
    
    let wallet;

    try{
        wallet = new ethers.Wallet(privateKey, provider)
    } catch(e) {
        drawView(res, "send", { 
            error : e.reason
        })
        return
    }

    let gasPrice = 6
    let gas = 21000

    wallet
      .send(
        recipient,
        ethers.utils.parseEther(amount),
        { gasLimit: gas * gasPrice})
      .then(transaction => {
          drawView(res, 'send', {transactionHash: transaction.hash})
      })
      .catch(err => {
          drawView(res, 'send', {error: JSON.parse(err.responseText).error.message})
      })
})

app.get('/balance', (req, res) => {
	res.render(__dirname + '/views/balance.html');
})

app.post('/balance', (req, res) => {
   let filename = req.body.filename
   let password = req.body.password
    
    //read the file
    fs.readFile(walletDirectory + filename, 'utf8', async (err, jsonWallet) => {
        if(err) {
            drawView(res, "balance", { wallets : undefined, error : 'Error with reading file.' })
        }
    
        ethers.Wallet.fromEncryptedWallet(jsonWallet, password).then(async (wallet) => {
            let derivationPath = "m/44'/60'/0'/0/"
            let wallets = []

            for (let i = 0; i < 5; i++) {
                let hdNode = ethers.HDNode.fromMnemonic(wallet.mnemonic)
                  .derivePath(derivationPath + i)
                
                let walletInstance = new ethers.Wallet(hdNode.privateKey, provider)
                let balance = await walletInstance.getBalance()
                wallets.push({
                    keypair: walletInstance,
                    balance: ethers.utils.formatEther(balance)
                })
            }

            drawView(res, "balance", { wallets : wallets })
        }).catch( (err) => {
            drawView(res, "balance", { error : 'The password is wrong.' })
        })
    })
})

//recover wallet
app.get('/recover', (req, res) => {
    res.render(__dirname + '/views/recover.html')
})

//recover wallet
app.post('/recover', (req, res) => {
    let mnemonic = req.body.mnemonic
    let password = req.body.password

    const wallet = ethers.Wallet.fromMnemonic(mnemonic)

    wallet.encrypt(password).then((jsonWallet) => {
        let filename  = "UTC_JSON_WALLET_" + Math.round(+ new Date() / 1000)
                                           + "_" + Math.random(10000, 10000)
                                           + ".json"

        fs.writeFile(walletDirectory + filename, jsonWallet, 'utf8', (err) => {
            if (err) {
                drawView(res, 'recover', {
                    error: 'There is problem with file writing.'
                })

                return
            }

            drawView(res, 'recover', {
                message: 'The wallet is recovered.',
                mnemonic: mnemonic,
                filename: filename
            })
        })
    })
})

//load your wallet
app.get('/load', (req, res) => {
    res.render(__dirname + '/views/load.html')
})

app.post('/load', (req, res) => {
    let filename = req.body.filename
    let password = req.body.password

    fs.readFile(walletDirectory + filename, 'utf8', (err, jsonWallet) => {
        if (err) { 
            res.render(__dirname + "/views/load.html", {
                error : 'The file doesn\'t exist'
            }) 
        }

        ethers.Wallet.fromEncryptedWallet(jsonWallet, password)
           .then(wallet => {
               drawView(res, 'load', {
                   address: wallet.address,
                   privateKey: wallet.privateKey,
                   mnemonic: wallet.mnemonic
               })
           })
           .catch(error => {
               drawView(res, 'load', {
                   error: 'Wrong password.'
               })
           })
    })
})

function drawView(res, view, data){
    res.render(__dirname + "/views/" +  view + ".html", data)
}

app.listen(3000)