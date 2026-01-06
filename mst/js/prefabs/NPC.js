Mst.NPC = class extends Mst.Prefab {
    constructor(name, position, properties) {
        super(name, position, properties);
    
        Mst.game.physics.arcade.enable(this);
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
        
        if (!properties.immovable) {
            this.body.immovable = true;
        } else {
            this.body.immovable = false;
        }
        
        if (!properties.gender) {
            properties.gender = "";
            this.gender = "";
        } else {
            this.gender = properties.gender;
        }
        
        if (!properties.badges) {
            this.badges = {};
        } else {
            this.badges = properties.badges;
        }
        
        if (!properties.nurse) {
            this.nurse = false;
        } else {
            this.nurse = true;
        }
        
        if (!properties.sprtype) {
            this.sprtype = 10;
        } else {
            this.sprtype = parseInt(properties.sprtype);
        }
        
        if (!properties.owner) {
            this.owner = 0;
        } else {
            this.owner = parseInt(properties.owner);
        }
        
        let offset = 2;
        if (properties.offset) offset = parseInt(properties.offset);
        
        if (!properties.tosave) {
            this.tosave = false;
        } else {
            this.tosave = true;
        }
        
        this.save = {
            type: "NPC",
            name: name,
            obj_id: this.unique_id,
            x: (position.x - (Mst.tileHeight / 2)),
            y: (position.y + (Mst.tileHeight / 2)),
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
            
            this.body.velocity.x = Mst.rnd(-20, 20);
            this.body.velocity.y = Mst.rnd(-5, 5);
        }
        if (this.stype === "merchant" || this.stype === "hospod" || this.stype === "kamelot") this.d_type = "item";
        
        this.bubble = Mst.groups.bubbles.create(this.x, this.y - 16, 'bubble_spritesheet', 0);
        this.bubble.anchor.setTo(0.5);
        this.bubble.inputEnabled = true;
        this.bubble.events.onInputDown.add(this.hide_bubble, this);
        this.bubble.visible = false;
        this.bubble_showed = false;
        
        this.num_of_hits = 0;
        this.player_hit_not_delay = true;
    }    

    update() {
        Mst.game.physics.arcade.collide(this, Mst.layers.collision);
        Mst.game.physics.arcade.collide(this, Mst.groups.enemies);
        Mst.game.physics.arcade.collide(this, Mst.groups.chests, this.collide_chest, null, this);

        if (!this.body.immovable) {
            Mst.groups.NPCs.forEachAlive(function(one_player) {
                Mst.game.physics.arcade.collide(this, one_player, this.collide_NPC, null, this);
            }, this);
        }

        if (this.sprtype === 2) {
            this.animations.play("go");
            if (Math.sign(this.body.velocity.x) !== 0) {
                this.scale.setTo(Math.sign(this.body.velocity.x), 1);
            }
        }
        
        if (this.stype === "kerik") {
            if(this.kerik_run) {
                Mst.game.physics.arcade.moveToObject(this, Mst.player, 40);
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
                    Mst.game.physics.arcade.moveToObject(this, this.tlustocerv_target, 40);
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
    }

    get uid() {
        return this.unique_id;
    }

    get otype() {
        return "NPC";
    }

    add_ren() {
        this.ren_sprite =  new Mst.Ren(this.ren_name, {x: 0, y:20}, {
            group: "ren", 
            texture: this.ren_name, 
            p_name: this.p_name,
            o_name: this.name,
            o_type: this.o_type,
            d_type: this.d_type,
            gender: this.gender,
            p_id: this.unique_id,
            dialogue_name: this.name
        }, this);

        this.ren_sprite.visible = false;
    }

    collide_NPC(oplayer, NPC) {
        console.log("NPC collide NPC");
                
        if (NPC.stype === "kerik") {
            NPC.kerik_run = false;
            Mst.game.physics.arcade.moveToObject(NPC, oplayer, -50);
            console.log("Not run kerik! " + NPC.name);
        }
        
        if (NPC.stype === "tlustocerv") {
            //NPC.tlustocerv_run = false;
            Mst.game.physics.arcade.moveToObject(NPC, oplayer, -30);
            this.tlustocerv_knockbacki = 6;
            //console.log("Not run tlustocerv! " + NPC.name);
        }
    }

    collide_chest(NPC, chest) {
        console.log("NPC collide chest");
        //console.log(chest);
        
        if (NPC.stype === "tlustocerv") {
            //NPC.tlustocerv_run = false;
            Mst.game.physics.arcade.moveToObject(NPC, chest, -30);
            this.tlustocerv_knockbacki = 6;
            chest.mChest.salat_lives--;
            this.eaten++;
            console.log("Salat lives: " + chest.mChest.salat_lives);
            if (chest.mChest.salat_lives < 0) chest.mChest.get_chest_core(chest);
        }
    }

    show_bubble(type) {
        this.bubble_showed = true;
        
        this.bubble.loadTexture('bubble_spritesheet', type);
        this.bubble.visible = true;
        
        if (type === 0) {
            Mst.game.time.events.add(Phaser.Timer.SECOND * 2, this.hide_bubble, this);
        }
    }

    hide_bubble() {
        this.bubble_showed = false;
        console.log("Bubble hide");
        
        this.bubble.visible = false;
    }

    save_NPC() {
        this.save.x = this.x - (Mst.tileHeight / 2);
        this.save.y = this.y + (Mst.tileHeight / 2);

        if (this.tosave) {
            const NPC = this;
            const name = this.name;
            this.save.action = "SAVE";
            this.save.type = "NPC";

        //    this.save.x = go_position.x;
        //    this.save.y = go_position.y;

            this.save.map_int = Mst.map_int;

            const n = Mst.time;
            this.save.properties.time = n;

            console.log("SAVE NPC");
            console.log(this.save);

            $.post("object.php?time=" + n + "&uid=" + Mst.usr_id, this.save)
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
        
        const key = Mst.mGame.keyOfName(this.name);

        if (key) {
            Mst.mGame.save.objects[key] = this.save;
        } else {
            Mst.mGame.save.objects.push(this.save);
        }

        console.log("Save NPC:");
        console.log(Mst.mGame.save.objects);

    }

    touch_player() {
        const NPC = this;

        let open = false;
        
        console.log("Touch NPC");
        
        if (!this.ren_sprite.visible && !Mst.cPlayer.ren.opened) {
            const wit = Mst.cPlayer.cases.init_witness(-1, NPC.unique_id, "NPC");
            console.log(wit);
            
            const  quest = this.ren_sprite.quest;
            console.log(quest);
            
            const is_investg = !Mst.cPlayer.cases.is_empty;

            let is_quest = false;
            if (quest) {
                quest.update("have");
                is_quest = true;
            }
            
            if (!Mst.cPlayer.business.opened && NPC.stype === "merchant") {
                if (this.relations_allowed) Mst.cPlayer.relations.update(NPC, 1);
                
                console.log("merchant");
                
                this.open_business();
                const arr_buss = ["buy_sell"];
                if (Mst.usr_id === this.owner) arr_buss.push("mer_admin");
                if (is_quest) arr_buss.push("quest");
                if (is_investg) arr_buss.push("investigate");
                
                console.log(arr_buss);
                
                this.ren_sprite.show_dialogue("Chcete si něco koupit nebo prodat?", arr_buss);
                open = true;
            } 
            
            if (NPC.stype === "hospod") {
                if (this.relations_allowed) Mst.cPlayer.relations.update(NPC,1);
                
                const arr = ["lodging"];
                if (is_investg) {
                    arr.push("investigate");
                }
                
                console.log("hospod");
                this.ren_sprite.show_dialogue("Chcete tu přespat za 10G?", arr);
                open = true;
            }
            
            if (NPC.stype === "kamelot") {
                if (this.relations_allowed) Mst.cPlayer.relations.update(NPC, 1);
                
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
                        const pom_hits = this.num_of_hits % 3;
                        console.log("NoHits:" + this.num_of_hits + " Mod: " + pom_hits);

                        switch (pom_hits) {
                            case 1:
                                this.show_bubble(0); // question
                                break;

                            case 2:
                                Mst.cPlayer.relations.update(NPC, 1);
                                console.log("Op.ren: " + this.name);
                                this.ren_sprite.show_dialogue("Vrrr?");
                                break;

                            case 0:
                                Mst.cPlayer.no_pass_OP = false;
                                break;
                        }
                        
                        Mst.game.time.events.add(Phaser.Timer.SECOND * 1.5, this.collide_with_player_delay, this);
                    }
                } else {
                    this.ren_sprite.show_dialogue("Dobrý den, co byste potřeboval?");
                }
            }
        }
        
        console.log(Mst.cPlayer.ren.opened);
    }
        
    collide_with_player_delay() {
        this.player_hit_not_delay = true;
        Mst.cPlayer.no_pass_OP = true;
    }

    open_business() {
        Mst.cPlayer.business.open(this);
        console.log("Open business");
        Mst.hud.businessitems.up_length = 0;
        Mst.hud.businessitems.show_initial_stats();
    }

    close_business() {
        Mst.hud.businessitems.kill_stats();
        this.save_NPC();
        Mst.cPlayer.business.close();
    }

    test_nurse() {
        if (Mst.mPlayer.killed && this.nurse) {
            console.log(this);
            
            this.ren_sprite.show_dialogue("Měl jste štěstí, že vás našli včas. Jinak by už bylo po vás.");
            if (this.relations_allowed) {
                Mst.cPlayer.relations.update(this, 5);
            }
        }        
        return this.nurse;
    }

    condi(cond, target) {
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
                    Mst.game.time.events.add(Phaser.Timer.SECOND * rnd, this.drop_item, this);
                }
                this.eaten = 0;
            }
        }
    }

    drop_item() { 
        if(this.stype === "tlustocerv") {
            Mst.groups.chests.drop_new_chest(this, 239); //sliz tlustocerva
        }
    }

    init_quest() { /// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        const player = Mst.player;
        const cpQuests = Mst.cPlayer.quests;
        const quests = cpQuests.unfin_quest;
        
        for (let key in quests) {
            const quest = quests[key];
            const owner_id = parseInt(quest.owner);
            console.log(quest);
            console.log("NPC ID: " + this.unique_id);

            const quest_state = quest.state;

            if (quest.target_type === "NPC" && owner_id === this.unique_id) { //!!!!!!!!! Identity
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
    }

    hide_ren() {
        this.ren_sprite.hide();
        
        if (Mst.cPlayer.business.opened) this.close_business();
        
        if (!Mst.hud.right_window.visible) {
            Mst.hud.items.kill_stats();
            Mst.hud.items.show_initial_stats();
            Mst.hud.equip.show();
        }

        if (!this.ren_sprite.quest) this.hide_bubble();
    }

    kerik_stop() {
        const position = { x: Mst.player.x, y: Mst.player.y };
        const properties = {
            group: "shadows",
            pool: "shadows",
            stype: "shadow",
            items: "",
            closed_frame: 41,
            opened_frame: 41,        
            texture: "blank_image"
        };

        Mst.player.shadow = new Mst.Chest("cpgive", position, properties);
        Mst.cPlayer.chest.open(player.shadow);
        //player.shadow.mChest.open_chest(player, player.shadow);
        
        Mst.mPlayer.fight.close();
    }
};
