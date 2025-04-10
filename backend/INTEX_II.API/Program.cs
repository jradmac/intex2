// File: /backend/CineNiche.API/Program.cs
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Mission11.API.Data;
using CineNiche.Auth.Configuration;
using CineNiche.Auth.Services;
using CineNiche.API.Data;
using CineNiche.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "CineNiche API", Version = "v1" });
    
    // Configure Swagger to use JWT Authentication
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Database context setup (preserved from original)
// builder.Services.AddDbContext<BookDbContext>(options =>
//     options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register the new UserDbContext for user management (Corrected name)
builder.Services.AddDbContext<UserDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("UserConnection")));

// Add registration for MovieDbContext
builder.Services.AddDbContext<MovieDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add registration for RatingDbContext
builder.Services.AddDbContext<RatingDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("RatingConnection")));

// Configure Stytch authentication
builder.Services.Configure<StytchConfig>(
    builder.Configuration.GetSection(StytchConfig.SectionName));

// Register Recommendation service
builder.Services.AddScoped<IRecommendationService, RecommendationService>();

// Register HttpClient for Stytch service
builder.Services.AddHttpClient<IStytchService, StytchService>();

// Register TokenService for JWT operations
builder.Services.AddScoped<ITokenService, TokenService>();

// Register User service
builder.Services.AddScoped<IUserService, UserService>();

builder.Services.AddScoped<ISimilarMovieService, SimilarMovieService>();

// Register authentication middleware
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var stytchConfig = builder.Configuration.GetSection(StytchConfig.SectionName).Get<StytchConfig>();
    
    // Validate configuration
    if (stytchConfig == null)
    {
        throw new InvalidOperationException("Stytch configuration section is missing. Please check your appsettings.json file.");
    }

    if (string.IsNullOrEmpty(stytchConfig.JwtSigningKey))
    {
        throw new InvalidOperationException("JWT signing key is missing in Stytch configuration. Please provide a strong key in appsettings.json.");
    }

    if (string.IsNullOrEmpty(stytchConfig.ProjectId))
    {
        throw new InvalidOperationException("Project ID is missing in Stytch configuration. Please provide the Stytch project ID in appsettings.json.");
    }

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = stytchConfig.ProjectId,
        ValidAudience = stytchConfig.ProjectId,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(stytchConfig.JwtSigningKey))
    };
    
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
            {
                context.Response.Headers.Add("Token-Expired", "true");
            }
            return Task.CompletedTask;
        }
    };
});

// Register authorization policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("AuthenticatedUser", policy => policy.RequireRole("User", "Admin"));
});

// CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.WithOrigins("http://localhost:3501")  // Frontend URL
               .AllowAnyMethod()
               .AllowAnyHeader()
               .WithExposedHeaders("Token-Expired"); // Only expose headers you need
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// CORS must be called before auth middleware
app.UseCors("AllowAll");

// Comment out HTTPS redirection for development
// app.UseHttpsRedirection();

// Add authentication middleware before authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();