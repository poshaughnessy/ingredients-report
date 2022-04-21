# Ingredients Design System Report Dashboard

This is a reporting dashboard showing how we're doing with getting our components migrated over to the Ingredients design system. It's a work-in-progress and this isn't intended to be the ultimate system for it.

Here's how to use this "MVP" version:

1. Use Node v14+ (e.g. via nvm) or a recent version which supports ESM modules.

2. Ensure this directory is checked out alongside both `wtr-ingredients` and `wtr-website` (so they should each come under the same parent directory). And ensure both those projects are updated to the latest code on the master branches.

3. Then to update the DB with the latest stats (at most once per day, but expected to be more like every week or two):

```
node update
```

4. Then to run the server and view the dashboard:

```
node server
```

5. As a temporary solution, the dashboard is currently [hosted on Render](https://wtr-ingredients-report.onrender.com/). If you would like to deploy updates there in the short term, please ask Peter O'Shaughnessy or Ashley Heath for help.

6. Upload the CSV files generated in the `output` directory into Google Drive (and, if necessary, update the anchor links to them in the `index.html`)
