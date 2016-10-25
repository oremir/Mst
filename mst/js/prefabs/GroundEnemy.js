var Phaser = Phaser || {};
var Mst = Mst || {};

Mst.GroundEnemy = function (game_state, position, properties) {
    "use strict";
    Mst.Enemy.call(this, game_state, position, properties);
};

Mst.GroundEnemy.prototype = Object.create(Mst.Enemy.prototype);
Mst.GroundEnemy.prototype.constructor = Mst.GroundEnemy;

Mst.GroundEnemy.prototype.update = function () {
    "use strict";
    Mst.Enemy.prototype.update.call(this);
};

