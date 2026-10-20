const { expect } = require('chai');
const { scrollableTables, scrollableCode } = require('../../config/transforms');

const TABLE = '<table><tr><td>1</td></tr></table>';

describe('scrollableTables', () => {
  it('ignores non-HTML output and pages without tables', () => {
    expect(scrollableTables(TABLE, 'feed.xml')).to.equal(TABLE);
    expect(scrollableTables(TABLE, undefined)).to.equal(TABLE);
    expect(scrollableTables('<p>Hi</p>', 'index.html')).to.equal('<p>Hi</p>');
  });

  it('wraps a table in a focusable region named after the heading above it', () => {
    const out = scrollableTables(`<h2 id="fields">Fields</h2>${TABLE}`, 'index.html');
    expect(out).to.equal(
      `<h2 id="fields">Fields</h2><div class="table-scroll" role="region" tabindex="0" aria-label="Fields table">${TABLE}</div>`,
    );
  });

  it('strips the permalink anchor and markup from the heading text', () => {
    const heading = '<h2 id="x"><code>code.json</code> fields <a href="#x" class="heading-permalink">#</a></h2>';
    expect(scrollableTables(heading + TABLE, 'index.html')).to.include('aria-label="code.json fields table"');
  });

  it('falls back to "Table" with no heading above', () => {
    expect(scrollableTables(TABLE, 'index.html')).to.include('aria-label="Table table"');
  });

  it('adds a bold caption line just above the table to the name', () => {
    const out = scrollableTables(`<h2>Status</h2><p><strong>Legend</strong></p>\n${TABLE}`, 'index.html');
    expect(out).to.include('aria-label="Status: Legend table"');
  });

  it('keeps names unique when headings repeat', () => {
    const out = scrollableTables(`<h2>Fields</h2>${TABLE}${TABLE}<h3>Fields</h3>${TABLE}`, 'index.html');
    expect(out.match(/aria-label="[^"]*"/g)).to.deep.equal([
      'aria-label="Fields table"',
      'aria-label="Fields (2) table"',
      'aria-label="Fields (3) table"',
    ]);
  });

  it('escapes ampersands and quotes in the name without double-escaping', () => {
    const out = scrollableTables(`<h2>Q&A "terms" &amp; more</h2>${TABLE}`, 'index.html');
    expect(out).to.include('aria-label="Q&amp;A &quot;terms&quot; &amp; more table"');
  });
});

describe('scrollableCode', () => {
  it('ignores non-HTML output and pages without code blocks', () => {
    expect(scrollableCode('<pre>x</pre>', 'feed.xml')).to.equal('<pre>x</pre>');
    expect(scrollableCode('<p>x</p>', 'index.html')).to.equal('<p>x</p>');
  });

  it('makes each code block focusable with a numbered name', () => {
    const out = scrollableCode('<pre class="language-json">a</pre><pre>b</pre>', 'index.html');
    expect(out).to.equal(
      '<pre class="language-json" tabindex="0" role="region" aria-label="Code example 1">a</pre>'
      + '<pre tabindex="0" role="region" aria-label="Code example 2">b</pre>',
    );
  });

  it('skips decorative and already-focusable blocks', () => {
    const input = '<pre aria-hidden="true">a</pre><pre tabindex="-1">b</pre>';
    expect(scrollableCode(input, 'index.html')).to.equal(input);
  });
});
