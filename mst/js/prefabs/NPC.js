var Mst = Mst || {};

Mst.NPC = function (game_state, name, position, properties) {
    "use strict";
    
    //console.log(position);
    
    Mst.Prefab.call(this, game_state, name, position, properties);
    
    this.game_state.game.physics.arcade.enable(this);
    
//    this.stats = {
//        items: properties.items
//    };
    
    console.log("NPC");
    //console.log(this);
    
    this.unique_id = properties.unique_id;
    this.p_name = properties.p_name;
    this.relations_allowed = (properties.relations_allowed === 'true');
    this.region = properties.region;
    
    this.stats = {
        items: properties.items || ""
    };
    
    this.save = {
        type: "NPC",
        name: name,
        x: (position.x - (this.game_state.map.tileHeight / 2)),
        y: (position.y + (this.game_state.map.tileHeight / 2)),
        properties: properties
    }
    
    this.body.immovable = true;
    this.frame = 0;
    this.body.setSize(16, 16, 2.5, parseInt(properties.offset));
    this.anchor.setTo(0.5);
    
    this.updated = false;
    
    
    // Call Ren
    
    var ren_name;
    
    ren_name = name+"_ren";
    
    this.ren_sprite =  new Mst.Ren(this.game_state, ren_name, {x: 0, y:20}, {
        group: "ren", 
        texture: ren_name, 
        p_name: this.p_name, 
        dialogue_name: this.name
    });

    this.ren_sprite.visible = false;
    
    this.bubble = this.game_state.groups.bubbles.create(this.x, this.y - 16, 'bubble_spritesheet', 0);
    this.bubble.anchor.setTo(0.5);
    this.bubble.inputEnabled = true;
    this.bubble.events.onInputDown.add(this.hide_bubble, this);
    this.bubble.visible = false;
    this.bubble_showed = false;
};

Mst.NPC.prototype = Object.create(Mst.Prefab.prototype);
Mst.NPC.prototype.constructor = Mst.NPC;

Mst.NPC.prototype.update = function () {
    "use strict";
    
    this.game_state.game.physics.arcade.collide(this, this.game_state.layers.collision);
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.enemies);
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.chests);    
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.players, this.touch_player, null, this);
    
    //console.log(this.game_state.prefabs.player.killed);
    
    if (this.game_state.prefabs.player.killed) {
        this.ren_sprite.show_dialogue("Měl jste štěstí, že vás našli včas. Jinak by už bylo po vás.");
        if (this.relations_allowed) {
            this.game_state.prefabs.player.update_relation(this, "NPC", 5);
        }
        
        this.game_state.prefabs.player.killed = false;
        this.game_state.prefabs.player.save.properties.killed = false;
    }
    
    if (this.updated) {
        this.save.properties.items = this.stats.items;
        
        this.updated = false;
    }
};

Mst.NPC.prototype.show_bubble = function (type) {
    "use strict";
    this.bubble_showed = true;
    
    this.bubble.loadTexture('bubble_spritesheet', type);
    this.bubble.visible = true;
    
    if (type === 0) {
        this.game_state.game.time.events.add(Phaser.Timer.SECOND * 2, this.hide_bubble, this);
    }
};

Mst.NPC.prototype.hide_bubble = function () {
    "use strict";
    this.bubble_showed = false;
    console.log("Bubble hide");
    
    this.bubble.visible = false;
};

Mst.NPC.prototype.save_NPC = function () {
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

    console.log("Save NPC:");
    console.log(this.game_state.save.objects);

};

Mst.NPC.prototype.touch_player = function (NPC, player) {
    "use strict";
    if (!this.ren_sprite.visible) {
        if (this.relations_allowed) {
            player.update_relation(NPC, "NPC", 1);
        }

        if (player.opened_business === "" && NPC.name === "merchant") {
            console.log("merchant");
            player.open_business(player, NPC);
            this.ren_sprite.show_dialogue("Chcete si něco koupit nebo prodat?", ["buy_sell", "quest"]);
        } 
        
        if (NPC.name === "hospod") {
            console.log("hospod");
            this.ren_sprite.show_dialogue("Chcete tu přespat za 10G?", ["lodging"]);
        } 

        if (NPC.name !== "merchant") {
            this.ren_sprite.show_dialogue("Dobrý den, co byste potřeboval?");
        }
    }
};

Mst.NPC.prototype.open_business = function (player) {
    "use strict";
    player.opened_business = this.name;
    console.log("Open business");
    this.game_state.prefabs.businessitems.show_initial_stats();
};

Mst.NPC.prototype.close_business = function () {
    "use strict";
    this.game_state.prefabs.businessitems.kill_stats();
    this.game_state.prefabs.player.opened_business = "";
};

Mst.NPC.prototype.test_quest = function () {
    "use strict";
    if (this.game_state.prefabs.player.test_quest("owner", this.unique_id)) {
        this.show_bubble(1); // ! exclamation mark - quest
    }
};

Mst.NPC.prototype.hide_ren = function () {
    "use strict";
    this.ren_sprite.hide();
    
    if (this.game_state.prefabs.player.opened_business != "") {
        this.close_business();
    }
    
    if (this.game_state.prefabs.player.test_quest("owner", this.unique_id)) {
        this.show_bubble(1); // ! exclamation mark - quest
    } else {
        this.hide_bubble();
    }
};
