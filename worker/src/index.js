// Files a signature or community adoption as a GitHub issue on the signer's behalf,
// so signing the declaration never needs a GitHub account. Nothing is published until
// a maintainer adds the `approved` label; .github/workflows/sync-signatures.yml does the rest.

const SITE = 'https://declarationofinnovation.org';
const LIMITS = { name: 100, location: 100, statement: 280, link: 200 };
const THANKS = 'Thank you for signing. Your signature will appear on the site after a quick review.';
const RETRY = 'That did not go through. Please try again in a minute.';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const allowed = (env.ALLOWED_ORIGINS || SITE).split(',').map((s) => s.trim());
    const cors = allowed.includes(origin) ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {};

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          ...cors,
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type, Accept',
          'Access-Control-Max-Age': '86400',
        },
      });
    }
    if (url.pathname !== '/sign' || request.method !== 'POST') {
      return new Response('Not found', { status: 404 });
    }

    // The site's script asks for JSON; a browser without JavaScript posts the form and gets a page back.
    const wantsJson = (request.headers.get('Accept') || '').includes('application/json');
    const reply = (status, message) => wantsJson
      ? Response.json({ ok: status < 300, message }, { status, headers: cors })
      : new Response(page(status < 300, message), { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } });

    let form;
    try {
      form = await request.formData();
    } catch {
      return reply(400, 'We could not read that form.');
    }

    // Honeypot: the field is hidden from people, so anything in it came from a bot. Pretend it worked.
    if (form.get('website')) return reply(200, THANKS);

    const fields = {};
    for (const [key, max] of Object.entries(LIMITS)) fields[key] = clean(form.get(key), max);
    if (!fields.name || !fields.location || !fields.statement) {
      return reply(400, 'Please add a name, a location, and one sentence about the bond you are strengthening.');
    }
    if (fields.link && !/^https?:\/\/\S+\.\S+$/i.test(fields.link)) {
      return reply(400, 'The link should start with http:// or https://.');
    }

    // Section headings match the GitHub issue forms in .github/ISSUE_TEMPLATE, so the sync
    // script reads issues filed here and issues filed on GitHub the same way.
    const issue = form.get('kind') === 'community'
      ? {
          title: `Community: ${fields.name}`,
          labels: ['community'],
          sections: [
            ['Community name', fields.name],
            ['Location', fields.location],
            ['One-line description', fields.statement],
            ['Link (optional)', fields.link],
          ],
        }
      : {
          title: `Signature: ${fields.name}`,
          labels: ['signature'],
          sections: [
            ['Name or community', fields.name],
            ['Location', fields.location],
            ['What bond are you strengthening?', fields.statement],
            ['Link (optional)', fields.link],
          ],
        };
    const body = issue.sections.map(([heading, value]) => `### ${heading}\n\n${value || '_No response_'}`).join('\n\n')
      + '\n\n---\n_Submitted through the form at declarationofinnovation.org. Add the `approved` label to publish it on the site._';

    const res = await fetch(`https://api.github.com/repos/${env.REPO}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'declaration-of-innovation-sign',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({ title: issue.title, body, labels: issue.labels }),
    });
    if (!res.ok) {
      console.log('GitHub issue create failed', res.status, await res.text());
      return reply(502, RETRY);
    }
    return reply(201, THANKS);
  },
};

// One line of plain text: no newlines or control characters, no fake section headings,
// and no @-mentions, which would otherwise notify strangers from the maintainer's account.
function clean(value, max) {
  return String(value || '')
    .replace(/[\u0000-\u001f\u007f​]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^#+\s*/, '')
    .slice(0, max)
    .replace(/@(?=\w)/g, '@​');
}

function page(ok, message) {
  const escaped = message.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${ok ? 'Signed' : 'Not signed yet'} · Declaration of Innovation</title>
<style>
  body { margin: 0; padding: 15vh 20px; background: #fbf7ef; color: #1d1c18; font: 1.15rem/1.6 Georgia, serif; }
  main { max-width: 560px; margin: 0 auto; }
  h1 { font-size: 2rem; line-height: 1.15; }
  a { color: #a03f2d; font-weight: 700; }
</style>
</head>
<body>
<main>
  <h1>${ok ? 'Thank you.' : 'Not signed yet.'}</h1>
  <p>${escaped}</p>
  <p><a href="${SITE}/${ok ? '' : '#sign'}">&larr; Back to the Declaration</a></p>
</main>
</body>
</html>`;
}
