namespace DeriveKeyByPassUsingScrypt
{
    using System;
    using System.Text;
    using CryptSharp.Utility;

    public class Program
    {
        public static void Main()
        {
            Console.Write("Enter password: ");
            string password = Console.ReadLine();
            if (password == null) return;

            // RandomNumberGenerator saltGenerator = RandomNumberGenerator.Create();
            // byte[] saltBytes = new byte[256];
            // saltGenerator.GetBytes(saltBytes);

            string salt = "7b07a2977a473e84fc30d463a2333bcfea6cb3400b16bec4e17fe981c925ba4f";
            byte[] saltBytes = Encoding.UTF8.GetBytes(salt);

            byte[] passwordBytes = Encoding.UTF8.GetBytes(password);
            byte[] keyBytes = new byte[32];
            SCrypt.ComputeKey(passwordBytes, saltBytes, 16384, 16, 1, null, keyBytes);

            Console.WriteLine("Key: " + BytesToString(keyBytes));
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
