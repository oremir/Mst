var Mst = Mst || {};

Mst.NPC = function (game_state, name, position, properties) {
    "use strict";
    
    //console.log(position);
    
    Mst.Prefab.call(this, game_state, name, position, properties);
    
    this.game_state.game.physics.arcade.enable(this);
    
//    this.stats = {
//        items: properties.items
//    };
    
    console.log("NPC init: " + name);
    //console.log(this);
    
    this.unique_id = parseInt(properties.unique_id);
    this.p_name = properties.p_name;
    this.stype = properties.stype;
    this.relations_allowed = (properties.relations_allowed === 'true');
    this.region = properties.region;
    this.o_type = "NPC";
    
    this.stats = {
        items: properties.items || ""
    };
    
    if (typeof (properties.immovable) === 'undefined') {
        this.body.immovable = true;
    } else {
        this.body.immovable = false;
    }
    
    if (typeof (properties.nurse) === 'undefined') {
        this.nurse = false;
    } else {
        this.nurse = true;
    }
    
    if (typeof (properties.sprtype) === 'undefined') {
        this.sprtype = 10;
    } else {
        this.sprtype = parseInt(properties.sprtype);
    }
    
    if (typeof (properties.offset) === 'undefined') {
        var offset = 2;
    } else {
        var offset = parseInt(properties.offset);
    }
    
    this.save = {
        type: "NPC",
        name: name,
        x: (position.x - (this.game_state.map.tileHeight / 2)),
        y: (position.y + (this.game_state.map.tileHeight / 2)),
        properties: properties
    }
    
    if (this.sprtype === 2) {
        this.animations.add("go", [0, 1], 5, true);
    } else {
        this.animations.add('left', [4, 5], 10, true);
        this.animations.add('right', [6, 7], 10, true);
        this.animations.add('up', [2, 3], 10, true);
        this.animations.add('down', [0, 1], 10, true);
    }
    this.frame = 0;
    
    if (this.stype === "pet") {
        this.body.setSize(12, 14, 2, offset);
    } else {
        this.body.setSize(16, 16, 2.5, offset);
    }
    
    this.anchor.setTo(0.5);
    
    this.updated = false;
    
    
    // Call Ren
    
    var ren_name;
    
    ren_name = this.stype + "_ren";
    if (this.stype === "pet") {
        ren_name = properties.ren_texture;
    }
    
    this.ren_sprite =  new Mst.Ren(this.game_state, ren_name, {x: 0, y:20}, {
        group: "ren", 
        texture: ren_name, 
        p_name: this.p_name, 
        p_id: this.unique_id,
        dialogue_name: this.name
    });

    this.ren_sprite.visible = false;
    
    this.bubble = this.game_state.groups.bubbles.create(this.x, this.y - 16, 'bubble_spritesheet', 0);
    this.bubble.anchor.setTo(0.5);
    this.bubble.inputEnabled = true;
    this.bubble.events.onInputDown.add(this.hide_bubble, this);
    this.bubble.visible = false;
    this.bubble_showed = false;
    
    this.num_of_hits = 0;
    this.player_hit_not_delay = true;
    
    //this.test_quest();
};

Mst.NPC.prototype = Object.create(Mst.Prefab.prototype);
Mst.NPC.prototype.constructor = Mst.NPC;

