using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using NewBusAPI.BackgroundService;
using NewBusAPI.HUB;
using NewBusAPI.Middelware;
using NewBusBLL.AdminConnection;
using NewBusBLL.Admins.BLL;
using NewBusBLL.Admins.InterFace;
using NewBusBLL.BackgroundService;
using NewBusBLL.Bus.BusBll;
using NewBusBLL.Bus.Interface;
using NewBusBLL.Driver.Driver;
using NewBusBLL.Driver.InterFace;
using NewBusBLL.DriverConnection;
using NewBusBLL.EmailService;
using NewBusBLL.Faculty.FacultyBLL;
using NewBusBLL.Faculty.Interface;
using NewBusBLL.Hashing_Service;
using NewBusBLL.Hashing_Service.Inter;
using NewBusBLL.LogoutService;
using NewBusBLL.RefreshToken;
using NewBusBLL.ResetPassword;
using NewBusBLL.Route.InteFace;
using NewBusBLL.Route.Route;
using NewBusBLL.Station;
using NewBusBLL.Station.Interface;
using NewBusBLL.StationTrips;
using NewBusBLL.StudentConnection;
using NewBusBLL.Students.InterFace;
using NewBusBLL.Students.StudentBLL;
using NewBusBLL.Token.IToken;
using NewBusBLL.Token.Token;
using NewBusBLL.Trip;
using NewBusDAL.Models;
using NewBusDAL.Repositry.Interfaces.IunitOfWork;
using NewBusDAL.Repositry.RepoClassess.UnitOfWork;
using Quartz;
using System.Reflection;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<NewBusContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("myconn")));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
//
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
//
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JWT:SecretKey"]!))
            };

            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    var accessToken = context.Request.Query["access_token"];

                    var path = context.HttpContext.Request.Path;
                    if (!string.IsNullOrEmpty(accessToken) &&
                        path.StartsWithSegments("/LiveHub"))
                    {
                        context.Token = accessToken;
                    }

                    return Task.CompletedTask;
                }
            };

        });

// Other configurations..
builder.Services.AddSignalR(options =>
{
    options.KeepAliveInterval = TimeSpan.FromSeconds(5);
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(10);
});


builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IadminBLL, AdminBLL>();
builder.Services.AddScoped<IStudentBLL, StudentBLL>();

builder.Services.AddScoped<IBusBLL, BusBLL>();
builder.Services.AddScoped<IFacultyBLL, FacultyBLL>();
builder.Services.AddScoped<IDriverBLL, DriverBLL>();
builder.Services.AddScoped<IToken, Token>();

builder.Services.AddScoped<IAdminConnection, AdminConnectionBLL>();
builder.Services.AddScoped<IDriverConnection, DriverConnectionBLL>();

builder.Services.AddScoped<IStudentConnection, NewBusBLL.StudentConnection.StudentConnection>();
builder.Services.AddScoped<IstationBLL, StationBLL>();
builder.Services.AddScoped<IRoute, RoutesBLL>();
builder.Services.AddScoped<ITripBLL, TripBLL>();
builder.Services.AddScoped<IhashingBLL, HashingBLL>();
builder.Services.AddScoped<IlogoutBLL, LogoutBLL>();
builder.Services.AddScoped<Iemail, EmailService>();

builder.Services.AddScoped<IResetPassword, ResetPassword>();
builder.Services.AddScoped<IRefreshToken, NewBusBLL.RefreshToken.RefreshToken>();


builder.Services.AddScoped<IstationTrip, NewBusBLL.StationTrips.StationTrip>();


//config swagger for endpoint Token
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "My API",
        Version = "v1"
    });

    // JWT Authorization
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Type Your JWT Token Like Bearer [Your Token].",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "bearer",
        BearerFormat = "JWT"
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
            new string[]{}
        }
    });
});
builder.Services.AddQuartz(q =>
{
    var jobkey = new JobKey(nameof(RemoveOTPnoVerfied));
    q.AddJob<RemoveOTPnoVerfied>(opts => opts.WithIdentity(jobkey));
    q.AddTrigger(opts =>
    opts.ForJob(jobkey).WithIdentity($"Trigger Remove {nameof(RemoveOTPnoVerfied)}")
  .WithCronSchedule("0 0 * * * ?"));// every 1 hour

    var jobkey2 = new JobKey(nameof(RemoveRefreshTokenLogout));
    q.AddJob<RemoveRefreshTokenLogout>(opts => opts.WithIdentity(jobkey2));
    q.AddTrigger(opts =>
    opts.ForJob(jobkey2).WithIdentity($"Trigger Remove {nameof(RemoveRefreshTokenLogout)}")
 .WithCronSchedule("0 0/30 * * * ?"));// every half hour
    var jobkey3 = new JobKey(nameof(RemoveRefreshTokenExpired));
    q.AddJob<RemoveRefreshTokenExpired>(opts => opts.WithIdentity(jobkey3));
    q.AddTrigger(opts =>
    opts.ForJob(jobkey3).WithIdentity($"Trigger Remove {nameof(RemoveRefreshTokenExpired)}")
.WithCronSchedule("0 0 0 1/5 * ?"));//every 5 days
});
builder.Services.AddQuartzHostedService(options =>
{
    options.WaitForJobsToComplete = true;
});
//
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("http://127.0.0.1:5500", "https://newbus.vercel.app", "https://new-bus-app.vercel.app", "https://haematozoic-unreliably-celeste.ngrok-free.dev", "https://lck1m92d.uks1.devtunnels.ms:5500", "https://enjoyable-satiable-svetlana.ngrok-free.dev:5089")
              .AllowAnyMethod()
              .AllowAnyHeader()
                          .AllowCredentials();

    });
});

var app = builder.Build();
var hubContext = app.Services.GetRequiredService<IHubContext<LiveHub>>();



app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseCors("AllowAll");
app.MapHub<NewBusAPI.HUB.LiveHub>("/LiveHub");
app.UseSwagger();
app.UseSwaggerUI();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<CheckLoginingMiddelware>();
app.MapControllers();


app.Run();
