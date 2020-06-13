#!/usr/bin/env node

/**
 * Will prevent commits to main branches
 * (default: master, develop)
 */

const logger = require('./utils/logger');
const git = require('./utils/git');

// TODO: Read from config
const defaultMainBranches = ['master', 'develop'];

function isMainBranch(branch, mainBranches) {
  const regex = new RegExp(`^${mainBranches.join('|')}$`);

  return !!branch.match(regex);
}

async function checkBranch() {
  const branch = await git.getCurrentBranch();
  const isMain = isMainBranch(branch, defaultMainBranches);

  if (isMain) {
    logger.error('Cannot commit directly to this branch', defaultMainBranches.join(', '), true);

    process.exit(1);
  }

  process.exit(0);
}

checkBranch();
