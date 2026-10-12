namespace MarahTouqan.Web.Models;

public class ServicesPage
{
    public string Title { get; set; } = "";
    public string Hint { get; set; } = "";
}

/// <summary>One service (Logo Design, Brand Identity, ...). Everything on its card and section comes from here.</summary>
public class Service
{
    public string Slug { get; set; } = "";
    public string MenuLabel { get; set; } = "";
    public string Heading1 { get; set; } = "";
    public string Heading2 { get; set; } = "";
    public string Tagline { get; set; } = "";
    public string Description { get; set; } = "";
    public string Color { get; set; } = "#000000";
    public string BoxImage { get; set; } = "box-orange.svg";

    public string ProjectImage { get; set; } = "";
    public string ProjectName { get; set; } = "";
    public string ProjectType { get; set; } = "";
    public string PriceLabel { get; set; } = "Starting from";
    public string Price { get; set; } = "";
    public string CtaText { get; set; } = "Start a project";

    public string ScopeTitle { get; set; } = "Scope";
    public List<ScopeItem> Scope { get; set; } = new();
    public string StepsTitle { get; set; } = "How we get there";
    public List<Step> Steps { get; set; } = new();

    public string ReceiveTitle { get; set; } = "What you receive";
    public List<ReceiveGroup> Receive { get; set; } = new();
    public string FilesTitle { get; set; } = "Files you receive";
    public List<string> Formats { get; set; } = new();
    public string FilesNote { get; set; } = "";
    public string ToolsTitle { get; set; } = "Made with";
    public List<Tool> Tools { get; set; } = new();
    public string MoreText { get; set; } = "See more";
    public string LessText { get; set; } = "See less";
}

/// <summary>A line in the Scope list, for example "2 concepts": Before + Highlight (coloured) + After.</summary>
public class ScopeItem
{
    public string Icon { get; set; } = "palette";   // palette, curve, calendar or screens
    public string Before { get; set; } = "";
    public string Highlight { get; set; } = "";
    public string After { get; set; } = "";
    public string Text { get; set; } = "";
}

public class Step
{
    public string Title { get; set; } = "";
    public string Text { get; set; } = "";
}

/// <summary>A bullet list under "What you receive". Heading is optional.</summary>
public class ReceiveGroup
{
    public string Heading { get; set; } = "";
    public List<string> Items { get; set; } = new();
}

public class Tool
{
    public string Icon { get; set; } = "";   // file name inside assets/tools
    public string Name { get; set; } = "";
}
