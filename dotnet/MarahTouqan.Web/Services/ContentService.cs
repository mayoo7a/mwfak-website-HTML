using System.Text.Json;
using MarahTouqan.Web.Models;

namespace MarahTouqan.Web.Services;

/// <summary>
/// Reads Data/content.json. The file is checked on every request, so a change saved by the admin
/// (or by hand) shows up on the site straight away, without restarting the app.
/// </summary>
public class ContentService
{
    private static readonly JsonSerializerOptions Options = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = true,
        Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
    };
    private const int KeepBackups = 60;
    private readonly string _backupDir;
    private readonly string _path;
    private readonly object _lock = new();
    private SiteContent _content = new();
    private DateTime _loadedAt = DateTime.MinValue;

    public ContentService(IWebHostEnvironment env)
    {
        _path = Path.Combine(env.ContentRootPath, "Data", "content.json");
        _backupDir = Path.Combine(env.ContentRootPath, "Data", "backups");
    }

    public string FilePath => _path;

    public SiteContent Current
    {
        get
        {
            var written = File.GetLastWriteTimeUtc(_path);
            if (written != _loadedAt)
            {
                lock (_lock)
                {
                    written = File.GetLastWriteTimeUtc(_path);
                    if (written != _loadedAt)
                    {
                        _content = JsonSerializer.Deserialize<SiteContent>(File.ReadAllText(_path), Options) ?? new SiteContent();
                        _loadedAt = written;
                    }
                }
            }
            return _content;
        }
    }

    public SiteSettings Site => Current.Site;
    public PageMeta Page(string slug) => Current.Pages[slug];

    /// <summary>The content as JSON, exactly as the editor shows it.</summary>
    public string CurrentJson() => JsonSerializer.Serialize(Current, Options);

    /// <summary>Checks the content before it is saved. Returns a list of problems in plain words (empty = fine).</summary>
    public static List<string> Validate(SiteContent c)
    {
        var errors = new List<string>();
        foreach (var slug in new[] { "home", "services", "my-work" })
            if (!c.Pages.ContainsKey(slug)) errors.Add($"The search texts for \"{slug}\" are missing.");
        var serviceSlugs = c.Services.Select(s => s.Slug).ToList();
        var projectSlugs = c.Work.Projects.Select(p => p.Slug).ToList();
        void Dupes(IEnumerable<string> slugs, string what)
        {
            foreach (var d in slugs.GroupBy(s => s).Where(g => g.Key == "" || g.Count() > 1))
                errors.Add(d.Key == "" ? $"A {what} has an empty address name (slug)." : $"Two {what}s share the address name \"{d.Key}\".");
        }
        Dupes(serviceSlugs, "service"); Dupes(projectSlugs, "project"); Dupes(c.Work.Groups.Select(g => g.Slug), "group");
        foreach (var g in c.Work.Groups)
            foreach (var i in g.Items.Where(i => !projectSlugs.Contains(i.Project)))
                errors.Add($"Group \"{g.Title}\" uses a project that does not exist (\"{i.Project}\").");
        foreach (var s in c.Home.Slides.Where(s => !projectSlugs.Contains(s.Project)))
            errors.Add($"The home slideshow uses a project that does not exist (\"{s.Project}\").");
        foreach (var card in c.Home.Cards.Where(k => !serviceSlugs.Contains(k.Service)))
            errors.Add($"A home card points to a service that does not exist (\"{card.Service}\").");
        if (c.Home.Slides.Count == 0) errors.Add("The home slideshow needs at least one slide.");
        if (c.Home.Reviews.Count == 0) errors.Add("Keep at least one review.");
        return errors;
    }

    /// <summary>Parses, validates and saves. The previous version is kept as a backup so it can be restored.</summary>
    public List<string> SaveJson(string json)
    {
        SiteContent? content;
        try { content = JsonSerializer.Deserialize<SiteContent>(json, Options); }
        catch (JsonException e) { return new() { "The data could not be read: " + e.Message }; }
        if (content == null) return new() { "Nothing to save." };
        var errors = Validate(content);
        if (errors.Count > 0) return errors;
        Save(content);
        return errors;
    }

    /// <summary>Writes the content to disk, keeping the old file in Data/backups first.</summary>
    public void Save(SiteContent content)
    {
        lock (_lock)
        {
            Directory.CreateDirectory(_backupDir);
            if (File.Exists(_path))
                File.Copy(_path, Path.Combine(_backupDir, $"content-{DateTime.Now:yyyyMMdd-HHmmss-fff}.json"), overwrite: false);
            foreach (var old in Directory.GetFiles(_backupDir, "content-*.json").OrderByDescending(f => f).Skip(KeepBackups))
                File.Delete(old);
            var tmp = _path + ".tmp";
            File.WriteAllText(tmp, JsonSerializer.Serialize(content, Options));
            File.Move(tmp, _path, overwrite: true);
            _loadedAt = DateTime.MinValue;
        }
    }

    /// <summary>Backups, newest first, as (file name, saved at).</summary>
    public List<(string Name, DateTime At)> Backups()
    {
        if (!Directory.Exists(_backupDir)) return new();
        return Directory.GetFiles(_backupDir, "content-*.json").OrderByDescending(f => f)
            .Select(f => (Path.GetFileName(f), File.GetLastWriteTime(f))).ToList();
    }

    public string? BackupJson(string name)
    {
        if (name != Path.GetFileName(name) || !name.StartsWith("content-") || !name.EndsWith(".json")) return null;
        var f = Path.Combine(_backupDir, name);
        return File.Exists(f) ? File.ReadAllText(f) : null;
    }
}
