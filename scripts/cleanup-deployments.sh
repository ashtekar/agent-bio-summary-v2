#!/bin/bash

set -euo pipefail

# --- Configuration Defaults ---
# 1. Set your Vercel Personal Access Token as an environment variable.
#    (Get one at: https://vercel.com/account/tokens)
#    
#    Option 1: Export in your shell:
#      export VERCEL_TOKEN="your_token"
#    
#    Option 2: Add to ~/.bashrc or ~/.zshrc:
#      export VERCEL_TOKEN="your_token"
#    
#    Option 3: Create a .env file (ignored by git):
#      VERCEL_TOKEN=your_token
#      Then run: source .env && ./scripts/cleanup-deployments.sh
VERCEL_TOKEN="${VERCEL_TOKEN:-}"

# 2. Project ID
#    Default project name is 'agent-bio-summary-v2'.
DEFAULT_PROJECT_ID="prj_Y1HUCATH8Xo0PzRmtHU6M9un4H5s"
PROJECT_ID="${VERCEL_PROJECT_ID:-$DEFAULT_PROJECT_ID}"

# 3. Team ID (optional)
TEAM_ID="${VERCEL_TEAM_ID:-}"

# 4. Preview keep count
KEEP_PREVIEW_COUNT="${VERCEL_KEEP_PREVIEW_COUNT:-5}"

# --- Helpers ---
usage() {
    cat <<EOF
🧹 Vercel Deployment Cleanup Script

Usage: ./scripts/cleanup-deployments.sh [options]

Options:
  --dry-run              Show what would be deleted without deleting anything
  --keep N               Number of preview deployments to keep (default: $KEEP_PREVIEW_COUNT)
  --project-id ID        Override the Vercel project ID
  --team-id ID           Optional Vercel team ID
  --help                 Show this help message

Environment variables:
  VERCEL_TOKEN                 (required) personal access token
  VERCEL_PROJECT_ID            default project id fallback ($DEFAULT_PROJECT_ID)
  VERCEL_TEAM_ID               optional team id
  VERCEL_KEEP_PREVIEW_COUNT    default keep count for preview deployments
EOF
}

is_integer() {
    [[ "$1" =~ ^[0-9]+$ ]]
}

format_timestamp() {
    local epoch_ms="$1"
    if ! is_integer "$epoch_ms"; then
        echo "Unknown"
        return
    fi

    local epoch_sec=$((epoch_ms / 1000))

    if date -d "@$epoch_sec" "+%Y-%m-%d %H:%M:%S" >/dev/null 2>&1; then
        date -d "@$epoch_sec" "+%Y-%m-%d %H:%M:%S"
    elif date -r "$epoch_sec" "+%Y-%m-%d %H:%M:%S" >/dev/null 2>&1; then
        date -r "$epoch_sec" "+%Y-%m-%d %H:%M:%S"
    else
        echo "Unknown"
    fi
}

# --- Parse command line arguments ---
DRY_RUN=false

while (($# > 0)); do
    case "$1" in
        --dry-run)
            DRY_RUN=true
            ;;
        --keep)
            if (($# < 2)); then
                echo "ERROR: --keep requires a numeric value" >&2
                exit 1
            fi
            KEEP_PREVIEW_COUNT="$2"
            shift
            ;;
        --keep=*)
            KEEP_PREVIEW_COUNT="${1#*=}"
            ;;
        --project-id)
            if (($# < 2)); then
                echo "ERROR: --project-id requires a value" >&2
                exit 1
            fi
            PROJECT_ID="$2"
            shift
            ;;
        --project-id=*)
            PROJECT_ID="${1#*=}"
            ;;
        --team-id)
            if (($# < 2)); then
                echo "ERROR: --team-id requires a value" >&2
                exit 1
            fi
            TEAM_ID="$2"
            shift
            ;;
        --team-id=*)
            TEAM_ID="${1#*=}"
            ;;
        --help|-h)
            usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1" >&2
            usage
            exit 1
            ;;
    esac
    shift
done

if ! is_integer "$KEEP_PREVIEW_COUNT"; then
    echo "ERROR: --keep value must be a non-negative integer (received '$KEEP_PREVIEW_COUNT')" >&2
    exit 1
fi

# --- Script Logic ---

