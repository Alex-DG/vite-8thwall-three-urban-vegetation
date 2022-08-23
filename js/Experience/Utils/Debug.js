import { colorToObjectRgbString } from '@tweakpane/core'
import { Pane } from 'tweakpane'

class DebugPane_ {
  constructor() {
    this.pane = new Pane()
  }

  addSlider(obj, name, params) {
    this.pane.addInput(obj, name, params)
  }

  addColorPicker(obj, name, params, callback) {
    this.pane.addInput(obj, name, params).on('change', ({ value }) => {
      callback(value)
    })
  }
}

const DebugPane = new DebugPane_()
export default DebugPane
