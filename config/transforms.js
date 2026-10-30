// Keep transform source code here.

const WIDE_COLUMNS = 5;
const SHORT_TEXT = 32;

const escapeAttr = (text) => text.replace(/&(?![a-z#0-9]+;)/gi, '&amp;').replace(/"/g, '&quot;');

// Tag each body cell with its column header so narrow screens can stack a row
// into a card ("Type: str") instead of hiding columns off to the side. Columns
// whose values are all short (e.g. "required", "str") are marked data-inline so
// a card can line them up on one row.
const labelCells = (table) => {
  const head = table.match(/<thead[\s\S]*?<\/thead>/);
  if (!head) return table;
  const headers = [...head[0].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)]
    .map(([, html]) => escapeAttr(html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()));
  // Everything after the header row is body, even if </tbody> is missing
  const split = head.index + head[0].length;
  const body = table.slice(split);
  const rows = body.match(/<tr[\s\S]*?<\/tr>/g) || [];
  const short = headers.map(() => true);
  rows.forEach((row) => {
    [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].forEach(([, html], col) => {
      const text = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (/<br/i.test(html) || text.length > SHORT_TEXT) short[col] = false;
    });
  });
  // The first column titles the card, so it's never inline
  short[0] = false;
  const labeled = body.replace(/<tr[\s\S]*?<\/tr>/g, (row) => {
    let col = 0;
    return row.replace(/<td(?![^>]*data-label)/g, () => {
      const header = headers[col];
      const inline = short[col] ? ' data-inline' : '';
      col += 1;
      return header ? `<td data-label="${header}"${inline}` : '<td';
    });
  });
  return table.slice(0, split) + labeled;
};

// Wrap every table (Markdown or raw HTML) in a keyboard-scrollable region so
// wide tables scroll on their own instead of the whole page (WCAG 1.4.10).
// Each region is named after the closest heading above it.
const scrollableTables = (content, outputPath) => {
  if (!outputPath || !outputPath.endsWith('.html') || !content.includes('<table')) {
    return content;
  }
  const captionPattern = /<p><strong>([^<]+)<\/strong><\/p>\s*$/;
  const used = {};
  let heading = 'Table';
  // One pass over headings and tables in page order, remembering the last heading.
  const pattern = /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>|<table[\s\S]*?<\/table>/g;
  return content.replace(pattern, (match, headingHTML, offset) => {
    if (headingHTML !== undefined) {
      heading = headingHTML;
      return match;
    }
    // Drop the permalink anchor and any markup from the heading text
    let label = heading.replace(/<a[^>]*heading-permalink[\s\S]*?<\/a>/g, '')
      .replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() || 'Table';
    // A bold caption line right above the table (e.g. "Legend") narrows the name.
    // Only the text just before the table can hold it, so don't search the whole page.
    const caption = content.slice(Math.max(0, offset - 500), offset).match(captionPattern);
    if (caption) label = `${label}: ${caption[1].trim()}`;
    // Keep region names unique on the page
    used[label] = (used[label] || 0) + 1;
    if (used[label] > 1) label = `${label} (${used[label]})`;
    const safeLabel = escapeAttr(label);
    // Tables with many columns need a wider column before they fit side by side
    const cols = ((match.match(/<thead[\s\S]*?<\/thead>/) || [''])[0].match(/<th[\s>]/g) || []).length;
    const className = cols >= WIDE_COLUMNS ? 'table-scroll table-scroll--wide' : 'table-scroll';
    return `<div class="${className}" role="region" tabindex="0" aria-label="${safeLabel} table">${labelCells(match)}</div>`;
  });
};

// Code blocks can scroll sideways on narrow screens; make them reachable by
// keyboard and give each a unique name. Skips blocks that are decorative
// (aria-hidden) or already focusable.
const scrollableCode = (content, outputPath) => {
  if (!outputPath || !outputPath.endsWith('.html') || !content.includes('<pre')) {
    return content;
  }
  let count = 0;
  return content.replace(/<pre(?![^>]*(?:tabindex|aria-hidden))([^>]*)>/g, (match, attrs) => {
    count += 1;
    return `<pre${attrs} tabindex="0" role="region" aria-label="Code example ${count}">`;
  });
};

module.exports = {
  scrollableTables,
  scrollableCode,
};
