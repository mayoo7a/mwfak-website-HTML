using MarahTouqan.Web.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages(options =>
{
    options.Conventions.AuthorizeFolder("/Admin");
    options.Conventions.AllowAnonymousToPage("/Admin/Login");
    options.Conventions.AllowAnonymousToPage("/Admin/Setup");
    // the old address of the home page keeps working
    options.Conventions.AddPageRoute("/Index", "index.html");
});
builder.Services.AddSingleton<ContentService>();
builder.Services.AddSingleton<AdminAuth>();
builder.Services.AddSingleton<AssetStore>();
builder.Services.AddAuthentication(Microsoft.AspNetCore.Authentication.Cookies.CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(o =>
    {
        o.LoginPath = "/admin/login";
        o.Cookie.Name = "mt_admin";
        o.Cookie.HttpOnly = true;
        o.Cookie.SameSite = SameSiteMode.Strict;
        o.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
        o.ExpireTimeSpan = TimeSpan.FromHours(8);
        o.SlidingExpiration = true;
    });
builder.Services.AddAuthorization();
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(o => o.MultipartBodyLengthLimit = 250_000_000);
builder.WebHost.ConfigureKestrel(o => o.Limits.MaxRequestBodySize = 250_000_000);

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

// Images, videos and the CV live in the assets folder at the root of the repository (shared with the static site).
// When running from the repository, serve that folder directly; after "dotnet publish" they are copied into wwwroot/assets.
var sharedAssets = Path.GetFullPath(Path.Combine(app.Environment.ContentRootPath, "..", "..", "assets"));
if (Directory.Exists(sharedAssets) && !Directory.Exists(Path.Combine(app.Environment.WebRootPath, "assets")))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(sharedAssets),
        RequestPath = "/assets"
    });
}
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.MapRazorPages();

app.Run();
