using System.Collections.Concurrent;
using System.Security.Cryptography;
using System.Text.Json;

namespace MarahTouqan.Web.Services;

/// <summary>
/// One admin password. It is stored as a salted hash in Data/admin.json (created by the first-run setup page),
/// or can be supplied with the ADMIN_PASSWORD environment variable (handy when hosting).
/// </summary>
public class AdminAuth
{
    private record Stored(string Salt, string Hash);

    private const int Iterations = 200_000;
    private readonly string _path;
    private readonly ConcurrentDictionary<string, (int Fails, DateTime LockedUntil)> _attempts = new();

    public AdminAuth(IWebHostEnvironment env) => _path = Path.Combine(env.ContentRootPath, "Data", "admin.json");

    private static string? EnvPassword => Environment.GetEnvironmentVariable("ADMIN_PASSWORD") is { Length: > 0 } p ? p : null;

    public bool IsConfigured => EnvPassword != null || File.Exists(_path);

    public void SetPassword(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(16);
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, HashAlgorithmName.SHA256, 32);
        File.WriteAllText(_path, JsonSerializer.Serialize(new Stored(Convert.ToBase64String(salt), Convert.ToBase64String(hash))));
    }

    public bool Verify(string password)
    {
        if (EnvPassword is { } env)
            return CryptographicOperations.FixedTimeEquals(
                SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(password)), SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(env)));
        if (!File.Exists(_path)) return false;
        var s = JsonSerializer.Deserialize<Stored>(File.ReadAllText(_path), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        if (s == null) return false;
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, Convert.FromBase64String(s.Salt), Iterations, HashAlgorithmName.SHA256, 32);
        return CryptographicOperations.FixedTimeEquals(hash, Convert.FromBase64String(s.Hash));
    }

    /// <summary>Five wrong passwords from one address lock the login for five minutes.</summary>
    public TimeSpan? LockedFor(string ip) =>
        _attempts.TryGetValue(ip, out var a) && a.LockedUntil > DateTime.UtcNow ? a.LockedUntil - DateTime.UtcNow : null;

    public void Failed(string ip) =>
        _attempts.AddOrUpdate(ip, _ => (1, DateTime.MinValue), (_, a) =>
            a.Fails + 1 >= 5 ? (0, DateTime.UtcNow.AddMinutes(5)) : (a.Fails + 1, a.LockedUntil));

    public void Succeeded(string ip) => _attempts.TryRemove(ip, out _);
}
