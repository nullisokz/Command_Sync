// using Microsoft.AspNetCore.Http.HttpResults;
// using Microsoft.AspNetCore.Identity;
// using Npgsql;
// namespace server;

// public class UserRoutes
// {
//     public record CreateUserDTO(string name, string password);
//     public static async Task<Results<Ok<int>, BadRequest<string>>> CreateUser(CreateUserDTO user, NpgsqlDataSource db)
//     {
//         try
//         {

//             var hasher = new PasswordHasher<object>();
//             string hashedPassword = hasher.HashPassword(null, user.password);

//             using var conn = db.CreateConnection();
//             await conn.OpenAsync();
//             await using var cmd = conn.CreateCommand();
//             cmd.CommandText=
//                                 """
//                                 INSERT INTO USERS (name, password)
//                                 VALUES
//                                 (@name, @password_hash)
//                                 RETURNING id
//                                 """;
//             cmd.Parameters.AddWithValue("@name", user.name);
//             cmd.Parameters.AddWithValue("@password_hash", hashedPassword);

//             var result = await cmd.ExecuteScalarAsync();

//             try
//             {
//                 int id = Convert.ToInt32(result);
//                 return TypedResults.Ok(id);
//             }catch{

//                 return TypedResults.BadRequest("Failed to create user");
//             }

//         }
//         catch(Exception ex)
//         {
//             return TypedResults.BadRequest($"Error creating user: {ex.Message}");
//         }

//     }


    
//     public static async Task<Results<Ok<List<User>>, BadRequest<string>>> GetAllUsers(NpgsqlDataSource db)
//     {

//         Console.WriteLine(db);
//         List<User> Userlist = new List<User>();
//         try
//         {
//             using var conn = db.CreateConnection();
//             await conn.OpenAsync();

//             await using var cmd = conn.CreateCommand();
//             cmd.CommandText = "SELECT * FROM Users";

//             await using var reader = await cmd.ExecuteReaderAsync();
//             while (await reader.ReadAsync())
//             {
//                 Userlist.Add(new User
//                 {
//                     Id = reader.GetInt32(0),
//                     Name = reader.GetString(1),
                    
//                 });
//             }

//             return TypedResults.Ok(Userlist);

//         }
//         catch (Exception ex)
//         {
//             return TypedResults.BadRequest($"Error recieving users from DB: {ex.Message}");

//         }
//     }

//     public static async Task<Results<Ok<User>, BadRequest<string>>> GetUserById(int id, NpgsqlDataSource db)
//     {
//         try
//         {
//             using var conn = db.CreateConnection();
//             await conn.OpenAsync();
//             await using var cmd = conn.CreateCommand();
//             cmd.CommandText = "SELECT * FROM Users WHERE id = @id";
//             cmd.Parameters.AddWithValue("@id", id);

//             await using var reader = await cmd.ExecuteReaderAsync();

//             User? user = null;

//             if (await reader.ReadAsync())
//             {
//                 user = new User
//                 {
//                     Id = reader.GetInt32(0),
//                     Name = reader.GetString(1),
                    
//                 };
//             }
//             return TypedResults.Ok(user);
//         }catch (Exception ex)
//         {
//             return TypedResults.BadRequest($"No user with ID {id},  {ex.Message}");
//         }
//     }
// }
