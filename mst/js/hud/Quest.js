var Phaser = Phaser || {};
var Mst = Mst || {};

Mst.Quest = function (game_state, name, position, properties) {
    "use strict";
    Mst.Prefab.call(this, game_state, name, position, properties);
    
    this.owner = properties.owner;
    this.starting_conditions = properties.starting_conditions;
    this.ending_conditions = properties.ending_conditions;
    this.assigned = properties.assigned;
    
    
};

Mst.Quest.prototype = Object.create(Mst.Prefab.prototype);
Mst.Quest.prototype.constructor = Mst.Quest;

Mst.Quest.prototype.update = function () {
    "use strict";
    
    
};