Mst.NPC.prototype.update = function () {
    "use strict";
    
    this.game_state.game.physics.arcade.collide(this, this.game_state.layers.collision);
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.enemies);
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.chests);    
    //this.game_state.game.physics.arcade.collide(this, this.game_state.groups.players);
    
    //console.log(!this.body.immovable);
    if (!this.body.immovable) {
        this.game_state.groups.NPCs.forEachAlive(function(one_player) {
            this.game_state.game.physics.arcade.collide(this, one_player);
        }, this);
//        this.game_state.groups.otherplayers.forEachAlive(function(o_player) {
//            //console.log(this.game_state.game.physics.arcade.distanceBetween(this, o_player));
//            if (this.game_state.game.physics.arcade.distanceBetween(this, o_player) < 10) {
//                this.game_state.game.physics.arcade.moveToObject(this, o_player, -30);
//            } else {
//                this.body.velocity.set(0);
//            }
//        }, this);
    }
    
    //console.log(this.game_state.prefabs.player.killed);
    
    if (this.game_state.prefabs.player.killed && this.nurse) {
        console.log(this);
        this.game_state.prefabs.player.set_opened_ren(this.name);
        this.ren_sprite.show_dialogue("Měl jste štěstí, že vás našli včas. Jinak by už bylo po vás.");
        if (this.relations_allowed) {
            this.game_state.prefabs.player.update_relation(this, "NPC", 5);
        }
        
        this.game_state.prefabs.player.killed = false;
        this.game_state.prefabs.player.save.properties.killed = false;
    }
    
    if (this.bubble_showed) {
        this.bubble.x = this.x;
        this.bubble.y = this.y - 16;
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
    var pom_hits, open;
    open = false;
    
    console.log("Touch NPC");
    
    if (!this.ren_sprite.visible && player.opened_ren === "") {
        if (player.opened_business === "" && NPC.stype === "merchant") {
            if (this.relations_allowed) {
                player.update_relation(NPC, "NPC", 1);
            }
            
            console.log("merchant");
            player.open_business(player, NPC);
            player.set_opened_ren(this.name);
            this.ren_sprite.show_dialogue("Chcete si něco koupit nebo prodat?", ["buy_sell", "quest"], "item");
            open = true;
        } 
        
        if (NPC.stype === "hospod") {
            if (this.relations_allowed) {
                player.update_relation(NPC, "NPC", 1);
            }
            
            console.log("hospod");
            player.set_opened_ren(this.name);
            this.ren_sprite.show_dialogue("Chcete tu přespat za 10G?", ["lodging"], "item");
            open = true;
        }
        
        if (NPC.stype === "kurolez") {
            
            console.log("kurolez");
            player.set_opened_ren(this.name);
            this.ren_sprite.show_dialogue("Hhhhrrarrhhh?", [], "item");
            open = true;
        }
        
        console.log(open);

        if (!open) {
            if (this.stype === "pet") {      
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
                            player.update_relation(NPC, "player", 1);
                            player.set_opened_ren(this.name);
                            console.log("Op.ren: " + this.name);
                            this.ren_sprite.show_dialogue("Vrrr?");
                            break;

                        case 0:
                            player.no_pass_OP = false;
                            break;
                    }
                    
                    this.game_state.game.time.events.add(Phaser.Timer.SECOND * 1.5, this.collide_with_player_delay, this);
                }
            } else {
                this.ren_sprite.show_dialogue("Dobrý den, co byste potřeboval?");
            }
        }
    }
    
    console.log(player.opened_ren);
};
    
Mst.NPC.prototype.collide_with_player_delay = function () {
    "use strict";    
    this.player_hit_not_delay = true;
    this.game_state.prefabs.player.no_pass_OP = true;
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

Mst.NPC.prototype.test_quest = function () { /// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    "use strict";
    
    var quests, owner_id, player, test_q, is_quest;
    //console.log(this.game_state.quest_data);
    quests = this.game_state.quest_data.quests;
    player = this.game_state.prefabs.player;
    is_quest = false;
//    if (this.game_state.prefabs.player.test_quest("owner", this.unique_id)) {
//        this.show_bubble(3); // ! exclamation mark - quest
//    }

    for (var i = 0; i < quests.length; i++) {
        owner_id = parseInt(quests[i].properties.owner);
        console.log(quests[i]);
        console.log("NPC ID: " + this.unique_id);
        if (quests[i].properties.owner_type === "NPC" && owner_id === this.unique_id) {
            console.log(quests[i]);
            
            test_q = player.test_quest("idfin", quests[i].qid);
            
            if (!test_q) {                
                test_q = player.test_quest("idass", quests[i].name);
                
                if (test_q) {
                    this.ren_sprite.quest = quests[i];
                    this.ren_sprite.quest.state = "ass";
                    this.show_bubble(4); // ! exclamation mark - quest assigned
                    is_quest = true;
                    break;
                } else {
                    test_q = player.test_quest("idacc", quests[i].name);
                    if (test_q) {
                        this.ren_sprite.quest = quests[i];
                        this.ren_sprite.quest.state = "acc";
                        this.show_bubble(5); // ! question mark - quest accomplished
                        is_quest = true;
                        break;            
                    } else {
                        this.ren_sprite.quest = quests[i];
                        this.ren_sprite.quest.state = "pre";
                        this.show_bubble(3); // ! exclamation mark - quest ready
                        is_quest = true;
                        break;            
                    }
                }
            }
        }
    }
    
    return is_quest;
};

Mst.NPC.prototype.hide_ren = function () {
    "use strict";
    this.ren_sprite.hide();
    
    if (this.game_state.prefabs.player.opened_business != "") {
        this.close_business();
    }
    
    if (typeof (this.ren_sprite.quest.state) === 'undefined') {
        this.hide_bubble();
    }
};