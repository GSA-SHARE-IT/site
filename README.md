# SHARE IT Act Landing Page

Guide to the SHARE IT Act helping federal agencies comply with software code sharing requirements.

## About the Project

The SHARE IT Act Landing Page provides documentation, tools, and guidance to help federal agencies comply with the legislation. It requires federal agencies to share custom developed software code, including metadata about the project, with each other to eliminate duplicative government work. Our project offers a suite of tools for generating, validating, and maintaining code.json files as well as guidance to get started.

## Project Vision

Our vision is to create a compliance path for all federal agencies to meet SHARE IT Act requirements while fostering an Open Source culture across government.

## Project Mission

To provide accessible, user-friendly tools and clear documentation that simplifies the process of implementing SHARE IT Act requirements.

## Agency Mission

The Centers for Medicare & Medicaid Services (CMS) is committed to strengthening and modernizing the nation's health care system to provide access to high-quality care and improved health at lower costs.

## Team Mission

The CMS Open Source Program Office aims to facilitate the development, use, and sharing of open source software across government.

## Core Team

An up-to-date list of core team members can be found in [COMMUNITY.md](COMMUNITY.md). At this time, the project is still building the core team and defining roles and responsibilities. We are eagerly seeking individuals who would like to join the community and help us define and fill these roles.

## Documentation Index

- **[COMMUNITY.md](COMMUNITY.md)** - Information about the project team and community
- **[LICENSE](LICENSE)** - CC0 1.0 Universal public domain dedication
- **[README.md](README.md)** - Information about the project, vision and goals

## Repository Structure

```
├── .github/               # GitHub action workflows
├── assets/                # Static assets like images, CSS, and JavaScript
│   ├── css/               # Stylesheet files
│   ├── js/                # JavaScript files
│   └── images/            # Project images and icons
└── code.json              # Metadata file
└── index.html             # Main html file
```

## Local Development

Drag and drop the `index.html` file into a browser to see the website. Once you make changes, refresh the page and the changes wil be reflected.

## Testing

- `npm test` runs the unit tests in `test/unit` (Mocha + jsdom).
- `npm run test:e2e` builds the site and runs the Playwright tests in `test/e2e` against it on port 8099. Run `npx playwright install chromium` once first. Stop `npm run dev` before running them, since both write to `_site`. If the browser download is blocked, run `PLAYWRIGHT_CHANNEL=chrome npm run test:e2e` to use your installed Chrome.

## Tool Previews

The tool cards on the homepage show real screenshots of the live tools, not hand-built mockups. A script takes the screenshots, and the site displays them. Cards with two or more screenshots get a Previous/Next carousel.

### Regenerate the previews

```
npm run previews
```

The script opens each live tool in a browser, puts it in the state we want, and saves the screenshots to `assets/_common/_img/previews/`. It also rewrites `_data/previews.json` with each image's size and alt text. Commit both the images and `previews.json`, and look at the images before you commit.

- Run `npx playwright install chromium` once first.
- If the browser download is blocked, run `PLAYWRIGHT_CHANNEL=chrome npm run previews` to use your installed Chrome.
- The tools are captured live, so you need internet access, and the screenshots reflect the tools as they are today.

### Add a tool or a screenshot

Everything is data in the `previews` array in `scripts/capture-previews.js`. Add an entry:

```javascript
{
  tool: 'my-tool',                       // becomes the key in previews.json
  url: 'https://example.github.io/my-tool/',
  ready: '#app input',                   // optional: wait for this before capturing
  shots: [
    {
      name: 'step-1',
      target: '#my-form',
      alt: 'My Tool: a description of what the screenshot shows.',
      setup: async (page) => { /* optional: click, type, select */ },
      verify: async (page) => { /* optional: check that setup worked */ },
    },
  ],
},
```

Then show it on the homepage by adding this include to the tool's card in `index.html`:

```
{% include 'tool-preview.html', shots: previews["my-tool"], label: "My Tool" %}
```

The `label` is used in the carousel's button names, so write it the way you'd say it out loud.

### The `name` and `target` rule

Every shot **must have a `name` and a `target`**.

- `name` becomes the file name: `<tool>-<name>.png`. Names must be unique within a tool.
- `target` is a CSS selector for the element where the screenshot starts. The script crops a fixed 4:3 region beginning at that element, so every image has the same shape and fills the preview window with no blank space and no cropping. If a screenshot looks wrong, change the `target` (or `pad`, the margin around it).

Optional fields:

- `pad`: margin around the target in pixels. The default is 32, and `0` starts flush with the target's edge.
- `setup`: puts the page in the state to capture, such as filling in sample data.
- `verify`: checks that `setup` worked, so a bad capture fails loudly instead of being saved.
- `alt`: the image's text description. Always provide it. An image without one is treated as decorative and screen reader users will miss it.

### Automatic updates

The workflow `.github/workflows/update-previews.yml` runs the script every Monday and can be run by hand from the **Actions** tab (select **Update Tool Previews**, then **Run workflow**). If any image changed, it opens a pull request on the `chore/update-previews` branch. Review the images in that PR before merging, because the live tools may have changed in a way that makes a screenshot misleading.

- If a tool's page changes and a selector stops matching, the run fails and no PR is opened. Update the `target` or `setup` for that shot.
- Pull requests opened by the workflow don't trigger other checks automatically. Run the tests yourself, or push an empty commit to the branch.
- Screenshots made on a different operating system differ slightly in font rendering, so regenerate on the same platform to avoid a PR that changes every image.

## Policies

### Open Source Policy

We adhere to the [CMS Open Source Policy](https://github.com/CMSGov/cms-open-source-policy). If you have any questions, just [shoot us an email](mailto:opensource@cms.hhs.gov).

### Security and Responsible Disclosure Policy

_Submit a vulnerability:_ Vulnerability reports can be submitted through [Bugcrowd](https://bugcrowd.com/cms-vdp). Reports may be submitted anonymously. If you share contact information, we will acknowledge receipt of your report within 3 business days.
For more information about our Security, Vulnerability, and Responsible Disclosure Policies, see [SECURITY.md](SECURITY.md).

## Public Domain

This project is in the public domain within the United States, and copyright and related rights in the work worldwide are waived through the [CC0 1.0 Universal public domain dedication](https://creativecommons.org/publicdomain/zero/1.0/) as indicated in [LICENSE](LICENSE).
All contributions to this project will be released under the CC0 dedication. By submitting a pull request or issue, you are agreeing to comply with this waiver of copyright interest.

### Software Bill of Materials (SBOM)

A Software Bill of Materials (SBOM) is a formal record containing the details and supply chain relationships of various components used in building software.
In the spirit of [Executive Order 14028 - Improving the Nation's Cyber Security](https://www.gsa.gov/technology/it-contract-vehicles-and-purchasing-programs/information-technology-category/it-security/executive-order-14028), a SBOM for this repository is provided here: https://github.com/GSA-SHARE-IT/site/network/dependencies.
For more information and resources about SBOMs, visit: https://www.cisa.gov/sbom.
