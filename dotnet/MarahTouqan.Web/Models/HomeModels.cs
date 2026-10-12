namespace MarahTouqan.Web.Models;

public class HomePage
{
    public string HeroTitle { get; set; } = "";
    public string HeroAriaLabel { get; set; } = "";
    public string HeroVideo { get; set; } = "";
    public string HeroVideoSmall { get; set; } = "";
    public string HeroPoster { get; set; } = "";
    public string IntroPrefix { get; set; } = "";
    public string ReplayLabel { get; set; } = "";
    /// <summary>Tooltips of the four floating stickers: palette, pen, layers, ruler.</summary>
    public List<string> StickerLabels { get; set; } = new();
    public string IntroLine2 { get; set; } = "";
    public string IntroPixel { get; set; } = "";
    public string IntroUnderline { get; set; } = "";
    /// <summary>Plain text with optional &lt;strong&gt; tags.</summary>
    public List<string> IntroParagraphs { get; set; } = new();
    public string CvLinkText { get; set; } = "";
    public string DragonPre { get; set; } = "";
    public string DragonWord { get; set; } = "";
    public string DragonTooltip { get; set; } = "";
    public List<HomeCard> Cards { get; set; } = new();
    public string WorkTitle { get; set; } = "";
    public string WorkCta { get; set; } = "";
    public List<HomeSlide> Slides { get; set; } = new();
    public List<string> ReviewsTitle { get; set; } = new();
    public List<Review> Reviews { get; set; } = new();
}

public class HomeCard
{
    public string Service { get; set; } = "";   // service slug
    public string Heading1 { get; set; } = "";
    public string Heading2 { get; set; } = "";
    public string Text { get; set; } = "";
    public string Ribbon { get; set; } = "";
}

public class HomeSlide
{
    public string Project { get; set; } = "";   // project slug from the My Work list
    public string Type { get; set; } = "";
    public string Alt { get; set; } = "";
}

public class Review
{
    public string Name { get; set; } = "";
    public string Role { get; set; } = "";
    public string Text { get; set; } = "";
}
