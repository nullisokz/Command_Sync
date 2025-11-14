using Microsoft.AspNetCore.Http.HttpResults;
using Npgsql;

namespace server;

public class CategoryRoutes
{
    public static async Task<Results<Ok<List<Category>>, BadRequest<string>>> GetCategories(NpgsqlDataSource db)
    {
        List<Category> categoryList = new List<Category>();


        try
        {
            using var conn = db.CreateConnection();
            await conn.OpenAsync();
            await using var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT * FROM categories ORDER BY id";

            await using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                categoryList.Add(new Category(reader.GetInt32(0), reader.GetString(1)));
            }
            return TypedResults.Ok(categoryList);
        }
        catch (Exception ex)
        {
            return TypedResults.BadRequest($"Error fetching actions from db, {ex.Message}");
        }
    }
}

