namespace CalculateHMAC
{
    using System;
    using System.Security.Cryptography;
    using System.Text;

    public class Program
    {
        public static void Main()
        {
            Console.Write("Enter key: ");
            string key = Console.ReadLine();
            Console.Write("Enter message: ");
            string message = Console.ReadLine();

            if (message == null || key == null) return;

            byte[] keyBytes = Encoding.UTF8.GetBytes(key);
            byte[] messageBytes = Encoding.UTF8.GetBytes(message);
            HMACSHA512 hmac = new HMACSHA512 {Key = keyBytes};
            byte[] hmacHash = hmac.ComputeHash(messageBytes);
            Console.WriteLine("HMAC: " + BytesToString(hmacHash));
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
