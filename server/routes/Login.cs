using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace server;

public class Login
{
    public record Credentials(string name, string password);
    public record LoginDTO(int Id, string Name,  string Password,bool admin);


    public static async Task<Results<Ok<string>, BadRequest<string>>> LoginNoGoogle([FromBody] Credentials creds, NpgsqlDataSource db, HttpContext ctx, [FromServices] PasswordHasher<string> passwordHasher)
    {
        try
        {
            using var conn = db.CreateConnection();
            await conn.OpenAsync();
            await using var cmd = conn.CreateCommand();
            cmd.CommandText = """
                                SELECT u.id, u.name, u.password, u.is_admin
                                FROM users u
                                WHERE name = @name;
                                """;
            cmd.Parameters.AddWithValue("@name", creds.name);

            await using var reader = await cmd.ExecuteReaderAsync();

            LoginDTO userResult;

            if(await reader.ReadAsync())
            {
                userResult = new LoginDTO(
                    reader.GetInt32(0),
                    reader.GetString(1),
                    reader.GetString(2),
                    reader.GetBoolean(3)
                );
            }
            else
            {
                return TypedResults.BadRequest("No user with that username");
            }
            //FOR DEV PURPOSES ONLY
            if(userResult.Name == "Oskar" || userResult.Name == "Viktor"){
                ctx.Session.SetInt32("id", userResult.Id);
                ctx.Session.SetString("name", userResult.Name);
                ctx.Session.SetString("role", "Admin");
                return TypedResults.Ok("DEV LOGIN");

            }
            //END
            else{
            var verificationResult = passwordHasher.VerifyHashedPassword("", userResult.Password, creds.password);

            if (verificationResult == PasswordVerificationResult.Failed)
            {
                return TypedResults.BadRequest("Verification failed");
            }
            else if (verificationResult == PasswordVerificationResult.SuccessRehashNeeded)
            {
                string newHash = passwordHasher.HashPassword("", creds.password);
                using var conn2 = db.CreateConnection();
                await conn2.OpenAsync();
                await using var cmdNewHash = conn2.CreateCommand();
                cmdNewHash.CommandText = "UPDATE users SET password = @newpwd WHERE id = @id AND name = @name";
                cmdNewHash.Parameters.AddWithValue("@newpwd", newHash);
                cmdNewHash.Parameters.AddWithValue("@id", userResult.Id);
                cmdNewHash.Parameters.AddWithValue("@name", userResult.Name);
                await cmdNewHash.ExecuteNonQueryAsync();
            }
            
            ctx.Session.SetInt32("id", userResult.Id);
        ctx.Session.SetString("name", userResult.Name);
        ctx.Session.SetString("role", userResult.admin ? "Admin" : "User");

        return TypedResults.Ok($"Success! User {userResult.Name} with id {userResult.Id} is logged in!");
            }
}catch(Exception ex)
        {
            return TypedResults.BadRequest($"Something went wrong: {ex.Message}");
        }
    }
}
