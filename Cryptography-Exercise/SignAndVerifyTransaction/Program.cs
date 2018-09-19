namespace SignAndVerifyTransaction
{
    using System;
    using System.Linq;
    using System.Text;
    using Newtonsoft.Json;
    using Org.BouncyCastle.Asn1.Sec;
    using Org.BouncyCastle.Asn1.X9;
    using Org.BouncyCastle.Crypto;
    using Org.BouncyCastle.Crypto.Digests;
    using Org.BouncyCastle.Crypto.Generators;
    using Org.BouncyCastle.Crypto.Parameters;
    using Org.BouncyCastle.Crypto.Signers;
    using Org.BouncyCastle.Math;
    using Org.BouncyCastle.Math.EC;
    using Org.BouncyCastle.Security;

    public class Program
    {
        private static readonly X9ECParameters Curve = SecNamedCurves.GetByName("secp256k1");
        private static readonly ECDomainParameters Domain = new ECDomainParameters(Curve.Curve, Curve.G, Curve.N, Curve.H);

        public static void Main()
        {
            SignAndVerifyTransaction(
                recipientAddress: "f51362b7351ef62253a227a77751ad9b2302f911",
                value: 25000,
                fee: 10,
                dateCreated: "2018-02-10T17:53:48.972Z",
                senderPrivKeyHex: "7e4670ae70c98d24f3662c172dc510a085578b9ccc717e6c2f4e547edd960a34"
            );
        }

        private static void SignAndVerifyTransaction(string recipientAddress, int value, int fee, string dateCreated,
            string senderPrivKeyHex)
        {
            Console.WriteLine("Generate and sign transaction");
            Console.WriteLine("-----------------------------");

            Console.WriteLine("Sender Private Key: " + senderPrivKeyHex);
            BigInteger privateKey = new BigInteger(senderPrivKeyHex, 16);

            ECPoint pubKey = GetPublicKeyFromPrivateKey(privateKey);
            string senderPubKeyCompressed = EncodeEcPointHexCompressed(pubKey);
            Console.WriteLine("Public key (compressed): " + senderPubKeyCompressed);

            string senderAddress = CalcRipeMd160(senderPubKeyCompressed);
            Console.WriteLine("Blockchain address: " + senderAddress);

            var tran = new
            {
                from = senderAddress,
                to = recipientAddress,
                senderPubKey = senderPubKeyCompressed,
                value,
                fee,
                dateCreated
            };

            string transactionJson = JsonConvert.SerializeObject(tran);
            Console.WriteLine("Transaction (JSON): " + transactionJson);

            string transactionHash = CalcSha256(transactionJson);
            Console.WriteLine("Transaction hash: " + transactionHash);

            BigInteger[] transactionSignature = SignData(privateKey, GetBytes(transactionHash));
            Console.WriteLine("Transaction signature: [{0}, {1}]", transactionSignature[0].ToString(16), transactionSignature[1].ToString(16));

            var tranSigned = new
            {
                from = senderAddress,
                to = recipientAddress,
                senderPubKey = senderPubKeyCompressed,
                value,
                fee,
                dateCreated,
                senderSignature = new []
                {
                    transactionSignature[0].ToString(16),
                    transactionSignature[1].ToString(16)
                }
            };

            string signedTranJson = JsonConvert.SerializeObject(tranSigned, Formatting.Indented);
            Console.WriteLine("Signed Transaction (JSON):");
            Console.WriteLine(signedTranJson);

            //Verify tran
            ECPublicKeyParameters ecPubKey = ToPublicKey(senderPrivKeyHex);
            bool isVerified = VerifySignature(ecPubKey, transactionSignature, GetBytes(transactionHash));
            Console.WriteLine("Is the signature valid ? - " + isVerified);
        }

        private static BigInteger[] SignData(BigInteger privateKey, byte[] data)
        {
            ECPrivateKeyParameters keyParameters = new ECPrivateKeyParameters(privateKey, Domain);
            IDsaKCalculator kCalculator = new HMacDsaKCalculator(new Sha256Digest());
            ECDsaSigner signer = new ECDsaSigner(kCalculator);
            signer.Init(true, keyParameters);
            BigInteger[] signature = signer.GenerateSignature(data);

            return signature;
        }

        public static bool VerifySignature(ECPublicKeyParameters pubKey, BigInteger[] signature, byte[] msg)
        {
            IDsaKCalculator kCalculator = new HMacDsaKCalculator(new Sha256Digest());
            ECDsaSigner signer = new ECDsaSigner(kCalculator);
            signer.Init(false, pubKey);

            return signer.VerifySignature(msg, signature[0], signature[1]);
        }

        private static void RandomPrivateKeyToAddress()
        {
            Console.WriteLine("Random private key --> public key --> address");
            Console.WriteLine("---------------------------------------------");

            var keyPair = GenerateRandomKeys();
            BigInteger privateKey = ((ECPrivateKeyParameters) keyPair.Private).D;

            Console.WriteLine("Private key (hex): " + privateKey.ToString(16));
            Console.WriteLine("Private key: " + privateKey.ToString(10));

            ECPoint pubKey = ((ECPublicKeyParameters) keyPair.Public).Q;
            Console.WriteLine("Public key: ({0}, {1})",
                pubKey.XCoord.ToBigInteger().ToString(10),
                pubKey.YCoord.ToBigInteger().ToString(10));

            string pubKeyCompressed = EncodeEcPointHexCompressed(pubKey);
            Console.WriteLine("Public key (compressed): " + pubKeyCompressed);

            string address = CalcRipeMd160(pubKeyCompressed);
            Console.WriteLine("Blockchain address: " + address);
        }

        private static AsymmetricCipherKeyPair GenerateRandomKeys(int keySize = 256)
        {
            ECKeyPairGenerator generator = new ECKeyPairGenerator();
            SecureRandom secureRandom = new SecureRandom();
            KeyGenerationParameters parameters = new KeyGenerationParameters(secureRandom, keySize);
            generator.Init(parameters);
            return generator.GenerateKeyPair();
        }

        private static ECPoint GetPublicKeyFromPrivateKey(BigInteger privateKey)
        {
            ECPoint pubKey = Curve.G.Multiply(privateKey).Normalize();
            return pubKey;
        }

        private static ECPublicKeyParameters ToPublicKey(string privateKey)
        {
            BigInteger d = new BigInteger(privateKey, 16);
            var q = Domain.G.Multiply(d);

            var publicParams = new ECPublicKeyParameters(q, Domain);
            return publicParams;
        }

        private static string EncodeEcPointHexCompressed(ECPoint point)
        {
            BigInteger x = point.XCoord.ToBigInteger();
            BigInteger y = point.YCoord.ToBigInteger();

            return x.ToString(16) + Convert.ToInt32(y.TestBit(0));
        }

        private static string CalcRipeMd160(string data)
        {
            byte[] bytes = GetBytes(data);
            RipeMD160Digest digest = new RipeMD160Digest();
            digest.BlockUpdate(bytes, 0, bytes.Length);
            byte[] result = new byte[digest.GetDigestSize()];
            digest.DoFinal(result, 0);
            return BytesToHex(result);
        }

        private static string CalcSha256(string data)
        {
            byte[] bytes = GetBytes(data);
            Sha256Digest digest = new Sha256Digest();
            digest.BlockUpdate(bytes, 0, bytes.Length);
            byte[] result = new byte[digest.GetDigestSize()];
            digest.DoFinal(result, 0);
            return BytesToHex(result);
        }

        private static byte[] GetBytes(string data)
        {
            byte[] bytes = Encoding.UTF8.GetBytes(data);
            return bytes;
        }

        private static string BytesToHex(byte[] bytes)
        {
            return String.Concat(bytes.Select(b => b.ToString("x2")));
        }
    }
}
