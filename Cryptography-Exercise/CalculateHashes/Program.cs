namespace CalculateHashes
{
    using HashLib;
    using Org.BouncyCastle.Crypto.Digests;
    using Nethereum.Util;
    using System;
    using System.Text;
    using System.Security.Cryptography;

    public class Program
    {
        public static void Main()
        {
            Console.Write("Enter text to hash: ");
            string text = Console.ReadLine();

            if (text == null) return;

            byte[] bytes = Encoding.UTF8.GetBytes(text);
            string sha256Hash = GetSha256Hash(bytes);
            string sha384Hash = GetSha384Hash(bytes);
            string sha512Hash = GetSha512Hash(bytes);
            string sha3_512Hash = GetSha3_512Hash(bytes);
            string keccak256Hash = GetKeccak256Hash(bytes);
            string keccak512Hash = GetKeccak512Hash(bytes);
            string whirlpool512Hash = GetWhirlpool512Hash(bytes);

            Console.WriteLine("SHA-256 hash: " + sha256Hash);
            Console.WriteLine("SHA-384 hash: " + sha384Hash);
            Console.WriteLine("SHA-512 hash: " + sha512Hash);
            Console.WriteLine("SHA3-512 hash: " + sha3_512Hash);
            Console.WriteLine("KECCAK-256 hash: " + keccak256Hash);
            Console.WriteLine("KECCAK-512 hash: " + keccak512Hash);
            Console.WriteLine("Whirlpool-512 hash: " + whirlpool512Hash);
        }

        public static string GetSha256Hash(byte[] bytes)
        {
            SHA256Managed hashstring = new SHA256Managed();
            byte[] hash = hashstring.ComputeHash(bytes);

            return BytesToString(hash);
        }

        public static string GetSha512Hash(byte[] bytes)
        {
            SHA512Cng sha512 = new SHA512Cng();
            byte[] sha512Hash = sha512.ComputeHash(bytes);

            return BytesToString(sha512Hash);
        }

        public static string GetSha384Hash(byte[] bytes)
        {
            SHA384Cng sha384 = new SHA384Cng();
            byte[] sha384Hash = sha384.ComputeHash(bytes);

            return BytesToString(sha384Hash);
        }

        public static string GetSha3_512Hash(byte[] bytes)
        {
            Sha3Digest sha3 = new Sha3Digest(512);
            sha3.Reset();
            sha3.BlockUpdate(bytes, 0, bytes.Length);

            byte[] sha3Hash = new byte[sha3.GetDigestSize()];
            sha3.DoFinal(sha3Hash, 0);

            return BytesToString(sha3Hash);
        }

        public static string GetKeccak256Hash(byte[] bytes)
        {
            var keccak = new Sha3Keccack();
            byte[] keccakHash = keccak.CalculateHash(bytes);

            return BytesToString(keccakHash);
        }

        public static string GetKeccak512Hash(byte[] bytes)
        {
            IHash keccak512 = HashFactory.Crypto.SHA3.CreateKeccak512();
            byte[] keccakHash = keccak512.ComputeBytes(bytes).GetBytes();

            return BytesToString(keccakHash);
        }

        public static string GetWhirlpool512Hash(byte[] bytes)
        {
            WhirlpoolDigest w = new WhirlpoolDigest();

            w.Reset();
            w.BlockUpdate(bytes, 0, bytes.Length);

            byte[] hash = new byte[w.GetDigestSize()];
            w.DoFinal(hash, 0);

            return BytesToString(hash);
        }

        public static string BytesToString(byte[] bytes)
        {
            string hashString = string.Empty;

            foreach (byte x in bytes)
            {
                hashString += $"{x:x2}";
            }

            return hashString;
        }
    }
}
