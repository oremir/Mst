var Phaser = Phaser || {};
var Mst = Mst || {};

Mst.EnemySpawner = function (game_state, name, position, properties) {
    "use strict";
    
    var max_level = 3;
    
    
    Mst.Spawner.call(this, game_state, name, position, properties);
    
    this.frames = properties.frames;
    if (typeof(properties.level) !== 'undefined') {
        if (properties.level > max_level) {
            this.level = max_level;
        } else {
            this.level = properties.level;
        }
    } else {
        this.level = max_level;
    }
};

Mst.EnemySpawner.prototype = Object.create(Mst.Spawner.prototype);
Mst.EnemySpawner.prototype.constructor = Mst.EnemySpawner;

Mst.EnemySpawner.prototype.create_object = function (name, position, properties) {
    "use strict";
    var max;
    
    // return new Enemy with random frame
    
    switch (this.game_state.game.rnd.between(1, this.level)) {
        case 1:
            properties.texture = "slime_spritesheet";
        break;
        case 2:
            properties.texture = "rabite_spritesheet";
        break;
        case 3:
            properties.texture = "wasp_spritesheet";
        break;
        default:
            properties.texture = "slime_spritesheet";
        break;
    }
    
    return new Mst.Enemy(this.game_state, name, position, properties);
};