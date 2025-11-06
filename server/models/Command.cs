namespace server;

public class Command
{
    private int _id;
    private string _name;
    private string _description;
    private string _shell_command;
    private string _created_at;

    private Command(int id, string name, string description, string shell_command, string created_at)
    {
        _id = id;
        _name = name;
        _description = description;
        _shell_command = shell_command;
        _created_at = created_at;
    }
    public int GetId() => _id;
    public string GetName() => _name;
    public string GetDescription() => _description;
    public string GetShellCommand() => _shell_command;
    public string GetCreatedAt() => _created_at;
}
