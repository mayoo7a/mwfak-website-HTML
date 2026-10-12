namespace MarahTouqan.Web.Models;

/// <summary>Everything that can be edited from the admin lives in Data/content.json and is read into these classes.</summary>
public class SiteContent
{
    public SiteSettings Site { get; set; } = new();
    public Dictionary<string, PageMeta> Pages { get; set; } = new();
    public ServicesPage ServicesPage { get; set; } = new();
    public List<Service> Services { get; set; } = new();
    public WorkPage Work { get; set; } = new();
}

public class SiteSettings
{
    public string BaseUrl { get; set; } = "https://marahtouqan.com";
    public string Name { get; set; } = "Marah Touqan";
    public string OgImage { get; set; } = "assets/og-preview.png";
    public string OgImageAlt { get; set; } = "";
    public string WhatsAppNumber { get; set; } = "";      // digits only, used in https://wa.me/...
    public string PhoneDisplay { get; set; } = "";
    public string Email { get; set; } = "";
    public string Behance { get; set; } = "";
    public string LinkedIn { get; set; } = "";
    public string Instagram { get; set; } = "";
    public string CvPath { get; set; } = "assets/Marah-Touqan-CV.pdf";
    public string JobTitle { get; set; } = "";
    public string ShortBio { get; set; } = "";
    public string[] KnowsAbout { get; set; } = Array.Empty<string>();
    public string[] ServiceTypes { get; set; } = Array.Empty<string>();

    public string BehanceHandle { get; set; } = "";
    public string LinkedInName { get; set; } = "";
    public string EmailCardText { get; set; } = "";
    public string ContactTitle { get; set; } = "";
    public string PostScript1 { get; set; } = "";
    public string PostScript2 { get; set; } = "";
    public string AvailabilityLine1 { get; set; } = "";
    public string AvailabilityLine2 { get; set; } = "";
    public string FooterTagline { get; set; } = "";

    public string WhatsAppUrl => "https://wa.me/" + WhatsAppNumber;
}

public class PageMeta
{
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public string Path { get; set; } = "/";
}
