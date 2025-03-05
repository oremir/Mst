Mst.Signpost = function (game_state, name, position, properties) {
    "use strict";
    Mst.Prefab.call(this, game_state, name, position, properties);
    
    this.game_state.game.physics.arcade.enable(this);
    
    this.owner = properties.owner;
    this.signpost_text = properties.text;
    this.signpost_alt = properties.alt;
    this.stype = properties.stype;
    
    this.is_takeable = properties.is_takeable;
    if (typeof(this.is_takeable) === 'string') {
        this.is_takeable = (properties.is_takeable === 'true');
    } else {
        if (typeof(properties.is_takeable) !== 'undefined') {
            this.is_takeable = false;
        }
    }
    
    this.exposed = false;
    
    this.anchor.setTo(0.5);
    this.body.immovable = true;
};

Mst.Signpost.prototype = Object.create(Mst.Prefab.prototype);
Mst.Signpost.prototype.constructor = Mst.Signpost;

Mst.Signpost.prototype.update = function () {
    "use strict";
    
    if (this.game_state.game.physics.arcade.distanceBetween(this, this.game_state.prefabs.player) > 22 && this.game_state.prefabs.player.cPlayer.signpost.opened) {
        if (this.game_state.prefabs.player.cPlayer.signpost.opened.name === this.name) {
            console.log(this.game_state.game.physics.arcade.distanceBetween(this, this.game_state.prefabs.player));
            console.log("Signpost is too far!");
            console.log("Signpost closed");
            this.game_state.prefabs.player.cPlayer.signpost.close();
        }
    }
};
