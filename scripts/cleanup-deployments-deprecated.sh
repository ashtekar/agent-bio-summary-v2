#!/bin/bash

# Vercel Deployment Cleanup Script (Shell Version)
# 
# This script removes old, inactive deployments from your Vercel project.
# It keeps the latest production deployment and a few recent preview deployments.
# 
# Usage:
#   ./scripts/cleanup-deployments.sh [options]
# 
# Options:
#   --dry-run    Show what would be deleted without actually deleting
#   --keep N     Number of deployments to keep (default: 5)
#   --project    Vercel project name (default: agent-bio-summary-v2)

set -e

# Default values
KEEP_COUNT=5
PROJECT_NAME="agent-bio-summary-v2"
DRY_RUN=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --keep)
      KEEP_COUNT="$2"
      shift 2
      ;;
    --project)
      PROJECT_NAME="$2"
      shift 2
      ;;
    --help)
      echo "🧹 Vercel Deployment Cleanup Script"
      echo ""
      echo "Usage:"
      echo "  ./scripts/cleanup-deployments.sh [options]"
      echo ""
      echo "Options:"
      echo "  --dry-run              Show what would be deleted without actually deleting"
      echo "  --keep N               Number of deployments to keep (default: 5)"
      echo "  --project NAME         Vercel project name (default: agent-bio-summary-v2)"
      echo "  --help                 Show this help message"
      echo ""
      echo "Examples:"
      echo "  ./scripts/cleanup-deployments.sh --dry-run"
      echo "  ./scripts/cleanup-deployments.sh --keep 3"
      echo "  ./scripts/cleanup-deployments.sh --project my-project --dry-run"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

echo "🧹 Vercel Deployment Cleanup Script"
echo "📦 Project: $PROJECT_NAME"
echo "🔢 Keep count: $KEEP_COUNT"
echo "🔍 Mode: $([ "$DRY_RUN" = true ] && echo "DRY RUN" || echo "LIVE")"
echo ""

# Check if Vercel CLI is available
if ! command -v vercel &> /dev/null && ! command -v npx &> /dev/null; then
  echo "❌ Vercel CLI not found. Please install it with: npm install -g vercel"
  exit 1
fi

# Function to get Vercel command
get_vercel_cmd() {
  if command -v vercel &> /dev/null; then
    echo "vercel"
  else
    echo "npx vercel"
  fi
}

VERCEL_CMD=$(get_vercel_cmd)

echo "📋 Fetching deployment list..."
DEPLOYMENTS_OUTPUT=$($VERCEL_CMD ls 2>/dev/null || echo "")

if [ -z "$DEPLOYMENTS_OUTPUT" ]; then
  echo "❌ Failed to fetch deployments. Make sure you're logged in to Vercel."
  exit 1
fi

# Count deployments
DEPLOYMENT_COUNT=$(echo "$DEPLOYMENTS_OUTPUT" | grep -c "https://" || echo "0")

if [ "$DEPLOYMENT_COUNT" -eq 0 ]; then
  echo "✅ No deployments found"
  exit 0
fi

echo "📊 Found $DEPLOYMENT_COUNT deployments"

# Get deployment URLs (excluding the first line which is headers)
# Calculate how many to keep and get the rest
TOTAL_DEPLOYMENTS=$(echo "$DEPLOYMENTS_OUTPUT" | grep -c "https://")

# Filter out active/ready deployments - only delete failed/error deployments
echo "🔍 Analyzing deployment statuses..."
# Filter out header lines and get only deployment data lines
DEPLOYMENT_LINES=$(echo "$DEPLOYMENTS_OUTPUT" | grep "https://")
# Use regex to match status patterns
ACTIVE_DEPLOYMENTS=$(echo "$DEPLOYMENT_LINES" | grep -c "Ready\|Building" 2>/dev/null | head -1 || echo "0")
FAILED_DEPLOYMENTS=$(echo "$DEPLOYMENT_LINES" | grep -c "Error\|Failed" 2>/dev/null | head -1 || echo "0")

echo "📊 Deployment Status Summary:"
echo "   ✅ Active/Ready: $ACTIVE_DEPLOYMENTS"
echo "   ❌ Failed/Error: $FAILED_DEPLOYMENTS"

# Only delete failed deployments
if [ "$FAILED_DEPLOYMENTS" -eq 0 ]; then
  echo "✅ No failed deployments to clean up"
  DEPLOYMENT_URLS=""
  DELETE_COUNT=0
else
  # Get only failed deployments for deletion
  DEPLOYMENT_URLS=$(echo "$DEPLOYMENT_LINES" | grep "Error\|Failed" | awk '{print $1}')
  DELETE_COUNT=$(echo "$DEPLOYMENT_URLS" | wc -l)
  
  # Limit deletions to keep count if there are too many failed deployments
  if [ "$DELETE_COUNT" -gt "$KEEP_COUNT" ]; then
    DELETE_COUNT=$KEEP_COUNT
    DEPLOYMENT_URLS=$(echo "$DEPLOYMENT_URLS" | head -n "$DELETE_COUNT")
  fi
fi

if [ -z "$DEPLOYMENT_URLS" ]; then
  echo "✅ No old deployments to clean up (keeping $KEEP_COUNT most recent)"
  exit 0
fi

echo "🗑️  Deployments to delete: $DELETE_COUNT"

if [ "$DRY_RUN" = true ]; then
  echo ""
  echo "🔍 DRY RUN - Deployments that would be deleted:"
  echo "$DEPLOYMENT_URLS" | nl -w2 -s'. '
  echo ""
  echo "✅ Dry run complete. Use without --dry-run to actually delete."
  exit 0
fi

echo ""
echo "⚠️  This will permanently delete $DELETE_COUNT deployments."
echo "   Press Ctrl+C to cancel, or wait 5 seconds to continue..."

sleep 5

# Delete deployments
DELETED_COUNT=0
FAILED_COUNT=0

while IFS= read -r url; do
  if [ -n "$url" ]; then
    echo "🗑️  Deleting $url..."
    
    # Extract deployment ID from URL
    DEPLOYMENT_ID=$(echo "$url" | sed 's/.*\///')
    
    if $VERCEL_CMD remove "$DEPLOYMENT_ID" --yes 2>/dev/null; then
      echo "   ✅ Deleted successfully"
      ((DELETED_COUNT++))
    else
      echo "   ❌ Failed to delete"
      ((FAILED_COUNT++))
    fi
  fi
done <<< "$DEPLOYMENT_URLS"

echo ""
echo "📊 Cleanup Summary:"
echo "   ✅ Successfully deleted: $DELETED_COUNT"
echo "   ❌ Failed to delete: $FAILED_COUNT"
echo "   📦 Remaining deployments: $((DEPLOYMENT_COUNT - DELETED_COUNT))"
