namespace server;


public class Category
{
    public int Id { get; set; } = 0;
    public string Title { get; set; } = "";
    

    public Category() { }

    public Category(int id, string title)
    {
        Id = id;
        Title = title;
    }
   
}

