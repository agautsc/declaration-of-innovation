// Rebuilds signatures.json from every issue labeled `approved`. Rebuilding from scratch
// means removing the label, or editing an approved issue, updates the site as well.
const fs = require('fs');

// Headings come from the issue forms in .github/ISSUE_TEMPLATE and from worker/src/index.js.
const FIELDS = {
  name: ['Name or community', 'Community name'],
  location: ['Location'],
  statement: ['What bond are you strengthening?', 'One-line description'],
  link: ['Link (optional)'],
};

function parse(body) {
  const sections = {};
  for (const part of (body || '').replace(/\r\n/g, '\n').split(/^### /m).slice(1)) {
    const [heading, ...rest] = part.split('\n');
    const value = rest.join('\n').split(/\n---\n/)[0].trim();
    sections[heading.trim()] = value === '_No response_' ? '' : value;
  }
  const pick = (headings) => (headings.map((h) => sections[h]).find(Boolean) || '')
    .replace(/​/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return Object.fromEntries(Object.entries(FIELDS).map(([key, headings]) => [key, pick(headings)]));
}

module.exports = async ({ github, context }) => {
  const issues = await github.paginate(github.rest.issues.listForRepo, {
    owner: context.repo.owner,
    repo: context.repo.repo,
    labels: 'approved',
    state: 'all',
    per_page: 100,
  });
  const signatures = issues
    .filter((issue) => !issue.pull_request)
    .map((issue) => {
      const labels = issue.labels.map((label) => (typeof label === 'string' ? label : label.name));
      const fields = parse(issue.body);
      if (!/^https?:\/\//i.test(fields.link)) fields.link = '';
      return {
        kind: labels.includes('community') ? 'community' : 'person',
        ...fields,
        date: issue.created_at.slice(0, 10),
        issue: issue.number,
      };
    })
    .filter((signature) => signature.name)
    .sort((a, b) => a.issue - b.issue);
  fs.writeFileSync('signatures.json', JSON.stringify({ signatures }, null, 2) + '\n');
};

module.exports.parse = parse;
