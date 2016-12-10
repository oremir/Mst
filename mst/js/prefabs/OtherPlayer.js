var Mst = Mst || {};

Mst.OtherPlayer = function (game_state, name, position, properties) {
    "use strict";
    
    //console.log(position);
    
    Mst.Prefab.call(this, game_state, name, position, properties);
    
    this.game_state.game.physics.arcade.enable(this);
    
    this.game_state.groups["otherplayers"].add(this);
    
//    this.stats = {
//        items: properties.items
//    };
    
    console.log("other player");
    //console.log(this.game_state.groups["otherplayers"]);
    
    
    this.region = properties.region;
    this.p_name = properties.p_name;
    
    var key;
    key = this.game_state.keyOfName(this.name);
    
    this.save = {
        type: "player",
        name: name,        
        usr_id: this.game_state.save.objects[key].usr_id,
        x: (position.x - (this.game_state.map.tileHeight / 2)),
        y: (position.y + (this.game_state.map.tileHeight / 2)),
        properties: properties
    }
    
    //this.body.immovable = true;
    this.frame = 0;
    this.body.setSize(11, 14, 2.5, 5);
    this.anchor.setTo(0.5);
    
    this.updated = false;
    
    this.bubble = this.game_state.groups.bubbles.create(this.x, this.y - 16, 'bubble_spritesheet', 0);
    this.bubble.anchor.setTo(0.5);
    this.bubble.inputEnabled = true;
    this.bubble.events.onInputDown.add(this.hide_bubble, this);
    this.bubble.visible = false;
    this.bubble_showed = false;
    
    
    
};

Mst.OtherPlayer.prototype = Object.create(Mst.Prefab.prototype);
Mst.OtherPlayer.prototype.constructor = Mst.OtherPlayer;

Mst.OtherPlayer.prototype.update = function () {
    "use strict";
    
    this.game_state.game.physics.arcade.collide(this, this.game_state.layers.collision);
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.enemies);
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.chests);
    
    if (this.bubble_showed) {
        this.bubble.x = this.x;
        this.bubble.y = this.y - 16;
    }
    
    if (this.updated) {
        
        this.save.properties.items = this.stats.items;
        
        this.updated = false;
    }
};

Mst.OtherPlayer.prototype.show_bubble = function (type) {
    "use strict";
    this.bubble_showed = true;
    
    this.bubble.loadTexture('bubble_spritesheet', type);
    this.bubble.visible = true;
    
    this.game_state.game.time.events.add(Phaser.Timer.SECOND * 2, this.hide_bubble, this);
};

Mst.OtherPlayer.prototype.hide_bubble = function () {
    "use strict";
    this.bubble_showed = false;
    console.log("Bubble hide");
    
    this.bubble.visible = false;
};



Mst.OtherPlayer.prototype.save_player = function () {
    "use strict";
    var key;
    
    this.save.x = this.x - (this.game_state.map.tileHeight / 2);
    this.save.y = this.y + (this.game_state.map.tileHeight / 2);
    
    key = this.game_state.keyOfName(this.name);
    
    //console.log(key);

    if (key != "") {
        this.game_state.save.objects[key] = this.save;
    } else {
        this.game_state.save.objects.push(this.save);
    }

    console.log(this.game_state.save.objects);

};
