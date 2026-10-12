namespace MarahTouqan.Web.Models;

/// <summary>Texts and links that repeat on every page: logo, menu, footer, contact card labels, small labels.</summary>
public class Ui
{
    public string LogoImage { get; set; } = "assets/logo.png";
    public string LogoAlt { get; set; } = "";
    /// <summary>The text beside the logo.</summary>
    public string BrandName { get; set; } = "";
    public string BrandAria { get; set; } = "";
    public List<LinkItem> MenuLinks { get; set; } = new();
    public string QuoteText { get; set; } = "";
    public string BackHomeText { get; set; } = "";
    public string SelectedProjectLabel { get; set; } = "";
    public string EmailLabel { get; set; } = "";
    public string BehanceLabel { get; set; } = "";
    public string LinkedInLabel { get; set; } = "";
    public string WhatsAppLabel { get; set; } = "";
    public string PsPrefix { get; set; } = "";
    public string FooterBye { get; set; } = "";
    public string FooterSitemapLabel { get; set; } = "";
    public string FooterElsewhereLabel { get; set; } = "";
    public string FooterCurrentlyLabel { get; set; } = "";
    public List<LinkItem> FooterSitemapLinks { get; set; } = new();
    public List<LinkItem> FooterElsewhereLinks { get; set; } = new();
}

public class LinkItem
{
    public string Label { get; set; } = "";
    /// <summary>A page (my-work.html), a section (index.html#about) or a token: {behance} {linkedin} {instagram} {email} {whatsapp} {cv}.</summary>
    public string Link { get; set; } = "";
}

/// <summary>The fonts of the website. Each value is a name from <see cref="FontCatalog"/>.</summary>
public class Fonts
{
    public string Heading { get; set; } = "Anton";
    public string Body { get; set; } = "Inter";
    public string Accent { get; set; } = "DM Serif Display";
    /// <summary>Used for Arabic letters anywhere on the site.</summary>
    public string Arabic { get; set; } = "Cairo";
}

public record FontInfo(string Name, string Group, string Query, string Generic);

public static class FontCatalog
{
    public const string Display = "Display (headings)", Sans = "Clean sans", Serif = "Serif", Arabic = "Arabic";

    public static readonly FontInfo[] All =
    {
        new("Anton", Display, "Anton", "sans-serif"), new("Bebas Neue", Display, "Bebas+Neue", "sans-serif"),
        new("Oswald", Display, "Oswald:wght@400;500;600;700", "sans-serif"), new("Archivo Black", Display, "Archivo+Black", "sans-serif"),
        new("Lilita One", Display, "Lilita+One", "sans-serif"), new("Fredoka", Display, "Fredoka:wght@400;500;600;700", "sans-serif"),
        new("Bangers", Display, "Bangers", "cursive"), new("Luckiest Guy", Display, "Luckiest+Guy", "cursive"),
        new("Titan One", Display, "Titan+One", "cursive"), new("Passion One", Display, "Passion+One:wght@400;700;900", "sans-serif"),
        new("Righteous", Display, "Righteous", "sans-serif"), new("Press Start 2P", Display, "Press+Start+2P", "monospace"),
        new("Pixelify Sans", Display, "Pixelify+Sans:wght@400;500;600;700", "sans-serif"), new("Rubik", Display, "Rubik:wght@400;500;600;700;800", "sans-serif"),
        new("Inter", Sans, "Inter:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500", "sans-serif"), new("Poppins", Sans, "Poppins:wght@400;500;600;700", "sans-serif"),
        new("Nunito", Sans, "Nunito:wght@400;500;600;700", "sans-serif"), new("DM Sans", Sans, "DM+Sans:wght@400;500;600;700", "sans-serif"),
        new("Manrope", Sans, "Manrope:wght@400;500;600;700", "sans-serif"), new("Work Sans", Sans, "Work+Sans:wght@400;500;600;700", "sans-serif"),
        new("Lexend", Sans, "Lexend:wght@400;500;600;700", "sans-serif"), new("Montserrat", Sans, "Montserrat:wght@400;500;600;700", "sans-serif"),
        new("Space Grotesk", Sans, "Space+Grotesk:wght@400;500;600;700", "sans-serif"), new("IBM Plex Sans", Sans, "IBM+Plex+Sans:wght@400;500;600;700", "sans-serif"),
        new("Quicksand", Sans, "Quicksand:wght@400;500;600;700", "sans-serif"),
        new("DM Serif Display", Serif, "DM+Serif+Display", "serif"), new("Playfair Display", Serif, "Playfair+Display:wght@400;500;600;700", "serif"),
        new("Abril Fatface", Serif, "Abril+Fatface", "serif"), new("Fraunces", Serif, "Fraunces:wght@400;500;600;700", "serif"),
        new("Young Serif", Serif, "Young+Serif", "serif"), new("Lora", Serif, "Lora:wght@400;500;600;700", "serif"), new("Caprasimo", Serif, "Caprasimo", "serif"),
        new("Cairo", Arabic, "Cairo:wght@400;500;600;700", "sans-serif"), new("Tajawal", Arabic, "Tajawal:wght@400;500;700", "sans-serif"),
        new("Almarai", Arabic, "Almarai:wght@400;700", "sans-serif"), new("Readex Pro", Arabic, "Readex+Pro:wght@400;500;600;700", "sans-serif"),
        new("IBM Plex Sans Arabic", Arabic, "IBM+Plex+Sans+Arabic:wght@400;500;600;700", "sans-serif"), new("Noto Kufi Arabic", Arabic, "Noto+Kufi+Arabic:wght@400;500;600;700", "sans-serif"),
        new("Reem Kufi", Arabic, "Reem+Kufi:wght@400;500;600;700", "sans-serif"), new("El Messiri", Arabic, "El+Messiri:wght@400;500;600;700", "sans-serif"),
        new("Changa", Arabic, "Changa:wght@400;500;600;700", "sans-serif"), new("Lalezar", Arabic, "Lalezar", "cursive"),
        new("Mada", Arabic, "Mada:wght@400;500;600;700", "sans-serif"), new("Amiri", Arabic, "Amiri:wght@400;700", "serif"),
        new("Baloo Bhaijaan 2", Arabic, "Baloo+Bhaijaan+2:wght@400;500;600;700", "sans-serif"),
    };

    public static FontInfo Find(string name, string fallback) =>
        All.FirstOrDefault(f => f.Name == name) ?? All.First(f => f.Name == fallback);
}

/// <summary>Turns a link from content.json into an address, replacing tokens such as {behance}.</summary>
public static class LinkResolver
{
    public static string Resolve(string link, SiteSettings s, bool onHome)
    {
        link ??= "";
        switch (link.Trim())
        {
            case "{behance}": return s.Behance;
            case "{linkedin}": return s.LinkedIn;
            case "{instagram}": return s.Instagram;
            case "{email}": return "mailto:" + s.Email;
            case "{whatsapp}": return s.WhatsAppUrl;
            case "{cv}": return s.CvPath;
        }
        return onHome && link.StartsWith("index.html#") ? link["index.html".Length..] : link;
    }

    /// <summary>Links that leave the page open in a new tab.</summary>
    public static bool Opens(string link) => link.StartsWith("{") && link != "{email}" || link.StartsWith("http");
    /// <summary>The little arrow shown after links that go elsewhere.</summary>
    public static bool Arrow(string link) => link.StartsWith("{") || link.StartsWith("http") || link.StartsWith("mailto:");
}
