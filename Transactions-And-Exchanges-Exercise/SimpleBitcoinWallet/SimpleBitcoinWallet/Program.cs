using System;
using System.Text;
using HBitcoin.KeyManagement;
using NBitcoin;
using QBitNinja.Client;
using QBitNinja.Client.Models;

namespace SimpleBitcoinWallet
{
    public class Program
    {
        private const string WalletFilePath = @"Wallets\";

        public static void Main()
        {
            Console.WriteLine("Enter operation [\"Create\", \"Recover\", \"Balance\", \"History\", \"Receive\", \"Send\", \"Exit\"]");
            var command = Console.ReadLine();

            while (command.ToLower() != "exit")
            {
                try
                {
                    switch (command.ToLower())
                    {
                        case "create":
                            CreateWallet();
                            break;

                        case "recover":
                            Console.WriteLine(
                                "Please note the wallet cannot check if your password is correct or not. " +
                                "If you provide a wrong password a wallet will be recovered with your " +
                                "provided mnemonic AND password pair: ");
                            Console.Write("Enter password: ");
                            string password = Console.ReadLine();
                            Console.Write("Enter mnemonic phrase: ");
                            string mnemonic = Console.ReadLine();
                            RecoverWallet(password, mnemonic);
                            Console.WriteLine("Wallet successfully recovered!");
                            break;

                        case "receive":
                            Console.Write("Enter wallet's name: ");
                            String walletName = Console.ReadLine();
                            Console.Write("Enter password: ");
                            password = Console.ReadLine();
                            Receive(walletName, password);
                            break;

                        case "balance":
                            Console.Write("Enter wallet's name: ");
                            walletName = Console.ReadLine();
                            Console.Write("Enter password: ");
                            password = Console.ReadLine();
                            Console.Write("Enter wallet address: ");
                            string walletAddress = Console.ReadLine();
                            decimal balance = GetBalance(walletName, password, walletAddress);
                            Console.WriteLine($"Balance of address: {balance}");
                            break;

                        case "history":
                            Console.Write("Enter wallet's name: ");
                            walletName = Console.ReadLine();
                            Console.Write("Enter password: ");
                            password = Console.ReadLine();
                            Console.Write("Enter wallet address: ");
                            walletAddress = Console.ReadLine();
                            ShowHistory(walletName,password,walletAddress);
                            break;

                        case "send":
                            Console.Write("Enter wallet's name: ");
                            walletName = Console.ReadLine();
                            Console.Write("Enter password: ");
                            password = Console.ReadLine();
                            Console.Write("Enter wallet address: ");
                            walletAddress = Console.ReadLine();
                            Console.Write("Select outpoint (transaction ID): ");
                            string outPoint = Console.ReadLine();
                            Send(walletName, password, walletAddress, outPoint);
                            break;

                        default:
                            Console.WriteLine("Invalid command!");
                            break;
                    }
                }
                catch (Exception exception)
                {
                    Console.WriteLine(exception.Message);
                }

                Console.WriteLine("Enter operation [\"Create\", \"Recover\", \"Balance\", \"History\", \"Receive\", \"Send\", \"Exit\"]");
                command = Console.ReadLine();
            }
        }

        private static void CreateWallet()
        {
            Network currentNetwork = Network.TestNet;
            string password;
            string confirmPassword;

            do
            {
                Console.Write("Enter password: ");
                password = Console.ReadLine();
                Console.Write("Confirm password: ");
                confirmPassword = Console.ReadLine();

                if (password != confirmPassword)
                {
                    Console.WriteLine("Passwords did not match!");
                    Console.WriteLine("Try again.");
                }
            } while (password != confirmPassword);

            bool failure = true;
            while (failure)
            {
                try
                {
                    Console.Write("Enter wallet name: ");
                    var walletName = Console.ReadLine();
                    Mnemonic mnemonic;
                    Safe safe = Safe.Create(out mnemonic, password, $"{WalletFilePath}{walletName}.json", currentNetwork);
                    Console.WriteLine("Wallet created successfully");
                    Console.WriteLine("Write down the following mnemonic words.");
                    Console.WriteLine("With the mnemonic words AND the password you can recover this wallet.");
                    Console.WriteLine();
                    Console.WriteLine("----------");
                    Console.WriteLine(mnemonic);
                    Console.WriteLine("----------");
                    Console.WriteLine("Write down and keep in SECURE place your private keys. Only through them you can access your coins!");

                    for (int i = 0; i < 10; i++)
                    {
                        Console.WriteLine($"Address: {safe.GetAddress(i)} -> Private key: {safe.FindPrivateKey(safe.GetAddress(i))}");
                    }

                    failure = false;
                }
                catch
                {
                    Console.WriteLine("Wallet already exists!");
                }
            }
        }

        private static void RecoverWallet(string password, string mnemonicString)
        {
            Mnemonic mnemonic = new Mnemonic(mnemonicString);
            Network currentNetwork = Network.TestNet;
            Random random = new Random();
            Safe safe = Safe.Recover(mnemonic, password, $"{WalletFilePath}RecoveredWalletNum{random.Next()}.json", currentNetwork, creationTime: DateTimeOffset.Now);
        }

        private static void Receive(string walletName, string password)
        {
            Safe safe = LoadSafe(walletName, password);

            for (int i = 0; i < 10; i++)
            {
                Console.WriteLine(safe.GetAddress(i));
            }
        }

        private static decimal GetBalance(string walletName, string password, string walletAddress)
        {
            Safe safe = LoadSafe(walletName, password);
            QBitNinjaClient client = new QBitNinjaClient(Network.TestNet);
            var balance = client.GetBalance(BitcoinAddress.Create(walletAddress), true).Result;

            decimal totalBalance = 0;

            foreach (var entry in balance.Operations)
            {
                foreach (var coin in entry.ReceivedCoins)
                {
                    Money amount = (Money) coin.Amount;
                    decimal currentAmount = amount.ToDecimal(MoneyUnit.BTC);
                    totalBalance += currentAmount;
                }
            }

            return totalBalance;
        }

