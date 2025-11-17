namespace server;


public class Action
{
    public int Id { get; set; } = 0;
    public string Title { get; set; } = "";
    
    public int Category { get; set; } = 0;
    public Action() { }

    public Action(int id, string title, int category)
    {
        Id = id;
        Title = title;
        Category = category;

    }
   
}
