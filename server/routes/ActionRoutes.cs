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
}

