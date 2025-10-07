#!/usr/bin/env node

/**
 * Vercel Deployment Cleanup Script
 * 
 * This script removes old, inactive deployments from your Vercel project.
 * It keeps the latest production deployment and a few recent preview deployments.
 * 
 * Usage:
 *   node scripts/cleanup-deployments.js [options]
 * 
 * Options:
 *   --dry-run    Show what would be deleted without actually deleting
 *   --keep       Number of deployments to keep (default: 5)
 *   --project    Vercel project name (default: agent-bio-summary-v2)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const DEFAULT_KEEP_COUNT = 5;
const DEFAULT_PROJECT = 'agent-bio-summary-v2';

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const keepCount = parseInt(args.find(arg => arg.startsWith('--keep='))?.split('=')[1]) || DEFAULT_KEEP_COUNT;
const projectName = args.find(arg => arg.startsWith('--project='))?.split('=')[1] || DEFAULT_PROJECT;

console.log(`🧹 Vercel Deployment Cleanup Script`);
console.log(`📦 Project: ${projectName}`);
console.log(`🔢 Keep count: ${keepCount}`);
console.log(`🔍 Mode: ${isDryRun ? 'DRY RUN' : 'LIVE'}`);
console.log('');

/**
 * Execute a command and return the output
 */
function execCommand(command) {
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    return output.trim();
  } catch (error) {
    console.error(`❌ Error executing command: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

/**
 * Parse deployment list from Vercel CLI output
 */
function parseDeployments(output) {
  const lines = output.split('\n');
  const deployments = [];
  
  for (const line of lines) {
    if (line.includes('https://') && line.includes('.vercel.app')) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 4) {
        const url = parts[0];
        const status = parts[1];
        const environment = parts[2];
        const duration = parts[3];
        const age = parts[4] || 'unknown';
        
        deployments.push({
          url,
          status,
          environment,
          duration,
          age,
          deploymentId: url.split('/').pop()
        });
      }
    }
  }
  
  return deployments;
}

/**
 * Get deployment details including creation time
 */
function getDeploymentDetails(deploymentUrl) {
  try {
    const inspectOutput = execCommand(`npx vercel inspect ${deploymentUrl} --json`);
    const details = JSON.parse(inspectOutput);
    return {
      id: details.id,
      url: details.url,
      createdAt: details.createdAt,
      state: details.state,
      environment: details.target || 'preview'
    };
  } catch (error) {
    console.warn(`⚠️  Could not get details for ${deploymentUrl}: ${error.message}`);
    return null;
  }
}

/**
 * Sort deployments by creation time (newest first)
 */
function sortDeploymentsByAge(deployments) {
  return deployments.sort((a, b) => {
    const timeA = parseAgeToMinutes(a.age);
    const timeB = parseAgeToMinutes(b.age);
    return timeA - timeB; // Oldest first
  });
}

/**
 * Parse age string to minutes for sorting
 */
function parseAgeToMinutes(age) {
  if (age.includes('s')) {
    return parseInt(age) / 60;
  } else if (age.includes('m')) {
    return parseInt(age);
  } else if (age.includes('h')) {
    return parseInt(age) * 60;
  } else if (age.includes('d')) {
    return parseInt(age) * 60 * 24;
  }
  return 0;
}

/**
 * Delete a deployment
 */
function deleteDeployment(deploymentUrl) {
  try {
    const deploymentId = deploymentUrl.split('/').pop();
    execCommand(`npx vercel remove ${deploymentId} --yes`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to delete ${deploymentUrl}: ${error.message}`);
    return false;
  }
}

/**
 * Main cleanup function
 */
