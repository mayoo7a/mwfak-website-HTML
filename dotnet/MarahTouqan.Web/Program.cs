using MarahTouqan.Web.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages(options =>
{
    // the old address of the home page keeps working
    options.Conventions.AddPageRoute("/Index", "index.html");
});
builder.Services.AddSingleton<ContentService>();

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
app.MapRazorPages();

app.Run();
