namespace SymmetricEncryptionDecryption
{
    using System;
    using System.Linq;
    using System.Security.Cryptography;
    using System.Text;
    using CryptSharp.Utility;
    using Org.BouncyCastle.Crypto.Engines;
    using Org.BouncyCastle.Crypto.Macs;
    using Org.BouncyCastle.Crypto.Paddings;
    using Org.BouncyCastle.Crypto.Parameters;

    public class Program
    {
        public static void Main()
        {
            Console.Write("Enter password: ");
            string password = Console.ReadLine();

            Console.Write("Enter message: ");
            string message = Console.ReadLine();

            if(password == null || message == null) return;

            // RandomNumberGenerator saltGenerator = RandomNumberGenerator.Create();
            // byte[] saltBytes = new byte[256];
            // saltGenerator.GetBytes(saltBytes);

            string salt = "7b07a2977a473e84fc30d463a2333bcfea6cb3400b16bec4e17fe981c925ba4f";
            byte[] saltBytes = Encoding.UTF8.GetBytes(salt);

            byte[] passwordBytes = Encoding.UTF8.GetBytes(password);
            byte[] keyBytes = new byte[512];
            SCrypt.ComputeKey(passwordBytes, saltBytes, 16384, 32, 1, null, keyBytes);

            byte[] encyptionKeyBytes = keyBytes.Take(256).ToArray();
            byte[] hmacKeyBytes = keyBytes.Skip(256).Take(256).ToArray();

            Console.WriteLine(BytesToString(keyBytes));
            Console.WriteLine("Key: " + BytesToString(encyptionKeyBytes));
            Console.WriteLine("HMAC-Key: " + BytesToString(hmacKeyBytes));

            HMACSHA256 hmac = new HMACSHA256 { Key = hmacKeyBytes };
            byte[] messageBytes = Encoding.UTF8.GetBytes(message);
            var hmacHash = hmac.ComputeHash(messageBytes);
            Console.WriteLine("MAC: " + BytesToString(hmacHash));

            var baseCipher = new TwofishEngine();
            var modeCipher = new CbcBlockCipherMac(baseCipher, new Pkcs7Padding());

            string iv = "433e0d8557a800a40c1d3b54f6636ff5";
            byte[] ivBytes = Encoding.UTF8.GetBytes(iv);

            Console.WriteLine(ivBytes.Length);
            Console.WriteLine(encyptionKeyBytes.Length);

            modeCipher.Init(new ParametersWithIV(new KeyParameter(encyptionKeyBytes), ivBytes, 0, ivBytes.Length));
            byte[] output = new byte[256];
            modeCipher.DoFinal(output, 0);

            Console.WriteLine("Twofish: " + BytesToString(output));
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
