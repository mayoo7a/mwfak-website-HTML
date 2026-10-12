# Marah Touqan website (ASP.NET Core 8, C#)

Same look as the static site in the repo root, but every text, price, project and link comes from
`MarahTouqan.Web/Data/content.json` and can be edited in the admin area.

## Run it on your computer

Needs the [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0).

```
cd dotnet/MarahTouqan.Web
dotnet run --urls http://localhost:5055
```

- Website: http://localhost:5055
- Admin: http://localhost:5055/admin

The first time, `/admin` asks you to create a password (10+ characters). This only works from the same computer.
The password is saved as a salted hash in `Data/admin.json`, which is not committed to GitHub.

## Using the admin

Tabs: Contact & links, Google texts, Home page, Services & prices, My work.

- Change the text, press **Save** (or Ctrl+S). The website updates straight away.
- **Choose / upload** next to any picture, video or PDF lets you pick an existing file or upload a new one.
- **Undo last save** and the version list bring back any earlier version. The last 60 versions are kept in `Data/backups/`.
- To add a project: My work > All projects > Add new, then add it to a group under "Groups on the page".

## Hosting later

- `dotnet publish -c Release -o out` produces a folder to upload. It includes `wwwroot/assets` and `Data/content.json`.
- Set the password on the server with the environment variable `ADMIN_PASSWORD`, or copy `Data/admin.json`.
- The app must be able to write to `Data/` and `wwwroot/assets/` (that is where saves and uploads go).
- Use HTTPS in production.
