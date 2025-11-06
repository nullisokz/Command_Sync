using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Common;
using Microsoft.Data.Sqlite;
using server;
using SQLitePCL;

var builder = WebApplication.CreateBuilder(args);

var dbPath = Path.Combine(Directory.GetCurrentDirectory(), "cmd_database.db");
builder.Services.AddSingleton(new SqliteConnectionFactory($"Data Source={dbPath}"));
var app = builder.Build();

app.MapGet("/users", UserRoutes.GetAllUsers);
app.MapGet("/users/{id}", UserRoutes.GetUserById);

app.Run();

public class SqliteConnectionFactory
{
    private readonly string _connectionString;
    public SqliteConnectionFactory(string connectionString)
    => _connectionString = connectionString;

    public SqliteConnection CreateConnection() => new(_connectionString);
}
