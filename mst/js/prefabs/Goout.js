var Mst = Mst || {};

Mst.Goout = function (game_state, name, position, properties) {
    "use strict";
    Mst.Prefab.call(this, game_state, name, position, properties);
    
    this.next_map = properties.next_map;
    this.go_position = properties.go_position;
    
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
    
    var new_splited = this.next_map.split("/");
    var new_new = new_splited[new_splited.length - 1];
    new_splited = new_new.split(".");
    new_new = new_splited[0];
    new_new = new_new.slice(3, new_new.length);    
    var new_int = parseInt(new_new);
    
    if (this.notupdated) {
        this.notupdated = false;
        this.game_state.save_data(this.go_position, new_int, "goout");
    }
};

