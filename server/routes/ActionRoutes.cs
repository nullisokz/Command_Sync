using Microsoft.AspNetCore.Http.HttpResults;
using Npgsql;
namespace server;

public class ActionRoutes
{
    public record ActionCommandsDTO(int id, string title, List<Command> commands, Category category);

     public record Category(int id, string title);
    public record NewCommandDTO(string description, string code);

    public record AddActionRequestDTO(
        int? categoryId, // Id för befintlig kategori
        string? categoryTitle, // Titel för ny kategori (om categoryId är null)
        string actionTitle,
        List<int>? commandIds, // Id:n för befintliga Commands
        List<NewCommandDTO>? newCommands // Lista över nya Commands som ska skapas
    );

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

    // I ActionRoutes.cs

public static async Task<Results<Ok<string>, BadRequest<string>>> AddAction(AddActionRequestDTO data, NpgsqlDataSource db, HttpContext ctx)
    {
        var userId = ctx.Session.GetInt32("id");
        if (userId == null)
        {
            return TypedResults.BadRequest("User must be logged in to add an action.");
        }

        // --- Validering ---
        if (string.IsNullOrWhiteSpace(data.actionTitle))
        {
            return TypedResults.BadRequest("Action title is required.");
        }

        if (data.categoryId == null && string.IsNullOrWhiteSpace(data.categoryTitle))
        {
            return TypedResults.BadRequest("A category must be specified (either id or new title).");
        }

        var hasExistingCommands = data.commandIds?.Any() == true;
        var hasNewCommands = data.newCommands?.Any() == true;
        if (!hasExistingCommands && !hasNewCommands)
        {
            return TypedResults.BadRequest("Action must contain at least one command.");
        }

        await using var conn = await db.OpenConnectionAsync();
        await using var transaction = await conn.BeginTransactionAsync();

        try
        {
            int categoryId;

            // 1. Hantera Kategori
            if (data.categoryId.HasValue)
            {
                categoryId = data.categoryId.Value;
            }
            else if (!string.IsNullOrWhiteSpace(data.categoryTitle))
            {
                await using var categoryCmd = new NpgsqlCommand("INSERT INTO categories (title) VALUES (@title) RETURNING id", conn, transaction);
                categoryCmd.Parameters.AddWithValue("@title", data.categoryTitle.Trim());
                categoryId = (int)await categoryCmd.ExecuteScalarAsync()!;
            }
            else
            {
                return TypedResults.BadRequest("Invalid category specification.");
            }

            // 2. Hantera Nya Commands (och samla in alla Command ID:n)
            var allCommandIds = new List<int>();
            if (hasExistingCommands)
            {
                // Lägg till befintliga command ID:n
                allCommandIds.AddRange(data.commandIds!);
            }

            if (hasNewCommands)
            {
                // Skapa nya commands och lägg till deras nya ID:n
                foreach (var newCmd in data.newCommands!)
                {
                    // FIX: Tog bort 'category' från INSERT INTO commands
                    await using var commandCmd = new NpgsqlCommand(
                        "INSERT INTO commands (description, code) VALUES (@description, @code) RETURNING id", 
                        conn, 
                        transaction
                    );
                    commandCmd.Parameters.AddWithValue("@description", newCmd.description.Trim());
                    commandCmd.Parameters.AddWithValue("@code", newCmd.code.Trim());
                    // Borttagen: commandCmd.Parameters.AddWithValue("@category", categoryId); 
                    
                    var newCommandId = (int)await commandCmd.ExecuteScalarAsync()!;
                    allCommandIds.Add(newCommandId);
                }
            }

            // 3. Skapa Action
            await using var actionCmd = new NpgsqlCommand(
                "INSERT INTO actions (title, category) VALUES (@title, @category) RETURNING id", 
                conn, 
                transaction
            );
            actionCmd.Parameters.AddWithValue("@title", data.actionTitle.Trim());
            actionCmd.Parameters.AddWithValue("@category", categoryId);
            var actionId = (int)await actionCmd.ExecuteScalarAsync()!;

            // 4. Länka Commands till Action i rätt ordning i actions_x_commands
            for (int i = 0; i < allCommandIds.Count; i++)
            {
                await using var linkCmd = new NpgsqlCommand(
                    "INSERT INTO actions_x_commands (action_id, command_id, steporder) VALUES (@actionId, @commandId, @stepOrder)", 
                    conn, 
                    transaction
                );
                linkCmd.Parameters.AddWithValue("@actionId", actionId);
                linkCmd.Parameters.AddWithValue("@commandId", allCommandIds[i]);
                linkCmd.Parameters.AddWithValue("@stepOrder", i + 1);
                await linkCmd.ExecuteNonQueryAsync();
            }

            await using var userActionCmd = new NpgsqlCommand(
                "INSERT INTO users_x_actions (user_id, actions_id) VALUES (@userId, @actionId)", 
                conn, 
                transaction
            );
            userActionCmd.Parameters.AddWithValue("@userId", userId.Value);
            userActionCmd.Parameters.AddWithValue("@actionId", actionId);

            await transaction.CommitAsync();

            return TypedResults.Ok($"Action '{data.actionTitle}' (ID: {actionId}) created successfully.");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return TypedResults.BadRequest($"An unexpected error occurred during action creation: {ex.Message}");
        }
    }
}

