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
    var max;
    
    // return new Enemy with random frame
    console.log("Spawner level: " + this.level);
    
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
        case 4:
            properties.texture = "spider_spritesheet";
        break;
        default:
            properties.texture = "slime_spritesheet";
        break;
    }
    
    console.log(this.spec);
    
    if (this.spec !== '') {
        properties.texture = "spider_spritesheet";
    }
    
    console.log(properties.texture);
    
    properties.group = "enemies";
    properties.pool = "enemies";
    
    return new Mst.Enemy(this.game_state, name, position, properties);
};