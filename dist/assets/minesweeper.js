/* jshint ignore:start */

/* jshint ignore:end */

define('minesweeper/app', ['exports', 'ember', 'ember/resolver', 'ember/load-initializers', 'minesweeper/config/environment'], function (exports, Ember, Resolver, loadInitializers, config) {

  'use strict';

  var App;

  Ember['default'].MODEL_FACTORY_INJECTIONS = true;

  App = Ember['default'].Application.extend({
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix,
    Resolver: Resolver['default']
  });

  loadInitializers['default'](App, config['default'].modulePrefix);

  exports['default'] = App;

});
define('minesweeper/components/table-cell', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var Component = Ember['default'].Component;

  exports['default'] = Component.extend({
    tagName: 'td',
    classNameBindings: ['model.isOpened:cell-open'],
    loadMines: 'loadMines',
    openNearestCells: 'openNearestCells',
    incNoOfMarkedCells: 'incNoOfMarkedCells',
    decNoOfMarkedCells: 'decNoOfMarkedCells',
    openAllCells: 'openAllCells',
    reload: 'reload',
    rightClicked: function rightClicked() {
      alert("A");
    },
    contextMenu: function contextMenu() {
      var model = this.get("model");
      if (model.get("isMarked")) {
        model.set("isMarked", false);
        this.sendAction('decNoOfMarkedCells');
      } else {
        model.set("isMarked", true);
        this.sendAction('incNoOfMarkedCells');
      }
      return false;
    },
    click: function click() {
      var model = this.get("model");
      model.set("isOpened", true);
      if (this.get("isMinesLoaded")) {
        if (!model.get("hasMine")) {
          if (!model.get("value")) {
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

    actions: {}
  });

});
define('minesweeper/controllers/application', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var Controller = Ember['default'].Controller;

  exports['default'] = Controller.extend({
    noOfBugs: 10,
    canShowAll: false,
    isMinesLoaded: false,
    noOfMarkedCells: 0,
    actions: {
      openAllCells: function openAllCells() {
        var model = this.get("model");
        model.forEach(function (item) {
          item.forEach(function (i) {
            return i.set("isOpened", true);
          });
          return item;
        });
      },
      incNoOfMarkedCells: function incNoOfMarkedCells() {
        this.incrementProperty('noOfMarkedCells');
      },
      decNoOfMarkedCells: function decNoOfMarkedCells() {
        this.decrementProperty('noOfMarkedCells');
      },
      loadMines: function loadMines(cell) {
        this.set('isMinesLoaded', true);
        this.send("fillMines", cell);
        this.send("setValues");
      }
    }
  });

});
define('minesweeper/controllers/array', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller;

});
define('minesweeper/controllers/object', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller;

});
define('minesweeper/initializers/app-version', ['exports', 'minesweeper/config/environment', 'ember'], function (exports, config, Ember) {

  'use strict';

  var classify = Ember['default'].String.classify;
  var registered = false;

  exports['default'] = {
    name: 'App Version',
    initialize: function initialize(container, application) {
      if (!registered) {
        var appName = classify(application.toString());
        Ember['default'].libraries.register(appName, config['default'].APP.version);
        registered = true;
      }
    }
  };

});
define('minesweeper/initializers/export-application-global', ['exports', 'ember', 'minesweeper/config/environment'], function (exports, Ember, config) {

  'use strict';

  exports.initialize = initialize;

  function initialize() {
    var application = arguments[1] || arguments[0];
    if (config['default'].exportApplicationGlobal !== false) {
      var value = config['default'].exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = Ember['default'].String.classify(config['default'].modulePrefix);
      }

      if (!window[globalName]) {
        window[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete window[globalName];
          }
        });
      }
    }
  }

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };

});
define('minesweeper/models/tile', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    exports['default'] = DS['default'].Model.extend({
        hasMine: DS['default'].attr('boolean', { defaultValue: false }),
        isMarked: DS['default'].attr('boolean', { defaultValue: false }),
        isOpened: DS['default'].attr('boolean', { defaultValue: false }),
        value: DS['default'].attr(),
        xPos: DS['default'].attr(),
        yPos: DS['default'].attr()
    });

});
define('minesweeper/router', ['exports', 'ember', 'minesweeper/config/environment'], function (exports, Ember, config) {

  'use strict';

  var Router = Ember['default'].Router.extend({
    location: config['default'].locationType
  });

  Router.map(function () {});

  exports['default'] = Router;

});
define('minesweeper/routes/application', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var Route = Ember['default'].Route;

  exports['default'] = Route.extend({
    store: Ember['default'].inject.service('store'),
    model: function model() {
      return this.loadCells();
    },

    loadCells: function loadCells() {
      var tableRows = Ember['default'].A();
      for (var i = 0; i < 9; i++) {
        var tableColumns = Ember['default'].A();
        for (var j = 0; j < 9; j++) {
          var tile = this.store.createRecord('tile', { xPos: j, yPos: i });
          tableColumns.push(tile);
        }
        tableRows.push(tableColumns);
      }
      return tableRows;
    },

    findPos: function findPos(min, max, valueToExclude) {
      var pos = Math.floor(Math.random() * (max - min + 1)) + min;
      if (valueToExclude && pos === valueToExclude) {
        return this.findPos(min, max, valueToExclude);
      }
      return pos;
    },

    actions: {
      reload: function reload() {
        this.get("controller").set("isMinesLoaded", false);
        this.refresh();
      },

      fillMines: function fillMines(cell) {
        var excXPos = cell.get("xPos");
        var excYPos = cell.get("yPos");
        for (var m = 0; m < 10; m++) {
          var xPos = this.findPos(0, 8, excXPos);
          var yPos = this.findPos(0, 8, excYPos);
          var selectObj = this.currentModel[yPos][xPos];
          selectObj.set("hasMine", true);
        }
      },

      setValues: function setValues() {

        for (var i = 0; i < 9; i++) {
          for (var j = 0; j < 9; j++) {
            var _value = 0;
            var model = this.currentModel;
            var cell = model[i][j];
            if (!cell.get('hasMine')) {
              for (var yOrigin = i - 1; yOrigin < i + 2; yOrigin++) {
                for (var xOrigin = j - 1; xOrigin < j + 2; xOrigin++) {
                  if (yOrigin >= 0 && yOrigin <= 8 && xOrigin >= 0 && xOrigin <= 8) {
                    if (model[yOrigin][xOrigin] && model[yOrigin][xOrigin].get("hasMine")) {
                      _value += 1;
                    }
                  }
                }
              }
              if (_value) {
                cell.set("value", _value);
              }
            }
          }
        }
      },

      openNearestCells: function openNearestCells(clickedCell) {
        var xPos = clickedCell.get("xPos");
        var yPos = clickedCell.get("yPos");
        this.send("openHorizontalCell", xPos, yPos);
        for (var upY = yPos; upY >= 0; upY--) {
          this.send("openHorizontalCell", xPos, upY);
        }
        for (var downY = yPos; downY <= 8; downY++) {
          this.send("openHorizontalCell", xPos, downY);
        }
      },

      openHorizontalCell: function openHorizontalCell(xPos, yPos) {
        var model = this.currentModel;
        for (var leftX = xPos; leftX >= 0; leftX--) {
          var currentCell = model[yPos][leftX];
          if (currentCell.get("hasMine")) {
            break;
          } else if (currentCell.get("value")) {
            currentCell.set("isOpened", true);
            break;
          }
          currentCell.set("isOpened", true);
        }
        for (var rightX = xPos; rightX <= 8; rightX++) {
          var currentCell = model[yPos][rightX];
          if (currentCell.get("hasMine")) {
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

});
define('minesweeper/templates/application', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          var child0 = (function() {
            var child0 = (function() {
              return {
                isHTMLBars: true,
                revision: "Ember@1.12.0",
                blockParams: 0,
                cachedFragment: null,
                hasRendered: false,
                build: function build(dom) {
                  var el0 = dom.createDocumentFragment();
                  var el1 = dom.createTextNode("                  ");
                  dom.appendChild(el0, el1);
                  var el1 = dom.createComment("");
                  dom.appendChild(el0, el1);
                  var el1 = dom.createTextNode("\n");
                  dom.appendChild(el0, el1);
                  return el0;
                },
                render: function render(context, env, contextualElement) {
                  var dom = env.dom;
                  var hooks = env.hooks, content = hooks.content;
                  dom.detectNamespace(contextualElement);
                  var fragment;
                  if (env.useFragmentCache && dom.canClone) {
                    if (this.cachedFragment === null) {
                      fragment = this.build(dom);
                      if (this.hasRendered) {
                        this.cachedFragment = fragment;
                      } else {
                        this.hasRendered = true;
                      }
                    }
                    if (this.cachedFragment) {
                      fragment = dom.cloneNode(this.cachedFragment, true);
                    }
                  } else {
                    fragment = this.build(dom);
                  }
                  var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
                  content(env, morph0, context, "cell.value");
                  return fragment;
                }
              };
            }());
            var child1 = (function() {
              var child0 = (function() {
                return {
                  isHTMLBars: true,
                  revision: "Ember@1.12.0",
                  blockParams: 0,
                  cachedFragment: null,
                  hasRendered: false,
                  build: function build(dom) {
                    var el0 = dom.createDocumentFragment();
                    var el1 = dom.createTextNode("                    ");
                    dom.appendChild(el0, el1);
                    var el1 = dom.createElement("div");
                    dom.setAttribute(el1,"style","display: inline-block; width:30px; height: 30px; background-color: red");
                    dom.appendChild(el0, el1);
                    var el1 = dom.createTextNode("\n");
                    dom.appendChild(el0, el1);
                    return el0;
                  },
                  render: function render(context, env, contextualElement) {
                    var dom = env.dom;
                    dom.detectNamespace(contextualElement);
                    var fragment;
                    if (env.useFragmentCache && dom.canClone) {
                      if (this.cachedFragment === null) {
                        fragment = this.build(dom);
                        if (this.hasRendered) {
                          this.cachedFragment = fragment;
                        } else {
                          this.hasRendered = true;
                        }
                      }
                      if (this.cachedFragment) {
                        fragment = dom.cloneNode(this.cachedFragment, true);
                      }
                    } else {
                      fragment = this.build(dom);
                    }
                    return fragment;
                  }
                };
              }());
              return {
                isHTMLBars: true,
                revision: "Ember@1.12.0",
                blockParams: 0,
                cachedFragment: null,
                hasRendered: false,
                build: function build(dom) {
                  var el0 = dom.createDocumentFragment();
                  var el1 = dom.createComment("");
                  dom.appendChild(el0, el1);
                  return el0;
                },
                render: function render(context, env, contextualElement) {
                  var dom = env.dom;
                  var hooks = env.hooks, get = hooks.get, block = hooks.block;
                  dom.detectNamespace(contextualElement);
                  var fragment;
                  if (env.useFragmentCache && dom.canClone) {
                    if (this.cachedFragment === null) {
                      fragment = this.build(dom);
                      if (this.hasRendered) {
                        this.cachedFragment = fragment;
                      } else {
                        this.hasRendered = true;
                      }
                    }
                    if (this.cachedFragment) {
                      fragment = dom.cloneNode(this.cachedFragment, true);
                    }
                  } else {
                    fragment = this.build(dom);
                  }
                  var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
                  dom.insertBoundary(fragment, null);
                  dom.insertBoundary(fragment, 0);
                  block(env, morph0, context, "if", [get(env, context, "cell.hasMine")], {}, child0, null);
                  return fragment;
                }
              };
            }());
            return {
              isHTMLBars: true,
              revision: "Ember@1.12.0",
              blockParams: 0,
              cachedFragment: null,
              hasRendered: false,
              build: function build(dom) {
                var el0 = dom.createDocumentFragment();
                var el1 = dom.createComment("");
                dom.appendChild(el0, el1);
                return el0;
              },
              render: function render(context, env, contextualElement) {
                var dom = env.dom;
                var hooks = env.hooks, get = hooks.get, block = hooks.block;
                dom.detectNamespace(contextualElement);
                var fragment;
                if (env.useFragmentCache && dom.canClone) {
                  if (this.cachedFragment === null) {
                    fragment = this.build(dom);
                    if (this.hasRendered) {
                      this.cachedFragment = fragment;
                    } else {
                      this.hasRendered = true;
                    }
                  }
                  if (this.cachedFragment) {
                    fragment = dom.cloneNode(this.cachedFragment, true);
                  }
                } else {
                  fragment = this.build(dom);
                }
                var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
                dom.insertBoundary(fragment, null);
                dom.insertBoundary(fragment, 0);
                block(env, morph0, context, "if", [get(env, context, "cell.value")], {}, child0, child1);
                return fragment;
              }
            };
          }());
          var child1 = (function() {
            var child0 = (function() {
              return {
                isHTMLBars: true,
                revision: "Ember@1.12.0",
                blockParams: 0,
                cachedFragment: null,
                hasRendered: false,
                build: function build(dom) {
                  var el0 = dom.createDocumentFragment();
                  var el1 = dom.createTextNode("                  ");
                  dom.appendChild(el0, el1);
                  var el1 = dom.createElement("div");
                  dom.setAttribute(el1,"style","display: inline-block; width:30px; height: 30px; background-color: green");
                  dom.appendChild(el0, el1);
                  var el1 = dom.createTextNode("\n");
                  dom.appendChild(el0, el1);
                  return el0;
                },
                render: function render(context, env, contextualElement) {
                  var dom = env.dom;
                  dom.detectNamespace(contextualElement);
                  var fragment;
                  if (env.useFragmentCache && dom.canClone) {
                    if (this.cachedFragment === null) {
                      fragment = this.build(dom);
                      if (this.hasRendered) {
                        this.cachedFragment = fragment;
                      } else {
                        this.hasRendered = true;
                      }
                    }
                    if (this.cachedFragment) {
                      fragment = dom.cloneNode(this.cachedFragment, true);
                    }
                  } else {
                    fragment = this.build(dom);
                  }
                  return fragment;
                }
              };
            }());
            return {
              isHTMLBars: true,
              revision: "Ember@1.12.0",
              blockParams: 0,
              cachedFragment: null,
              hasRendered: false,
              build: function build(dom) {
                var el0 = dom.createDocumentFragment();
                var el1 = dom.createComment("");
                dom.appendChild(el0, el1);
                return el0;
              },
              render: function render(context, env, contextualElement) {
                var dom = env.dom;
                var hooks = env.hooks, get = hooks.get, block = hooks.block;
                dom.detectNamespace(contextualElement);
                var fragment;
                if (env.useFragmentCache && dom.canClone) {
                  if (this.cachedFragment === null) {
                    fragment = this.build(dom);
                    if (this.hasRendered) {
                      this.cachedFragment = fragment;
                    } else {
                      this.hasRendered = true;
                    }
                  }
                  if (this.cachedFragment) {
                    fragment = dom.cloneNode(this.cachedFragment, true);
                  }
                } else {
                  fragment = this.build(dom);
                }
                var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
                dom.insertBoundary(fragment, null);
                dom.insertBoundary(fragment, 0);
                block(env, morph0, context, "if", [get(env, context, "cell.isMarked")], {}, child0, null);
                return fragment;
              }
            };
          }());
          return {
            isHTMLBars: true,
            revision: "Ember@1.12.0",
            blockParams: 1,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createComment("");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement, blockArguments) {
              var dom = env.dom;
              var hooks = env.hooks, set = hooks.set, get = hooks.get, block = hooks.block;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
              dom.insertBoundary(fragment, null);
              dom.insertBoundary(fragment, 0);
              set(env, context, "tableCell", blockArguments[0]);
              block(env, morph0, context, "if", [get(env, context, "cell.isOpened")], {}, child0, child1);
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          revision: "Ember@1.12.0",
          blockParams: 1,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement, blockArguments) {
            var dom = env.dom;
            var hooks = env.hooks, set = hooks.set, get = hooks.get, block = hooks.block;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
            dom.insertBoundary(fragment, null);
            dom.insertBoundary(fragment, 0);
            set(env, context, "cell", blockArguments[0]);
            block(env, morph0, context, "table-cell", [], {"model": get(env, context, "cell"), "isMinesLoaded": get(env, context, "isMinesLoaded"), "oncontextmenu": get(env, context, "rightClicked")}, child0, null);
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("tr");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          set(env, context, "row", blockArguments[0]);
          block(env, morph0, context, "each", [get(env, context, "row")], {}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h2");
        dom.setAttribute(el1,"id","title");
        var el2 = dom.createTextNode("Minesweeper");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-md-4");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-md-4");
        var el3 = dom.createTextNode("noOfMarkedCells: ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-md-4");
        var el3 = dom.createElement("a");
        var el4 = dom.createTextNode("Open All Cells");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-md-6");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("table");
        dom.setAttribute(el3,"border","0");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("tbody");
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, element = hooks.element, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [2]);
        var element1 = dom.childAt(element0, [5, 0]);
        var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),0,0);
        var morph1 = dom.createMorphAt(dom.childAt(element0, [3]),1,1);
        var morph2 = dom.createMorphAt(dom.childAt(fragment, [4, 1, 1, 1]),1,1);
        var morph3 = dom.createMorphAt(fragment,6,6,contextualElement);
        content(env, morph0, context, "noOfBugs");
        content(env, morph1, context, "noOfMarkedCells");
        element(env, element1, context, "action", ["openAllCells"], {});
        block(env, morph2, context, "each", [get(env, context, "model")], {}, child0, null);
        content(env, morph3, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('minesweeper/tests/app.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('app.js should pass jshint', function() { 
    ok(true, 'app.js should pass jshint.'); 
  });

});
define('minesweeper/tests/components/table-cell.jshint', function () {

  'use strict';

  module('JSHint - components');
  test('components/table-cell.js should pass jshint', function() { 
    ok(true, 'components/table-cell.js should pass jshint.'); 
  });

});
define('minesweeper/tests/controllers/application.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/application.js should pass jshint', function() { 
    ok(true, 'controllers/application.js should pass jshint.'); 
  });

});
define('minesweeper/tests/helpers/resolver', ['exports', 'ember/resolver', 'minesweeper/config/environment'], function (exports, Resolver, config) {

  'use strict';

  var resolver = Resolver['default'].create();

  resolver.namespace = {
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix
  };

  exports['default'] = resolver;

});
define('minesweeper/tests/helpers/resolver.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/resolver.js should pass jshint', function() { 
    ok(true, 'helpers/resolver.js should pass jshint.'); 
  });

});
define('minesweeper/tests/helpers/start-app', ['exports', 'ember', 'minesweeper/app', 'minesweeper/router', 'minesweeper/config/environment'], function (exports, Ember, Application, Router, config) {

  'use strict';



  exports['default'] = startApp;
  function startApp(attrs) {
    var application;

    var attributes = Ember['default'].merge({}, config['default'].APP);
    attributes = Ember['default'].merge(attributes, attrs); // use defaults, but you can override;

    Ember['default'].run(function () {
      application = Application['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }

});
define('minesweeper/tests/helpers/start-app.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/start-app.js should pass jshint', function() { 
    ok(true, 'helpers/start-app.js should pass jshint.'); 
  });

});
define('minesweeper/tests/models/tile.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/tile.js should pass jshint', function() { 
    ok(true, 'models/tile.js should pass jshint.'); 
  });

});
define('minesweeper/tests/router.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('router.js should pass jshint', function() { 
    ok(true, 'router.js should pass jshint.'); 
  });

});
define('minesweeper/tests/routes/application.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/application.js should pass jshint', function() { 
    ok(true, 'routes/application.js should pass jshint.'); 
  });

});
define('minesweeper/tests/test-helper', ['minesweeper/tests/helpers/resolver', 'ember-qunit'], function (resolver, ember_qunit) {

	'use strict';

	ember_qunit.setResolver(resolver['default']);

});
define('minesweeper/tests/test-helper.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('test-helper.js should pass jshint', function() { 
    ok(true, 'test-helper.js should pass jshint.'); 
  });

});
define('minesweeper/tests/unit/models/tile-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('tile', 'Unit | Model | tile', {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test('it exists', function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('minesweeper/tests/unit/models/tile-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/tile-test.js should pass jshint', function() { 
    ok(true, 'unit/models/tile-test.js should pass jshint.'); 
  });

});
/* jshint ignore:start */

/* jshint ignore:end */

/* jshint ignore:start */

define('minesweeper/config/environment', ['ember'], function(Ember) {
  var prefix = 'minesweeper';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

if (runningTests) {
  require("minesweeper/tests/test-helper");
} else {
  require("minesweeper/app")["default"].create({"name":"minesweeper","version":"0.0.0.57453066"});
}

/* jshint ignore:end */
//# sourceMappingURL=minesweeper.map