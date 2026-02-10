// Load the UMD-style validator script as text and evaluate it
let scriptText;
const scriptUrl = new URL('./sbml_validator.js', import.meta.url);
if (scriptUrl.protocol === 'file:') {
	const fs = await import('fs');
	scriptText = fs.readFileSync(scriptUrl, 'utf8');
} else {
	const res = await fetch(scriptUrl.href);
	if (!res.ok) throw new Error('Failed to load SBML validator script.');
	scriptText = await res.text();
}
// ensure the module runs in browser environment
scriptText = scriptText.replace('var ENVIRONMENT_IS_NODE=true', 'var ENVIRONMENT_IS_NODE=false');
const module = { exports: {} };
// Prefer any locally-defined `createCpsModule` function in the evaluated script,
// otherwise fall back to CommonJS-style `module.exports`.
const wrapper = scriptText + '\nreturn (typeof createCpsModule !== "undefined" ? createCpsModule : (module.exports && (module.exports.default || module.exports)));';
const fn = new Function('module', wrapper);
const createCpsModule = fn(module);

export default createCpsModule;