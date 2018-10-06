$(document).ready(function () {
    const derivationPath = "m/44'/60'/0'/0/";
    const provider = ethers.providers.getDefaultProvider('ropsten');

    let wallets = {};

    showView("viewHome");

    $('#linkHome').click(function () {
        showView("viewHome");
    });

    $('#linkCreateNewWallet').click(function () {
        $('#passwordCreateWallet').val('');
        $('#textareaCreateWalletResult').val('');
        showView("viewCreateNewWallet");
    });

    $('#linkImportWalletFromMnemonic').click(function () {
        $('#textareaOpenWallet').val('');
        $('#passwordOpenWallet').val('');
        $('#textareaOpenWalletResult').val('');
        $('#textareaOpenWallet').val('toddler online monitor oblige solid enrich cycle animal mad prevent hockey motor');
        showView("viewOpenWalletFromMnemonic");
    });

    $('#linkImportWalletFromFile').click(function () {
        $('#walletForUpload').val('');
        $('#passwordUploadWallet').val('');
        showView("viewOpenWalletFromFile");
    });

    $('#linkShowMnemonic').click(function () {
        $('#passwordShowMnemonic').val('');
        showView("viewShowMnemonic");
    });

    $('#linkShowAddressesAndBalances').click(function () {
        $('#passwordShowAddresses').val('');
        $('#divAddressesAndBalances').empty();
        showView("viewShowAddressesAndBalances");
    });

    $('#linkSendTransaction').click(function () {
        $('#divSignAndSendTransaction').hide();

        $('#passwordSendTransaction').val('');
        $('#transferValue').val('');
        $('#senderAddress').empty();

        $('#textareaSignedTransaction').val('');
        $('#textareaSendTransactionResult').val('');

        showView("viewSendTransaction");
    });

    $('#buttonGenerateNewWallet').click(generateNewWallet);
    $('#buttonOpenExistingWallet').click(openWalletFromMnemonic);
    $('#buttonUploadWallet').click(openWalletFromFile);
    $('#buttonShowMnemonic').click(showMnemonic);
    $('#buttonShowAddresses').click(showAddressesAndBalances);
    $('#buttonSendAddresses').click(unlockWalletAndDeriveAddresses);
    $('#buttonSignTransaction').click(signTransaction);
    $('#buttonSendSignedTransaction').click(sendSignedTransaction);

    $('#linkDelete').click(deleteWallet);

    function showView(viewName) {
        // Hide all views and show the selected view only
        $('main > section').hide();
        $('#' + viewName).show();

        if (localStorage.JSON) {
            $('#linkCreateNewWallet').hide();
            $('#linkImportWalletFromMnemonic').hide();
            $('#linkImportWalletFromFile').hide();

            $('#linkShowMnemonic').show();
            $('#linkShowAddressesAndBalances').show();
            $('#linkSendTransaction').show();
            $('#linkDelete').show();
        }
        else {
            $('#linkShowMnemonic').hide();
            $('#linkShowAddressesAndBalances').hide();
            $('#linkSendTransaction').hide();
            $('#linkDelete').hide();

            $('#linkCreateNewWallet').show();
            $('#linkImportWalletFromMnemonic').show();
            $('#linkImportWalletFromFile').show();
        }
    }

    function showInfo(message) {
        $('#infoBox>p').html(message);
        $('#infoBox').show();
        $('#infoBox>header').click(function () {
            $('#infoBox').hide();
        })
    }

    function showError(errorMsg) {
        $('#errorBox>p').html('Error: ' + errorMsg);
        $('#errorBox').show();
        $('#errorBox>header').click(function () {
            $('#errorBox').hide();
        })
    }

    function showLoadingProgress(percent) {
        $('#loadingBox').html("Loading... " + parseInt(percent * 100) + "% complete");
        $('#loadingBox').show();
        $('#loadingBox>header').click(function () {
            $('#errorBox').hide();
        })
    }

    function hideLoadingBar() {
        $('#loadingBox').hide();
    }

    function showLoggedInButtons() {
        $('#linkCreateNewWallet').hide();
        $('#linkImportWalletFromMnemonic').hide();
        $('#linkImportWalletFromFile').hide();

        $('#linkShowMnemonic').show();
        $('#linkShowAddressesAndBalances').show();
        $('#linkSendTransaction').show();
        $('#linkDelete').show();
    }

    function encryptAndSaveJSON(wallet, password) {
        return wallet.encrypt(password, {}, showLoadingProgress)
          .then(json => {
              localStorage['JSON'] = json;
              showLoggedInButtons();
          })
          .catch(showError)
          .finally(hideLoadingBar);
    }

    function decryptWallet(json, password) {
        return ethers.Wallet.fromEncryptedWallet(json, password, showLoadingProgress);
    }

    function generateNewWallet() {
        let password = $('#passwordCreateWallet').val();
        let wallet = ethers.Wallet.createRandom();

        encryptAndSaveJSON(wallet, password)
           .then(() => {
               showInfo("PLEASE SAVE YOUR MNEMONIC: " + wallet.mnemonic);
               $('#textareaCreateWalletResult').val(localStorage.JSON);
           })
    }

    function openWalletFromMnemonic() {
        let mnemonic = $('#textareaOpenWallet').val();
        console.log(mnemonic);
        if(!ethers.HDNode.isValidMnemonic(mnemonic)) {
            return showError('Invalid mnemonic!')
        }

        let password = $('#passwordOpenWallet').val();
        let wallet = ethers.Wallet.fromMnemonic(mnemonic);

        encryptAndSaveJSON(wallet, password)
           .then(() => {
               showInfo('Wallet successfully loaded.');
               $('#textareaOpenWalletResult').val(localStorage.JSON);
           })
    }

    function openWalletFromFile() {
        if($('#walletForUpload')[0].files.length == 0){
            return showError('Please select a file to upload.')
        }

        let password = $('#passwordUploadWallet').val();
        let fileReader = new FileReader();
        fileReader.onload = function () {
            let json = fileReader.result;

            decryptWallet(json, password)
              .then(wallet => {
                  if(!wallet.mnemonic) {
                      return showError('Invalid JSON file!')
                  }

                  localStorage['JSON'] = json;
                  showInfo('Wallet successfully loaded.');
                  showLoggedInButtons();
              })
              .catch(showError)
              .finally(hideLoadingBar);
        };

        fileReader.readAsText($('#walletForUpload')[0].files[0]);
    }

    function showMnemonic() {
        let password = $('#passwordShowMnemonic').val();
        let json = localStorage.JSON;

        decryptWallet(json, password)
          .then(wallet => {
              showInfo('Your mnemonic is: ' + wallet.mnemonic);
          })
          .catch(showError)
          .finnaly(hideLoadingBar);
    }

    function showAddressesAndBalances() {
        let password = $('#passwordShowAddresses').val();
        let json = localStorage.JSON;

        decryptWallet(json, password)
          .then(renderAddressesAndBalances)
          .catch(err => {
              $('#divAddressesAndBalances').empty();
              showError(err);
          })
          .finnaly(hideLoadingBar);

        function renderAddressesAndBalances(wallet) {
            $('#divAddressesAndBalances').empty();
            let masterNode = ethers.HDNode.fromMnemonic(wallet.mnemonic);

            for (let i = 0; i < 5; i++) {
                let div = $('<div id="qrcode">');
                let wallet = new ethers.Wallet(masterNode.derivePath(derivationPath + i).privateKey, provider);
                
                wallet
                  .getBalance()
                  .then(balance => {
                      div.qrcode(wallet.address);
                      div.append($(`<p>${wallet.address}: ${ethers.utils.formatEther(balance)} ETH</p>`));
                      $('#divAddressesAndBalances').append(div);
                  })
                  .catch(showError);
            }
        }
    }

    function unlockWalletAndDeriveAddresses() {
        let password = $('#passwordSendTransaction').val();
        let json = localStorage.JSON;

        decryptWallet(json, password)
          .then(wallet => {
              showInfo('Wallet successfully unlocked!');
              renderAddresses(wallet);
              $('#divSignAndSendTransaction').show();
          })
          .catch(showError)
          .finally(() => {
              $('#passwordSendTransaction').val('');
              hideLoadingBar();
           });

        function renderAddresses(wallet) {
            $('#senderAddresses').empty();
            let masterNode = ethers.HDNode.fromMnemonic(wallet.mnemonic);

            for (let i = 0; i < 5; i++) {
                let div = $('<div id="qrcode">');
                let wallet = new ethers.Wallet(masterNode.derivePath(derivationPath + i).privateKey, provider);
                let address = wallet.address;
                wallets[address] = wallet;

                let option = $(`<option id=${address}>`).text(address);
                $('#senderAddress').append(option);
            }
        }
    }

    function signTransaction() {
        let senderAddress = $('#senderAddress option:selected').attr('id');
        let wallet = wallets[senderAddress];
        if(!wallet) {
            return showError('Invalid address!');
        }

        let recipient = $('#recipientAddress').val();
        if(!recipient) {
            return showError('Invalid recipient!');
        }

        let value = $('#transferValue').val();
        if(!value) {
            return showError('Invalid transfer value!');
        }

        wallet
          .getTransactionCount()
          .then(signTran)
          .catch(showError);
        
        function signTran(nonce) {
            let transaction = {
                nonce,
                gasLimit: 210000,
                gasPrice: ethers.utils.bigNumberify("20000000000"),
                to: recipient,
                value: ethers.utils.parseEther(value.toString()),
                data: '0x',
                chainId: provider.chainId
            }

            let signedTransaction = wallet.sign(transaction);
            $('#textareaSignedTransaction').val(signedTransaction);
        }
    }

    function sendSignedTransaction() {
        let signedTransaction = $('#textareaSignedTransaction').val();
        provider
          .sendTransaction(signedTransaction)
          .then(tranHash => {
              showInfo("Transaction hash: " + tranHash);
              let etherscanUrl = `https://ropsten.etherscan.io/tx/${tranHash}`;
              $('#textareaSendTransactionResult').val(etherscanUrl);
          })
          .catch(showError);
    }

    function deleteWallet() {
        localStorage.clear();
        showView('viewHome');
    }
});