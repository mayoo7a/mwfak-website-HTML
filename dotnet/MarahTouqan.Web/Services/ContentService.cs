using System.Text.Json;
using MarahTouqan.Web.Models;

namespace MarahTouqan.Web.Services;

/// <summary>
/// Reads Data/content.json. The file is checked on every request, so a change saved by the admin
/// (or by hand) shows up on the site straight away, without restarting the app.
/// </summary>
public class ContentService
{
    private static readonly JsonSerializerOptions Options = new() { PropertyNameCaseInsensitive = true, WriteIndented = true };
    private readonly string _path;
    private readonly object _lock = new();
    private SiteContent _content = new();
    private DateTime _loadedAt = DateTime.MinValue;

    public ContentService(IWebHostEnvironment env) => _path = Path.Combine(env.ContentRootPath, "Data", "content.json");

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

    /// <summary>Writes the content back to disk (used by the admin).</summary>
    public void Save(SiteContent content)
    {
        lock (_lock)
        {
            var tmp = _path + ".tmp";
            File.WriteAllText(tmp, JsonSerializer.Serialize(content, Options));
            File.Move(tmp, _path, overwrite: true);
            _loadedAt = DateTime.MinValue;
        }
    }
}
