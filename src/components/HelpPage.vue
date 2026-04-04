^;<template>

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
        <li class="toc-expandable">
          <button
            class="toc-expand-btn"
            :aria-expanded="categoriesExpanded"
            @click="categoriesExpanded = !categoriesExpanded"
          >
            <span class="toc-expand-icon" :class="{ expanded: categoriesExpanded }">▸</span>
            Error Categories
          </button>
          <ul v-show="categoriesExpanded" class="toc-sub">
            <li><a href="#general-conformance">General Consistency</a></li>
            <li><a href="#identifier-consistency">Identifier Consistency</a></li>
            <li><a href="#units-consistency">Units Consistency</a></li>
            <li><a href="#mathml-consistency">MathML Consistency</a></li>
            <li><a href="#sbo-consistency">SBO Consistency</a></li>
            <li><a href="#overdetermined-model">Overdetermined Model</a></li>
            <li><a href="#modelling-practice">Modelling Practice</a></li>
            <li><a href="#strict-units-consistency">Strict Units Consistency</a></li>
          </ul>
        </li>
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
                <a href="#error-categories">Error Categories</a> below.
              </td>
            </tr>
            <tr>
              <td><code>errorId</code></td>
              <td>
                Numeric identifier from the libSBML error table.
              </td>
            </tr>
            <tr>
              <td><code>package</code></td>
              <td>
                The SBML Level 3 package that defines the violated rule, e.g.
                <code>core</code>, <code>fbc</code>, <code>qual</code>. Note
                packages do not apply to any levels of SBML below Level 3, so
                this field will be <code>core</code> for all errors in SBML
                Level 2 and below.
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
      <section id="error-categories">
        <h2>Error Categories</h2>
        <p>
          Each error is assigned to a category that indicates the general type
          of rule that was violated. These categories are part of the
          official SBML specification and are listed as an appendix in each specification.
        </p>

        <section id="general-conformance">
          <h3>General Consistency</h3>
          <p>
            Rules about permitted attributes and child elements on each SBML
            component. Violations here mean an element has an attribute it is not allowed to have, is missing a required attribute, is missing a required child element or contains child elements that are not valid for that component type.
          </p>
          <h4>Example</h4>
          <p>
            Rule 20404:      
            If a <code>model</code> defines any <code>species</code>, then the <code>model</code> must also define at least one <code>compartment</code>. This is an implication of the fact that the <code>compartment</code> attribute on the <code>species</code> element is not optional. 
          </p>
          <div class="custom-box-pre box-green">
            <div class="box-header">
              <span class="tick">✓</span>
              Valid SBML snippet
            </div>
            <pre>
              <code>
                &lt;sbml level="2" version="2"&gt;
                  &lt;model id="m1"&gt;
                    &lt;listOfSpecies&gt;
                      &lt;species id="s1" compartment="c1"/&gt;
                    &lt;/listOfSpecies&gt;
                    &lt;listOfCompartments&gt;
                      &lt;compartment id="c1"/&gt;
                    &lt;/listOfCompartments&gt;
                  &lt;/model&gt;
                &lt;/sbml&gt;
              </code>
            </pre>
          </div>

          <div class="custom-box-pre box-red">
            <div class="box-header">
              <span class="cross">✗</span>
              Invalid SBML snippet
            </div>
            <pre>
              <code>
                &lt;sbml level="2" version="2"&gt;
                  &lt;model id="m1"&gt;
                    &lt;listOfSpecies&gt;
                      &lt;species id="s1" compartment="c1"/&gt;
                    &lt;/listOfSpecies&gt;
                  &lt;/model&gt;
                &lt;/sbml&gt;
              </code>
            </pre>
          </div>
        </section>

        <section id="identifier-consistency">
          <h3>Identifier Consistency</h3>
          <p>
            Rules that ensure every <code>id</code> and <code>metaid</code> in
            the document is unique and syntactically valid. References to those
            identifiers (e.g. in reactions or rules) must also point to something that actually exists.
          </p>
          <h4>Example</h4>
          <p>
            Rule 10301:      
            The value of the <code>id</code> field on every instance of the following type of object in a model must be unique: <code>model</code>, <code>functionDefinition</code>, <code>compartmentType</code>, <code>compartment</code>, <code>speciesType</code>, <code>species</code>, <code>reaction</code>, <code>speciesReference</code>, <code>modifierSpeciesReference</code>, <code>event</code>, and model-wide <code>parameter</code>. Note that <code>unitDefinition</code> and parameters defined inside a <code>reaction</code> are treated separately. 
          </p>
          <div class="custom-box-pre box-green">
            <div class="box-header">
              <span class="tick">✓</span>
              Valid SBML snippet
            </div>
            <pre>
              <code>
                &lt;sbml level="2" version="2"&gt;
                  &lt;model id="m1"&gt;
                    &lt;listOfSpecies&gt;
                      &lt;species id="s1" compartment="c1"/&gt;
                    &lt;/listOfSpecies&gt;
                    &lt;listOfCompartments&gt;
                      &lt;compartment id="c1"/&gt;
                    &lt;/listOfCompartments&gt;
                  &lt;/model&gt;
                &lt;/sbml&gt;
              </code>
            </pre>
          </div>

          <div class="custom-box-pre box-red">
            <div class="box-header">
              <span class="cross">✗</span>
              Invalid SBML snippet
            </div>
            <pre>
              <code>
                &lt;sbml level="2" version="2"&gt;
                  &lt;model id="m1"&gt;
                    &lt;listOfSpecies&gt;
                      &lt;species id="c1" compartment="c1"/&gt;
                    &lt;/listOfSpecies&gt;
                    &lt;listOfCompartments&gt;
                      &lt;compartment id="c1"/&gt;
                    &lt;/listOfCompartments&gt;
                  &lt;/model&gt;
                &lt;/sbml&gt;
              </code>
            </pre>
          </div>
        </section>

        <section id="units-consistency">
          <h3>Units Consistency</h3>
          <p>
            Checks that units are correctly defined and used consistently
            throughout the model. These tests do not take account of any numerical values and will allow units derive from the same base
            dimensions to be used together (e.g. <code>mM</code> and <code>mole</code>), but will flag cases where units are incompatible (e.g. <code>second</code> and <code>mole</code>) or where unit definitions are malformed. It will assume that missing units are compatible with any other units, so will not flag cases where units are missing entirely.
          </p>
          <h4>Example</h4>
          <p>
            Rule 10511:      
            When the <code>variable</code> in an <code>assignmentRule</code> refers to a <code>compartment</code>, the units of the rule's right-hand side are expected to be consistent with the units of that compartment's size. 
          </p>
          <div class="custom-box-pre box-green">
            <div class="box-header">
              <span class="tick">✓</span>
              Valid SBML snippet
            </div>
            <pre>
              <code>
                &lt;sbml level="3" version="1"&gt;
                  &lt;model id="m1"&gt;
                    &lt;listOfUnitDefinitions&gt;
                      &lt;unitDefinition id="millimole"&gt;
                        &lt;listOfUnits&gt;
                          &lt;unit kind="mole" exponent="1" scale="0"
                          multiplier="0.001"/&gt;
                        &lt;/listOfUnits&gt;
                      &lt;/unitDefinition&gt;
                      &lt;unitDefinition id="litre"&gt;
                        &lt;listOfUnits&gt;
                          &lt;unit kind="metre" exponent="3" scale="0" multiplier="1"/&gt;
                        &lt;/listOfUnits&gt;
                      &lt;/unitDefinition&gt;
                    &lt;listOfSpecies&gt;
                      &lt;species id="s1" compartment="c1" units="millimole"/&gt;
                    &lt;/listOfSpecies&gt;
                    &lt;listOfCompartments&gt;
                      &lt;compartment id="c1" spatialDimensions="3"/&gt;
                    &lt;/listOfCompartments&gt;
                    &lt;listOfRules&gt;
                      &lt;assignmentRule variable="s1"&gt;
                        &lt;math xmlns="http://www.w3.org/1998/Math/MathML"&gt;
                          &lt;cn units="mole"&gt;0.002&lt;/cn&gt;
                        &lt;/math&gt;
                      &lt;/assignmentRule&gt;
                    &lt;/listOfRules&gt;
                  &lt;/model&gt;
                &lt;/sbml&gt;
              </code>
            </pre>
          </div>

          <div class="custom-box-pre box-red">
            <div class="box-header">
              <span class="cross">✗</span>
              Invalid SBML snippet
            </div>
            <pre>
              <code>
                &lt;sbml level="3" version="1"&gt;
                  &lt;model id="m1"&gt;
                    &lt;listOfCompartments&gt;
                      &lt;compartment id="c1" spatialDimensions="3"/&gt;
                    &lt;/listOfCompartments&gt;
                    &lt;listOfRules&gt;
                      &lt;assignmentRule variable="c1"&gt;
                        &lt;math xmlns="http://www.w3.org/1998/Math/MathML"&gt;
                          &lt;cn units="metre"&gt;1&lt;/cn&gt;
                        &lt;/math&gt;
                      &lt;/assignmentRule&gt;
                    &lt;/listOfRules&gt;
                  &lt;/model&gt;
                &lt;/sbml&gt;              
              </code>
            </pre>
          </div>
        </section>

        <section id="mathml-consistency">
          <h3>MathML Consistency</h3>
          <p>
            Validation of any MathML expressions embedded in the document, such
            as kinetic laws, assignment rules, or constraints. Errors here mean
            the mathematics is either syntactically malformed or uses operators
            and functions in ways not permitted by the SBML specification. For example, using a function that is not defined in SBML or applying an operator to an invalid number of arguments or arguments that have incompatible units would trigger an error in this category.
          </p>
          <h4>Example</h4>
          <p>
            Rule 10203:      
            In the SBML subset of MathML 2.0, the MathML attribute <code>encoding</code> is only permitted on <code>csymbol</code>. No other MathML elements may have an <code>encoding</code> attribute. An SBML L3 Package may allow the <code>encoding</code> attribute in other places, and if so, the package must define <code>required = "true"</code> on the SBML container element <code>sbml</code>. 
          </p>
          <div class="custom-box-pre box-green">
            <div class="box-header">
              <span class="tick">✓</span>
              Valid SBML snippet
            </div>
            <pre>
              <code>
                &lt;sbml level="2" version="2"&gt;
                  &lt;model id="m1"&gt;
                    &lt;listOfSpecies&gt;
                      &lt;species id="s1" compartment="c1"/&gt;
                    &lt;/listOfSpecies&gt;
                    &lt;listOfCompartments&gt;
                      &lt;compartment id="c1"/&gt;
                    &lt;/listOfCompartments&gt;
                    &lt;listOfParameters&gt;      
                      &lt;parameter id="p1" units="metre" value="1"
                      constant="false"/&gt;
                      &lt;parameter id="delta_t" units="second" value="1"
                      constant="false"/&gt;
                    &lt;/listOfParameters&gt;
                    &lt;listOfRules&gt;
                      &lt;algebraicRule&gt;
                        &lt;math xmlns="http://www.w3.org/1998/Math/MathML"&gt;
                          &lt;apply&gt;
                            &lt;times/&gt; 
                            &lt;ci&gt; p &lt;/ci&gt;
                            &lt;apply&gt;
                              &lt;csymbol encoding="text"
                              definitionURL="http://www.sbml.org/sbml/symbols/delay"&gt;
                              delay
                              &lt;/csymbol&gt;
                              &lt;ci&gt; p1 &lt;/ci&gt;
                              &lt;ci&gt; delta_t &lt;/ci&gt;
                            &lt;/apply&gt;
                          &lt;/apply&gt;
                        &lt;/math&gt;
                      &lt;/algebraicRule&gt;
                    &lt;/listOfRules&gt;                  
                  &lt;/model&gt;
                &lt;/sbml&gt;
              </code>
            </pre>
          </div>

          <div class="custom-box-pre box-red">
            <div class="box-header">
              <span class="cross">✗</span>
              Invalid SBML snippet
            </div>
            <pre>
              <code>
                &lt;sbml level="2" version="2"&gt;
                  &lt;model id="m1"&gt;
                    &lt;listOfSpecies&gt;
                      &lt;species id="s1" compartment="c1"/&gt;
                    &lt;/listOfSpecies&gt;
                    &lt;listOfCompartments&gt;
                      &lt;compartment id="c1"/&gt;
                    &lt;/listOfCompartments&gt;
                    &lt;listOfParameters&gt;      
                      &lt;parameter id="p1" units="metre" value="1"
                      constant="false"/&gt;
                      &lt;parameter id="delta_t" units="second" value="1"
                      constant="false"/&gt;
                    &lt;/listOfParameters&gt;
                    &lt;listOfRules&gt;
                      &lt;algebraicRule&gt;
                        &lt;math xmlns="http://www.w3.org/1998/Math/MathML"&gt;
                          &lt;apply&gt;
                            &lt;times/&gt; 
                            &lt;ci encoding="text"&gt; p &lt;/ci&gt;
                            &lt;apply&gt;
                              &lt;csymbol encoding="text"
                              definitionURL="http://www.sbml.org/sbml/symbols/delay"&gt;
                              delay
                              &lt;/csymbol&gt;
                              &lt;ci&gt; p1 &lt;/ci&gt;
                              &lt;ci&gt; delta_t &lt;/ci&gt;
                            &lt;/apply&gt;
                          &lt;/apply&gt;
                        &lt;/math&gt;
                      &lt;/algebraicRule&gt;
                    &lt;/listOfRules&gt;                  
                  &lt;/model&gt;
                &lt;/sbml&gt;
              </code>
            </pre>
          </div>
        </section>

        <section id="sbo-consistency">
          <h3>SBO Consistency</h3>
          <p>
            Validation of Systems Biology Ontology (SBO) terms attached to model
            elements. Errors here mean a term is either not a valid SBO identifier or has been applied to an element type for which it is not appropriate.
          </p>
          <h4>Example</h4>
          <p>
            Rule 10712:      
            The value of the <code>sboTerm</code> attribute on a <code>compartment</code> is expected to be an SBO identifier (http://www.biomodels.net/SBO/). In SBML Level 2 prior to Version 4 it is expected to refer to a participant physical type (i.e., terms derived from SBO:0000236, \"participant physical type\"); in Versions 4 and above it is expected to refer to a material entity (i.e., terms derived from SBO:0000240, \"material entity\").
          </p>
          <div class="custom-box-pre box-green">
            <div class="box-header">
              <span class="tick">✓</span>
              Valid SBML snippet
            </div>
            <pre>
              <code>
                &lt;sbml level="2" version="2"&gt;
                  &lt;model id="m1"&gt;
                    &lt;listOfCompartments&gt;
                      &lt;compartment id="c1" sboTerm="SBO:0000236"/&gt;
                    &lt;/listOfCompartments&gt;
                  &lt;/model&gt;
                &lt;/sbml&gt;
              </code>
            </pre>
          </div>

          <div class="custom-box-pre box-red">
            <div class="box-header">
              <span class="cross">✗</span>
              Invalid SBML snippet
            </div>
            <pre>
              <code>
                &lt;sbml level="2" version="2"&gt;
                  &lt;model id="m1"&gt;
                    &lt;listOfCompartments&gt;
                      &lt;compartment id="c1" sboTerm="SBO:0000064"/&gt;
                    &lt;/listOfCompartments&gt;
                  &lt;/model&gt;
                &lt;/sbml&gt;
              </code>
            </pre>
          </div>
        </section>

        <section id="overdetermined-model">
          <h3>Overdetermined Model</h3>
          <p>
            Checks that the model is not overdetermined — i.e. that the number of independent equations does not exceed the number of unknowns. An SBML model is overdetermined if the number of independent equations exceeds the number of unknowns. The equations are derived from the reactions, rules, and constraints in the model, and the unknowns are the values of the species, compartments, and parameters that can change over time. An overdetermined model cannot be simulated, as there is no consistent way to assign values to all variables. This typically indicates that there are conflicting rules or constraints in the model that cannot be satisfied simultaneously.
          </p>
          <h4>Example</h4>
          <p>
            Rule 10601:      
           The system of equations created from an SBML model must not be overdetermined. 
          </p>
          <div class="custom-box-pre box-green">
            <div class="box-header">
              <span class="tick">✓</span>
              Valid SBML snippet
            </div>
            <pre>
              <code>
                &lt;sbml xmlns="http://www.sbml.org/sbml/level2" level="2" version="1"&gt;
                  &lt;model id="algebraicRules_basic"&gt;
                    &lt;listOfCompartments&gt;
                      &lt;compartment id="cell" size="1"/&gt;
                    &lt;/listOfCompartments&gt;
                    &lt;listOfSpecies&gt;
                      &lt;species id="x" compartment="cell" initialConcentration="0.5"/&gt;
                      &lt;species id="y" compartment="cell" initialConcentration="0.5"/&gt;
                      &lt;species id="z" compartment="cell" initialConcentration="0.5"/&gt;
                    &lt;/listOfSpecies&gt;
                    &lt;listOfRules&gt;
                      &lt;algebraicRule&gt;
                        &lt;math xmlns="http://www.w3.org/1998/Math/MathML"&gt;
                          &lt;apply&gt;
                            &lt;abs/&gt;
                            &lt;ci&gt; z &lt;/ci&gt;
                          &lt;/apply&gt;
                        &lt;/math&gt;
                      &lt;/algebraicRule&gt;
                    &lt;/listOfRules&gt;
                    &lt;listOfReactions&gt;
                      &lt;reaction id="R1" reversible="false"&gt;
                        &lt;listOfReactants&gt;
                          &lt;speciesReference species="x"/&gt;
                        &lt;/listOfReactants&gt;
                        &lt;listOfProducts&gt;
                          &lt;speciesReference species="y"/&gt;
                        &lt;/listOfProducts&gt;
                        &lt;kineticLaw&gt;
                          &lt;math xmlns="http://www.w3.org/1998/Math/MathML"&gt;
                            &lt;apply&gt;
                              &lt;times/&gt;
                              &lt;ci&gt; K_1 &lt;/ci&gt;
                              &lt;ci&gt; x &lt;/ci&gt;
                            &lt;/apply&gt;
                          &lt;/math&gt;
                          &lt;listOfParameters&gt;
                            &lt;parameter id="K_1"/&gt;
                          &lt;/listOfParameters&gt;
                        &lt;/kineticLaw&gt;
                      &lt;/reaction&gt;
                    &lt;/listOfReactions&gt;
                  &lt;/model&gt;
                &lt;/sbml&gt;
              </code>
            </pre>
          </div>

          <div class="custom-box-pre box-red">
            <div class="box-header">
              <span class="cross">✗</span>
              Invalid SBML snippet
            </div>
            <pre>
              <code>
                &lt;sbml xmlns="http://www.sbml.org/sbml/level2" level="2" version="1"&gt;
                  &lt;model id="algebraicRules_basic"&gt;
                    &lt;listOfCompartments&gt;
                      &lt;compartment id="cell" size="1"/&gt;
                    &lt;/listOfCompartments&gt;
                    &lt;listOfSpecies&gt;
                      &lt;species id="x" compartment="cell" initialConcentration="0.5"/&gt;
                      &lt;species id="y" compartment="cell" initialConcentration="0.5"/&gt;
                    &lt;/listOfSpecies&gt;
                    &lt;listOfRules&gt;
                      &lt;algebraicRule&gt;
                        &lt;math xmlns="http://www.w3.org/1998/Math/MathML"&gt;
                          &lt;apply&gt;
                            &lt;abs/&gt;
                            &lt;ci&gt; x &lt;/ci&gt;
                          &lt;/apply&gt;
                        &lt;/math&gt;
                      &lt;/algebraicRule&gt;
                    &lt;/listOfRules&gt;
                    &lt;listOfReactions&gt;
                      &lt;reaction id="R1" reversible="false"&gt;
                        &lt;listOfReactants&gt;
                          &lt;speciesReference species="x"/&gt;
                        &lt;/listOfReactants&gt;
                        &lt;listOfProducts&gt;
                          &lt;speciesReference species="y"/&gt;
                        &lt;/listOfProducts&gt;
                        &lt;kineticLaw&gt;
                          &lt;math xmlns="http://www.w3.org/1998/Math/MathML"&gt;
                            &lt;apply&gt;
                              &lt;times/&gt;
                              &lt;ci&gt; K_1 &lt;/ci&gt;
                              &lt;ci&gt; x &lt;/ci&gt;
                            &lt;/apply&gt;
                          &lt;/math&gt;
                          &lt;listOfParameters&gt;
                            &lt;parameter id="K_1"/&gt;
                          &lt;/listOfParameters&gt;
                        &lt;/kineticLaw&gt;
                      &lt;/reaction&gt;
                    &lt;/listOfReactions&gt;
                  &lt;/model&gt;
                &lt;/sbml&gt;                
              </code>
            </pre>
          </div>
        </section>

        <section id="modelling-practice">
          <h3>Modelling Practice</h3>
          <p>
            Best-practice guidelines that are not strictly required by the
            specification but are strongly recommended. Following these
            suggestions improves interoperability between tools and makes models
            easier to understand and reproduce.
          </p>
          <h4>Example</h4>
          <p>
            Rule 80702:      
            As a principle of best modeling practice, the <code>parameter</code> should set an initial value (<code>value</code> attribute should be set) rather than be left undefined. Doing so improves the portability of models between different simulation and analysis systems, and helps make it easier to detect potential errors in models.
          </p>
          <div class="custom-box-pre box-green">
            <div class="box-header">
              <span class="tick">✓</span>
              Valid SBML snippet
            </div>
            <pre>
              <code>
                &lt;sbml xmlns="http://www.sbml.org/sbml/level3/version1/core"
                level="3" version="1"&gt;
                  &lt;model id="ValidateBug"&gt;
                  &lt;listOfCompartments&gt;
                  &lt;compartment id="comp" name="comp" size="1" constant="true"/&gt;
                  &lt;/listOfCompartments&gt;
                    &lt;listOfSpecies&gt;
                      &lt;species id="S1" compartment="comp" initialAmount="0"
                      constant="false" hasOnlySubstanceUnits="false"
                      boundaryCondition="false"/&gt;
                      &lt;species id="S2" compartment="comp" initialAmount="0"
                      constant="false" hasOnlySubstanceUnits="false"
                      boundaryCondition="false"/&gt;
                    &lt;/listOfSpecies&gt;
                    &lt;listOfReactions&gt;
                      &lt;reaction id="reaction1" reversible="false" fast="false"&gt;
                        &lt;listOfReactants&gt;
                          &lt;speciesReference species="S1" constant="true"/&gt;
                        &lt;/listOfReactants&gt;
                        &lt;listOfProducts&gt;
                          &lt;speciesReference species="S2" constant="true"/&gt;
                        &lt;/listOfProducts&gt;
                        &lt;kineticLaw&gt;
                          &lt;math xmlns="http://www.w3.org/1998/Math/MathML"&gt;
                            &lt;apply&gt;
                              &lt;power/&gt;
                              &lt;ci&gt; S1 &lt;/ci&gt;
                              &lt;ci&gt; p1 &lt;/ci&gt;
                            &lt;/apply&gt;
                          &lt;/math&gt;
                          &lt;listOfLocalParameters&gt;
                              &lt;localParameter id="p1" units="second" value="1"/&gt;
                          &lt;/listOfLocalParameters&gt;
                        &lt;/kineticLaw&gt;
                      &lt;/reaction&gt;
                    &lt;/listOfReactions&gt;
                  &lt;/model&gt;
                &lt;/sbml&gt;
                
              </code>
            </pre>
          </div>

          <div class="custom-box-pre box-red">
            <div class="box-header">
              <span class="cross">✗</span>
              Invalid SBML snippet
            </div>
            <pre>
              <code>
                &lt;sbml xmlns="http://www.sbml.org/sbml/level3/version1/core"
                level="3" version="1"&gt;
                  &lt;model id="ValidateBug"&gt;
                  &lt;listOfCompartments&gt;
                  &lt;compartment id="comp" name="comp" size="1" constant="true"/&gt;
                  &lt;/listOfCompartments&gt;
                    &lt;listOfSpecies&gt;
                      &lt;species id="S1" compartment="comp" initialAmount="0"
                      constant="false" hasOnlySubstanceUnits="false"
                      boundaryCondition="false"/&gt;
                      &lt;species id="S2" compartment="comp" initialAmount="0"
                      constant="false" hasOnlySubstanceUnits="false"
                      boundaryCondition="false"/&gt;
                    &lt;/listOfSpecies&gt;
                    &lt;listOfReactions&gt;
                      &lt;reaction id="reaction1" reversible="false" fast="false"&gt;
                        &lt;listOfReactants&gt;
                          &lt;speciesReference species="S1" constant="true"/&gt;
                        &lt;/listOfReactants&gt;
                        &lt;listOfProducts&gt;
                          &lt;speciesReference species="S2" constant="true"/&gt;
                        &lt;/listOfProducts&gt;
                        &lt;kineticLaw&gt;
                          &lt;math xmlns="http://www.w3.org/1998/Math/MathML"&gt;
                            &lt;apply&gt;
                              &lt;power/&gt;
                              &lt;ci&gt; S1 &lt;/ci&gt;
                              &lt;ci&gt; p1 &lt;/ci&gt;
                            &lt;/apply&gt;
                          &lt;/math&gt;
                          &lt;listOfLocalParameters&gt;
                              &lt;localParameter id="p1" units="second"/&gt;
                          &lt;/listOfLocalParameters&gt;
                        &lt;/kineticLaw&gt;
                      &lt;/reaction&gt;
                    &lt;/listOfReactions&gt;
                  &lt;/model&gt;
                &lt;/sbml&gt;                
              </code>
            </pre>
          </div>
        </section>

        <section id="strict-units-consistency">
          <h3>Strict Units Consistency</h3>
          <p>
            A stricter form of units checking that goes beyond the standard units consistency rules. This includes cases where units can be inferred but are inconsistent, or where unit information is missing entirely. Models passing strict units checks are more likely to be correctly interpreted by simulation tools.
          </p>
           ! <h4>Example</h4>
          <p>
            Rule 99508:      
            In situations where a mathematical expression refers to a compartment, species or parameter, it is necessary to know the units of the object to establish unit consistency. In models where the units of an object have not been declared, libSBML does not yet have the functionality to accurately verify the consistency of the units in mathematical expressions referring to that object.
          </p>
          <div class="custom-box-pre box-green">
            <div class="box-header">
              <span class="tick">✓</span>
              Valid SBML snippet
            </div>
            <pre>
              <code>
                &lt;sbml xmlns="http://www.sbml.org/sbml/level3/version2/core"
                level="3" version="2"&gt;
                  &lt;model&gt;
                    &lt;listOfUnitDefinitions&gt;
                      &lt;unitDefinition id="volume"&gt;
                        &lt;listOfUnits&gt;
                          &lt;unit kind="litre" exponent="1" scale="0" multiplier="1"/&gt;
                        &lt;/listOfUnits&gt;
                      &lt;/unitDefinition&gt;
                    &lt;/listOfUnitDefinitions&gt;
                    &lt;listOfCompartments&gt;
                      &lt;compartment id="comp" name="comp" size="1.0"
                      constant="true" units="volume"/&gt;
                    &lt;/listOfCompartments&gt;
                  &lt;/model&gt;
                &lt;/sbml&gt;                 
              </code>
            </pre>
          </div>

          <div class="custom-box-pre box-red">
            <div class="box-header">
              <span class="cross">✗</span>
              Invalid SBML snippet
            </div>
            <pre>
              <code>
                &lt;sbml xmlns="http://www.sbml.org/sbml/level3/version2/core"
                level="3" version="2"&gt;
                  &lt;model&gt;
                    &lt;listOfUnitDefinitions&gt;
                      &lt;unitDefinition id="volume"&gt;
                      &lt;/unitDefinition&gt;
                    &lt;/listOfUnitDefinitions&gt;
                    &lt;listOfCompartments&gt;
                      &lt;compartment id="comp" name="comp" size="1.0"
                      constant="true" units="volume"/&gt;
                    &lt;/listOfCompartments&gt;
                  &lt;/model&gt;
                &lt;/sbml&gt;                
              </code>
            </pre>
          </div>
        </section>
      </section>
    </main>

    <footer class="help-footer">
      <router-link to="/">← Back to validator</router-link>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const categoriesExpanded = ref(false)
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

.toc-expandable {
  list-style: none;
  margin-left: -1.2rem;
}

.toc-expand-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: none;
  border: none;
  padding: 0;
  font-size: inherit;
  color: #4a90d9;
  cursor: pointer;
  text-decoration: none;
}

