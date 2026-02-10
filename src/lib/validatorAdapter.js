const BASE = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL
  ? import.meta.env.BASE_URL
  : '/'
const LIB_BASE = BASE.replace(/\/?$/, '/') + 'lib/'

let modulePromise = null

export const validationOptions = {
    "LIBSBML_CAT_GENERAL_CONSISTENCY": true,
    "LIBSBML_CAT_IDENTIFIER_CONSISTENCY": true,
    "LIBSBML_CAT_UNITS_CONSISTENCY": false,
    "LIBSBML_CAT_MATHML_CONSISTENCY": true,
    "LIBSBML_CAT_SBO_CONSISTENCY": true,
    "LIBSBML_CAT_OVERDETERMINED_MODEL": true,
    "LIBSBML_CAT_MODELING_PRACTICE": true,
    "LIBSBML_CAT_STRICT_UNITS_CONSISTENCY": false,
};


async function loadValidatorFactory() {
  const res = await fetch(LIB_BASE + 'sbml_validator.js')
  if (!res.ok) throw new Error('Failed to load SBML validator script.')
  let scriptText = await res.text()
  scriptText = scriptText.replace('var ENVIRONMENT_IS_NODE=true', 'var ENVIRONMENT_IS_NODE=false')
  const module = { exports: {} }
  const exports = module.exports
  const fn = new Function('module', 'exports', scriptText + '\nreturn module.exports.default || module.exports;')
  const createCpsModule = fn(module, exports)
  if (typeof createCpsModule !== 'function') {
    throw new Error('SBML validator script did not export createCpsModule. Check that the script loads correctly.')
  }
  return createCpsModule
}

function getModule() {
  if (modulePromise) return modulePromise
  modulePromise = loadValidatorFactory()
    .then(createCpsModule =>
      createCpsModule({
        locateFile(path) {
          return LIB_BASE + path
        }
      })
    )
    .then(m => (m && typeof m.then === 'function' ? m : Promise.resolve(m)))
  return modulePromise
}

function normalizeErrors(raw) {
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw.errors === 'object' && Array.isArray(raw.errors)) return raw.errors
  if (raw && typeof raw === 'object' && raw !== null) return [raw]
  return []
}

/**
 * Validate SBML string. Loads the Emscripten module on first call.
 * @param {string} sbmlString - UTF-8 SBML document string
 * @returns {Promise<{ errors: Array<{ line?: number, column?: number, message: string, severity?: string }>, durationMs: number }>}
 */
export async function validate(sbmlString) {
  const start = performance.now()
  const mod = await getModule()
  const validateSBMLString = mod.validateSBMLString
  if (typeof validateSBMLString !== 'function') {
    throw new Error('Validator module does not expose validateSBMLString')
  }
  const raw = validateSBMLString(sbmlString, JSON.stringify(validationOptions))
  const durationMs = performance.now() - start
  let errors = raw
  if (typeof raw === 'string') {
    try {
      errors = JSON.parse(raw)
    } catch {
      errors = [{ message: raw, severity: 'error' }]
    }
  }
  return {
    errors: normalizeErrors(errors),
    durationMs
  }
}

/**
 * Get the libSBML version from the validator module. Loads the module on first call.
 * @returns {Promise<string>} Version string, or empty string if not available
 */
export async function getLibSBMLVersion() {
  const mod = await getModule()
  const fn = mod.getLibSBMLVersion
  if (typeof fn !== 'function') return ''
  const v = fn()
  return v != null ? 'libSBML ' + String(v) : ''
}
