/**
 * Web Worker for SBML validation. Runs the CPU-intensive libSBML validation
 * off the main thread so the browser stays responsive.
 */

let modulePromise = null

function normalizeErrors(raw) {
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw.errors === 'object' && Array.isArray(raw.errors)) return raw.errors
  if (raw && typeof raw === 'object' && raw !== null) return [raw]
  return []
}

async function getModule(libBase) {
  if (modulePromise) return modulePromise
  const res = await fetch(libBase + 'sbml_validator.js')
  if (!res.ok) throw new Error('Failed to load SBML validator script.')
  let scriptText = await res.text()
  scriptText = scriptText.replace('var ENVIRONMENT_IS_NODE=true', 'var ENVIRONMENT_IS_NODE=false')
  const module = { exports: {} }
  const fn = new Function('module', 'exports', scriptText + '\nreturn module.exports.default || module.exports;')
  const createCpsModule = fn(module, module.exports)
  if (typeof createCpsModule !== 'function') {
    throw new Error('SBML validator script did not export createCpsModule.')
  }
  const mod = await createCpsModule({
    locateFile(path) {
      return libBase + path
    }
  })
  const resolved = mod && typeof mod.then === 'function' ? await mod : mod
  modulePromise = Promise.resolve(resolved)
  return modulePromise
}

self.onmessage = async (e) => {
  const { id, type, libBase, sbmlString, options } = e.data
  if (!id || !libBase) return
  try {
    const mod = await getModule(libBase)
    if (type === 'getVersion') {
      const fn = mod.getLibSBMLVersion
      const v = typeof fn === 'function' ? fn() : null
      self.postMessage({ id, type: 'version', version: v != null ? 'libSBML ' + String(v) : '' })
      return
    }
    if (type === 'validate' && sbmlString) {
      const validateSBMLString = mod.validateSBMLString
      if (typeof validateSBMLString !== 'function') {
        throw new Error('Validator module does not expose validateSBMLString')
      }
      const start = performance.now()
      const raw = validateSBMLString(sbmlString, JSON.stringify(options || {}))
      const durationMs = performance.now() - start
      let errors = raw
      if (typeof raw === 'string') {
        try {
          errors = JSON.parse(raw)
        } catch {
          errors = [{ message: raw, severity: 'error' }]
        }
      }
      self.postMessage({
        id,
        type: 'result',
        errors: normalizeErrors(errors),
        durationMs
      })
      return
    }
  } catch (err) {
    self.postMessage({
      id,
      type: 'error',
      message: err?.message || String(err)
    })
  }
}