        private static void ShowHistory(string walletName, string password, string walletAddress)
        {
            Safe safe = LoadSafe(walletName, password);
            QBitNinjaClient client = new QBitNinjaClient(Network.TestNet);
            var coinsReceived = client.GetBalance(BitcoinAddress.Create(walletAddress), true).Result;

            string header = "-----COINS RECEIVED-----";
            Console.WriteLine(header);

            foreach (var entry in coinsReceived.Operations)
            {
                foreach (var coin in entry.ReceivedCoins)
                {
                    Money amount = (Money)coin.Amount;
                    Console.WriteLine($"Transaction Id: {coin.Outpoint}; Received coins: {amount.ToDecimal(MoneyUnit.BTC)}");
                }
            }

            Console.WriteLine(new string('-',header.Length));

            var coinsSpent = client.GetBalance(BitcoinAddress.Create(walletAddress)).Result;

            header = "-----COINS SPENT-----";
            Console.WriteLine(header);

            foreach (var entry in coinsSpent.Operations)
            {
                foreach (var coin in entry.SpentCoins)
                {
                    Money amount = (Money)coin.Amount;
                    Console.WriteLine($"Transaction Id: {coin.Outpoint}; Spent coins: {amount.ToDecimal(MoneyUnit.BTC)}");
                }
            }

            Console.WriteLine(new string('-', header.Length));
        }


        private static void Send(string walletName, string password, string walletAddress, string outPoint)
        {
            Safe safe = LoadSafe(walletName, password);
            BitcoinExtKey privateKey = GetPrivateKey(safe, walletAddress);
            OutPoint outpoint = GetOutPoint(walletAddress, outPoint);

            Transaction transaction = new Transaction();
            transaction.Inputs.Add(new TxIn()
            {
                PrevOut = outpoint
            });

            BitcoinAddress addressToSendTo = GetAddressToSendTo();

            Console.Write("Enter amount to send: ");
            decimal amountToSend = decimal.Parse(Console.ReadLine());

            TxOut outTran = new TxOut()
            {
                Value = new Money(amountToSend, MoneyUnit.BTC),
                ScriptPubKey = addressToSendTo.ScriptPubKey
            };

            Console.Write("Enter amount to get back: ");
            decimal amountToGetBack = decimal.Parse(Console.ReadLine());

            TxOut changeBackTran = new TxOut()
            {
                Value = new Money(amountToGetBack, MoneyUnit.BTC),
                ScriptPubKey = privateKey.ScriptPubKey
            };

            Console.Write("Enter message: ");
            string message = Console.ReadLine();
            var bytes = Encoding.UTF8.GetBytes(message);

            TxOut messageTran = new TxOut()
            {
                Value = Money.Zero,
                ScriptPubKey = TxNullDataTemplate.Instance.GenerateScriptPubKey(bytes)
            };

            transaction.Outputs.Add(outTran);
            transaction.Outputs.Add(changeBackTran);
            transaction.Outputs.Add(messageTran);

            transaction.Inputs[0].ScriptSig = privateKey.ScriptPubKey;
            transaction.Sign(privateKey, false);

            QBitNinjaClient client = new QBitNinjaClient(Network.TestNet);
            BroadcastResponse broadcastResponse = client.Broadcast(transaction).Result;

            if (broadcastResponse.Success)
            {
                Console.WriteLine("Transaction send!");
            }
            else
            {
                Console.WriteLine("Something went wrong! :(");
            }
        }

        private static Safe LoadSafe(string walletName, string password)
        {
            try
            {
                Safe safe = Safe.Load(password, $"{WalletFilePath}{walletName}.json");
                return safe;
            }
            catch
            {
                throw new Exception("Invalid wallet name or password!");
            }
        }

        private static BitcoinExtKey GetPrivateKey(Safe safe, string walletAddress)
        {
            BitcoinExtKey privateKey = null;

            for (int i = 0; i < 10; i++)
            {
                if (safe.GetAddress(i).ToString() == walletAddress)
                {
                    Console.Write("Enter private key: ");
                    string privateKeyAsString = Console.ReadLine();
                    privateKey = new BitcoinExtKey(privateKeyAsString);

                    if (!privateKey.Equals(safe.FindPrivateKey(safe.GetAddress(i))))
                    {
                        throw new Exception("Invalid private key!");
                    }

                    break;
                }
            }

            if (privateKey == null)
            {
                throw new Exception("Invalid wallet address!");
            }

            return privateKey;
        }

        private static OutPoint GetOutPoint(string walletAddress, string outPoint)
        {
            QBitNinjaClient client = new QBitNinjaClient(Network.TestNet);
            var balance = client.GetBalance(BitcoinAddress.Create(walletAddress)).Result;
            OutPoint outPointToSpend = null;

            foreach (var entry in balance.Operations)
            {
                foreach (var coin in entry.ReceivedCoins)
                {
                    if (coin.Outpoint.ToString().Substring(0, coin.Outpoint.ToString().Length - 2) == outPoint)
                    {
                        outPointToSpend = coin.Outpoint;
                        break;
                    }
                }
            }

            if (outPointToSpend == null)
            {
                throw new Exception("Invalid Outpoint (Transaction ID)!");
            }

            return outPointToSpend;
        }

        private static BitcoinAddress GetAddressToSendTo()
        {
            Console.Write("Enter address to send to: ");
            return BitcoinAddress.Create(Console.ReadLine());
        }
    }
}
