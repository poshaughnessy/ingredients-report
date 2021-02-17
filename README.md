# Design System Report

This mini project is for a report dashboard showing how we're doing with getting our components migrated over to the Ingredients design system.

1. Use Node v14+ (e.g. via nvm) or a recent version which supports ESM modules.

2. Ensure this directory is checked out alongside both wtr-ingredients and wtr-website (so they should each come under the same parent directory). And ensure both those projects are updated to the latest code on the master branches.

3. Then to update the DB with the latest stats (at most once per day, but expected to be more like every week or two):

```
node gather-stats
```

4. Then to run the server and view the dashboard:

```
node server
```