if [ -z "$VERCEL_TOKEN" ]; then
    echo "ERROR: VERCEL_TOKEN environment variable is not set." >&2
    echo "" >&2
    echo "Please set it using one of these methods:" >&2
    echo "  1. Export in your current shell:" >&2
    echo "     export VERCEL_TOKEN='your_token'" >&2
    echo "" >&2
    echo "  2. Add to ~/.bashrc or ~/.zshrc for persistence:" >&2
    echo "     echo 'export VERCEL_TOKEN=\"your_token\"' >> ~/.zshrc" >&2
    echo "" >&2
    echo "  3. Create a .env file (not tracked by git):" >&2
    echo "     echo 'VERCEL_TOKEN=your_token' > .env" >&2
    echo "     source .env && ./scripts/cleanup-deployments.sh" >&2
    echo "" >&2
    echo "Get your token at: https://vercel.com/account/tokens" >&2
    exit 1
fi

if [ -z "$PROJECT_ID" ]; then
    echo "ERROR: Vercel project ID is not set." >&2
    echo "Pass --project-id or set VERCEL_PROJECT_ID." >&2
    exit 1
fi

# Check if jq is installed
if ! command -v jq >/dev/null 2>&1; then
    echo "ERROR: jq is required but not installed." >&2
    echo "Install it with: brew install jq" >&2
    exit 1
fi

API_URL="https://api.vercel.com/v6/deployments"

echo "🧹 Vercel Deployment Cleanup Script"
echo "📦 Project ID: $PROJECT_ID"
if [ -n "$TEAM_ID" ]; then
    echo "👥 Team ID: $TEAM_ID"
fi
echo "🔢 Preview keep count: $KEEP_PREVIEW_COUNT"
echo "🔍 Mode: $([ "$DRY_RUN" = true ] && echo "DRY RUN" || echo "LIVE")"
echo ""

echo "📋 Fetching deployments..." >&2

# Fetch ALL deployments with pagination
ALL_DEPLOYMENTS="[]"
NEXT_CURSOR=""
PAGE=1

while true; do
    echo "   Fetching page $PAGE..." >&2
    
    # Build URL with cursor if available
    if [ -z "$NEXT_CURSOR" ]; then
        URL="${API_URL}?projectId=${PROJECT_ID}&limit=100"
    else
        URL="${API_URL}?projectId=${PROJECT_ID}&until=${NEXT_CURSOR}&limit=100"
    fi

    if [ -n "$TEAM_ID" ]; then
        URL="${URL}&teamId=${TEAM_ID}"
    fi
    
    # Fetch page
    PAGE_JSON=$(curl -sS -X GET "$URL" -H "Authorization: Bearer ${VERCEL_TOKEN}")
    
    if [ -z "$PAGE_JSON" ]; then
        echo "❌ Failed to fetch deployments" >&2
        exit 1
    fi
    
    # Merge deployments from this page
    ALL_DEPLOYMENTS=$(echo "$ALL_DEPLOYMENTS" "$PAGE_JSON" | jq -s '.[0] + (.[1].deployments // [])')
    
    # Check if there's a next page
    NEXT_CURSOR=$(echo "$PAGE_JSON" | jq -r '.pagination.next // empty')
    
    if [ -z "$NEXT_CURSOR" ]; then
        echo "   ✅ Fetched all deployments (total: $(echo "$ALL_DEPLOYMENTS" | jq 'length'))" >&2
        break
    fi
    
    PAGE=$((PAGE + 1))
done

# Create a JSON structure similar to the original response
DEPLOYMENTS_JSON=$(jq -n --argjson deps "$ALL_DEPLOYMENTS" '{deployments: $deps}')

# Parse JSON to find current (PROMOTED) deployment
CURRENT_DEPLOYMENT=$(echo "$DEPLOYMENTS_JSON" | jq -r '.deployments[] | select(.readySubstate == "PROMOTED") | .uid' | head -1)
CURRENT_URL=$(echo "$DEPLOYMENTS_JSON" | jq -r '.deployments[] | select(.readySubstate == "PROMOTED") | .url' | head -1)

if [ -z "$CURRENT_DEPLOYMENT" ]; then
    echo "⚠️  No PROMOTED deployment found. Looking for most recent READY production deployment..." >&2
    CURRENT_DEPLOYMENT=$(echo "$DEPLOYMENTS_JSON" | jq -r '.deployments[] | select(.target == "production" and .state == "READY") | .uid' | head -1)
    CURRENT_URL=$(echo "$DEPLOYMENTS_JSON" | jq -r '.deployments[] | select(.target == "production" and .state == "READY") | .url' | head -1)
fi

if [ -z "$CURRENT_DEPLOYMENT" ]; then
    echo "⚠️  No READY production deployment found. Preserving the most recent READY deployment overall..." >&2
    CURRENT_DEPLOYMENT=$(echo "$DEPLOYMENTS_JSON" | jq -r '.deployments[] | select(.state == "READY") | .uid' | head -1)
    CURRENT_URL=$(echo "$DEPLOYMENTS_JSON" | jq -r '.deployments[] | select(.state == "READY") | .url' | head -1)
