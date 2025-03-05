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
        const succ = this.game_state.cGame.hud.middle_window.open("Chcete se vyspat?", this, ["yes", "no"]);
        if (succ) this.hited = true;
    } 
    
};

Mst.Bed.prototype.option_yes = function () {
    "use strict";
    
    console.log("Option YES");    
    this.game_state.prefabs.player.mPlayer.sleep();
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
