# Deployment Cleanup Script

This directory contains the automation used to clean up Vercel preview deployments for the Agent Bio Summary V2 project.

## 🧹 Script Overview

`cleanup-deployments.sh` is a lightweight shell script that talks directly to the Vercel REST API. It lists every deployment, keeps production deployments safe, and deletes stale preview deployments beyond a configurable retention window.

> ⚠️ **Security Note**: The script requires a Vercel Personal Access Token (PAT). Never commit tokens to git.

## 🔐 Security Setup

### Option 1: Environment Variable (Recommended)
```bash
# Add to your ~/.zshrc or ~/.bashrc
export VERCEL_TOKEN="your_token_here"

# Or export in your current shell session
export VERCEL_TOKEN="your_token_here"
./scripts/cleanup-deployments.sh
```

### Option 2: Use a .env file (git-ignored)
```bash
# Create a .env file (already in .gitignore)
echo 'VERCEL_TOKEN=your_token_here' > .env.vercel

# Source it before running the script
source .env.vercel && ./scripts/cleanup-deployments.sh
```

### Get Your Vercel Token
1. Go to https://vercel.com/account/tokens  
2. Create a token with access to the project (read + write deployments)  
3. Store the token securely  
4. **Do not** commit the token to git

## 🚀 Usage

### Quick Start
```bash
# Dry run to see what would be deleted
npm run cleanup:deployments:dry

# Actually clean up deployments
npm run cleanup:deployments
```

### Direct Execution
```bash
# Basic usage (default keep count = 5 preview deployments)
./scripts/cleanup-deployments.sh

# Keep only the latest preview deployment
./scripts/cleanup-deployments.sh --keep 1

# Override project or team identifiers
./scripts/cleanup-deployments.sh --project-id prj_123 --team-id team_abc

# Show help
./scripts/cleanup-deployments.sh --help
```

## 📋 Features

- **Production-safe**: Always keeps the latest promoted/production deployment.
- **Preview retention**: Keeps only the newest N preview deployments (`--keep N`, default 5).
- **Dry-run mode**: Inspect what would be deleted before running for real.
- **Team-aware**: Supports Vercel team scopes via `--team-id` or `VERCEL_TEAM_ID`.
- **Build protection**: Skips deployments that are still `BUILDING` or `QUEUED`.
- **Detailed logging**: Shows branch, status, and timestamp for every deletion candidate.

## ⚙️ Configuration

| Setting | How to configure | Default |
| ------- | ---------------- | ------- |
| Vercel token | `VERCEL_TOKEN` env | required |
| Project ID | `--project-id`, `VERCEL_PROJECT_ID` | `prj_Y1HUCATH8Xo0PzRmtHU6M9un4H5s` |
| Team ID | `--team-id`, `VERCEL_TEAM_ID` | unset |
| Preview keep count | `--keep`, `VERCEL_KEEP_PREVIEW_COUNT` | `5` |
| Dry run | `--dry-run` | `false` |

## 📊 Example Output

```
🧹 Vercel Deployment Cleanup Script
📦 Project ID: prj_Y1HUCATH8Xo0PzRmtHU6M9un4H5s
🔢 Preview keep count: 5
🔍 Mode: DRY RUN

📋 Fetching deployments...
📊 Summary:
   Total deployments:      18
   Production deployments: 2 (all kept)
   Preview deployments:    16
   Keeping preview:        5 (limit: 5)
   To delete (preview):    11

🗑️  Preview deployments to DELETE:
   ❌ [READY] https://agent-bio-summary-v2-abcdef.vercel.app (Branch: feature/foo, Created: 2025-11-01 16:32:22)
   ❌ [READY] https://agent-bio-summary-v2-ghijkl.vercel.app (Branch: feature/bar, Created: 2025-10-28 11:05:14)
   ...

✅ Dry run complete. Use without --dry-run to actually delete.
```

## 🛡️ Safety Guidelines

1. **Always start with a dry run** (`--dry-run`) and review the list.
2. Adjust the `--keep` value to retain the desired number of previews.
3. Run routinely (e.g., weekly) to prevent preview accumulation.
4. Do not run while critical builds are in progress.

## 🔄 Automation

### GitHub Actions (Manual or Scheduled)
```yaml
# .github/workflows/cleanup-deployments.yml
name: Cleanup Old Vercel Previews
on:
  schedule:
    - cron: '0 2 * * 0'  # Weekly on Sunday at 2 AM UTC
  workflow_dispatch:

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: chmod +x scripts/cleanup-deployments.sh
      - run: ./scripts/cleanup-deployments.sh --dry-run
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_PROJECT_ID: prj_Y1HUCATH8Xo0PzRmtHU6M9un4H5s
      - run: ./scripts/cleanup-deployments.sh
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_PROJECT_ID: prj_Y1HUCATH8Xo0PzRmtHU6M9un4H5s
```

### Local Cron Job
```bash
# Weekly cleanup every Sunday at 2 AM
0 2 * * 0 cd /path/to/agent-bio-summary-v2 && npm run cleanup:deployments
```

## 🆘 Troubleshooting

| Symptom | Fix |
| ------- | --- |
| `ERROR: VERCEL_TOKEN environment variable is not set.` | Export `VERCEL_TOKEN` or source `.env.vercel`. |
| `Failed to fetch deployments` | Ensure the token has access, confirm project/team IDs. |
| `jq: command not found` | Install jq (`brew install jq`, `apt-get install jq`, etc.). |
| Script exits without deleting anything | Only preview deployments beyond the keep threshold are removed; increase `--keep` or check branch filters. |

## 📝 Notes

- Production deployments are never deleted by this script.
- Preview retention is age-based (oldest previews removed first).
- The script continues even if some deletions fail and reports the counts.
- Keep the script executable: `chmod +x scripts/cleanup-deployments.sh`.
