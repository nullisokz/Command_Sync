using Microsoft.AspNetCore.Http.HttpResults;
using Npgsql;

namespace server;

public class CommandRoutes
{
    public static async Task<Results<Ok<Command>, BadRequest<string>>> GetCommandById(int id, NpgsqlDataSource db)
    {

        try
        {
            using var conn = db.CreateConnection();
            await conn.OpenAsync();
            await using var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT * FROM commands WHERE id = @id";
            cmd.Parameters.AddWithValue("@id", id);

            await using var reader = await cmd.ExecuteReaderAsync();

            Command? command = null;

            if (await reader.ReadAsync())
            {
                command = new Command
                {
                    Id = reader.GetInt32(0),
                    Description = reader.GetString(1),
                    Code = reader.GetString(2)

                };

            }
            return TypedResults.Ok(command);

        }
        catch (Exception ex)

        {
            return TypedResults.BadRequest($"No command with that ID {id}, {ex.Message}");
        }

    }
    public static async Task<Results<Ok<List<Command>>, BadRequest<string>>> GetCommandsByCategoryId(
    int id,
    NpgsqlDataSource db)
{
    try
    {
        await using var conn = await db.OpenConnectionAsync();
        await using var cmd = conn.CreateCommand();

        cmd.CommandText = @"
            SELECT DISTINCT c.id, c.description, c.code
            FROM actions a
            JOIN actions_x_commands ac ON ac.action_id = a.id
            JOIN commands c ON c.id = ac.command_id
            WHERE a.category = @categoryId
            ORDER BY c.id;
        ";

        cmd.Parameters.AddWithValue("@categoryId", id);

        var commands = new List<Command>();

        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            commands.Add(new Command
            {
                Id = reader.GetInt32(0),
                Description = reader.GetString(1),
                Code = reader.GetString(2)
            });
        }

        return TypedResults.Ok(commands);
    }
    catch (Exception ex)
    {
        return TypedResults.BadRequest($"Failed to load commands for category {id}: {ex.Message}");
    }
}


    public static async Task<Results<Ok<List<Command>>, BadRequest<string>>> GetCommandsByActionId(int id, NpgsqlDataSource db)
    {
        List<Command> actioncommansList = new List<Command>();

        try
        {
            using var conn = db.CreateConnection();
            await conn.OpenAsync();
            using var cmd = conn.CreateCommand();
            cmd.CommandText = """
                              SELECT c.id, c.description, c.code
                              FROM commands c
                              JOIN actions_x_commands ac on c.id = ac.command_id
                              WHERE ac.action_id = @id;
                              """;

            cmd.Parameters.AddWithValue("@id", id);
            await using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                actioncommansList.Add(new Command
                {
                    Id = reader.GetInt32(0),
                    Description = reader.GetString(1),
                    Code = reader.GetString(2)
                });
            }
            return TypedResults.Ok(actioncommansList);
        }
        catch (Exception ex)
        {
            return TypedResults.BadRequest($"Error fetching action commands: {ex.Message}");
        }
    }
    //INTERNAL HELPER FUNCTION:
    internal static async Task<List<Command>> FetchCommandsByActionId(int id, NpgsqlDataSource db)
    {
        var actionCommandsList = new List<Command>();

        using var conn = db.CreateConnection();
        await conn.OpenAsync();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = """
            SELECT c.id, c.description, c.code
            FROM commands c
            JOIN actions_x_commands ac on c.id = ac.command_id
            WHERE ac.action_id = @id;
            """;
        cmd.Parameters.AddWithValue("@id", id);

        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            actionCommandsList.Add(new Command
            {
                Id = reader.GetInt32(0),
                Description = reader.GetString(1),
                Code = reader.GetString(2)
            });
        }

        return actionCommandsList;
    }
}
