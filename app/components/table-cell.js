import Ember from 'ember';

const {
  Component
} = Ember;

export default Component.extend({
  tagName: 'td',
  classNameBindings: ['model.isOpened:cell-open'],
  loadMines: 'loadMines',
  openNearestCells: 'openNearestCells',
  incNoOfMarkedCells: 'incNoOfMarkedCells',
  decNoOfMarkedCells: 'decNoOfMarkedCells',
  openAllCells: 'openAllCells',
  reload: 'reload',
  rightClicked() {
    alert("A");
  },
  contextMenu() {
    let model = this.get("model");
    if(model.get("isMarked")) {
      model.set("isMarked", false);
      this.sendAction('decNoOfMarkedCells');
    } else {
      model.set("isMarked", true);
      this.sendAction('incNoOfMarkedCells');
    }
    return false;
  },
  click() {
    var model = this.get("model");
    model.set("isOpened", true);
    if(this.get("isMinesLoaded")) {
      if(!model.get("hasMine")) {
        if(!model.get("value")) {
          this.sendAction("openNearestCells", model);
        } else {
          model.set("isOpened", true);
        }
      } else {
        alert("Try again");
        this.sendAction('openAllCells');
        this.sendAction('reload');
      }
    } else {
      this.sendAction("loadMines", model);
      this.sendAction("openNearestCells", model);
    }
  },

  actions: {

  }
});
