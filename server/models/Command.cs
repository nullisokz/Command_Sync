namespace server;

public class Command
{
    public int Id { get; set; } = 0;
    public string Description { get; set; } = "";
    public string Code { get; set; } = "";

    public Command() { }

    public Command(int id, string description, string code)
    {
        Id = id;
        Description = description;
        Code = code;
    }
   
}
