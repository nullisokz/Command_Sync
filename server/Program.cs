using server;
using Npgsql;

var dataSourceBuilder = new NpgsqlDataSourceBuilder("Host=localhost;Database=commandsyncdb;Username=postgres;Password=password123;Port=5430");

var db = dataSourceBuilder.Build();

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<NpgsqlDataSource>(db);

var app = builder.Build();

app.MapGet("/api/users", UserRoutes.GetAllUsers);
app.MapGet("/api/users/{id}", UserRoutes.GetUserById);
app.MapPost("/api/users",UserRoutes.CreateUser);

app.MapGet("/api/commands/{id}", CommandRoutes.GetCommandById);

app.MapGet("/api/actions", ActionRoutes.GetAllActions);
app.MapGet("/api/actions/{id}", ActionRoutes.GetActionById);
app.MapGet("/api/category/actions/{id}", ActionRoutes.GetAllActionsByCategory);

app.MapGet("/api/categories", CategoryRoutes.GetCategories);



app.Run();

