// Keep transform source code here.

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
    const safeLabel = label.replace(/&(?![a-z#0-9]+;)/gi, '&amp;').replace(/"/g, '&quot;');
    return `<div class="table-scroll" role="region" tabindex="0" aria-label="${safeLabel} table">${match}</div>`;
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
