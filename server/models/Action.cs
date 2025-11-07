namespace server;


public class Action
{
    public int Id { get; set; } = 0;
    public string Title { get; set; } = "";
    

    public Action() { }

    public Action(int id, string title)
    {
        Id = id;
        Title = Title;
    }
   
}
