The SHARE IT Act requires federal agencies to publish metadata for their software projects. This metadata is compiled into an `agency-index.json` file, which serves as a centralized inventory of the agency's software portfolio.

## Generate an agency-index.json file for submission

To create an agency-index.json:

1. Identify GitHub organizations and other platforms where source code is hosted
2. Generate the agency-index.json using the tools below. Learn more about usage in the [procedures page](https://gsa-share-it.github.io/site/schema/procedures/#generate-an-agency-index-json-file-for-agencies)

- [codejson-index website](https://gsa-share-it.github.io/codejson-index/)
- [codejson-index python tool](https://github.com/GSA-SHARE-IT/codejson-index)

3. Provide the index at:

- Agency's top level domain (TLD)
- A GitHub repository

## agency-index.json Fields

<table>
  <thead>
    <tr>
      <th>Field</th>
      <th>Presence</th>
      <th>Type</th>
      <th>Description</th>
      <th>Options/Examples</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>agency <span class="schema-required" aria-hidden="true">*</span></strong></td>
      <td>required</td>
      <td>str</td>
      <td>The agency acronym for Clinger Cohen Act agency, as defined by the United States Government Manual.</td>
      <td>
        - USDA<br>
        - DOC<br>
        - DOD<br>
        - ED<br>
        - DOE<br>
        - HHS<br>
        - HUD<br>
        - DHS<br>
        - DOI<br>
        - DOJ<br>
        - DOL<br>
        - DOS<br>
        - DOT<br>
        - TREASURY<br>
        - VA<br>
        - CFPB<br>
        - EPA<br>
        - FEC<br>
        - GSA<br>
        - NARA<br>
        - NASA<br>
        - NRC<br>
        - NSF<br>
        - OPM<br>
        - SBA<br>
        - SSA<br>
        - USAID
      </td>
    </tr>
    <tr>
      <td>releases</td>
      <td>required</td>
      <td>array</td>
      <td>An array of code.json objects containing each versioned source code release made available. </td>
      <td></td>
    </tr>
    <tr>
      <td><strong>version <span class="schema-required" aria-hidden="true">*</span></strong></td>
      <td>required</td>
      <td>str</td>
      <td>The version of the metadata schema in use. Implements semantic versioning 2.0.0 rules as defined at http://semver.org.</td>
      <td></td>
    </tr>
  </tbody>
</table>

View the agency-index.json schema here: https://github.com/GSA-SHARE-IT/codejson-schemas/tree/main/schemas/agency-index/schema-1.0.0.json

More examples of agency index files can be found here: https://github.com/DSACMS/code-gov/tree/main/agency-indexes
