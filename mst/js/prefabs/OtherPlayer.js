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
    
    if (typeof (properties.ren_texture) === 'undefined') {
        properties.ren_texture = "";
    }
    
    if (typeof (properties.gender) === 'undefined') {
        properties.gender = "";
    }
    
    this.gender = properties.gender;
    
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
    this.num_of_hits = 0;
    this.player_hit_not_delay = true;
    
    // Call Ren
    
    var ren_name, ren_texture;
    
    ren_name = name+"_ren";
    
    if (properties.ren_texture === "") {
        if (this.gender === "male") {
            ren_texture = "male_ren";
        } else {
            ren_texture = "female_ren";
        }  
    } else {
        ren_texture = properties.ren_texture;
    }
    
    
    this.ren_sprite =  new Mst.Ren(this.game_state, ren_name, {x: 0, y:20}, {
        group: "ren", 
        texture: ren_texture, 
        p_name: name, // this.p_name
        dialogue_name: name
    });

    this.ren_sprite.visible = false;
    
    this.bubble = this.game_state.groups.bubbles.create(this.x, this.y - 16, 'bubble_spritesheet', 0);
    this.bubble.anchor.setTo(0.5);
    this.bubble.inputEnabled = true;
    this.bubble.events.onInputDown.add(this.hide_bubble, this);
    this.bubble.visible = false;
    this.bubble_showed = false;

    this.o_type = "otherPlayer";
    this.inputEnabled = true;
    this.input.useHandCursor = true;
    this.events.onInputOver.add(this.game_state.hud.alt.show_alt, this);
    this.events.onInputOut.add(this.game_state.hud.alt.hide_alt, this);
    
    
    
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
    
    if (Math.abs(this.body.velocity.x) > 7) {
        this.body.velocity.x *= 0.96;
    } else {
        this.body.velocity.x = 0;
    }
    
    if (Math.abs(this.body.velocity.y) > 7) {
        this.body.velocity.y *= 0.96;
    } else {
        this.body.velocity.y = 0;
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
    
    if (type === 0) {
        this.game_state.game.time.events.add(Phaser.Timer.SECOND * 2, this.hide_bubble, this);
    }
};

Mst.OtherPlayer.prototype.hide_bubble = function () {
    "use strict";
    this.bubble_showed = false;
    console.log("Bubble hide");
    
    this.bubble.visible = false;
};

Mst.OtherPlayer.prototype.collide_with_player = function (player) {
    "use strict";
    var pom_hits;
    
    if (this.player_hit_not_delay) {
        this.player_hit_not_delay = false;
        
        this.num_of_hits ++;
        pom_hits = this.num_of_hits % 3;
        console.log("NoHits:" + this.num_of_hits + " Mod: " + pom_hits);
        
        switch (pom_hits) {
            case 1:
                this.show_bubble(0); // question
                break;
                
            case 2:
                if (!this.ren_sprite.visible) {
                    player.set_opened_ren(this.name);
                    console.log("Op.ren: " + this.name);
                    if (player.gender === "male") {                        
                        this.ren_sprite.show_dialogue("Dobrý den, co byste potřeboval?");
                    } else {
                        this.ren_sprite.show_dialogue("Dobrý den, co byste potřebovala?");
                    }
                }
                break;
                
            case 0:
                player.no_pass_OP = false;
                break;
        }
    
        
        
        this.game_state.game.time.events.add(Phaser.Timer.SECOND * 1.5, this.collide_with_player_delay, this);
    }
    
    
};

Mst.OtherPlayer.prototype.collide_with_player_delay = function () {
    "use strict";    
    this.player_hit_not_delay = true;
    this.game_state.prefabs.player.no_pass_OP = true;
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

Mst.OtherPlayer.prototype.hide_ren = function () {
    "use strict";
    this.ren_sprite.hide();
};
