Mst.Follower = function (game_state, name, position, properties) {
    "use strict";
    
    //console.log(position);
    
    Mst.Prefab.call(this, game_state, name, position, properties);
    
    this.game_state.game.physics.arcade.enable(this);
    
//    this.stats = {
//        items: properties.items
//    };
    
    console.log("Follower");
    //console.log(this);
    
    this.unique_id = parseInt(properties.unique_id);
    this.p_name = properties.p_name;
    this.stype = properties.stype;
    this.relations_allowed = (properties.relations_allowed === 'true');
    this.region = properties.region;
    this.o_type = "NPC";
    this.type = "follower";
    
    this.stats = {
        items: properties.items || ""
    };
    
    let offset = 2;
    if (typeof (properties.offset) !== 'undefined') offset = parseInt(properties.offset);
    
    this.save = {
        type: properties.ftype,
        name: name,
        obj_id: this.unique_id,
        x: (position.x - (this.game_state.map.tileHeight / 2)),
        y: (position.y + (this.game_state.map.tileHeight / 2)),
        properties: properties
    };
    
    if (typeof (properties.sprtype) === 'undefined') {
        this.sprtype = 10;
    } else {
        this.sprtype = parseInt(properties.sprtype);
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
    
    this.body.setSize(12, 14, 2, offset);
    this.anchor.setTo(0.5);
    
    this.updated = false;
    
    
    // Call Ren
    
    this.ren_name = this.stype + "_ren";
    if (this.stype === "pet") {
        this.ren_name = properties.ren_texture;
    }
    
    this.bubble = this.game_state.groups.bubbles.create(this.x, this.y - 16, 'bubble_spritesheet', 0);
    this.bubble.anchor.setTo(0.5);
    this.bubble.inputEnabled = true;
    this.bubble.events.onInputDown.add(this.hide_bubble, this);
    this.bubble.visible = false;
    this.bubble_showed = false;
    
    this.following = false;
    this.action = "follow";
    
    //this.test_quest();
};

Mst.Follower.prototype = Object.create(Mst.Prefab.prototype);
Mst.Follower.prototype.constructor = Mst.Follower;

Mst.Follower.prototype.update = function () {
    "use strict";
    
    this.game_state.game.physics.arcade.collide(this, this.game_state.layers.collision);
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.chests);
    
    this.game_state.groups.enemies.forEachAlive(function(one_enemy) {
        var player_dist = this.game_state.game.physics.arcade.distanceBetween(this, this.game_state.prefabs.player);
        var enemy_dist = this.game_state.game.physics.arcade.distanceBetween(this, one_enemy);
        if (enemy_dist < 30) {
            this.action = "attack";
            this.game_state.game.physics.arcade.moveToObject(this, one_enemy, 120);
        }
        this.game_state.game.physics.arcade.collide(this, one_enemy, this.hit_enemy, null, this);
    }, this);
    
    if (this.game_state.game.physics.arcade.distanceBetween(this, this.game_state.prefabs.player) > 70) {
        this.action = "follow";
    }
    
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.players);
    if (this.game_state.game.physics.arcade.distanceBetween(this, this.game_state.prefabs.player) > 30 && this.action === 'follow') {
        this.game_state.game.physics.arcade.moveToObject(this, this.game_state.prefabs.player, 130);
        this.following = true;
    } else {
        this.stop_follow();
    }
    
    if (this.game_state.game.physics.arcade.distanceBetween(this, this.game_state.prefabs.player) < 24 && this.action === 'follow') {
        this.body.velocity.set(0);
        this.animations.stop();
    }
    
    //console.log("Follower velocity x: " + Math.floor(this.body.velocity.x) + " y: " + Math.floor(this.body.velocity.y));
    if (this.sprtype === 2) {
        this.animations.play("go");
        if (Math.sign(this.body.velocity.x) !== 0) {
            this.scale.setTo(-Math.sign(this.body.velocity.x), 1);
        }
    } else {
        if (Math.abs(this.body.velocity.x) > Math.abs(this.body.velocity.y)) {
            if (this.body.velocity.x > 0) {
                this.animations.play("right");
            } else {
                this.animations.play("left");
            }
        } else {
            if (this.body.velocity.y < 0) {
                this.animations.play("up");
            } else {
                this.animations.play("down");
            }
        }
    }
        
    //console.log(this.game_state.prefabs.player.killed);
    
    if (this.updated) {
        this.save.properties.items = this.stats.items;
        
        this.updated = false;
    }
};

Mst.Follower.prototype.add_ren = function () {
    "use strict";

    // Call Ren 
        
    this.ren_sprite =  new Mst.Ren(this.game_state, this.ren_name, {x: 0, y:20}, {
        group: "ren", 
        texture: this.ren_name, 
        p_name: this.p_name, 
        p_id: this.unique_id,
        dialogue_name: this.name
    });
    
    this.ren_sprite.visible = false;
};

Mst.Follower.prototype.show_bubble = function (type) {
    "use strict";
    this.bubble_showed = true;
    
    this.bubble.loadTexture('bubble_spritesheet', type);
    this.bubble.visible = true;
    
    if (type === 0) {
        this.game_state.game.time.events.add(Phaser.Timer.SECOND * 2, this.hide_bubble, this);
    }
};

