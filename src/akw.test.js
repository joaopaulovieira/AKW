import AKW from './akw.js'

describe('AKW', function() {
  beforeEach(() => {
    this.akw = new AKW()
  })

  describe('built with default element', () => {
    test('use document reference for element', () => {
      expect(this.akw.element).toEqual(window.document)
    })
  })

  describe('built with custom element', () => {
    beforeEach(() => {
      this.element = document.createElement('div')
      this.akw = new AKW(this.element)
    })

    test('use this element instead document reference', () => {
      expect(this.akw.element).toEqual(this.element)
      expect(this.akw.element).not.toEqual(window.document)
    })
  })

  describe('events', () => {
    describe('that are supported', () => {
      beforeEach(() => {
        this.element = document.createElement('div')
        this.akw = new AKW(this.element, 'keydown')
      })

      test('only bind them', () => {
        expect(this.akw.usedEvents).toEqual(['keydown'])
        this.akw = new AKW(this.element, ['keydown', 'keyup'])

        expect(this.akw.usedEvents).toContain('keydown')
        expect(this.akw.usedEvents).toContain('keyup')
      })

      test('active the listeners for those events on configured element', () => {
        jest.spyOn(this.akw, 'handler')
        const evt = new Event('keydown', { bubbles: true, cancelable: false })
        this.element.dispatchEvent(evt)

        expect(this.akw.handler).toHaveBeenCalled()
      })

      test('active listener on unload event to remove any listener on configured element', () => {
        jest.spyOn(this.akw, 'unregisterEvents')
        const evt = new Event('unload', { bubbles: true, cancelable: false })
        document.dispatchEvent(evt)

        expect(this.akw.unregisterEvents).toHaveBeenCalled()
      })
    })

    describe('which are invalid', () => {
      beforeEach(() => {
        this.element = document.createElement('div')
        this.akw = new AKW(this.element, 'invalidEvent')
      })

      test('bind all supported events', () => {
        expect(this.akw.usedEvents).toContain('keydown')
        expect(this.akw.usedEvents).toContain('keyup')
      })

      test('active the listeners for all supported events on configured element', () => {
        jest.spyOn(this.akw, 'handler')
        const keyDownEvt = new Event('keydown', { bubbles: true, cancelable: false })
        const keyUpEvt = new Event('keyup', { bubbles: true, cancelable: false })
        this.element.dispatchEvent(keyDownEvt)
        this.element.dispatchEvent(keyUpEvt)

        expect(this.akw.handler).toHaveBeenCalledTimes(2)
      })

      test('active listener on unload event to remove any listener on configured element', () => {
        jest.spyOn(this.akw, 'unregisterEvents')
        const evt = new Event('unload', { bubbles: true, cancelable: false })
        document.dispatchEvent(evt)

        expect(this.akw.unregisterEvents).toHaveBeenCalled()
      })
    })
  })

  describe('on keyRegister', () => {
    beforeEach(() => {
      this.akw = new AKW()
    })

    test('occurs the key check before the register', () => {
      let checkResult = this.akw.isSupportedKey('a')

      expect(checkResult).toBeTruthy()
      checkResult = this.akw.isSupportedKey('0')

      expect(checkResult).toBeTruthy()
      checkResult = this.akw.isSupportedKey('invalid')

      expect(checkResult).toBeFalsy()
    })

    test('don\'t register unsupported keys', () => {
      this.akw.keyDown('invalid', () => {})

      expect(this.akw.registeredKeys.length).toEqual(0)
    })

    test('register the key input', () => {
      const callback = () => {}
      this.akw.keyRegister('keyup', 'z', callback)

      expect(this.akw.registeredSequences.length).toEqual(0)
      expect(this.akw.registeredKeys[0].input).toEqual('z')
    })

    test('register each key in array input when validateSequence is false', () => {
      const callback = () => {}
      this.akw.keyRegister('keydown', ['x', 'p', 't', 'o'], callback)

      expect(this.akw.registeredSequences.length).toEqual(0)
      expect(this.akw.registeredKeys[0].input).toEqual('x')
      expect(this.akw.registeredKeys[1].input).toEqual('p')
      expect(this.akw.registeredKeys[2].input).toEqual('t')
      expect(this.akw.registeredKeys[3].input).toEqual('o')
    })

    test('register array input as sequence when validateSequence is true', () => {
      const callback = () => {}
      this.akw.keyRegister('keydown', ['x', 'p', 't', 'o'], callback, true)

      expect(this.akw.registeredKeys.length).toEqual(0)
      expect(this.akw.registeredSequences[0].event).toEqual('keydown')
      expect(this.akw.registeredSequences[0].input).toEqual(['x', 'p', 't', 'o'])
      expect(this.akw.registeredSequences[0].callback).toEqual(callback)
    })

    describe('using keyDown method', () => {
      test('register keys on keydown event', () => {
        const callback = () => {}
        jest.spyOn(this.akw, 'keyRegister')
        this.akw.keyDown('z', callback)

        expect(this.akw.keyRegister).toHaveBeenCalledWith('keydown', 'z', callback, false)
      })
    })

    describe('using keyUp method', () => {
      test('register keys on keyup event', () => {
        const callback = () => {}
        jest.spyOn(this.akw, 'keyRegister')
        this.akw.keyUp('x', callback)

        expect(this.akw.keyRegister).toHaveBeenCalledWith('keyup', 'x', callback, false)
      })
    })
  })

  describe('once handler is called', () => {
    test('the function registered for one key as callback is called', () => {
      const callback = jest.fn()
      this.akw.keyDown('a', callback)
      const evt = new Event('keydown', { bubbles: true, cancelable: false })
      evt.key = 'a'
      document.dispatchEvent(evt)

      expect(callback).toHaveBeenCalled()
    })

    test('the function registered for one sequence as callback is called', () => {
      const callback = jest.fn()
      this.akw.keyDown(['4', 'k', 'w'], callback, true)
      const evt = new Event('keydown', { bubbles: true, cancelable: false })
      evt.key = '4'
      document.dispatchEvent(evt)
      evt.key = 'k'
      document.dispatchEvent(evt)
      evt.key = 'q'
      document.dispatchEvent(evt)

      expect(callback).not.toHaveBeenCalled()

      evt.key = '4'
      document.dispatchEvent(evt)
      evt.key = 'k'
      document.dispatchEvent(evt)
      evt.key = 'w'
      document.dispatchEvent(evt)

      expect(callback).toHaveBeenCalled()
    })
  })

  describe('on key unregister', () => {
    beforeEach(() => {
      this.akw = new AKW()
    })

    test('clear specific registered key', () => {
      const callback = jest.fn()
      this.akw.keyDown('a', callback)
      this.akw.keyDown('b', callback)
      this.akw.keyUp('c', callback)

      expect(this.akw.registeredKeys.length).toEqual(3)
      this.akw.unregisterKey('b')

      expect(this.akw.registeredKeys.length).toEqual(2)
      expect(this.akw.registeredKeys).not.toContain('b')
      expect(this.akw.registeredKeys[0].input).toEqual('a')
      expect(this.akw.registeredKeys[1].input).toEqual('c')
    })

    test('clear all registered keys', () => {
      const callback = jest.fn()
      this.akw.keyDown('a', callback)
      this.akw.keyDown('b', callback)
      this.akw.keyUp('c', callback)

      expect(this.akw.registeredKeys.length).toEqual(3)
      this.akw.unregisterAllKeys()

      expect(this.akw.registeredKeys.length).toEqual(0)
    })

    test('clear specific registered sequence', () => {
      const callback = jest.fn()
      this.akw.keyDown(['q', 'w', 'e', 'r', 't', 'y'], callback, true)
      this.akw.keyDown(['x', 'p', 't', 'o'], callback, true)

      expect(this.akw.registeredSequences.length).toEqual(2)
      this.akw.unregisterSequence(1)

      expect(this.akw.registeredSequences.length).toEqual(1)
      expect(this.akw.registeredSequences[0].input).toEqual(['q', 'w', 'e', 'r', 't', 'y'])
    })

    test('clear all registered sequences', () => {
      const callback = jest.fn()
      this.akw.keyDown(['q', 'w', 'e', 'r', 't', 'y'], callback, true)
      this.akw.keyDown(['x', 'p', 't', 'o'], callback, true)

      expect(this.akw.registeredSequences.length).toEqual(2)
      this.akw.unregisterAllSequences()

      expect(this.akw.registeredSequences.length).toEqual(0)
    })
  })
})
