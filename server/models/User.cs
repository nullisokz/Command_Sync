
using System.Runtime.CompilerServices;
using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.Identity;
using Microsoft.Net.Http.Headers;

namespace server;

public class User
{
    public int Id { get; set; } = 0;
    public string Name { get; set; } = "";

    private string PasswordHash = "";
    private static PasswordHasher<User> hasher = new ();
    
    public void SetPassword(string password)
    {
        PasswordHash = hasher.HashPassword(this, password);
    }

    public bool CheckPassword(string password)
    {
        var result = hasher.VerifyHashedPassword(this, PasswordHash, password);
        return result == PasswordVerificationResult.Success;
    }


    public User()
    {
        
    }

    public User(int id, string name, string password)
    {
        Id = id;
        Name = name;
        SetPassword(password);
    }
    
}

