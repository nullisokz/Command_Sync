using Microsoft.AspNetCore.Http.HttpResults;
using Npgsql;
namespace server;

public class ActionRoutes
{
    public record ActionCommandsDTO(int id, string title, List<Command> commands, Category category);
    public static async Task<Results<Ok<List<ActionCommandsDTO>>, BadRequest<string>>> GetAllActions(NpgsqlDataSource db)
    {
        List<ActionCommandsDTO> actionlist = new List<ActionCommandsDTO>();

        try
        {
            using var conn = db.CreateConnection();
            await conn.OpenAsync();
            await using var cmd = conn.CreateCommand();
            cmd.CommandText = """
                                SELECT a.id, a.title, c.id, c.title 
                                FROM actions a
                                JOIN categories c 
                                ON c.id = a.category
                             """;

            await using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                actionlist.Add(new ActionCommandsDTO(reader.GetInt32(0),reader.GetString(1), await CommandRoutes.FetchCommandsByActionId(reader.GetInt32(0),db), new Category(reader.GetInt32(2), reader.GetString(3))));
            }
            return TypedResults.Ok(actionlist);
        }
        catch (Exception ex)
        {
            return TypedResults.BadRequest($"Error fetching actions from db, {ex.Message}");
        }
    }

   
    public record SingleActionCommandsDTO(int id, string title, List<Command> commandlist);
    public static async Task<Results<Ok<SingleActionCommandsDTO>, BadRequest<string>>> GetActionById(int id, NpgsqlDataSource db)
    {

        try
        {
            using var conn = db.CreateConnection();
            await conn.OpenAsync();
            await using var cmd = conn.CreateCommand();
            cmd.CommandText = """
                                SELECT * FROM actions
                                WHERE id = @id;
                                """;
            cmd.Parameters.AddWithValue("@id", id);

            await using var reader = await cmd.ExecuteReaderAsync();

            if(await reader.ReadAsync())
            {
                var result = new SingleActionCommandsDTO(reader.GetInt32(0), reader.GetString(1), await CommandRoutes.FetchCommandsByActionId(id, db));
                return TypedResults.Ok(result);
            }
            else
            {
                return TypedResults.BadRequest($"Could not connect to db:");
            }

            
        }catch(Exception ex){
        return TypedResults.BadRequest($"Error fetching data: {ex.Message}");
        }
    }

      public static async Task<Results<Ok<List<ActionCommandsDTO>>, BadRequest<string>>> GetAllActionsByCategory(int id, NpgsqlDataSource db)
    {
        List<ActionCommandsDTO> actionlist = new List<ActionCommandsDTO>();

        try
        {
            using var conn = db.CreateConnection();
            await conn.OpenAsync();
            await using var cmd = conn.CreateCommand();
            cmd.CommandText = """
                                SELECT a.id, a.title, c.id, c.title 
                                FROM actions a
                                JOIN categories c 
                                ON c.id = a.category
                                WHERE a.category = @category
                             """;
            cmd.Parameters.AddWithValue("@category", id);

            await using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                actionlist.Add(new ActionCommandsDTO(reader.GetInt32(0),reader.GetString(1), await CommandRoutes.FetchCommandsByActionId(reader.GetInt32(0),db), new Category(reader.GetInt32(2), reader.GetString(3))));
            }
            return TypedResults.Ok(actionlist);
        }
        catch (Exception ex)
        {
            return TypedResults.BadRequest($"Error fetching actions from db, {ex.Message}");
        }
    }


}

