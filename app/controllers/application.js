import Ember from 'ember';

const {
  Controller
} = Ember;

export default Controller.extend({
  noOfBugs: 10,
  canShowAll: false,
  isMinesLoaded: false,
  noOfMarkedCells: 0,
  actions: {
    openAllCells: function() {
      let model = this.get("model");
      model.forEach(function(item){
        item.forEach(i => i.set("isOpened", true));
        return item;
      });
    },
    incNoOfMarkedCells: function () {
      this.incrementProperty('noOfMarkedCells');
    },
    decNoOfMarkedCells() {
      this.decrementProperty('noOfMarkedCells');
    },
    loadMines: function(cell) {
      this.set('isMinesLoaded', true);
      this.send("fillMines", cell);
      this.send("setValues");
    }
  }
});
