## Deploy with Coolify

Create a new Coolify application from this Git repository and select **Dockerfile**
as the build pack. Use the repository root as the base directory and `Dockerfile`
as the Dockerfile path. The container serves the website and Instagram API on
port `3001`; configure that as the application's exposed port.

Set `INSTAGRAM_TOKEN` as a server-side environment variable in Coolify. Do not
use a `VITE_` prefix. Add persistent storage mounted at
`/app/server/data` so refreshed Instagram tokens survive container restarts.
The app's health check is available at `/healthz`.

After deployment, open `/api/instagram` on the application domain. A configured
Instagram account should return JSON; without `INSTAGRAM_TOKEN`, the endpoint
returns a JSON configuration error. The Instagram token must belong to a
professional account and have the `instagram_business_basic` permission.
# bakverkstan
