# Permanent Cloudflare deployment

The classroom app deploys from `main` to the authenticated Cloudflare account through `.github/workflows/permanent-deploy.yml`.

Permanent URLs after the first successful production deploy:

- Student: `https://classroom.itsbadlabs.com/student`
- Showrunner: `https://classroom.itsbadlabs.com/instructor`
- Room: `https://classroom.itsbadlabs.com/room`

## One-time GitHub setup

Create these GitHub Actions secrets for the repository:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

The API token should be scoped to the Cloudflare account that owns `itsbadlabs.com` and allow Workers Scripts editing plus the permissions required to manage the custom Worker domain/DNS for `classroom.itsbadlabs.com`.

The workflow uses the GitHub `production` environment. If the environment does not already exist, GitHub will create/use it when the workflow is configured; repository or environment secrets may be used as long as the two names above are available to the job.

## Deployment behavior

Every push to `main` that changes the Worker, static assets, Wrangler configuration, package configuration, or permanent deployment workflow runs:

`npx wrangler@latest deploy`

It no longer uses `--temporary`, so deploys update the same Worker in the same Cloudflare account rather than creating disposable preview accounts and changing hostnames.

The Worker custom domain is declared in `wrangler.jsonc` as `classroom.itsbadlabs.com`.
