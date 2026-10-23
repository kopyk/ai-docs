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
 * wrapper only adds the landmark name. Region names are unique within a page:
 * tables and code blocks are named after the heading they sit under, with a
 * counter when a heading has more than one ("Table: Errors (2)").
 *
 * Runs at build time, so the markup works without JS. A client module,
 * src/clientModules/scrollRegions.js, then removes tabindex from tables that
 * don't overflow at the current width, so only tables that scroll are Tab stops.
 *
 * A table inside <div className="text-col-N"> gets class "long-col" on its Nth
 * column (th and td). custom.css gives that column a readable minimum width on
 * phones; the wrapper marks the main text column of tables that scroll anyway.
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

/** Class names of a hast element or an MDX JSX element (<div className="…">). */
function classNamesOf(node) {
  if (node?.type === 'element') {
    return [node.properties?.className ?? []].flat().map(String);
  }
  if (node?.type === 'mdxJsxFlowElement' || node?.type === 'mdxJsxTextElement') {
    const attr = (node.attributes ?? []).find(
      (a) => a.type === 'mdxJsxAttribute' && (a.name === 'className' || a.name === 'class'),
    );
    return typeof attr?.value === 'string' ? attr.value.split(/\s+/) : [];
  }
  return [];
}

/** The column index (1-based) named by a text-col-N wrapper, or 0. */
function longColumnOf(parent) {
  for (const name of classNamesOf(parent)) {
    const match = /^text-col-(\d+)$/.exec(name);
    if (match) {
      return Number(match[1]);
    }
  }
  return 0;
}

function tagLongColumn(table, column) {
  function visit(node) {
    if (!node.children) {
      return;
    }
    if (isElement(node, 'tr')) {
      const cells = node.children.filter((c) => isElement(c, 'th') || isElement(c, 'td'));
      const cell = cells[column - 1];
      if (cell) {
        const classes = [cell.properties?.className ?? []].flat();
        cell.properties = {...cell.properties, className: [...classes, 'long-col']};
      }
      return;
    }
    node.children.forEach(visit);
  }
  visit(table);
}

/** Base name for a code block: its title= if present, else its language. */
function codeBase(pre) {
  const code = pre.children?.find((child) => isElement(child, 'code'));
  const classes = [code?.properties?.className ?? []].flat();
  const languageClass = classes.find((c) => String(c).startsWith('language-'));
  const language = languageClass ? String(languageClass).slice('language-'.length) : '';
  const meta = code?.data?.meta ?? '';
  const title = /title=(["'])(.*?)\1/.exec(meta)?.[2];
  if (title) {
    return {base: `Code: ${title}`, titled: true};
  }
  const name = LANGUAGE_NAMES[language] ?? (language ? language.toUpperCase() : '');
  return {base: name ? `${name} code example` : 'Code example', titled: false};
}

export default function rehypeScrollRegions() {
  return (tree) => {
    let heading = '';
    const tablesUnderHeading = new Map();
    const codeUnderHeading = new Map();

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
          const column = longColumnOf(node);
          if (column) {
            tagLongColumn(child, column);
          }
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
          const {base, titled} = codeBase(child);
          // A title= names the block itself; everything else is named by its
          // language and the heading it sits under, with a counter.
          let label = base;
          if (!titled) {
            label = heading ? `${base}: ${heading}` : base;
            const key = `${heading}\u0000${base}`;
            const count = (codeUnderHeading.get(key) ?? 0) + 1;
            codeUnderHeading.set(key, count);
            if (count > 1) {
              label = `${label} (${count})`;
            }
          }
          node.children[index] = {
            type: 'element',
            tagName: 'div',
            properties: {
              className: ['code-region'],
              role: 'region',
              ariaLabel: label,
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
