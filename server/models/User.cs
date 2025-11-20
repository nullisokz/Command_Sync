namespace server;

public class User
{
    public int Id { get; set; } = 0;
    public string Name { get; set; } = "";
    public string Password { get; set; } = "";
    public bool IsAdmin { get; set; } = false;


    public User() { }

    public User(int id, string name, string password, bool isAdmin)
    {
        Id = id;
        Name = name;
        Password = password;
        IsAdmin = isAdmin;
        
    }

}