Mst.Follower.prototype.hide_bubble = function () {
    "use strict";
    this.bubble_showed = false;
    console.log("Bubble hide");
    
    this.bubble.visible = false;
};

Mst.Follower.prototype.hit_enemy = function (follower, enemy) {
    "use strict";
    //console.log(enemy);
    //console.log(follower);
    
    enemy.hit_enemy_pet(this.game_state.prefabs.player, enemy);
    
    this.action = "follow";
};

Mst.Follower.prototype.stop_follow = function () {
    "use strict";
    if (this.following) {
        this.game_state.game.physics.arcade.moveToObject(this, this.game_state.prefabs.player, 50);
    }
    this.following = false;
};

//Mst.Follower.prototype.save_follower = function () {
//    "use strict";
//    var key;
//    
//    this.save.x = this.x - (this.game_state.map.tileHeight / 2);
//    this.save.y = this.y + (this.game_state.map.tileHeight / 2);
//    
//    key = this.game_state.keyOfName(this.name);
//    
//    //console.log(key);
//
//    if (key != "") {
//        this.game_state.save.objects[key] = this.save;
//    } else {
//        this.game_state.save.objects.push(this.save);
//    }
//
//    console.log("Save Follower:");
//    console.log(this.game_state.save.objects);
//
//};

Mst.Follower.prototype.touch_player = function (Follower, player) {
    "use strict";
    var open = false;
    
    if (!this.ren_sprite.visible && player.opened_ren === "" && !player.infight) {
        if (this.relations_allowed) {
            player.update_relation(Follower, "NPC", 1);
        }

        if (player.opened_business === "" && Follower.stype === "merchant") {
            console.log("merchant");
            player.open_business(player, Follower);
            this.ren_sprite.show_dialogue("Chcete si něco koupit nebo prodat?", ["buy_sell", "quest"], "item");
            open = true;
        } 
        
        if (Follower.stype === "hospod") {
            console.log("hospod");
            this.ren_sprite.show_dialogue("Chcete tu přespat za 10G?", ["lodging"], "item");
            open = true;
        } 

        if (!open) {
            this.ren_sprite.show_dialogue("Dobrý den, co byste potřeboval?");
        }
    }
};

Mst.Follower.prototype.open_business = function (player) {
    "use strict";
    player.opened_business = this.name;
    console.log("Open business");
    this.game_state.prefabs.businessitems.show_initial_stats();
};

Mst.Follower.prototype.close_business = function () {
    "use strict";
    this.game_state.prefabs.businessitems.kill_stats();
    this.game_state.prefabs.player.opened_business = "";
};

Mst.Follower.prototype.test_nurse = function () {
    "use strict";
    
    return false;
};

Mst.Follower.prototype.test_quest = function () { /// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    "use strict";
    
    //console.log(this.game_state.gdata.quest);
    const quests = this.game_state.gdata.quest.quests;
    const player = this.game_state.prefabs.player;
    let is_quest = false;
//    if (this.game_state.prefabs.player.test_quest("owner", this.unique_id)) {
//        this.show_bubble(3); // ! exclamation mark - quest
//    }

    for (let i in quests) {
        const owner_id = parseInt(quests[i].properties.owner);
        console.log(quests[i]);
        console.log("Follower ID: " + this.unique_id);
        if (quests[i].properties.owner_type === "NPC" && owner_id === this.unique_id) {
            console.log(quests[i]);
            
            let test_q = player.test_quest("idfin", quests[i].qid);
            
            if (!test_q) {                
                test_q = player.test_quest("idass", quests[i].name);
                
                if (test_q) {
                    this.ren_sprite.new_quest(quests[i]);
                    this.ren_sprite.quest.state = "ass";
                    this.show_bubble(4); // ! exclamation mark - quest assigned
                    is_quest = true;
                    break;
                } else {
                    test_q = player.test_quest("idacc", quests[i].name);
                    if (test_q) {
                        this.ren_sprite.new_quest(quests[i]);
                        this.ren_sprite.quest.state = "acc";
                        this.show_bubble(5); // ! question mark - quest accomplished
                        is_quest = true;
                        break;            
                    } else {
                        this.ren_sprite.new_quest(quests[i]);
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

Mst.Follower.prototype.hide_ren = function () {
    "use strict";
    this.ren_sprite.hide();
    
    if (this.game_state.prefabs.player.opened_business != "") {
        this.close_business();
    }
    
    if (typeof (this.ren_sprite.quest.state) === 'undefined') {
        this.hide_bubble();
    }
};

Mst.Follower.prototype.save_follower = function (go_position, go_map_int) {
    "use strict";
        
    var game_state, follower, name, usr_id, d, n;
    game_state = this.game_state;
    follower = this;
    name = this.name;
    usr_id = game_state.prefabs.player.usr_id;
    this.save.action = "SAVE";
    this.save.type = "follower";
    this.save.x = go_position.x;
    this.save.y = go_position.y;
    this.save.map_int = go_map_int;
    
    d = new Date();
    n = d.getTime();
    this.save.properties.time = n;

    console.log("SAVE Follower");
    console.log(this.save);

    $.post("object.php?time=" + n + "&uid=" + usr_id, this.save)
        .done(function (data) {
            console.log("Follower save success");
            console.log(data);
        })
        .fail(function (data) {
            console.log("Follower save error");
            console.log(data);
        });

    console.log("save follower save");
    
};
