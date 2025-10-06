# Deployment Cleanup Scripts

This directory contains scripts to manage and clean up Vercel deployments for the Agent Bio Summary V2 project.

## 🧹 Cleanup Scripts

### Node.js Version (`cleanup-deployments.js`)
A comprehensive Node.js script with advanced features and detailed logging.

### Shell Version (`cleanup-deployments.sh`)
A lightweight shell script for quick cleanup operations.

## 🚀 Usage

### Quick Start
```bash
# Dry run to see what would be deleted
npm run cleanup:deployments:dry

# Actually clean up deployments
npm run cleanup:deployments
```

### Advanced Usage

#### Node.js Script
```bash
# Dry run with custom keep count
node scripts/cleanup-deployments.js --dry-run --keep=3

# Clean up with custom project name
node scripts/cleanup-deployments.js --project=my-project --keep=10

# Show help
node scripts/cleanup-deployments.js --help
```

#### Shell Script
```bash
# Dry run
./scripts/cleanup-deployments.sh --dry-run

# Clean up with custom settings
./scripts/cleanup-deployments.sh --keep 3 --project my-project

# Show help
./scripts/cleanup-deployments.sh --help
```

## 📋 Features

### What the Scripts Do
- **Smart Cleanup**: Keeps the latest production deployment
- **Configurable**: Set how many preview deployments to keep
- **Safe**: Always run dry-run first to see what will be deleted
- **Detailed Logging**: Shows exactly what's being deleted
- **Error Handling**: Gracefully handles failures

### Safety Features
- **Dry Run Mode**: Preview deletions without actually deleting
- **Confirmation**: 5-second delay before actual deletion
- **Production Protection**: Always keeps the latest production deployment
- **Error Recovery**: Continues even if some deletions fail

## ⚙️ Configuration

### Default Settings
- **Keep Count**: 5 deployments (1 production + 4 preview)
- **Project**: `agent-bio-summary-v2`
- **Mode**: Live (use `--dry-run` for preview)

### Environment Requirements
- Vercel CLI installed (`npm install -g vercel`)
- Authenticated with Vercel (`vercel login`)
- Project access permissions

## 🔧 Script Options

| Option | Description | Default |
|--------|-------------|---------|
| `--dry-run` | Show what would be deleted without deleting | false |
| `--keep=N` | Number of deployments to keep | 5 |
| `--project=NAME` | Vercel project name | agent-bio-summary-v2 |
| `--help` | Show help information | - |

## 📊 Example Output

```
🧹 Vercel Deployment Cleanup Script
📦 Project: agent-bio-summary-v2
🔢 Keep count: 5
🔍 Mode: DRY RUN

📋 Fetching deployment list...
📊 Found 12 deployments
🏭 Production deployments: 3
👀 Preview deployments: 9

🗑️  Deployments to delete: 7
   - Production: 2
   - Preview: 5

🔍 DRY RUN - Deployments that would be deleted:
   1. https://agent-bio-summary-v2-abc123.vercel.app (Production, 2h)
   2. https://agent-bio-summary-v2-def456.vercel.app (Preview, 1h)
   3. https://agent-bio-summary-v2-ghi789.vercel.app (Preview, 30m)
   ...

✅ Dry run complete. Use without --dry-run to actually delete.
```

## 🛡️ Safety Guidelines

### Before Running
1. **Always run dry-run first**: `npm run cleanup:deployments:dry`
2. **Check the output**: Verify the deployments listed are safe to delete
3. **Backup if needed**: Important deployments should be backed up
4. **Test in staging**: Use a test project first if unsure

### Best Practices
- Run cleanup regularly to avoid accumulation
- Keep more deployments during active development
- Monitor Vercel usage and costs
- Document any custom cleanup needs

## 🔄 Automation

### GitHub Actions Integration
You can integrate these scripts into your CI/CD pipeline:

```yaml
# .github/workflows/cleanup-deployments.yml
name: Cleanup Old Deployments
on:
  schedule:
    - cron: '0 2 * * 0'  # Weekly on Sunday at 2 AM
  workflow_dispatch:  # Manual trigger

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install -g vercel
      - run: vercel login --token ${{ secrets.VERCEL_TOKEN }}
      - run: npm run cleanup:deployments
```

### Cron Job (Local)
```bash
# Add to crontab for weekly cleanup
0 2 * * 0 cd /path/to/agent-bio-summary-v2 && npm run cleanup:deployments
```

## 🆘 Troubleshooting

### Common Issues

#### "Vercel CLI not found"
```bash
npm install -g vercel
# or
npx vercel --version
```

#### "Not authenticated"
```bash
vercel login
```

#### "Permission denied"
```bash
chmod +x scripts/cleanup-deployments.sh
```

#### "No deployments found"
- Check if you're in the right project
- Verify Vercel CLI is working: `vercel ls`
- Check project permissions

### Getting Help
- Check Vercel CLI documentation
- Verify project settings in Vercel dashboard
- Test with `--dry-run` first
- Use `--help` for script-specific options

## 📝 Notes

- Scripts are designed to be safe and conservative
- Always test with `--dry-run` first
- Production deployments are protected
- Preview deployments are cleaned up based on age
- Failed deletions are logged but don't stop the process
