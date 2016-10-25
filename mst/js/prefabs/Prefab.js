var Phaser = Phaser || {};
var Mst = Mst || {};

Mst.Prefab = function (game_state, name, position, properties) {
    "use strict";
    Phaser.Sprite.call(this, game_state.game, position.x, position.y, properties.texture, properties.firstframe);
            
    
    //console.log("W "+properties.texture);
    
    this.game_state = game_state;
    
    this.pool = properties.pool || properties.group;
    
    //console.log(properties);
    
    //console.log(name+" "+this.pool+" "+properties.group+" "+properties.texture);
    
    this.game_state.groups[this.pool].add(this);
    
    this.game_state.prefabs[name] = this;
    this.name = name;
};

Mst.Prefab.prototype = Object.create(Phaser.Sprite.prototype);
Mst.Prefab.prototype.constructor = Mst.Prefab;