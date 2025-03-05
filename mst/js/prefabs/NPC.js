Mst.NPC = function (game_state, name, position, properties) {
    "use strict";
    
    //console.log(position);
    
    Mst.Prefab.call(this, game_state, name, position, properties);
    
    this.game_state.game.physics.arcade.enable(this);
    this.body.bounce.setTo(0.8);
    
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
    
    if (typeof (properties.gender) === 'undefined') {
        properties.gender = "";
        this.gender = "";
    } else {
        this.gender = properties.gender;
    }
    
    if (typeof (properties.badges) === 'undefined') {
        this.badges = {};
    } else {
        this.badges = properties.badges;
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
    
    if (typeof (properties.owner) === 'undefined') {
        this.owner = 0;
    } else {
        this.owner = parseInt(properties.owner);
    }
    
    let offset = 2;
    if (typeof (properties.offset) !== 'undefined') offset = parseInt(properties.offset);
    
    if (typeof (properties.tosave) === 'undefined') {
        this.tosave = false;
    } else {
        this.tosave = true;
    }
    
    this.save = {
        type: "NPC",
        name: name,
        obj_id: this.unique_id,
        x: (position.x - (this.game_state.map.tileHeight / 2)),
        y: (position.y + (this.game_state.map.tileHeight / 2)),
        properties: properties
    };
    
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
    
    // Call Ren
    
    this.ren_name = properties.texture + "_ren";
    this.ren_texture = properties.texture + "_ren";
    if (this.stype === "pet") {
        this.ren_name = properties.ren_texture;
    }
    if (this.stype === "kurolez") {
        this.ren_name = "kurolez_ren";
        this.d_type = "item";
    }
    if (this.stype === "cmelotrysk") {
        this.ren_name = "cmelotrysk_ren";
        this.d_type = "item";
    }
    if (this.stype === "kerik") {
        this.ren_name = "kerik_ren";
        this.kerik_run = false;
        this.d_type = "item";
    }
    if (this.stype === "tlustocerv") {
        this.ren_name = "blank_image";
        this.tlustocerv_run = false;
        this.tlustocerv_target = {};
        this.tlustocerv_knockbacki = 0;
        this.eaten = 0;
        
        this.body.velocity.x = this.game_state.game.rnd.between(-20, 20);
        this.body.velocity.y = this.game_state.game.rnd.between(-5, 5);
    }
    if (this.stype === "merchant" || this.stype === "hospod" || this.stype === "kamelot") this.d_type = "item";
    
    this.bubble = this.game_state.mGame.groups.bubbles.create(this.x, this.y - 16, 'bubble_spritesheet', 0);
    this.bubble.anchor.setTo(0.5);
    this.bubble.inputEnabled = true;
    this.bubble.events.onInputDown.add(this.hide_bubble, this);
    this.bubble.visible = false;
    this.bubble_showed = false;
    
    this.num_of_hits = 0;
    this.player_hit_not_delay = true;
};

Mst.NPC.prototype = Object.create(Mst.Prefab.prototype);
Mst.NPC.prototype.constructor = Mst.NPC;

Mst.NPC.prototype.update = function () {
    "use strict";
    
    this.game_state.game.physics.arcade.collide(this, this.game_state.layers.collision);
    this.game_state.game.physics.arcade.collide(this, this.game_state.mGame.groups.enemies);
    this.game_state.game.physics.arcade.collide(this, this.game_state.mGame.groups.chests, this.collide_chest, null, this);
    //this.game_state.game.physics.arcade.collide(this, this.game_state.mGame.groups.players);
    
    //console.log(!this.body.immovable);
    if (!this.body.immovable) {
        this.game_state.mGame.groups.NPCs.forEachAlive(function(one_player) {
            //console.log(this.name + " " + one_player.name);
            this.game_state.game.physics.arcade.collide(this, one_player, this.collide_NPC, null, this);
        }, this);
//        this.game_state.mGame.groups.otherplayers.forEachAlive(function(o_player) {
//            //console.log(this.game_state.game.physics.arcade.distanceBetween(this, o_player));
//            if (this.game_state.game.physics.arcade.distanceBetween(this, o_player) < 10) {
//                this.game_state.game.physics.arcade.moveToObject(this, o_player, -30);
//            } else {
//                this.body.velocity.set(0);
//            }
//        }, this);
    }
    
//    if (this.game_state.game.physics.arcade.distanceBetween(this, this.game_state.prefabs.player) > 35 && this.game_state.prefabs.player.opened_ren === this.name) {
//            console.log(this.game_state.game.physics.arcade.distanceBetween(this, this.game_state.prefabs.player));
//            console.log("NPC is too far!");
//            this.save_NPC();
//        }
    if (this.sprtype === 2) {
        this.animations.play("go");
        if (Math.sign(this.body.velocity.x) !== 0) {
            this.scale.setTo(Math.sign(this.body.velocity.x), 1);
        }
    }
    
    if (this.stype === "kerik") {
        if(this.kerik_run) {
            this.game_state.game.physics.arcade.moveToObject(this, this.game_state.prefabs.player, 40);
        } else {
            this.body.velocity.x = 0;
            this.body.velocity.y = 0;
        }
    }
    
    if (this.stype === "tlustocerv") {
        if(this.tlustocerv_run && typeof(this.tlustocerv_target.mChest.closed_frame) !== 'undefined') {
            if (this.tlustocerv_knockbacki > 0) {
                this.tlustocerv_knockbacki--;
                //console.log("KI: " + this.tlustocerv_knockbacki);
            } else {
                this.game_state.game.physics.arcade.moveToObject(this, this.tlustocerv_target, 40);
            }
        } else {
//            this.body.velocity.x = 0;
//            this.body.velocity.y = 0;
        }
    }
    
    if (this.bubble_showed) {
        this.bubble.x = this.x;
        this.bubble.y = this.y - 16;
    }
};

Mst.NPC.prototype.get_uid = function () {
    "use strict";
    return this.unique_id;
};

Mst.NPC.prototype.get_otype = function () {
    "use strict";
    return "NPC";
};

Mst.NPC.prototype.add_ren = function () {
    "use strict";

    // Call Ren 
    
    this.ren_sprite =  new Mst.Ren(this.game_state, this.ren_name, {x: 0, y:20}, {
        group: "ren", 
        texture: this.ren_name, 
        p_name: this.p_name,
        o_name: this.name,
        o_type: this.o_type,
        d_type: this.d_type,
        gender: this.gender,
        p_id: this.unique_id,
        dialogue_name: this.name
    });

    this.ren_sprite.visible = false;
};

Mst.NPC.prototype.collide_NPC = function (oplayer, NPC) {
    "use strict";
    console.log("NPC collide NPC");
            
    if (NPC.stype === "kerik") {
        NPC.kerik_run = false;
        this.game_state.game.physics.arcade.moveToObject(NPC, oplayer, -50);
        console.log("Not run kerik! " + NPC.name);
    }
    
    if (NPC.stype === "tlustocerv") {
        //NPC.tlustocerv_run = false;
        this.game_state.game.physics.arcade.moveToObject(NPC, oplayer, -30);
        this.tlustocerv_knockbacki = 6;
        //console.log("Not run tlustocerv! " + NPC.name);
    }
};

Mst.NPC.prototype.collide_chest = function (NPC, chest) {
    "use strict";
    console.log("NPC collide chest");
    //console.log(chest);
    
    if (NPC.stype === "tlustocerv") {
        //NPC.tlustocerv_run = false;
        this.game_state.game.physics.arcade.moveToObject(NPC, chest, -30);
        this.tlustocerv_knockbacki = 6;
        chest.mChest.salat_lives--;
        this.eaten++;
        console.log("Salat lives: " + chest.mChest.salat_lives);
        if (chest.mChest.salat_lives < 0) chest.mChest.get_chest_core(chest);
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
    
    this.save.x = this.x - (this.game_state.map.tileHeight / 2);
    this.save.y = this.y + (this.game_state.map.tileHeight / 2);

    if (this.tosave) {
        const game_state = this.game_state;
        const NPC = this;
        const name = this.name;
        const usr_id = game_state.prefabs.player.mPlayer.usr_id;
        this.save.action = "SAVE";
        this.save.type = "NPC";

    //    this.save.x = go_position.x;
    //    this.save.y = go_position.y;

        this.save.map_int = this.game_state.gdata.root.map_int;

        const d = new Date();
        const n = d.getTime();
        this.save.properties.time = n;

        console.log("SAVE NPC");
        console.log(this.save);

        $.post("object.php?time=" + n + "&uid=" + usr_id, this.save)
            .done(function (data) {
                console.log("NPC save success");
                console.log(data);
            })
            .fail(function (data) {
                console.log("NPC save error");
                console.log(data);
            });

        console.log("save npc save");
    }
    
    const key = this.game_state.mGame.keyOfName(this.name);

    if (key) {
        this.game_state.mGame.save.objects[key] = this.save;
    } else {
        this.game_state.mGame.save.objects.push(this.save);
    }

    console.log("Save NPC:");
    console.log(this.game_state.mGame.save.objects);

};

Mst.NPC.prototype.touch_player = function (NPC, player) {
    "use strict";
    var pom_hits, open;
    open = false;
    
    console.log("Touch NPC");
    
    if (!this.ren_sprite.visible && !player.cPlayer.ren.opened) {
        const wit = player.cPlayer.cases.init_witness(-1, NPC.unique_id, "NPC");
        console.log(wit);
        
        const  quest = this.ren_sprite.quest;
        console.log(quest);
        
        const is_investg = !player.cPlayer.cases.is_empty;

        let is_quest = false;
        if (quest) {
            quest.update("have");
            is_quest = true;
        }
        
        if (!player.cPlayer.business.opened && NPC.stype === "merchant") {
            if (this.relations_allowed) player.cPlayer.relations.update(NPC, 1);
            
            console.log("merchant");
            
            this.open_business(player);
            var arr_buss = ["buy_sell"];
            if (player.mPlayer.usr_id === this.owner) {
                arr_buss = ["buy_sell", "mer_admin"];
            }
            
            if (is_quest) {
                arr_buss.push("quest");
            }
            
            if (is_investg) {
                arr_buss.push("investigate");
            }
            
            console.log(arr_buss);
            
            this.ren_sprite.show_dialogue("Chcete si něco koupit nebo prodat?", arr_buss);
            open = true;
        } 
        
        if (NPC.stype === "hospod") {
            if (this.relations_allowed) {
                player.cPlayer.relations.update(NPC,1);
            }
            
            var arr = ["lodging"];
            if (is_investg) {
                arr.push("investigate");
            }
            
            console.log("hospod");
            this.ren_sprite.show_dialogue("Chcete tu přespat za 10G?", arr);
            open = true;
        }
        
        if (NPC.stype === "kamelot") {
            if (this.relations_allowed) {
                player.cPlayer.relations.update(NPC, 1);
            }
            
            console.log("kamelot");
            this.ren_sprite.show_dialogue("Kuuupte novinyyy za 5G...", ["newsppr"]);
            open = true;
        }
        
        if (NPC.stype === "kurolez") {
            
            console.log("kurolez");
            this.ren_sprite.show_dialogue("Hhhhrrarrhhh?");
            open = true;
        }
        
        if (NPC.stype === "cmelotrysk") {
            
            console.log("cmelotrysk");
            this.ren_sprite.show_dialogue("Bzzzzzzzzzzz?");
            open = true;
        }
        
        if (NPC.stype === "kerik") {
            
            console.log("kerik");
            this.ren_sprite.show_dialogue("Pššš. Plesk. Ššššš. Plác.");
            this.kerik_stop();
            open = true;
        }
        
        if (NPC.stype === "tlustocerv") {
            
            console.log("tlustocerv");
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
                            player.cPlayer.relations.update(NPC, 1);
                            console.log("Op.ren: " + this.name);
                            this.ren_sprite.show_dialogue("Vrrr?");
                            break;

                        case 0:
                            player.cPlayer.no_pass_OP = false;
                            break;
                    }
                    
                    this.game_state.game.time.events.add(Phaser.Timer.SECOND * 1.5, this.collide_with_player_delay, this);
                }
            } else {
                this.ren_sprite.show_dialogue("Dobrý den, co byste potřeboval?");
            }
        }
    }
    
    console.log(player.cPlayer.ren.opened);
};
    
