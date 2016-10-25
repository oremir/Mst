var Phaser = Phaser || {};
var Mst = Mst || {};

Mst.EnemySpawner = function (game_state, name, position, properties) {
    "use strict";
    
    
    Mst.Spawner.call(this, game_state, name, position, properties);
    
    this.frames = properties.frames;
};

Mst.EnemySpawner.prototype = Object.create(Mst.Spawner.prototype);
Mst.EnemySpawner.prototype.constructor = Mst.EnemySpawner;

Mst.EnemySpawner.prototype.create_object = function (name, position, properties) {
    "use strict";
    // return new Enemy with random frame
    return new Mst.Enemy(this.game_state, name, position, properties);
};