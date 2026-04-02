<template>
  <div class="help-page">
    <header class="help-header">
      <h1>SBML Validation — Help &amp; Reference</h1>
      <p class="subtitle">
        This page explains each validation option and how to interpret results.
      </p>
    </header>

    <nav class="toc">
      <h2>Contents</h2>
      <ul>
        <li><a href="#paste">Paste SBML</a></li>
        <li><a href="#upload">Upload a File</a></li>
        <li><a href="#results">Understanding Results</a></li>
        <li><a href="#severity">Severity Levels</a></li>
        <li><a href="#categories">Error Categories</a></li>
      </ul>
    </nav>

    <main>
      <section id="paste">
        <h2>Paste SBML</h2>
        <p>
          Copy your SBML XML directly into the text area and click
          <strong>Validate</strong>. The input must be a valid UTF-8 string
          representing an SBML document. This option is best for quick checks
          of small models or snippets.
        </p>
      </section>

      <section id="upload">
        <h2>Upload a File</h2>
        <p>
          Choose a <code>.xml</code> or <code>.sbml</code> file from your
          local machine. The file is read entirely in the browser — nothing is
          sent to a server. File size is limited only by your browser's memory.
        </p>
      </section>

      <section id="results">
        <h2>Understanding Results</h2>
        <p>Each result entry contains the following fields:</p>
        <table>
          <thead>
            <tr>
              <th>Field</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>line</code></td>
              <td>Line number in the SBML document where the issue was found.</td>
            </tr>
            <tr>
              <td><code>column</code></td>
              <td>Column offset on that line.</td>
            </tr>
            <tr>
              <td><code>message</code></td>
              <td>
                Human-readable description of the problem, including a
                reference to the relevant section of the SBML specification.
              </td>
            </tr>
            <tr>
              <td><code>severity</code></td>
              <td>
                How serious the issue is. See
                <a href="#severity">Severity Levels</a> below.
              </td>
            </tr>
            <tr>
              <td><code>category</code></td>
              <td>
                The rule group the error belongs to. See
                <a href="#categories">Error Categories</a>.
              </td>
            </tr>
            <tr>
              <td><code>errorId</code></td>
              <td>
                Numeric identifier from the libSBML error table. You can look
                up any ID in the
                <a
                  href="[sbml.org](https://sbml.org/software/libsbml/libsbml-docs/api/libsbml-error-codes.html)"
                  target="_blank"
                  rel="noopener noreferrer"
                  >libSBML error code reference</a
                >.
              </td>
            </tr>
            <tr>
              <td><code>package</code></td>
              <td>
                The SBML package that defines the violated rule, e.g.
                <code>core</code>, <code>fbc</code>, <code>qual</code>.
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section id="severity">
        <h2>Severity Levels</h2>
        <ul class="severity-list">
          <li>
            <span class="badge badge--error">error</span>
            The document violates the SBML specification. Software is not
            required to be able to read or process the file.
          </li>
          <li>
            <span class="badge badge--warning">warning</span>
            The document is technically valid but contains something that is
            likely unintentional or may cause interoperability problems.
          </li>
          <li>
            <span class="badge badge--info">info</span>
            Informational message. No corrective action is needed.
          </li>
          <li>
            <span class="badge badge--fatal">fatal</span>
            A critical error that prevents the document from being parsed at
            all.
          </li>
        </ul>
      </section>

      <section id="categories">
        <h2>Error Categories</h2>
        <p>
          Errors are grouped into categories that reflect where in the SBML
          specification the violated rule lives:
        </p>
        <ul>
          <li>
            <strong>General consistency</strong> — rules about
            permitted attributes and children on each SBML element.
          </li>
          <li>
            <strong>Identifier consistency</strong> — rules about unique and
            valid <code>id</code> / <code>metaid</code> values.
          </li>
          <li>
            <strong>Units consistency</strong> — checks that units are
            correctly defined and used throughout the model.
          </li>
          <li>
            <strong>MathML consistency</strong> — validation of any embedded
            MathML expressions.
          </li>
          <li>
            <strong>SBO consistency</strong> — validation of any embedded
            SBO terms.
          </li>
          <li>
            <strong>Overdetermined Model </strong> — check that the model is not overdetermined.
          </li>
          <li>
            <strong>Modelling practice</strong> — best-practice guidelines
            that are not strictly required but are strongly recommended.
          </li>
          <li>
            <strong>Strict Units consistency</strong> — checks that units are
            correctly defined and used throughout the model.
          </li>
        </ul>
      </section>
    </main>

    <footer class="help-footer">
      <router-link to="/">← Back to validator</router-link>
    </footer>
  </div>
</template>

<script setup>
// No logic needed — this is a purely static page.
</script>

<style scoped>
.help-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  font-family: inherit;
  line-height: 1.7;
  color: #222;
}

.help-header {
  margin-bottom: 2rem;
}

.help-header h1 {
  font-size: 1.8rem;
  margin-bottom: 0.4rem;
}

.subtitle {
  color: #555;
  margin: 0;
}

.toc {
  background: #f5f7fa;
  border-left: 4px solid #4a90d9;
  padding: 1rem 1.5rem;
  margin-bottom: 2.5rem;
  border-radius: 0 4px 4px 0;
}

.toc h2 {
  margin-top: 0;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #4a90d9;
}

.toc ul {
  margin: 0;
  padding-left: 1.2rem;
}

.toc li {
  margin: 0.3rem 0;
}

main section {
  margin-bottom: 2.5rem;
}

main section h2 {
  font-size: 1.3rem;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 0.4rem;
  margin-bottom: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.92rem;
}

th, td {
  text-align: left;
  padding: 0.55rem 0.75rem;
  border: 1px solid #ddd;
}

th {
  background: #f0f4f8;
  font-weight: 600;
}

tr:nth-child(even) td {
  background: #fafafa;
}

.severity-list {
  list-style: none;
  padding: 0;
}

.severity-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.8rem;
}

.badge {
  display: inline-block;
  padding: 0.2em 0.6em;
  border-radius: 3px;
  font-size: 0.8rem;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
  margin-top: 0.15em;
}

.badge--error   { background: #fde8e8; color: #c0392b; }
.badge--warning { background: #fef3cd; color: #856404; }
.badge--info    { background: #d6eaf8; color: #1a5276; }
.badge--fatal   { background: #f0d0f0; color: #6c3483; }

.help-footer {
  margin-top: 3rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
  font-size: 0.9rem;
}

a {
  color: #4a90d9;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
