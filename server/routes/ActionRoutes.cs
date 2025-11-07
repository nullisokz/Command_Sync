using Microsoft.AspNetCore.Http.HttpResults;
namespace server;

public class ActionRoutes
{
    public static async Task<Results<Ok<List<Action>>, BadRequest<string>>> GetAllActions(SqliteConnectionFactory db)
    {
        List<Action> actionlist = new List<Action>();

        try
        {
            using var conn = db.CreateConnection();
            await conn.OpenAsync();
            await using var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT * FROM actions ORDER BY id";

            await using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                actionlist.Add(new Action
                {
                    Id = reader.GetInt32(0),
                    Title = reader.GetString(1)
                });
            }
            return TypedResults.Ok(actionlist);
        }
        catch (Exception ex)
        {
            return TypedResults.BadRequest($"Error fetching actions from db, {ex.Message}");
        }
    }

    public record ActionCommandsDTO(int id, string title, List<Command> commandlist);

    public static async Task<Results<Ok<ActionCommandsDTO>, BadRequest<string>>> GetActionById(int id, SqliteConnectionFactory db)
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
                var result = new ActionCommandsDTO(reader.GetInt32(0), reader.GetString(1), await CommandRoutes.FetchCommandsByActionId(id, db));
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


}

