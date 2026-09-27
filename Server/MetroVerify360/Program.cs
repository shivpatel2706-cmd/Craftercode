using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MetroVerify360.Data;
using MetroVerify360.Helpers;
using MetroVerify360.Interfaces;
using MetroVerify360.Middleware;
using MetroVerify360.Repositories;
using MetroVerify360.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Database Configuration
var dbProvider = builder.Configuration["DatabaseProvider"] ?? "Sqlite";
var sqlServerConn = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Server=localhost;Database=MetroVerify360Db;Trusted_Connection=True;TrustServerCertificate=True;";
var sqliteConn = builder.Configuration.GetConnectionString("SqliteConnection") 
    ?? "Data Source=MetroVerify360.db";

builder.Services.AddDbContext<MetroVerifyDbContext>(options =>
{
    if (dbProvider.Equals("SqlServer", StringComparison.OrdinalIgnoreCase))
    {
        options.UseSqlServer(sqlServerConn, sql => sql.EnableRetryOnFailure(3));
    }
    else
    {
        options.UseSqlite(sqliteConn);
    }
});

// 2. Dependency Injection - Repositories & Services
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IInstrumentService, InstrumentService>();
builder.Services.AddScoped<IApplicationService, ApplicationService>();
builder.Services.AddScoped<IAssignmentService, AssignmentService>();
builder.Services.AddScoped<IInspectionService, InspectionService>();
builder.Services.AddScoped<ICertificateService, CertificateService>();
builder.Services.AddScoped<INawiReportService, NawiReportService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IAuditService, AuditService>();
builder.Services.AddScoped<JwtTokenGenerator>();

// ML Engine — HttpClient with generous timeout for model inference
builder.Services.AddHttpClient("MlEngine", client =>
{
    client.Timeout = TimeSpan.FromSeconds(30);
    client.DefaultRequestHeaders.Add("Accept", "application/json");
});

// Auto-start / auto-stop the Python FastAPI ML process alongside ASP.NET
builder.Services.AddHostedService<MlProcessService>();

// 3. JWT Authentication Configuration
var jwtKey = builder.Configuration["Jwt:Key"] ?? "MetroVerify360_Super_Secret_Statutory_Key_2026_Minimum_32_Chars!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "MetroVerify360";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "MetroVerify360Client";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// 4. CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",
                "http://localhost:5173",
                "https://localhost:3000"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// 5. Add Controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });

// 6. Swagger / OpenAPI with Bearer Auth
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "METROVERIFY 360 API",
        Version = "v1",
        Description = "Statutory REST API for Online Verification System of Weighing and Measuring Instruments under Legal Metrology Act 2009.",
        Contact = new OpenApiContact
        {
            Name = "Legal Metrology Digital Directorate",
            Email = "support@metroverify.gov.in"
        }
    });

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

var app = builder.Build();

// 7. HTTP Request Pipeline
app.UseMiddleware<GlobalExceptionMiddleware>();

// Always enable Swagger for testing and review
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "METROVERIFY 360 API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("AllowFrontend");

// Ensure Reports directory exists and can serve generated PDFs
var reportsPath = Path.Combine(app.Environment.ContentRootPath, "Reports");
if (!Directory.Exists(reportsPath))
{
    Directory.CreateDirectory(reportsPath);
}
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(reportsPath),
    RequestPath = "/reports"
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health check / root endpoint
app.MapGet("/", () => Results.Ok(new
{
    system = "METROVERIFY 360",
    version = "1.0.0",
    status = "Operational",
    statutoryFramework = "Legal Metrology Act 2009 & General Rules 2011",
    documentation = "/swagger"
}));

// 8. Auto-migrate and Seed Demo Data
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    try
    {
        var context = services.GetRequiredService<MetroVerifyDbContext>();
        await context.Database.EnsureCreatedAsync();
        await DbInitializer.SeedAsync(context);
        logger.LogInformation("METROVERIFY 360 Database initialized and seeded successfully.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while initializing or seeding the database.");
    }
}

var port = Environment.GetEnvironmentVariable("PORT") ?? "5051";
app.Run($"http://0.0.0.0:{port}");