.toc-expand-btn:hover {
  text-decoration: underline;
}

.toc-expand-icon {
  display: inline-block;
  font-size: 0.75rem;
  transition: transform 0.2s ease;
  color: #4a90d9;
}

.toc-expand-icon.expanded {
  transform: rotate(90deg);
}

.toc-sub {
  margin-top: 0.25rem;
  padding-left: 1.4rem;
  border-left: 2px solid #d0e3f5;
}

.toc-sub li {
  margin: 0.2rem 0;
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


.custom-box {
  padding: 12px;
  margin: 10px 0;
  border-radius: 6px;
  border: 2px solid;
  font-family: Arial, sans-serif;
}

.custom-box pre {
  margin: 0;
  font-family: Consolas, monospace;
  background: rgba(0,0,0,0.05);
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
}

.box-header {
  display: flex;
  align-items: center;
  font-weight: bold;
  margin-bottom: 6px;
}

.box-header .tick {
  color: #2ecc71;
  font-size: 18px;
  margin-right: 8px;
}

.box-header .cross {
  color: #e74c3c;
  font-size: 18px;
  margin-right: 8px;
}

.box-green {
  background-color: #e6f9e6;
  border-color: #2ecc71;
  color: #1e7e34;
}

.box-red {
  background-color: #fdecea;
  border-color: #e74c3c;
  color: #a94442;
}

</style>