async function cleanupDeployments() {
  console.log('📋 Fetching deployment list...');
  
  // Get list of deployments
  const deploymentsOutput = execCommand('npx vercel ls');
  const deployments = parseDeployments(deploymentsOutput);
  
  if (deployments.length === 0) {
    console.log('✅ No deployments found');
    return;
  }
  
  console.log(`📊 Found ${deployments.length} deployments`);
  
  // Sort by age (oldest first)
  const sortedDeployments = sortDeploymentsByAge(deployments);
  
  // Separate production and preview deployments
  const productionDeployments = sortedDeployments.filter(d => d.environment === 'Production');
  const previewDeployments = sortedDeployments.filter(d => d.environment === 'Preview');
  
  console.log(`🏭 Production deployments: ${productionDeployments.length}`);
  console.log(`👀 Preview deployments: ${previewDeployments.length}`);
  
  // Filter by status - only delete failed/error deployments
  const activeProduction = productionDeployments.filter(d => d.status === 'Ready' || d.status === 'Building');
  const failedProduction = productionDeployments.filter(d => d.status === 'Error' || d.status === 'Failed');
  const activePreview = previewDeployments.filter(d => d.status === 'Ready' || d.status === 'Building');
  const failedPreview = previewDeployments.filter(d => d.status === 'Error' || d.status === 'Failed');
  
  console.log(`📊 Status Summary:`);
  console.log(`   ✅ Active Production: ${activeProduction.length}`);
  console.log(`   ❌ Failed Production: ${failedProduction.length}`);
  console.log(`   ✅ Active Preview: ${activePreview.length}`);
  console.log(`   ❌ Failed Preview: ${failedPreview.length}`);
  
  // Keep all active deployments, only delete failed ones
  const productionToKeep = activeProduction;
  const productionToDelete = failedProduction;
  
  const previewToKeep = activePreview;
  const previewToDelete = failedPreview.slice(0, Math.max(0, failedPreview.length - (keepCount - 1)));
  
  const totalToDelete = productionToDelete.length + previewToDelete.length;
  
  if (totalToDelete === 0) {
    console.log('✅ No old deployments to clean up');
    return;
  }
  
  console.log(`🗑️  Deployments to delete: ${totalToDelete}`);
  console.log(`   - Production: ${productionToDelete.length}`);
  console.log(`   - Preview: ${previewToDelete.length}`);
  console.log('');
  
  if (isDryRun) {
    console.log('🔍 DRY RUN - Deployments that would be deleted:');
    [...productionToDelete, ...previewToDelete].forEach((deployment, index) => {
      console.log(`   ${index + 1}. ${deployment.url} (${deployment.environment}, ${deployment.age})`);
    });
    console.log('');
    console.log('✅ Dry run complete. Use without --dry-run to actually delete.');
    return;
  }
  
  // Confirm deletion
  console.log('⚠️  This will permanently delete the above deployments.');
  console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Delete deployments
  let deletedCount = 0;
  let failedCount = 0;
  
  const allToDelete = [...productionToDelete, ...previewToDelete];
  
  for (const deployment of allToDelete) {
    console.log(`🗑️  Deleting ${deployment.url}...`);
    
    if (deleteDeployment(deployment.url)) {
      deletedCount++;
      console.log(`   ✅ Deleted successfully`);
    } else {
      failedCount++;
      console.log(`   ❌ Failed to delete`);
    }
  }
  
  console.log('');
  console.log(`📊 Cleanup Summary:`);
  console.log(`   ✅ Successfully deleted: ${deletedCount}`);
  console.log(`   ❌ Failed to delete: ${failedCount}`);
  console.log(`   📦 Remaining deployments: ${deployments.length - deletedCount}`);
}

/**
 * Show help information
 */
function showHelp() {
  console.log(`
🧹 Vercel Deployment Cleanup Script

Usage:
  node scripts/cleanup-deployments.js [options]

Options:
  --dry-run              Show what would be deleted without actually deleting
  --keep=N               Number of deployments to keep (default: 5)
  --project=NAME         Vercel project name (default: agent-bio-summary-v2)
  --help                 Show this help message

Examples:
  node scripts/cleanup-deployments.js --dry-run
  node scripts/cleanup-deployments.js --keep=3
  node scripts/cleanup-deployments.js --project=my-project --dry-run

Notes:
  - Always keeps the latest production deployment
  - Keeps the most recent preview deployments (configurable)
  - Use --dry-run first to see what would be deleted
  - Requires Vercel CLI to be installed and authenticated
`);
}

// Main execution
if (args.includes('--help')) {
  showHelp();
  process.exit(0);
}

// Check if Vercel CLI is available
try {
  execCommand('npx vercel --version');
} catch (error) {
  console.error('❌ Vercel CLI not found. Please install it with: npm install -g vercel');
  process.exit(1);
}

// Run cleanup
cleanupDeployments().catch(error => {
  console.error('❌ Cleanup failed:', error.message);
  process.exit(1);
});
