import Ember from 'ember';

const {
  Route
} = Ember;

export default Route.extend({
  store: Ember.inject.service('store'),
  model() {
    return this.loadCells();
  },

  loadCells() {
    let tableRows = Ember.A();
    for(let i = 0; i < 9; i++) {
      let tableColumns = Ember.A();
      for(let j = 0; j < 9; j++) {
        var tile = this.store.createRecord('tile', {xPos: j, yPos: i});
        tableColumns.push(tile);
      }
      tableRows.push(tableColumns);
    }
    return tableRows;
  },

  findPos: function(min, max, valueToExclude) {
    let pos = Math.floor(Math.random() * (max - min + 1)) + min;
    if (valueToExclude && pos === valueToExclude) {
      return this.findPos(min, max, valueToExclude);
    }
    return pos;
  },

  actions: {
    reload() {
      this.get("controller").set("isMinesLoaded", false);
      this.refresh();
    },

    fillMines(cell) {
      let excXPos = cell.get("xPos");
      let excYPos = cell.get("yPos");
      for(let m = 0; m < 10; m++) {
        let xPos = this.findPos(0, 8, excXPos);
        let yPos = this.findPos(0, 8, excYPos);
        let selectObj = this.currentModel[yPos][xPos];
        selectObj.set("hasMine", true);
      }
    },

    setValues() {

      for(let i = 0; i < 9; i++) {
        for(let j = 0; j < 9; j++) {
          let _value = 0;
          let model = this.currentModel;
          let cell = model[i][j];
          if(!cell.get('hasMine')) {
            for(let yOrigin = i - 1; yOrigin < i + 2; yOrigin++) {
              for(let xOrigin = j - 1; xOrigin < j + 2; xOrigin++) {
                if((yOrigin >= 0) && (yOrigin<= 8) && (xOrigin >= 0) && (xOrigin <= 8)) {
                  if(model[yOrigin][xOrigin] && model[yOrigin][xOrigin].get("hasMine")) {
                    _value += 1;
                  }
                }
              }
            }
            if(_value) {
              cell.set("value", _value);
            }
          }
        }
      }
    },

    openNearestCells: function(clickedCell) {
      let xPos = clickedCell.get("xPos");
      let yPos = clickedCell.get("yPos");
      this.send("openHorizontalCell", xPos, yPos);
      for(let upY = yPos; upY >= 0; upY--) {
        this.send("openHorizontalCell", xPos, upY);
      }
      for(let downY = yPos; downY <= 8; downY++) {
        this.send("openHorizontalCell", xPos, downY);
      }
    },

    openHorizontalCell: function(xPos, yPos) {
      let model = this.currentModel;
      for(let leftX = xPos; leftX >= 0; leftX--) {
        let currentCell = model[yPos][leftX];
        if(currentCell.get("hasMine")){
          break;
        } else if (currentCell.get("value")) {
          currentCell.set("isOpened", true);
          break;
        }
        currentCell.set("isOpened", true);
      }
      for(let rightX = xPos; rightX <= 8; rightX++) {
        let currentCell = model[yPos][rightX];
        if(currentCell.get("hasMine")){
          break;
        } else if (currentCell.get("value")) {
          currentCell.set("isOpened", true);
          break;
        }
        currentCell.set("isOpened", true);
      }
    }
  }
});
