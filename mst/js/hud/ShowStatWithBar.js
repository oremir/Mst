var Engine = Engine || {};
var Mst = Mst || {};

Mst.ShowStatWithBar = function (game_state, name, position, properties) {
    "use strict";
    Mst.ShowStat.call(this, game_state, name, position, properties);
};

Mst.ShowStatWithBar.prototype = Object.create(Mst.ShowStat.prototype);
Mst.ShowStatWithBar.prototype.constructor = Mst.ShowStatWithBar;

Mst.ShowStatWithBar.prototype.update_stat = function (new_stat) {
    "use strict";
    Mst.ShowStat.prototype.update_stat.call(this, new_stat);
    // use the stat to define the bar size
    this.scale.setTo(this.stat, 2);
};
