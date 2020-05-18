var Phaser = Phaser || {};
var Mst = Mst || {};

Mst.Bed = function (game_state, name, position, properties) {
    "use strict";
    Mst.Prefab.call(this, game_state, name, position, properties);
    
    this.game_state.game.physics.arcade.enable(this);
    
    this.owner = properties.owner;
    
    if (typeof(properties.is_takeable) !== 'undefined') {
        this.is_takeable = (properties.is_takeable === 'true');
    } else {
        this.is_takeable = true;
    }
};

Mst.Bed.prototype = Object.create(Mst.Prefab.prototype);
Mst.Bed.prototype.constructor = Mst.Bed;

Mst.Bed.prototype.update = function () {
    "use strict";
    
    
};

Mst.Bed.prototype.open_collision = function (player) {
    "use strict";
    
    console.log("Open collision: Bed")
    
    this.game_state.hud.middle_window.show_mw("Chcete se vyspat?");
};
