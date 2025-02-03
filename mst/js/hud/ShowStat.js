Mst.ShowStat = function (game_state, name, position, properties) {
    "use strict";
    Mst.Prefab.call(this, game_state, name, position, properties);
    
    this.stat_to_show = properties.stat_to_show;
};

Mst.ShowStat.prototype = Object.create(Mst.Prefab.prototype);
Mst.ShowStat.prototype.constructor = Mst.ShowStat;

Mst.ShowStat.prototype.update = function () {
    "use strict";
    var prefab_name, stat_name, new_stat;
    prefab_name = this.stat_to_show.split(".")[0];
    stat_name = this.stat_to_show.split(".")[1];
    
    if (typeof (this.game_state.prefabs[prefab_name]) !== 'undefined') {
        new_stat = this.game_state.prefabs[prefab_name].stats[stat_name];
        // check if the stat has changed
        if (this.stat !== new_stat) {
            // update the stat with the new value
            this.update_stat(new_stat);
        }
    }
};

Mst.ShowStat.prototype.update_stat = function (new_stat) {
    "use strict";
    this.stat = new_stat;
};