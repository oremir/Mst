Mst.Bed = function (game_state, name, position, properties) {
    "use strict";
    Mst.Prefab.call(this, game_state, name, position, properties);
    
    this.game_state.game.physics.arcade.enable(this);
    this.body.immovable = true;
    this.anchor.setTo(0.5);
    
    this.owner = properties.owner;
    
    this.is_takeable = properties.is_takeable;
    if (typeof(this.is_takeable) === 'string') {
        this.is_takeable = (properties.is_takeable === 'true');
    } else {
        if (typeof(properties.is_takeable) !== 'undefined') this.is_takeable = false;
    }
    
    this.mw_context = "bed";    
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
        var succ = this.game_state.hud.middle_window.show_mw("Chcete se vyspat?", this, ["yes", "no"]);
        if (succ) {
            this.hited = true;
        }
    } 
    
};

Mst.Bed.prototype.option_yes = function () {
    "use strict";
    
    console.log("Option YES");
    
    const player = this.game_state.prefabs.player;
    let constitution = Math.ceil(parseInt(player.stats.abilities.constitution)/2 + 50);
    let health = Math.ceil(parseInt(player.stats.health_max)*0.8);
    let stress = Math.ceil(parseInt(player.stats.stress)*0.8);
    if (constitution < 100) constitution = 100;
    if (constitution > health) health = constitution;
    if (constitution > stress) stress = constitution;
    
    player.add_health(health);
    player.subtract_stress(stress);
    player.new_day();
    this.game_state.prefabs.moon.subtract_moon();
    this.game_state.save_data({ "x": player.x-8, "y": player.y+8 }, this.game_state.gdata.map.map.map_int, "lodging");

};

Mst.Bed.prototype.option_no = function () {
    "use strict";
    
    console.log("Option NO");
    this.hited = false;
};

Mst.Bed.prototype.option_ok = function () {
    "use strict";
    
    console.log("Option OK");
    this.hited = false;
};
