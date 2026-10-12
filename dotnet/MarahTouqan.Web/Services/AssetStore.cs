namespace MarahTouqan.Web.Services;

/// <summary>The assets folder: uploads from the admin are saved here and listed in the picker.</summary>
public class AssetStore
{
    public static readonly string[] AllowedExtensions = { ".webp", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".mp4", ".pdf" };
    public static readonly string[] ImageExtensions = { ".webp", ".png", ".jpg", ".jpeg", ".gif", ".svg" };

    public string Root { get; }

    public AssetStore(IWebHostEnvironment env)
    {
        var published = Path.Combine(env.WebRootPath, "assets");
        var shared = Path.GetFullPath(Path.Combine(env.ContentRootPath, "..", "..", "assets"));
        Root = Directory.Exists(published) ? published : shared;
        Directory.CreateDirectory(Root);
    }

    /// <summary>Lowercase letters, digits, dash and dot only, so a name is always safe in a web address.</summary>
    public static string SafeName(string fileName)
    {
        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        var stem = new string(Path.GetFileNameWithoutExtension(fileName).ToLowerInvariant()
            .Select(c => char.IsAsciiLetterOrDigit(c) ? c : '-').ToArray()).Trim('-');
        while (stem.Contains("--")) stem = stem.Replace("--", "-");
        return (stem.Length == 0 ? "file" : stem) + ext;
    }

    /// <summary>Saves an upload into a sub folder (portfolio, tools or the root) and returns its site path.</summary>
    public async Task<string> SaveAsync(IFormFile file, string folder)
    {
        folder = folder is "portfolio" or "tools" ? folder : "";
        var dir = folder == "" ? Root : Path.Combine(Root, folder);
        Directory.CreateDirectory(dir);
        var name = SafeName(file.FileName);
        var target = Path.Combine(dir, name);
        await using (var fs = File.Create(target)) await file.CopyToAsync(fs);
        return "assets/" + (folder == "" ? "" : folder + "/") + name;
    }

    public IEnumerable<string> List() =>
        Directory.EnumerateFiles(Root, "*", SearchOption.AllDirectories)
            .Where(f => AllowedExtensions.Contains(Path.GetExtension(f).ToLowerInvariant()))
            .Select(f => "assets/" + Path.GetRelativePath(Root, f).Replace('\\', '/'))
            .OrderBy(f => f);
}
