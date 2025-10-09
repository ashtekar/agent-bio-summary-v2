#!/bin/bash

# --- Configuration ---
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
VERCEL_TOKEN="${VERCEL_TOKEN}"

# 2. Project ID (automatically set from .vercel/project.json)
#    Your project name is 'agent-bio-summary-v2'.
PROJECT_ID="prj_Y1HUCATH8Xo0PzRmtHU6M9un4H5s"

# 3. Parse command line arguments
DRY_RUN=false
if [ "$1" = "--dry-run" ]; then
    DRY_RUN=true
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

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "ERROR: jq is required but not installed." >&2
    echo "Install it with: brew install jq" >&2
    exit 1
fi

API_URL="https://api.vercel.com/v6/deployments"

echo "🧹 Vercel Deployment Cleanup Script"
echo "📦 Project: agent-bio-summary-v2"
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
        URL="${API_URL}?projectId=${PROJECT_ID}"
    else
        URL="${API_URL}?projectId=${PROJECT_ID}&until=${NEXT_CURSOR}"
    fi
    
    # Fetch page
    PAGE_JSON=$(curl -sS -X GET "$URL" -H "Authorization: Bearer ${VERCEL_TOKEN}")
    
    if [ -z "$PAGE_JSON" ]; then
        echo "❌ Failed to fetch deployments" >&2
        exit 1
    fi
    
    # Merge deployments from this page
    ALL_DEPLOYMENTS=$(echo "$ALL_DEPLOYMENTS" "$PAGE_JSON" | jq -s '.[0] + .[1].deployments')
    
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
    echo "⚠️  No PROMOTED deployment found. Looking for most recent READY deployment..." >&2
    CURRENT_DEPLOYMENT=$(echo "$DEPLOYMENTS_JSON" | jq -r '.deployments[] | select(.state == "READY") | .uid' | head -1)
    CURRENT_URL=$(echo "$DEPLOYMENTS_JSON" | jq -r '.deployments[] | select(.state == "READY") | .url' | head -1)
fi

if [ -z "$CURRENT_DEPLOYMENT" ]; then
    echo "❌ No current deployment found to keep!" >&2
    exit 1
fi

echo "✅ Current deployment to KEEP:"
echo "   ID:  $CURRENT_DEPLOYMENT"
echo "   URL: https://$CURRENT_URL"
echo ""

# Get all other deployments (excluding current)
DEPLOYMENTS_TO_DELETE=$(echo "$DEPLOYMENTS_JSON" | jq -r --arg current "$CURRENT_DEPLOYMENT" \
  '.deployments[] | select(.uid != $current) | "\(.uid)|\(.url)|\(.state)|\(.created)"')

TOTAL_COUNT=$(echo "$DEPLOYMENTS_JSON" | jq '.deployments | length')
DELETE_COUNT=$(echo "$DEPLOYMENTS_TO_DELETE" | grep -c . || echo "0")

echo "📊 Summary:"
echo "   Total deployments: $TOTAL_COUNT"
echo "   Keeping: 1 (current)"
echo "   To delete: $DELETE_COUNT"
echo ""

if [ "$DELETE_COUNT" -eq 0 ]; then
    echo "✅ No old deployments to clean up!"
    exit 0
fi

echo "🗑️  Deployments to DELETE:"
echo "$DEPLOYMENTS_TO_DELETE" | while IFS='|' read -r uid url state created; do
    timestamp=$(date -r "$((created / 1000))" "+%Y-%m-%d %H:%M:%S" 2>/dev/null || echo "Unknown")
    echo "   ❌ [$state] https://$url (Created: $timestamp)"
done
echo ""

if [ "$DRY_RUN" = true ]; then
    echo "🔍 DRY RUN - No deployments were deleted."
    echo "   Remove --dry-run to actually delete these deployments."
    exit 0
fi

echo "⚠️  This will permanently delete $DELETE_COUNT deployment(s)."
echo "   Press Ctrl+C to cancel, or wait 5 seconds to continue..."
sleep 5

# Delete deployments
DELETED_COUNT=0
FAILED_COUNT=0

echo ""
echo "🗑️  Deleting old deployments..."

# Use process substitution to avoid subshell and preserve counter variables
while IFS='|' read -r uid url state created; do
    if [ -n "$uid" ]; then
        echo -n "   Deleting $uid... "
        
        DELETE_RESPONSE=$(curl -sS -X DELETE \
          "${API_URL}/${uid}" \
          -H "Authorization: Bearer ${VERCEL_TOKEN}" 2>&1)
        
        if [ $? -eq 0 ]; then
            echo "✅"
            DELETED_COUNT=$((DELETED_COUNT + 1))
        else
            echo "❌"
            FAILED_COUNT=$((FAILED_COUNT + 1))
        fi
    fi
done < <(echo "$DEPLOYMENTS_TO_DELETE")

echo ""
echo "📊 Cleanup Summary:"
echo "   ✅ Successfully deleted: $DELETED_COUNT"
echo "   ❌ Failed to delete: $FAILED_COUNT"
echo "   💾 Kept: 1 (current deployment)"
echo ""
echo "🎉 Cleanup complete!"