Mst.NPC.prototype.collide_with_player_delay = function () {
    "use strict";    
    this.player_hit_not_delay = true;
    this.game_state.prefabs.player.cPlayer.no_pass_OP = true;
};

Mst.NPC.prototype.open_business = function (player) {
    "use strict";
    player.cPlayer.business.open(this);
    console.log("Open business");
    this.game_state.prefabs.businessitems.up_length = 0;
    this.game_state.prefabs.businessitems.show_initial_stats();
};

Mst.NPC.prototype.close_business = function () {
    "use strict";
    this.game_state.prefabs.businessitems.kill_stats();
    this.save_NPC();
    this.game_state.prefabs.player.cPlayer.business.close();
};

Mst.NPC.prototype.test_nurse = function () {
    "use strict";
    
    if (this.game_state.prefabs.player.mPlayer.killed && this.nurse) {
        console.log(this);
        
        this.ren_sprite.show_dialogue("Měl jste štěstí, že vás našli včas. Jinak by už bylo po vás.");
        if (this.relations_allowed) {
            this.game_state.prefabs.player.cPlayer.relations.update(this, 5);
        }
    }
    
    return this.nurse;
};

Mst.NPC.prototype.condi = function (cond, target) {
    if (cond) {
        if(this.stype === "kerik") {
            this.kerik_run = true;
        }
        if(this.stype === "tlustocerv") {
            this.tlustocerv_run = true;
            this.tlustocerv_target = target;
        }
    } else {
        if(this.stype === "tlustocerv") {
            this.tlustocerv_run = false;
            this.tlustocerv_target = {};
            if (this.eaten > 0) {
                const rnd = Math.ceil(Math.random() * 4);
                this.game_state.game.time.events.add(Phaser.Timer.SECOND * rnd, this.drop_item, this);
            }
            this.eaten = 0;
        }
    }
};