fi

if [ -z "$CURRENT_DEPLOYMENT" ]; then
    echo "❌ No deployment found to keep! Aborting." >&2
    exit 1
fi

echo "✅ Current deployment to KEEP:"
echo "   ID:  $CURRENT_DEPLOYMENT"
echo "   URL: https://$CURRENT_URL"
echo ""

# Collect preview deployments eligible for deletion
PREVIEW_TO_DELETE=$(echo "$DEPLOYMENTS_JSON" | jq -r --arg current "$CURRENT_DEPLOYMENT" --argjson keep "$KEEP_PREVIEW_COUNT" '
    .deployments
    | map(select(.target == "preview" and .uid != $current and (.state // "") != "BUILDING" and (.state // "") != "QUEUED"))
    | sort_by(.created)
    | if ($keep | type) == "number" and $keep >= 0 then
        (if length > $keep then .[0:(length - $keep)] else [] end)
      else
        .
      end
    | map("\(.uid)|\(.url)|\(.state)|\(.created)|\(.meta.githubCommitRef // .meta.branch // .gitBranch // \"unknown\")")
    | .[]
')

TOTAL_COUNT=$(echo "$DEPLOYMENTS_JSON" | jq '.deployments | length')
PRODUCTION_COUNT=$(echo "$DEPLOYMENTS_JSON" | jq '[.deployments[] | select(.target == "production")] | length')
PREVIEW_COUNT=$(echo "$DEPLOYMENTS_JSON" | jq '[.deployments[] | select(.target == "preview")] | length')
DELETE_COUNT=$(echo "$PREVIEW_TO_DELETE" | grep -c . || echo "0")
PREVIEW_KEEP_COUNT=$(( PREVIEW_COUNT - DELETE_COUNT ))
if [ $PREVIEW_KEEP_COUNT -lt 0 ]; then
    PREVIEW_KEEP_COUNT=0
fi

echo "📊 Summary:"
echo "   Total deployments:      $TOTAL_COUNT"
echo "   Production deployments: $PRODUCTION_COUNT (all kept)"
echo "   Preview deployments:    $PREVIEW_COUNT"
echo "   Keeping preview:        $PREVIEW_KEEP_COUNT (limit: $KEEP_PREVIEW_COUNT)"
echo "   To delete (preview):    $DELETE_COUNT"
echo ""

if [ "$DELETE_COUNT" -eq 0 ]; then
    echo "✅ No preview deployments qualify for cleanup!"
    exit 0
fi

echo "🗑️  Preview deployments to DELETE:"
echo "$PREVIEW_TO_DELETE" | while IFS='|' read -r uid url state created branch; do
    [ -z "$uid" ] && continue
    timestamp=$(format_timestamp "$created")
    printf "   ❌ [%s] https://%s (Branch: %s, Created: %s)\n" "$state" "$url" "$branch" "$timestamp"
done
echo ""

if [ "$DRY_RUN" = true ]; then
    echo "🔍 DRY RUN - No deployments were deleted."
    echo "   Remove --dry-run to actually delete these deployments."
    exit 0
fi

echo "⚠️  This will permanently delete $DELETE_COUNT preview deployment(s)."
echo "   Press Ctrl+C to cancel, or wait 5 seconds to continue..."
sleep 5

# Delete deployments
DELETED_COUNT=0
FAILED_COUNT=0

echo ""
echo "🗑️  Deleting old preview deployments..."

# Use process substitution to avoid subshell and preserve counter variables
while IFS='|' read -r uid url state created branch; do
    if [ -n "$uid" ]; then
        echo -n "   Deleting $uid... "
        
        DELETE_URL="${API_URL}/${uid}"
        if [ -n "$TEAM_ID" ]; then
            DELETE_URL="${DELETE_URL}?teamId=${TEAM_ID}"
        fi
        
        if curl -sS -X DELETE "$DELETE_URL" -H "Authorization: Bearer ${VERCEL_TOKEN}" >/dev/null 2>&1; then
            echo "✅"
            DELETED_COUNT=$((DELETED_COUNT + 1))
        else
            echo "❌"
            FAILED_COUNT=$((FAILED_COUNT + 1))
        fi
    fi
done < <(echo "$PREVIEW_TO_DELETE")

echo ""
echo "📊 Cleanup Summary:"
echo "   ✅ Successfully deleted: $DELETED_COUNT"
echo "   ❌ Failed to delete:     $FAILED_COUNT"
echo "   💾 Preview kept:         $PREVIEW_KEEP_COUNT"
echo "   💾 Production kept:      $PRODUCTION_COUNT"
echo ""
echo "🎉 Cleanup complete!"
