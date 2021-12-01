var Phaser = Phaser || {};
var Mst = Mst || {};

Mst.Bed = function (game_state, name, position, properties) {
    "use strict";
    Mst.Prefab.call(this, game_state, name, position, properties);
    
    this.game_state.game.physics.arcade.enable(this);
    this.body.immovable = true;
    this.anchor.setTo(0.5);
    
    this.owner = properties.owner;
    
    this.is_takeable = properties.is_takeable;
    if (typeof(this.is_takeable) === 'string') {
        this.is_takeable = (properties.is_takeable === 'true')
    } else {
        if (typeof(properties.is_takeable) !== 'undefined') {
            this.is_takeable = false;
        }
    }
    
    this.hited = false;
};

Mst.Bed.prototype = Object.create(Mst.Prefab.prototype);
Mst.Bed.prototype.constructor = Mst.Bed;

Mst.Bed.prototype.update = function () {
    "use strict";
    
    
};

Mst.Bed.prototype.open_collision = function (player) {
    "use strict";
    
    console.log("Open collision: Bed");
    
    if (!this.hited) {
        this.hited = true;
        this.game_state.hud.middle_window.show_mw("Chcete se vyspat?", this, ["yes", "no"]);
    } 
    
};

Mst.Bed.prototype.option_yes = function () {
    "use strict";
    
    console.log("Option YES");
    
    var index_gold, cost, constitution, player;
    
    player = this.game_state.prefabs.player;
    console.log(player);
    constitution = parseInt(player.stats.abilities.constitution)/2 + 50;
    if (constitution < 100) {constitution = 100;}
    
    player.add_health(constitution);
    player.subtract_stress(constitution);
    player.new_day();
    this.game_state.prefabs.moon.subtract_moon();
    this.game_state.save_data({ "x": player.x-8, "y": player.y+8 }, this.game_state.map_data.map.map_int, "lodging");

};

Mst.Bed.prototype.option_no = function () {
    "use strict";
    
    console.log("Option NO");
    this.hited = false;
};
