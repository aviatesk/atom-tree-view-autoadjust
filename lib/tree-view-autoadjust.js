const { CompositeDisposable } = require('atom');

module.exports = {
  subscriptions: null,
  treePanel: null,
  conf: [],
  delayMs: 100,
  scrollbarWidth: require('scrollbar-width')(),

  activate: function() {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      atom.packages.onDidActivatePackage(pkg => {
        if (pkg.name !== 'tree-view') return;
        if (!pkg.mainModule.treeView) pkg.mainModule.createOrDestroyTreeViewIfNeeded()
        this.treePanel = pkg.mainModule.treeView.element;
        this.treePanel.style.width = null;
        this.initTreeViewEvents();
        this.resizeTreeView();
        this.observe('minimumWidth');
        this.observe('maximumWidth');
        this.observe('padding');
        this.observe('animationMilliseconds');
        this.observe('delayMilliseconds', false);
      })
    );
  },

  deactivate: function() {
    if (this.treePanel) {
      this.treePanel.removeEventListener('click', this.bindClick);
      this.treePanel = null;
    }
    if (this.subscriptions) {
      this.subscriptions.dispose();
      this.subscriptions = null;
    }
  },

  resizeTreeView: function() {
    setTimeout((function(_this) {
      return function() {
        if (_this.isInLeft()) {
          return atom.workspace.getLeftDock().handleResizeToFit();
        } else {
          return atom.workspace.getRightDock().handleResizeToFit();
        }
      };
    })(this), this.conf['delayMilliseconds']);
  },

  onClickDirectory: function(e) {
    var node;
    node = e.target;
    while (node !== null && node !== this.treePanel) {
      if (node.classList.contains('directory')) {
        this.resizeTreeView();
        return;
      }
      node = node.parentNode;
    }
  },

  isInLeft: function() {
    var node, ref;
    node = this.treePanel.parentNode;
    while (node !== null) {
      if ((ref = node.classList) != null ? ref.contains('left') : void 0) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  },

  setStyles: function() {
    var css;
    if (!this.style) {
      this.style = document.createElement('style');
      this.style.type = 'text/css';
    }
    css = this.generateCss();
    this.style.innerHTML = css;
    return document.body.appendChild(this.style);
  },

  observe: function(key, updateStyles) {
    if (updateStyles == null) {
      updateStyles = true;
    }
    return this.subscriptions.add(atom.config.observe("tree-view-autoadjust." + key, (function(_this) {
      return function(value) {
        _this.conf[key] = value;
        if (updateStyles) {
          return _this.setStyles();
        }
      };
    })(this)));
  },

  initTreeViewEvents: function() {
    this.bindClick = this.onClickDirectory.bind(this);
    this.treePanel.addEventListener('click', this.bindClick);
    this.subscriptions.add(atom.project.onDidChangePaths(((function(_this) {
      return function() {
        return _this.resizeTreeView();
      };
    })(this))));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'tree-view:reveal-active-file': (function(_this) {
        return function() {
          return _this.resizeTreeView();
        };
      })(this),
      'tree-view:toggle': (function(_this) {
        return function() {
          return _this.resizeTreeView();
        };
      })(this),
      'tree-view:show': (function(_this) {
        return function() {
          return _this.resizeTreeView();
        };
      })(this)
    }));
    return this.subscriptions.add(atom.commands.add('.tree-view', {
      'tree-view:open-selected-entry': (function(_this) {
        return function() {
          return _this.resizeTreeView();
        };
      })(this),
      'tree-view:expand-item': (function(_this) {
        return function() {
          return _this.resizeTreeView();
        };
      })(this),
      'tree-view:recursive-expand-directory': (function(_this) {
        return function() {
          return _this.resizeTreeView();
        };
      })(this),
      'tree-view:collapse-directory': (function(_this) {
        return function() {
          return _this.resizeTreeView();
        };
      })(this),
      'tree-view:recursive-collapse-directory': (function(_this) {
        return function() {
          return _this.resizeTreeView();
        };
      })(this),
      'tree-view:move': (function(_this) {
        return function() {
          return _this.resizeTreeView();
        };
      })(this),
      'tree-view:cut': (function(_this) {
        return function() {
          return _this.resizeTreeView();
        };
      })(this),
      'tree-view:paste': (function(_this) {
        return function() {
          return _this.resizeTreeView();
        };
      })(this),
      'tree-view:toggle-vcs-ignored-files': (function(_this) {
        return function() {
          return _this.resizeTreeView();
        };
      })(this),
      'tree-view:toggle-ignored-names': (function(_this) {
        return function() {
          return _this.resizeTreeView();
        };
      })(this),
      'tree-view:remove-project-folder': (function(_this) {
        return function() {
          return _this.resizeTreeView();
        };
      })(this)
    }));
  },

  generateCss: function() {
    let css = `
      atom-dock.left  .atom-dock-open .atom-dock-content-wrapper:not(:active),
      atom-dock.left  .atom-dock-open .atom-dock-mask:not(:active),
      atom-dock.right .atom-dock-open .atom-dock-content-wrapper:not(:active),
      atom-dock.right .atom-dock-open .atom-dock-mask:not(:active) {
        transition: width ${this.conf['animationMilliseconds']}ms linear;
      }
    `;

    if (this.conf['minimumWidth'] > 0) {
      if (this.isInLeft()) {
        css += `
          atom-dock.left .atom-dock-open .atom-dock-mask,
          atom-dock.left .atom-dock-open .atom-dock-mask .atom-dock-content-wrapper {
            min-width: ${this.conf['minimumWidth']}px;
          }
        `;
      } else {
        css += `
          atom-dock.right .atom-dock-open .atom-dock-mask,
          atom-dock.right .atom-dock-open .atom-dock-mask .atom-dock-content-wrapper {
            min-width: ${this.conf['minimumWidth']}px;
          }
        `;
      }
    }

    if (this.conf['maximumWidth'] > 0) {
      if (this.isInLeft()) {
        css += `
          atom-dock.left .atom-dock-open .atom-dock-mask,
          atom-dock.left .atom-dock-open .atom-dock-mask .atom-dock-content-wrapper {
            max-width: ${this.conf['maximumWidth']}px;
          }
        `;
      } else {
        css += `
          atom-dock.right .atom-dock-open .atom-dock-mask,
          atom-dock.right .atom-dock-open .atom-dock-mask .atom-dock-content-wrapper {
            max-width: ${this.conf['maximumWidth']}px;
          }
        `;
      }
    }

    css += `
      atom-dock.left  .tree-view .full-menu,
      atom-dock.right .tree-view .full-menu {
        padding-right: ${this.conf['padding'] + this.scrollbarWidth}px;
      }
      atom-dock.left  .tree-view,
      atom-dock.right .tree-view {
        overflow-x: hidden;
      }
    `;

    return css;
  }
};
