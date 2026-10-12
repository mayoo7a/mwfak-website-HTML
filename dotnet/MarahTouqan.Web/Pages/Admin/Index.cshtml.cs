using System.Text.Json;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using MarahTouqan.Web.Services;

namespace MarahTouqan.Web.Pages.Admin;

public class IndexModel : PageModel
{
    private readonly ContentService _content;
    private readonly AssetStore _assets;
    public IndexModel(ContentService content, AssetStore assets) { _content = content; _assets = assets; }

    public void OnGet() { }

    public ContentResult OnGetContent() => Json(_content.CurrentJson());

    public IActionResult OnPostSave()
    {
        using var reader = new StreamReader(Request.Body);
        var errors = _content.SaveJson(reader.ReadToEndAsync().Result);
        return new JsonResult(new { ok = errors.Count == 0, errors });
    }

    public IActionResult OnGetBackups() =>
        new JsonResult(_content.Backups().Select(b => new { name = b.Name, at = b.At.ToString("d MMM yyyy, HH:mm:ss") }));

    public ContentResult OnGetBackup(string name) =>
        _content.BackupJson(name) is { } json ? Json(json) : throw new FileNotFoundException();

    public IActionResult OnGetAssets() => new JsonResult(_assets.List());

    public async Task<IActionResult> OnPostUploadAsync(IFormFile file, string folder)
    {
        if (file == null || file.Length == 0) return BadRequest(new { error = "No file." });
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AssetStore.AllowedExtensions.Contains(ext))
            return BadRequest(new { error = "This file type is not allowed. Use webp, png, jpg, gif, svg, mp4 or pdf." });
        var path = await _assets.SaveAsync(file, folder ?? "");
        return new JsonResult(new { path });
    }

    public async Task<IActionResult> OnPostLogoutAsync()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return Redirect("/admin/login");
    }

    private static ContentResult Json(string json) => new() { Content = json, ContentType = "application/json; charset=utf-8" };
}
