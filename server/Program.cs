using server;
using Npgsql;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;


var dataSourceBuilder = new NpgsqlDataSourceBuilder("Host=localhost;Database=commandsyncdb;Username=postgres;Password=password123;Port=5430");

var db = dataSourceBuilder.Build();

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<NpgsqlDataSource>(db);
builder.Services.AddScoped<PasswordHasher<string>>();
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    // Session options
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});
builder.Services.AddAuthentication(options => {
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
})
.AddCookie()
.AddGoogle(GoogleDefaults.AuthenticationScheme, options =>
{
    options.ClientId = builder.Configuration["Authentication:Google:ClientId"] ?? throw new InvalidOperationException("Google ClientId must be set.");
    options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"] ?? throw new InvalidOperationException("Google ClientSecret must be set.");
});
builder.Services.AddAuthorization();

var app = builder.Build();
app.UseSession();        // ⬅️ MOVED TO HERE
app.UseAuthentication();
app.UseAuthorization();

// app.MapGet("/api/users", UserRoutes.GetAllUsers);
// app.MapGet("/api/users/{id}", UserRoutes.GetUserById);

app.MapPost("/api/login", Login.LoginNoGoogle);
app.MapPost("/api/create-user",UserRoutes.CreateUser);
app.MapGet("/login/google", (HttpContext ctx) => {
    var properties = new AuthenticationProperties
    {
        RedirectUri = "/signin-google-callback"
    };

    return Results.Challenge(properties, new[] { GoogleDefaults.AuthenticationScheme});
});

app.MapGet("/signin-google-callback", async (HttpContext ctx) => {
    var authResult = await ctx.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);

    if(!authResult.Succeeded){
        return Results.Forbid();
    }
    
    return Results.Ok("HEJ DU HAR LOGGAT IN");
}).AllowAnonymous();

app.MapGet("/api/commands/{id}", CommandRoutes.GetCommandById);

app.MapGet("/api/actions", ActionRoutes.GetAllActions);
app.MapGet("/api/actions/{id}", ActionRoutes.GetActionById);
app.MapPost("/api/actions", ActionRoutes.AddAction); 
app.MapGet("/api/categories/actions/{id}", ActionRoutes.GetAllActionsByCategory);
app.MapGet("/api/categories/actions/commands/{id}", CommandRoutes.GetCommandsByCategoryId);

app.MapGet("/api/categories", CategoryRoutes.GetCategories);

app.Run();

