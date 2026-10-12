using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using MarahTouqan.Web.Services;

namespace MarahTouqan.Web.Pages.Admin;

/// <summary>First-run page. Only works while no password exists, and only from the same computer (localhost).</summary>
public class SetupModel : PageModel
{
    private readonly AdminAuth _auth;
    public SetupModel(AdminAuth auth) => _auth = auth;

    [BindProperty] public string Password { get; set; } = "";
    [BindProperty] public string Repeat { get; set; } = "";
    public string? Error { get; set; }

    private bool Allowed =>
        !_auth.IsConfigured && System.Net.IPAddress.IsLoopback(HttpContext.Connection.RemoteIpAddress ?? System.Net.IPAddress.None);

    public IActionResult OnGet() => Allowed ? Page() : (_auth.IsConfigured ? Redirect("/admin/login") : NotFound());

    public IActionResult OnPost()
    {
        if (!Allowed) return NotFound();
        if ((Password ?? "").Length < 10) { Error = "Use at least 10 characters."; return Page(); }
        if (Password != Repeat) { Error = "The two passwords are different."; return Page(); }
        _auth.SetPassword(Password);
        return Redirect("/admin/login");
    }
}
