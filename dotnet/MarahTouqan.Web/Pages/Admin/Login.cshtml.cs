using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using MarahTouqan.Web.Services;

namespace MarahTouqan.Web.Pages.Admin;

public class LoginModel : PageModel
{
    private readonly AdminAuth _auth;
    public LoginModel(AdminAuth auth) => _auth = auth;

    [BindProperty] public string Password { get; set; } = "";
    public string? Error { get; set; }

    public IActionResult OnGet() => _auth.IsConfigured ? Page() : Redirect("/admin/setup");

    public async Task<IActionResult> OnPostAsync()
    {
        if (!_auth.IsConfigured) return Redirect("/admin/setup");
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        if (_auth.LockedFor(ip) is { } wait)
        {
            Error = $"Too many wrong passwords. Try again in {Math.Ceiling(wait.TotalMinutes)} minute(s).";
            return Page();
        }
        if (!_auth.Verify(Password ?? ""))
        {
            _auth.Failed(ip);
            await Task.Delay(700);
            Error = "Wrong password.";
            return Page();
        }
        _auth.Succeeded(ip);
        var id = new ClaimsIdentity(new[] { new Claim(ClaimTypes.Name, "admin") }, CookieAuthenticationDefaults.AuthenticationScheme);
        await HttpContext.SignInAsync(new ClaimsPrincipal(id));
        return Redirect("/admin");
    }
}
