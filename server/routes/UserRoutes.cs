using Microsoft.AspNetCore.Http.HttpResults;
namespace server;

public class UserRoutes
{
    public static async Task<Results<Ok<List<User>>, BadRequest<string>>> GetAllUsers(SqliteConnectionFactory db)
    {

        Console.WriteLine(db);
        List<User> Userlist = new List<User>();
        try
        {
            using var conn = db.CreateConnection();
            await conn.OpenAsync();

            await using var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT * FROM Users";

            await using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                Userlist.Add(new User
                {
                    Id = reader.GetInt32(0),
                    Name = reader.GetString(1)
                });
            }

            return TypedResults.Ok(Userlist);

        }
        catch (Exception ex)
        {
            return TypedResults.BadRequest($"Error recieving users from DB: {ex.Message}");

        }
    }

    public static async Task<Results<Ok<User>, BadRequest<string>>> GetUserById(int id, SqliteConnectionFactory db)
    {
        try
        {
            using var conn = db.CreateConnection();
            await conn.OpenAsync();
            await using var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT * FROM Users WHERE id = @id";
            cmd.Parameters.AddWithValue("@id", id);

            await using var reader = await cmd.ExecuteReaderAsync();

            User? user = null;

            if (await reader.ReadAsync())
            {
                user = new User
                {
                    Id = reader.GetInt32(0),
                    Name = reader.GetString(1)
                };
            }
            return TypedResults.Ok(user);
        }catch (Exception ex)
        {
            return TypedResults.BadRequest($"No user with ID {id},  {ex.Message}");
        }
    }
}
