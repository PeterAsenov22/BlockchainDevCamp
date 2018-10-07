$(document).ready(function () {
    const ethereumProvider = ethers.providers.getDefaultProvider('ropsten');
    const votingContractAddress = "0xfacc93ba8511917768a1ba8f72a1fb9d56ca2d40";
    const votingContractABI = [
        {
            "constant": false,
            "inputs": [
                {
                    "name": "name",
                    "type": "string"
                }
            ],
            "name": "addCandidate",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "index",
                    "type": "uint32"
                }
            ],
            "name": "vote",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "candidatesCount",
            "outputs": [
                {
                    "name": "",
                    "type": "uint32"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "index",
                    "type": "uint32"
                }
            ],
            "name": "getCandidate",
            "outputs": [
                {
                    "name": "",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "index",
                    "type": "uint32"
                }
            ],
            "name": "getVotes",
            "outputs": [
                {
                    "name": "",
                    "type": "uint32"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        }
    ];
    const votingContract = new ethers.Contract(votingContractAddress, votingContractABI, ethereumProvider);

    showView("viewHome");

    $('#linkHome').click(function () {
        showView("viewHome");
    });

    $('#linkLogin').click(function () {
        showView("viewLogin");
    });

    $('#linkRegister').click(function () {
        showView("viewRegister");
    });

    $('#linkLogout').click(logout);

    $('#buttonLogin').click(login);
    $('#buttonRegister').click(register);

    function showView(viewName) {
        // Hide all views and show the selected view only
        $('main > section').hide();
        $('#' + viewName).show();
        const loggedIn = sessionStorage.jsonWallet;
        if (loggedIn) {
            $('.show-after-login').show();
            $('.hide-after-login').hide();
        } else {
            $('.show-after-login').hide();
            $('.hide-after-login').show();
        }
        if (viewName === 'viewHome')
            loadVotingResults();
    }

    // Attach AJAX "loading" event listener
    $(document).on({
        ajaxStart: function() { $("#ajaxLoadingBox").fadeIn(200) },
        ajaxStop: function() { $("#ajaxLoadingBox").fadeOut(200) }
    });

    function showInfo(message) {
        $('#infoBox>p').html(message);
        $('#infoBox').show();
        $('#infoBox>header').click(function () {
            $('#infoBox').hide();
        });
    }

    function showError(errorMsg, err) {
        let msgDetails = "";
        if (err && err.responseJSON)
            msgDetails = err.responseJSON.errorMsg;
        $('#errorBox>p').html('Error: ' + errorMsg + msgDetails);
        $('#errorBox').show();
        $('#errorBox>header').click(function () {
            $('#errorBox').hide();
        });
    }

    function showProgressBox(percent) {
        let msg = "Wallet encryption / decryption ... " +
            Math.round(percent * 100) + "% complete";
        $('#progressBox').html(msg).show(100);
    }

    function hideProgressProgress() {
        $('#progressBox').hide(100);
    }

    async function login() {
        let username = $('#usernameLogin').val();
        let walletPassword = $('#passwordLogin').val();
        let backendPass = CryptoJS.HmacSHA256(username, walletPassword).toString();

        try{
            let result = await $.ajax({
                type: 'POST',
                url: '/login',
                data: JSON.stringify({username, password: backendPass}),
                contentType: 'application/json'
            });

            sessionStorage['username'] = username;
            sessionStorage['jsonWallet'] = result.jsonWallet;
            showView('viewHome');
            showInfo(`User "${username}" logged in successfully.`);
        } catch (err) {
            showError('Cannot login user. ', err);
        }finally{
            $('#usernameLogin').val('');
            $('#passwordLogin').val('');
        }    
    }

    async function register() {
        let username = $('#usernameRegister').val();
        let walletPassword = $('#passwordRegister').val();
        try {
            let wallet = ethers.Wallet.createRandom();
            let jsonWallet = await wallet.encrypt(walletPassword, {}, showProgressBox);
            let backendPass = CryptoJS.HmacSHA256(username, walletPassword).toString();

            await $.ajax({
                type: 'POST',
                url: '/register',
                data: JSON.stringify({username, password: backendPass, jsonWallet}),
                contentType: 'application/json'
            });

            sessionStorage['username'] = username;
            sessionStorage['jsonWallet'] = jsonWallet;
            showView('viewHome');
            showInfo(`User "${username}" registered successfully. Please save your mnemonics: <b>${wallet.mnemonic}</b>`);
        } catch(err){
            showError('Cannot register user. ', err);
        } finally{
            hideProgressProgress();
        }
    }

    async function loadVotingResults() {
        try {
            let candidates = [];
            let candidatesCount = await votingContract.candidatesCount();

            for (let i = 0; i < candidatesCount; i++) {
                let candidate = await votingContract.getCandidate(i);
                let votes = await votingContract.getVotes(i);
                candidates.push({candidate, votes});
            }

            let votingResultsUl = $('#votingResults').empty();
            for (let i = 0; i < candidatesCount; i++) {
                let candidate = candidates[i];
                let li = $('<li>').html(`${candidate.candidate} -> ${candidate.votes} votes `);
                if(sessionStorage['username']){
                    let button = $('<input type="submit" value="Vote">');
                    button.click(function (){
                        vote(i, candidate.candidate);
                    });

                    li.append(button);
                }

                li.appendTo(votingResultsUl);
            }
        } catch (err) {
            showError(err);
        }
    }

    async function vote(candidateIndex, candidateName) {
        try {
            let jsonWallet = sessionStorage['jsonWallet'];
            let walletPassword = prompt('Enter your wallet password:');
            let wallet = await ethers.Wallet.fromEncryptedWallet(jsonWallet, walletPassword, showProgressBox);
            let privateKey = wallet.privateKey;
            const votingContract = new ethers.Contract(
                votingContractAddress, votingContractABI,
                new ethers.Wallet(privateKey, ethereumProvider));
            let votingResult = await votingContract.vote(candidateIndex);
            let tranHash = votingResult.hash;
            showInfo(`Voted successfully for ${candidateName}.` + 
              `See the transaction: <a href="https://ropsten.etherscan.io/tx/${tranHash}" target="_blank">${tranHash}</a>`);
        } catch (err) {
            showError(err);
        } finally {
            hideProgressProgress();
        }
    }

    function logout() {
        sessionStorage.clear();
        showView('viewHome');
    }
});


