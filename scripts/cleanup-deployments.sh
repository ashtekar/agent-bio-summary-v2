#!/bin/bash

# Simple Vercel Deployment Cleanup Script
# Based on the original agent-bio-summary project
# 
# This script removes old, failed deployments from your Vercel project.
# It keeps all successful deployments and only deletes failed ones.
# 
# Usage:
#   ./scripts/cleanup-deployments-simple.sh [options]
# 
# Options:
#   --dry-run    Show what would be deleted without actually deleting
#   --project    Vercel project name (default: agent-bio-summary-v2)

set -e

# Default values
PROJECT_NAME="agent-bio-summary-v2"
DRY_RUN=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --project)
      PROJECT_NAME="$2"
      shift 2
      ;;
    --help)
      echo "🧹 Simple Vercel Deployment Cleanup Script"
      echo ""
      echo "Usage:"
      echo "  ./scripts/cleanup-deployments-simple.sh [options]"
      echo ""
      echo "Options:"
      echo "  --dry-run              Show what would be deleted without actually deleting"
      echo "  --project NAME         Vercel project name (default: agent-bio-summary-v2)"
      echo "  --help                 Show this help message"
      echo ""
      echo "Examples:"
      echo "  ./scripts/cleanup-deployments-simple.sh --dry-run"
      echo "  ./scripts/cleanup-deployments-simple.sh --project my-project --dry-run"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

echo "🧹 Simple Vercel Deployment Cleanup Script"
echo "📦 Project: $PROJECT_NAME"
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

# Count total deployments
TOTAL_DEPLOYMENTS=$(echo "$DEPLOYMENTS_OUTPUT" | grep -c "https://" || echo "0")

if [ "$TOTAL_DEPLOYMENTS" -eq 0 ]; then
  echo "✅ No deployments found"
  exit 0
fi

echo "📊 Found $TOTAL_DEPLOYMENTS deployments"

# Get only failed deployments (Error status)
echo "🔍 Analyzing deployment statuses..."
# Filter out header lines and get only deployment data lines
DEPLOYMENT_LINES=$(echo "$DEPLOYMENTS_OUTPUT" | grep "https://")
# Use regex to match status patterns
FAILED_DEPLOYMENTS=$(echo "$DEPLOYMENT_LINES" | grep -c "Error" || echo "0")
SUCCESSFUL_DEPLOYMENTS=$(echo "$DEPLOYMENT_LINES" | grep -c "Ready" || echo "0")

echo "📊 Deployment Status Summary:"
echo "   ✅ Successful (Ready): $SUCCESSFUL_DEPLOYMENTS"
echo "   ❌ Failed (Error): $FAILED_DEPLOYMENTS"

# Only delete failed deployments
if [ "$FAILED_DEPLOYMENTS" -eq 0 ]; then
  echo "✅ No failed deployments to clean up"
  exit 0
fi

# Get failed deployment URLs
FAILED_URLS=$(echo "$DEPLOYMENT_LINES" | grep "Error" | awk '{print $1}')

echo "🗑️  Failed deployments to delete: $FAILED_DEPLOYMENTS"

if [ "$DRY_RUN" = true ]; then
  echo ""
  echo "🔍 DRY RUN - Failed deployments that would be deleted:"
  echo "$FAILED_URLS" | nl -w2 -s'. '
  echo ""
  echo "✅ Dry run complete. Use without --dry-run to actually delete."
  exit 0
fi

echo ""
echo "⚠️  This will permanently delete $FAILED_DEPLOYMENTS failed deployments."
echo "   Press Ctrl+C to cancel, or wait 5 seconds to continue..."

sleep 5

# Delete failed deployments
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
done <<< "$FAILED_URLS"

echo ""
echo "📊 Cleanup Summary:"
echo "   ✅ Successfully deleted: $DELETED_COUNT"
echo "   ❌ Failed to delete: $FAILED_COUNT"
echo "   📦 Remaining deployments: $((TOTAL_DEPLOYMENTS - DELETED_COUNT))"
