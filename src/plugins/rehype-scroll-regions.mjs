/**
 * Rehype plugin: wrap Markdown tables and code blocks in labelled scroll regions.
 *
 * Wide tables and long code lines scroll sideways instead of widening the page
 * (WCAG 1.4.10 Reflow). Each scroll area needs a name and must be reachable by
 * keyboard (WCAG 2.1.1), so this adds:
 *
 *   <div class="table-scroll" role="region" aria-label="…" tabindex="0"><table>…</table></div>
 *   <div class="code-region" role="region" aria-label="…"><pre>…</pre></div>
 *
 * Code blocks already render a focusable <pre> (tabindex="0"), so the code
 * wrapper only adds the landmark name. Runs at build time; no client JS.
 */

const LANGUAGE_NAMES = {
  bash: 'Shell',
  sh: 'Shell',
  shell: 'Shell',
  python: 'Python',
  py: 'Python',
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  http: 'HTTP',
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  text: 'Text',
};

function textOf(node) {
  if (node.type === 'text') {
    return node.value;
  }
  return (node.children ?? []).map(textOf).join('');
}

function isElement(node, tagName) {
  return node?.type === 'element' && node.tagName === tagName;
}

function codeLabel(pre) {
  const code = pre.children?.find((child) => isElement(child, 'code'));
  const classes = [code?.properties?.className ?? []].flat();
  const languageClass = classes.find((c) => String(c).startsWith('language-'));
  const language = languageClass ? String(languageClass).slice('language-'.length) : '';
  const meta = code?.data?.meta ?? '';
  const title = /title=(["'])(.*?)\1/.exec(meta)?.[2];
  const name = LANGUAGE_NAMES[language] ?? (language ? language.toUpperCase() : '');
  if (title) {
    return `Code: ${title}`;
  }
  return name ? `${name} code example` : 'Code example';
}

export default function rehypeScrollRegions() {
  return (tree) => {
    let heading = '';
    const tablesUnderHeading = new Map();

    function walk(node) {
      if (!node.children) {
        return;
      }
      node.children.forEach((child, index) => {
        if (child.type === 'element' && /^h[1-6]$/.test(child.tagName)) {
          heading = textOf(child).trim();
          return;
        }
        if (isElement(child, 'table')) {
          const count = (tablesUnderHeading.get(heading) ?? 0) + 1;
          tablesUnderHeading.set(heading, count);
          const base = heading ? `Table: ${heading}` : 'Table';
          node.children[index] = {
            type: 'element',
            tagName: 'div',
            properties: {
              className: ['table-scroll'],
              role: 'region',
              ariaLabel: count > 1 ? `${base} (${count})` : base,
              tabIndex: 0,
            },
            children: [child],
          };
          return;
        }
        if (isElement(child, 'pre')) {
          node.children[index] = {
            type: 'element',
            tagName: 'div',
            properties: {
              className: ['code-region'],
              role: 'region',
              ariaLabel: codeLabel(child),
            },
            children: [child],
          };
          return;
        }
        walk(child);
      });
    }

    walk(tree);
  };
}
