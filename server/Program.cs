using server;
using Npgsql;

var dataSourceBuilder = new NpgsqlDataSourceBuilder("Host=localhost;Database=postgres;Username=postgres;Password=password123;Port=5432");

var db = dataSourceBuilder.Build();

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<NpgsqlDataSource>(db);

var app = builder.Build();

app.MapGet("/users", UserRoutes.GetAllUsers);
app.MapGet("/users/{id}", UserRoutes.GetUserById);

app.MapGet("/commands/{id}", CommandRoutes.GetCommandById);

app.MapGet("/actions", ActionRoutes.GetAllActions);
app.MapGet("/actions/{id}", ActionRoutes.GetActionById);



app.Run();

