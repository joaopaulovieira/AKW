import { ALL_KEYS } from './supported_keys'

const SUPPORTED_EVENTS = ['keydown', 'keyup']

export default class AKW {
  constructor(element = window.document, events = SUPPORTED_EVENTS) {
    this.registeredKeys = []
    this.registeredSequences = []
    this.element = element
    this.usedEvents = this.setupKeyBoardEvents(events)
    this.registerEvents(this.element, this.usedEvents)
  }

  setupKeyBoardEvents(events) {
    const formattedEvents = this.formatRequestedEvents(events)
    return this.hasValidKeyboardEvents(formattedEvents) ? formattedEvents : SUPPORTED_EVENTS
  }

  formatRequestedEvents(events) {
    let formattedEvents = []
    Array.isArray(events) ? formattedEvents = events : formattedEvents.push(events)
    return formattedEvents
  }

  hasValidKeyboardEvents(events) {
    let isValidData
    events.forEach(keyboardEvent => {
      if (!SUPPORTED_EVENTS.includes(keyboardEvent)) {
        console.warn('The keyboard event requested to listen is not valid. The AKW will listen all supported events in this case.') // eslint-disable-line no-console
        isValidData = false
        return isValidData
      }
      isValidData = true
      return isValidData
    })
    return isValidData
  }

  registerEvents(element, events) {
    this._boundHandler = e => this.handler(e)
    this._boundUnregister = () => this.unregisterEvents(element, events)

    events.forEach(keyboardEvent => element.addEventListener(keyboardEvent, this._boundHandler))
    window.addEventListener('unload', this._boundUnregister)
  }

  unregisterEvents(element, events) {
    events.forEach(keyboardEvent => element.removeEventListener(keyboardEvent, this._boundHandler))
    window.removeEventListener('unload', this._boundUnregister)
  }

  handler(keyboardEvent) {
    this.registeredSequences.forEach(item => {
      !item.record && (item.record = function(event, input, callback) {
        this.counter = this.counter || 0

        event.key === input[this.counter] ? this.counter++ : this.counter = 0
        if (this.counter === input.length) {
          callback(keyboardEvent)
          this.counter = 0
        }
      })
      item.record(keyboardEvent, item.input, item.callback)
    })

    const callbacksRelatedToEvent = this.registeredKeys.filter(item => item.input === keyboardEvent.key)
    callbacksRelatedToEvent.forEach(item => {
      keyboardEvent.type === item.event && keyboardEvent.key === item.input && item.callback(keyboardEvent)
    })
  }

  keyDown(input, callback, validateSequence = false) {
    this.keyRegister('keydown', input, callback, validateSequence)
  }

  keyUp(input, callback, validateSequence = false) {
    this.keyRegister('keyup', input, callback, validateSequence)
  }

  keyRegister(event, input, callback, validateSequence) {
    if (!this.isSupportedKey(input))
      return console.warn(`the input ${input} is not valid. Check the supported keys to register valid keys.`) // eslint-disable-line no-console

    return Array.isArray(input)
      ? validateSequence
        ? this.registeredSequences.push({ event, input, callback })
        : input.forEach(item => this.registeredKeys.push({ event, input: item, callback }))
      : this.registeredKeys.push({ event, input, callback })
  }

  isSupportedKey(input) {
    return Array.isArray(input) ? input.every(key => ALL_KEYS.includes(key)) : ALL_KEYS.includes(input)
  }

  unregisterKey(key) {
    const filteredKeys = this.registeredKeys.filter(item => item.input !== key)
    this.registeredKeys = filteredKeys
  }

  unregisterAllKeys() {
    this.registeredKeys = []
  }

  unregisterSequence(id) {
    const filteredSequences = this.registeredSequences.filter(item => item !== this.registeredSequences[id])
    this.registeredSequences = filteredSequences
  }

  unregisterAllSequences() {
    this.registeredSequences = []
  }
}
