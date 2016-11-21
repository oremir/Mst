var Phaser = Phaser || {};
var Mst = Mst || {};

Mst.Quest = function (game_state, name, position, properties) {
    "use strict";
    Mst.Prefab.call(this, game_state, name, position, properties);
    
    
};

Mst.Quest.prototype = Object.create(Mst.Prefab.prototype);
Mst.Quest.prototype.constructor = Mst.Quest;

Mst.Quest.prototype.update = function () {
    "use strict";
    
    
};
