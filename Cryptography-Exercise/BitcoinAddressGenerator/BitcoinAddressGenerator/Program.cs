namespace BitcoinAddressGenerator
{
    using System;
    using System.Globalization;
    using System.Numerics;
    using System.Security.Cryptography;

    public class Program
    {
        public static void Main()
        {
            string hexHash = "0450863AD64A87AE8A2FE83C1AF1A8403CB53F53E486D8511DAD8A04887E5B23522CD470243453A299FA9E77237716103ABC11A1DF38855ED6F2EE187E9C582BA6";
            byte[] publicKey = HexToByte(hexHash);
            Console.WriteLine($"Public key: {ByteToHex(publicKey)}");

            byte[] publicKeySha = Sha256(publicKey);
            Console.WriteLine($"Sha Public key: {ByteToHex(publicKeySha)}");

            byte[] publicKeyShaRipe = RipeMd160(publicKeySha);
            Console.WriteLine($"Ripe Sha Public key: {ByteToHex(publicKeyShaRipe)}");

            byte[] preHashWNetwork = AppendBitcoinNetwork(publicKeyShaRipe, 0);
            byte[] publicHash = Sha256(preHashWNetwork);
            Console.WriteLine($"Public Hash: {ByteToHex(publicHash)}");

            byte[] publicHashHash = Sha256(publicHash);
            Console.WriteLine($"Public HashHash: {ByteToHex(publicHashHash)}");

            Console.WriteLine($"Checksum: {ByteToHex(publicHashHash).Substring(0,4)}");

            byte[] address = ConcatAddress(preHashWNetwork, publicHashHash);
            Console.WriteLine($"Address: {ByteToHex(address)}");
        }

        public static string Base58Encode(byte[] array)
        {
            const string alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
            string retString = string.Empty;
            BigInteger encodeSize = alphabet.Length;
            BigInteger arrayToInt = 0;

            foreach (byte t in array)
            {
                arrayToInt = arrayToInt * 256 + t;
            }

            while (arrayToInt > 0)
            {
                int rem = (int)(arrayToInt % encodeSize);
                arrayToInt /= encodeSize;
                retString = alphabet[rem] + retString;
            }

            for (int i = 0; i < array.Length && array[i] == 0; ++i)
            {
                retString = alphabet[0] + retString;
            }

            return retString;
        }

        private static string ByteToHex(byte[] pubKeySha)
        {
            return BitConverter.ToString(pubKeySha);
        }

        private static byte[] ConcatAddress(byte[] ripeHash, byte[] checksum)
        {
            byte[] ret = new byte[ripeHash.Length + 4];
            Array.Copy(ripeHash,ret,ripeHash.Length);
            Array.Copy(checksum,0,ret,ripeHash.Length,4);
            return ret;
        }

        private static byte[] AppendBitcoinNetwork(byte[] ripeHash, byte network)
        {
            byte[] extended = new byte[ripeHash.Length+1];
            extended[0] = network;
            Array.Copy(ripeHash,0,extended,1,ripeHash.Length);

            return extended;
        }

        private static byte[] RipeMd160(byte[] publicKeySha)
        {
            RIPEMD160Managed manager = new RIPEMD160Managed();
            return manager.ComputeHash(publicKeySha);
        }

        private static byte[] Sha256(byte[] publicKey)
        {
            SHA256Managed manager = new SHA256Managed();
            return manager.ComputeHash(publicKey);
        }

        private static byte[] HexToByte(string hexString)
        {
            if (hexString.Length % 2 != 0)
            {
                throw new Exception("Invalid HEX!");
            }

            byte[] retArray = new byte[hexString.Length/2];

            for (int i = 0; i < retArray.Length; i++)
            {
                retArray[i] = Byte.Parse(hexString.Substring(i*2,2),NumberStyles.HexNumber,CultureInfo.InvariantCulture);
            }

            return retArray;
        }
    }
}
