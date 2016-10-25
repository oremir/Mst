var Mst = Mst || {};

Mst.Chest = function (game_state, name, position, properties) {
    "use strict";
    Mst.Prefab.call(this, game_state, name, position, properties);
    
    this.game_state = game_state;    
    this.game_state.game.physics.arcade.enable(this);
    
    this.stats = {
        items: properties.items
    };
    
    this.body.immovable = true;
    this.frame = 0;
    this.anchor.setTo(0.5);
};

Mst.Chest.prototype = Object.create(Mst.Prefab.prototype);
Mst.Chest.prototype.constructor = Mst.Chest;

Mst.Chest.prototype.update = function () {
    "use strict";

    if (this.game_state.game.physics.arcade.distanceBetween(this, this.game_state.prefabs.player) > 20) {
        this.chest_close();
    }
    
    
};

Mst.Chest.prototype.chest_close = function () {
    "use strict";
    
    this.frame = 0; 
    this.game_state.prefabs.chestitems.kill_stats();
    this.game_state.prefabs.player.opened_chest = "";
};

Mst.Chest.prototype.chest_empty = function () {
    "use strict";
    
    
    
    
};