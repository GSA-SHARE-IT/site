const { expect } = require('chai');
const {
  readableDate, htmlDateString, head, min, filterTagList,
} = require('../../config/filters');
const { contrastRatio, humanReadableContrastRatio } = require('../../config/wcagColorContrast');

describe('filters', () => {
  const date = new Date(Date.UTC(2026, 9, 5, 23, 30));

  it('formats dates in UTC', () => {
    expect(readableDate(date)).to.equal('05 Oct 2026');
    expect(htmlDateString(date)).to.equal('2026-10-05');
  });

  it('head returns the first or last n items', () => {
    expect(head([1, 2, 3], 2)).to.deep.equal([1, 2]);
    expect(head([1, 2, 3], -1)).to.deep.equal([3]);
    expect(head([], 2)).to.deep.equal([]);
    expect(head('not an array', 2)).to.deep.equal([]);
  });

  it('min returns the smallest argument', () => {
    expect(min(4, 1, 3)).to.equal(1);
  });

  it('filterTagList drops internal collection tags', () => {
    expect(filterTagList(['all', 'schema', 'nav', 'post', 'posts', 'about'])).to.deep.equal(['schema', 'about']);
    expect(filterTagList(undefined)).to.deep.equal([]);
  });
});

describe('wcagColorContrast', () => {
  it('computes the WCAG contrast ratio in either order', () => {
    expect(contrastRatio('#000000', '#ffffff')).to.be.closeTo(21, 0.001);
    expect(contrastRatio('#ffffff', '#000000')).to.be.closeTo(21, 0.001);
    expect(contrastRatio('#1c304a', '#1c304a')).to.equal(1);
  });

  it('rounds the readable ratio more precisely near the AA thresholds', () => {
    expect(humanReadableContrastRatio(3.14159)).to.equal('3.1:1');
    expect(humanReadableContrastRatio(4.4999)).to.equal('4.50:1');
    expect(humanReadableContrastRatio(21)).to.equal('21:1');
  });
});
