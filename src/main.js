import { logger, handleError } from './utils.js';
import * as core from '@actions/core';
import * as github from '@actions/github';


async function processIssue(issue) {
  try {
    logger('info', `Processing issue #${issue.number}`);
    if (!issue.body) {
      logger('warn', `Issue #${issue.number} has no body content, skipping...`);
      return null;
    }

    const match = issue.body.match(/```json\s*\{[\s\S]*?\}\s*```/m);
    const jsonMatch = match ? match[0].match(/\{[\s\S]*?\}/m) : null;

    if (!jsonMatch) {
      logger('warn', `No JSON content found in issue #${issue.number}`);
      return null;
    }

    logger('info', `Found JSON content in issue #${issue.number}`);
    const jsonData = JSON.parse(jsonMatch[0]);
    logger('info', `Got JSON content in issue #${issue.number}`, jsonData);
    
    // 转换旧格式到新格式

    // avatar -> icon
    jsonData.icon = jsonData.avatar || '';
    if ('avatar' in jsonData) {
      delete jsonData.avatar;
    }

    // screenshot -> snapshot
    jsonData.snapshot = jsonData.screenshot || '';
    if ('screenshot' in jsonData) {
      delete jsonData.screenshot;
    }

    // add feed
    jsonData.feed = jsonData.feed || ''; // 添加 feed 字段，如果不存在则为空字符串

    logger('info', `Converted JSON content in issue #${issue.number}`, jsonData);
    const newBody = issue.body.replace(jsonMatch[0], JSON.stringify(jsonData, null, 2));
    return { data: jsonData, newBody: newBody };
  } catch (error) {
    handleError(error, `Error processing issue #${issue.number}`);
    return null;
  }
}

async function parseIssues() {
  const token =  process.env.GITHUB_TOKEN;
  const owner = github.context.repo.owner;
  const repo = github.context.repo.repo;
  const { Octokit } = await import('@octokit/rest');
  const octokit = new Octokit({
    auth: token
  });

  try {
    const allIssues = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const { data: issues } = await octokit.issues.listForRepo({
        owner,
        repo,
        state: 'open',
        per_page: 100,
        page
      });

      if (issues.length === 0) {
        hasMore = false;
      } else {
        allIssues.push(...issues);
        page++;
      }
    }

    logger('info', `Found ${allIssues.length} open issues.`);

    for (const issue of allIssues) {
      const result = await processIssue(issue);
      if (result) {
        // 更新 issue body
        await octokit.issues.update({
          owner,
          repo,
          issue_number: issue.number,
          body: result.newBody
        });
        logger('info', `Updated issue #${issue.number}`);
      }
    }

  } catch (error) {
    handleError(error, 'Error processing issues');
    process.exit(1);
  }
}

parseIssues();
