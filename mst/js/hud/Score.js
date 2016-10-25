var Phaser = Phaser || {};
var Mst = Mst || {};

Mst.Score = function (game_state, position, properties) {
    "use strict";
    Phaser.Text.call(this, game_state.game, position.x, position.y, properties.text);
    
    this.game_state = game_state;
    
    this.game_state.groups[properties.group].add(this);
    
    this.fixedToCamera = true;
};

Mst.Score.prototype = Object.create(Phaser.Text.prototype);
Mst.Score.prototype.constructor = Mst.Score;

Mst.Score.prototype.update = function () {
    "use strict";
    // update text to player current score
    this.text = "Health: " + this.game_state.prefabs.player.health;
};
