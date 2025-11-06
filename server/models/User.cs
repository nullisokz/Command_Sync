namespace server;

public class User
{
    public int Id { get; set; } = 0;
    public string Name { get; set; } = "";

    public User() { }

    public User(int id, string name)
    {
        Id = id;
        Name = name;
    }
}

