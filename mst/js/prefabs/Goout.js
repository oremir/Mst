var Mst = Mst || {};

Mst.Goout = function (game_state, name, position, properties) {
    "use strict";
    Mst.Prefab.call(this, game_state, name, position, properties);
    
    this.next_map = +properties.next_map;
    this.go_position = {
        x: +properties.go_position_x,
        y: +properties.go_position_y
    };
    
    this.locked = false;
    this.key_permit = "";
    this.key_level = 0;
    this.key_obj_id = 0;
    this.permit_type = "";
    if (typeof (properties.locked) !== 'undefined') {
        this.locked = (properties.locked === 'true');
        this.key_permit = properties.key_permit;
        this.key_level = parseInt(properties.key_level);
        this.key_obj_id = parseInt(properties.key_obj_id);
        this.permit_type = properties.permit_type;
    }
    
    this.game_state = game_state;
    
    this.game_state.game.physics.arcade.enable(this);
    
    this.anchor.setTo(0.5);
    
    this.body.immovable = true;
    
    this.notupdated = true;
};

Mst.Goout.prototype = Object.create(Mst.Prefab.prototype);
Mst.Goout.prototype.constructor = Mst.Goout;

Mst.Goout.prototype.update = function () {
    "use strict";
    
    this.game_state.game.physics.arcade.overlap(this, this.game_state.prefabs.player, this.go_out, null, this);
};

Mst.Goout.prototype.go_out = function () {
    "use strict";
    // start the next map
    
    var new_int = parseInt(this.next_map);
    
    if (this.notupdated) {
        this.notupdated = false;
        if (!this.locked) {
            this.game_state.save_data(this.go_position, new_int, "goout");
        } else {
            this.game_state.hud.alert.show_alert("Zamčeno!");
        }        
    }
};

