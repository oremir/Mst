Mst.Prefab = function (game_state, name, position, properties) {
    "use strict";
    
    //console.log(position);

    if (typeof(properties.texture) === 'undefined') {
        properties.texture = "blank_image";
    }
    
    Phaser.Sprite.call(this, game_state.game, position.x, position.y, properties.texture, properties.firstframe);
            
    
    //console.log("W "+properties.texture);
    
    this.game_state = game_state;
    
    this.group = properties.pool || properties.group;
    
    //console.log(properties);
    
    //console.log(name+" "+this.pool+" "+properties.group+" "+properties.texture);
    
    this.game_state.mGame.groups[this.group].add(this);
    
    this.game_state.prefabs[name] = this;
    this.name = name;
    
    //console.log(this);
};

Mst.Prefab.prototype = Object.create(Phaser.Sprite.prototype);
Mst.Prefab.prototype.constructor = Mst.Prefab;
