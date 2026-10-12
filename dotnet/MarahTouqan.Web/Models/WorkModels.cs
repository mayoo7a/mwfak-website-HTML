namespace MarahTouqan.Web.Models;

public class WorkPage
{
    public string Title1 { get; set; } = "";
    public string Title2 { get; set; } = "";
    public List<WorkGroup> Groups { get; set; } = new();
    public List<Project> Projects { get; set; } = new();

    public Project? Find(string slug) => Projects.FirstOrDefault(p => p.Slug == slug);
}

/// <summary>A project, written once. The same project can appear in more than one group of My Work.</summary>
public class Project
{
    public string Slug { get; set; } = "";
    public string Name { get; set; } = "";
    public string Image { get; set; } = "";
    public string Description1 { get; set; } = "";
    public string Description2 { get; set; } = "";
}

/// <summary>A section of My Work, for example "Logo Design".</summary>
public class WorkGroup
{
    public string Slug { get; set; } = "";
    public string Title { get; set; } = "";
    public string Accent { get; set; } = "#000000";
    /// <summary>When true, this group and the next one sit side by side (two small services in a row).</summary>
    public bool PairWithNext { get; set; }
    public List<WorkItem> Items { get; set; } = new();
}

public class WorkItem
{
    public string Project { get; set; } = "";
    public string Type { get; set; } = "";
}