Mst.NPC.prototype.drop_item = function () { 
    "use strict";
    
    if(this.stype === "tlustocerv") {
        this.game_state.prefabs.chest_creator.drop_new_chest(this, 239); //sliz tlustocerva
    }
};

Mst.NPC.prototype.init_quest = function () { /// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    "use strict";
    const player = this.game_state.prefabs.player;    
    const cpQuests = player.cPlayer.quests;
    const quests = cpQuests.new_quest;
    
    for (let key in quests) {
        const quest = quests[key];
        const owner_id = parseInt(quest.properties.owner);
        console.log(quest);
        console.log("NPC ID: " + this.unique_id);
        
        const quest_state = quest.state;
        
        if (quest.properties.target_type === "NPC" && owner_id === this.unique_id) {
            if (quest.is_prev_fin()) {
                this.ren_sprite.set_quest(quest);
                this.ren_sprite.quest.state = quest_state;

                if (quest_state === "ass" || quest_state === "acc") {
                    const bub = quest_state === "ass" ? 4 : 5;
                    this.show_bubble(bub);
                }
                if (quest_state === "pre") {
                    this.ren_sprite.quest.showed = false;
                    this.show_bubble(3); // ! exclamation mark - quest ready
                }
                break;
            }
        }
    }
};

Mst.NPC.prototype.hide_ren = function () {
    "use strict";
    this.ren_sprite.hide();
    
    if (this.game_state.prefabs.player.cPlayer.business.opened) {
        this.close_business();
    }
    
    if (!this.game_state.mGame.hud.right_window.visible) {
        this.game_state.prefabs.items.kill_stats();
        this.game_state.prefabs.items.show_initial_stats();
        this.game_state.prefabs.equip.show();
    }
    
    if (!this.ren_sprite.quest) {
        this.hide_bubble();
    }
};

Mst.NPC.prototype.kerik_stop = function () {
    "use strict";
    
    const player = this.game_state.prefabs.player;
    
    const position = { x: player.x, y: player.y };
    const properties = {
        group: "shadows",
        pool: "shadows",
        stype: "shadow",
        items: "",
        closed_frame: 41,
        opened_frame: 41,        
        texture: "blank_image"
    };

    player.shadow = new Mst.Chest(this.game_state, "cpgive", position, properties);
    player.cPlayer.chest.open(player.shadow);
    player.shadow.mChest.open_chest(player, player.shadow);
    
    player.infight = false;      
};
