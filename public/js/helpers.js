// use to mapping keys
const registeredKeys = []
window.document.addEventListener('keydown', e => {
  registeredKeys.push(e.key)
  console.log(registeredKeys) // eslint-disable-line no-console
})
