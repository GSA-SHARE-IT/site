const fs = require('fs');
const path = require('path');
const { expect } = require('chai');
const { JSDOM } = require('jsdom');

const source = fs.readFileSync(path.join(__dirname, '../../assets/_common/js/home.js'), 'utf8');
const fixture = fs.readFileSync(path.join(__dirname, 'fixtures/home.html'), 'utf8');

// Load the homepage fixture and run home.js against it, the way the browser does.
// Without the `motion` class on <html>, only the non-decorative features run.
// home.js waits for DOMContentLoaded, so resolve on load, which fires after it.
async function load({ html = fixture, hash = '' } = {}) {
  const dom = new JSDOM(`<!DOCTYPE html><html><body>${html}</body></html>`, {
    url: `http://localhost/${hash}`,
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  });
  // jsdom doesn't implement scrolling
  dom.window.Element.prototype.scrollIntoView = () => {};
  dom.window.eval(source);
  await new Promise((resolve) => {
    dom.window.addEventListener('load', resolve);
  });
  return dom;
}

function press(el, key) {
  el.dispatchEvent(new el.ownerDocument.defaultView.KeyboardEvent('keydown', { key, bubbles: true }));
}

describe('home.js', () => {
  let dom;
  let document;

  afterEach(() => {
    dom.window.close();
  });

  describe('on any page', () => {
    it('marks itself as loaded for the fallback in meta.html', async () => {
      dom = await load({ html: '<main><p>Content page</p></main>' });
      expect(dom.window.document.documentElement.dataset.homeJs).to.equal('loaded');
    });

    it('leaves pages without homepage elements alone', async () => {
      dom = await load({ html: '<main><p>Content page</p></main>' });
      expect(dom.window.document.body.innerHTML).to.equal('<main><p>Content page</p></main>');
    });
  });

  describe('journey tabs', () => {
    let tabs;
    let panels;

    beforeEach(async () => {
      dom = await load();
      ({ document } = dom.window);
      tabs = Array.from(document.querySelectorAll('[data-tab-for]'));
      panels = tabs.map((tab) => document.getElementById(tab.dataset.tabFor));
    });

    const selected = () => tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
    const visible = () => panels.findIndex((p) => !p.hidden);

    it('shows the tablist and wires up ARIA roles', () => {
      const tablist = document.querySelector('[data-tabs]');
      expect(tablist.hidden).to.equal(false);
      expect(tablist.getAttribute('role')).to.equal('tablist');
      tabs.forEach((tab, i) => {
        expect(tab.getAttribute('role')).to.equal('tab');
        expect(tab.getAttribute('aria-controls')).to.equal(panels[i].id);
        expect(panels[i].getAttribute('role')).to.equal('tabpanel');
        expect(panels[i].getAttribute('aria-labelledby')).to.equal(tab.id);
      });
    });

    it('selects the first tab and hides the other panels', () => {
      expect(selected()).to.equal(0);
      expect(panels.map((p) => p.hidden)).to.deep.equal([false, true, true]);
      expect(tabs.map((t) => t.tabIndex)).to.deep.equal([0, -1, -1]);
    });

    it('switches panels on click', () => {
      tabs[2].click();
      expect(selected()).to.equal(2);
      expect(visible()).to.equal(2);
    });

    it('moves between tabs with arrow keys, wrapping at the ends', () => {
      press(tabs[0], 'ArrowRight');
      expect(selected()).to.equal(1);
      expect(document.activeElement).to.equal(tabs[1]);

      press(tabs[0], 'ArrowLeft');
      expect(selected()).to.equal(2);
      expect(document.activeElement).to.equal(tabs[2]);
    });

    it('jumps to the first and last tab with Home and End', () => {
      press(tabs[0], 'End');
      expect(selected()).to.equal(2);
      press(tabs[2], 'Home');
      expect(selected()).to.equal(0);
    });
  });

  describe('deep links', () => {
    it('opens the panel that contains the linked element', async () => {
      dom = await load({ hash: '#for-agencies' });
      const panel = dom.window.document.getElementById('panel-agencies');
      expect(panel.hidden).to.equal(false);
      expect(dom.window.document.getElementById('panel-teams').hidden).to.equal(true);
    });

    it('follows hash changes after load', async () => {
      dom = await load();
      dom.window.location.hash = '#for-congress';
      dom.window.dispatchEvent(new dom.window.HashChangeEvent('hashchange'));
      expect(dom.window.document.getElementById('panel-congress').hidden).to.equal(false);
    });

    it('falls back to the first tab on a malformed hash', async () => {
      dom = await load({ hash: '#%E0%A4' });
      expect(dom.window.document.getElementById('panel-teams').hidden).to.equal(false);
    });
  });

  describe('checklist progress', () => {
    let panel;
    let boxes;

    beforeEach(async () => {
      dom = await load();
      panel = dom.window.document.getElementById('panel-teams');
      boxes = panel.querySelectorAll('input[type="checkbox"]');
    });

    function check(box) {
      box.checked = true;
      box.dispatchEvent(new dom.window.Event('change'));
    }

    it('starts unchecked even if the browser restored state', () => {
      expect(Array.from(boxes).every((b) => !b.checked)).to.equal(true);
      expect(panel.querySelector('.progress').hidden).to.equal(false);
      expect(panel.querySelector('[data-count]').textContent).to.equal('0 of 3');
    });

    it('updates the count and progress bar as boxes are checked', () => {
      check(boxes[0]);
      const bar = panel.querySelector('[role="progressbar"]');
      expect(panel.querySelector('[data-count]').textContent).to.equal('1 of 3');
      expect(bar.getAttribute('aria-valuenow')).to.equal('33');
      expect(bar.getAttribute('aria-valuetext')).to.equal('1 of 3 complete');
      expect(bar.firstElementChild.style.width).to.equal('33%');

      check(boxes[1]);
      check(boxes[2]);
      expect(bar.getAttribute('aria-valuenow')).to.equal('100');
    });

    it('shows the confirmation only once every task is done', () => {
      const msg = panel.querySelector('[data-done]');
      expect(msg.hidden).to.equal(true);
      boxes.forEach(check);
      expect(msg.hidden).to.equal(false);
      boxes[0].checked = false;
      boxes[0].dispatchEvent(new dom.window.Event('change'));
      expect(msg.hidden).to.equal(true);
    });

    it('tracks each panel separately', () => {
      check(boxes[0]);
      const other = dom.window.document.getElementById('panel-agencies');
      expect(other.querySelector('[data-count]').textContent).to.equal('0 of 2');
    });

    it('counts an either/or group as one task and keeps only one option checked', () => {
      const other = dom.window.document.getElementById('panel-agencies');
      const [, e, f] = other.querySelectorAll('input[type="checkbox"]');
      check(e);
      expect(other.querySelector('[data-count]').textContent).to.equal('1 of 2');
      check(f);
      expect(e.checked).to.equal(false);
      expect(other.querySelector('[data-count]').textContent).to.equal('1 of 2');
    });
  });

  describe('agency rotation', () => {
    let toggle;
    let chip;

    beforeEach(async () => {
      dom = await load();
      toggle = dom.window.document.getElementById('rotate-toggle');
      chip = dom.window.document.getElementById('glyph-agency');
    });

    it('shows the pause control, starting paused without motion', () => {
      expect(toggle.hidden).to.equal(false);
      expect(toggle.dataset.paused).to.equal('true');
      expect(toggle.querySelector('[data-label]').textContent).to.equal('Play rotating agency names');
    });

    it('plays and advances to the next agency when pressed', () => {
      toggle.click();
      expect(toggle.dataset.paused).to.equal('false');
      expect(toggle.title).to.equal('Pause rotating agency names');
      expect(chip.textContent).to.equal('HHS');
    });

    it('pauses again on a second press', () => {
      toggle.click();
      toggle.click();
      expect(toggle.dataset.paused).to.equal('true');
      expect(chip.textContent).to.equal('HHS');
    });
  });
});
