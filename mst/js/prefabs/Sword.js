var Mst = Mst || {};

Mst.Sword = function (game_state, name, position, properties) {
    "use strict";
    Mst.Prefab.call(this, game_state, name, position, properties);

    this.game_state.game.physics.arcade.enable(this);
    
    this.hit = this.game_state.groups[this.group].create(position.x, position.y, 'hit');
    this.hit.anchor.setTo(0.5);
    //this.game_state.game.physics.arcade.enable(this.hit);
    this.hit.animations.add('r_hit', [0, 1, 2, 3, 4, 0], 12, false);
    //this.hit.animations['r_hit'].onComplete.add(function () {this.hit.frame = 5}, this);
    this.hit.frame = 5;
    
    this.body.allowRotation = true;
    this.kill();
    
    //this.scale.setTo(1, -1);
    this.equip_frame = parseInt(this.game_state.prefabs.player.stats.equip);
    
    if (this.equip_frame !== -1) {
        this.fr_left = parseInt(this.game_state.core_data.items[this.equip_frame].properties.tool_fr_left);
        this.fr_right = parseInt(this.game_state.core_data.items[this.equip_frame].properties.tool_fr_right);
        this.cut_type = this.game_state.core_data.items[this.equip_frame].properties.cut_type;
    } else {
        this.fr_left = 0;
        this.fr_right = 0;
        this.cut_type = "";
    }
        
        
    this.cut = false;
    
    this.wooshSound = this.game_state.game.add.audio('woosh');
    
    this.b_pool = this.game_state.groups.playerbullets;
};

Mst.Sword.prototype = Object.create(Mst.Prefab.prototype);
Mst.Sword.prototype.constructor = Mst.Sword;

Mst.Sword.prototype.update = function () {
    "use strict";
     
    if (this.alive) {
        if (typeof (this.game_state.layers.collision_forrest) !== 'undefined' && this.cut && (this.cut_type === "wood" || this.cut_type === "uni")) {
            this.game_state.game.physics.arcade.overlap(this, this.game_state.layers.collision_forrest,  this.cut_wood, null, this);
            //console.log(this.game_state.layers.collision_forrest);
        }
        if (typeof (this.game_state.layers.collision_rock) !== 'undefined' && this.cut && (this.cut_type === "stone" || this.cut_type === "uni")) {
            this.game_state.game.physics.arcade.overlap(this, this.game_state.layers.collision_rock,  this.cut_stone, null, this);
            //console.log(this.game_state.layers.collision_forrest);
        }
        if (this.body.rotation > 40 && this.body.rotation < 80) {
            this.kill();
        }
    }
    
};

Mst.Sword.prototype.swing = function () {
    "use strict";
    
    if (this.alive === false) {
        this.hit.animations.play("r_hit");
        
        this.body.rotation = -135;
        this.body.angularVelocity = this.game_state.prefabs.player.direction_sword.x * 500;
        
        if (this.game_state.prefabs.player.direction_sword.x === 1) {
            this.frame = this.fr_right;
        } else {
            this.frame = this.fr_left;
        }
        
        this.cut = true;
        
        this.wooshSound.play();

        this.revive();
        
        if (this.cut_type === "magic") {
            player.work_rout("magic", "intelligence", 1, 1, 1, 3); // stress, stand_exp, skill_exp, abil_p
            
            this.create_bullet();
        }
    }
};

Mst.Sword.prototype.reequip = function (ef) {
    "use strict";
    this.equip_frame = parseInt(ef);
    
    if (this.equip_frame !== -1) {
        this.fr_left = parseInt(this.game_state.core_data.items[this.equip_frame].properties.tool_fr_left);
        this.fr_right = parseInt(this.game_state.core_data.items[this.equip_frame].properties.tool_fr_right);
        this.cut_type = this.game_state.core_data.items[this.equip_frame].properties.cut_type;
    } else {
        this.fr_left = 0;
        this.fr_right = 0;
        this.cut_type = "";
    }
    
    console.log("Frames sword: " + this.fr_left + " " + this.fr_right);
};

Mst.Sword.prototype.cut_wood = function (tool, wood) {
    "use strict";
    var x, y, tile, player, rnd_test;
    player = this.game_state.prefabs.player;
    
    x = player.direction_chest.x + wood.x;
    y = player.direction_chest.y + wood.y;
    
    //console.log(wood);
    //console.log(this.game_state.layers.collision_forrest.layer.data[y][x]);
    
    if (this.game_state.map.getTile(x, y, "collision_forrest") !== null) {
        console.log("Cut wood");
        
        player.add_item(30, 1); // wood
        
        player.work_rout("woodcutter", "strength", 1, 2, 1, 3); // stress, stand_exp, skill_exp, abil_p
        
        rnd_test = Math.floor(Math.random() * 20);
        if (rnd_test < 2) {
            player.add_item(33, 1); // trnka
        }
    }
    
    this.cut = false;
};

Mst.Sword.prototype.cut_stone = function (tool, stone) {
    "use strict";
    var x, y, tile, player, rnd_test, rnd_core;
    player = this.game_state.prefabs.player;
    
    x = player.direction_chest.x + stone.x;
    y = player.direction_chest.y + stone.y;
    
    //console.log(wood);
    //console.log(this.game_state.layers.collision_forrest.layer.data[y][x]);
    if (this.game_state.map.getTile(x, y, "collision_rock") !== null) {
        console.log("Cut stone");
        
        player.add_item(21, 1); // stone
        player.work_rout("stonebreaker", "strength", 1, 2, 1, 3); // stress, stand_exp, skill_exp, abil_p
        
        rnd_test = Math.floor(Math.random() * 20);
        if (rnd_test < 2) {
            player.add_item(40, 1); // lichen
        } else {
            rnd_core = Math.max(15, 30 - player.level("stonebreaker"))
            rnd_test = Math.floor(Math.random() * rnd_core);
            if (rnd_test < 2) {
                player.add_item(96, 1); // pazourek
            } else {
                rnd_core = Math.max(20, 40 - player.level("stonebreaker"))
                rnd_test = Math.floor(Math.random() * rnd_core);
                if (rnd_test < 2 && player.level("stonebreaker") > 1) {
                    player.add_item(49, 1); // uhli
                } else {
                    rnd_test = Math.floor(Math.random() * rnd_core);
                    if (rnd_test < 2 && player.level("stonebreaker") > 2) {
                        player.add_item(47, 1); // med. ruda
                    } else {
                        rnd_test = Math.floor(Math.random() * rnd_core);
                        if (rnd_test < 2 && player.level("stonebreaker") > 3) {
                            player.add_item(48, 1); // cin. ruda
                        } else {
                            rnd_test = Math.floor(Math.random() * rnd_core);
                            if (rnd_test < 2 && player.level("stonebreaker") > 4) {
                                player.add_item(61, 1); // zlato
                            }
                        }
                    }
                }
            }
        }
    }
    
    this.cut = false;
};

Mst.Sword.prototype.cut_chest = function (chest) {
    "use strict";
    var player, index, in_chest, tool_frame, recipe;
    
    console.log("Cut chest");
    console.log(chest);
    
    player = this.game_state.prefabs.player;
    tool_frame = this.frame;
    if (tool_frame == 2) {tool_frame = 1;}
    
    if (player.opened_chest !== "") {
        if (player.opened_chest === chest.name) {
            console.log("Chest frame: " + chest.closed_frame + " op: " + chest.is_opened);
            console.log("Tool frame: " + tool_frame);
            switch (tool_frame) {
                case 1: //sekera                    
                    switch (chest.closed_frame) {
                        case 7: //dřevo
                            in_chest = chest.in_chest_ord();
                            chest.take_all();
                            player.put_all(in_chest);
                            chest.get_chest(chest);
                            player.work_rout("woodcutter", "strength", 1, 2, 1, 3); // stress, stand_exp, skill_exp, abil_p
                        break;
                        case 30: //kmen
                            in_chest = chest.in_chest_ord();
                            console.log(in_chest.length);
                            
                            if (in_chest.length < 1) {
                                chest.change_frame(31);
                                
                                chest.add_item(31, 1); //špalek
                                player.work_rout("woodcutter", "strength", 1, 3, 2, 3); // stress, stand_exp, skill_exp, abil_p
                            }  else {
                                chest.take_all();
                                player.put_all(in_chest);
                                chest.get_chest(chest);
                                player.work_rout("woodcutter", "strength", 1, 2, 1, 3); // stress, stand_exp, skill_exp, abil_p
                            }
                        break;
                        case 31: //špalek
                            index = chest.test_item(30, 1); //kmen
                            console.log(index);
                            if (index > -1) {
                                chest.subtract_item(index, 1);
                                chest.add_item(31, 2); //špalek
                                chest.updated = true;
                                player.work_rout("woodcutter", "strength", 1, 3, 2, 3); // stress, stand_exp, skill_exp, abil_p
                            } else {
                                index = chest.test_item(31, 1);
                                console.log(index);
                                if (index > -1) {
                                    chest.subtract_item(index, 1);
                                    chest.add_item(32,2); //prkno
                                    chest.updated = true;
                                    player.work_rout("woodcutter", "strength", 1, 3, 2, 3); // stress, stand_exp, skill_exp, abil_p
                                } else {
                                    index = chest.test_item(32, 1);
                                    console.log(index);
                                    if (index > -1) {
                                        chest.subtract_item(index, 1);
                                        chest.add_item(24, 2); // hůl
                                        chest.updated = true;
                                        player.work_rout("woodcutter", "strength", 1, 3, 2, 3); // stress, stand_exp, skill_exp, abil_p
                                    } 
                                }
                            }
                        case 43: //větev
                            in_chest = chest.in_chest_ord();
                            chest.take_all();
                            player.put_all(in_chest);
                            chest.get_chest(chest);
                            
                            player.work_rout("woodcutter", "strength", 1, 2, 1, 3); // stress, stand_exp, skill_exp, abil_p
                            
//                            rnd_test = Math.floor(Math.random() * 20);
//                            if (rnd_test < 2) {
//                                player.add_item(33, 1); // trnka
//                            }
                        break;
                        default:
                        break;
                    }                    
                break;
                case 3: //krumpáč                    
                    switch (chest.closed_frame) {
                        case 21: //kámen
                            in_chest = chest.in_chest_ord();
                            console.log(in_chest.length);
                            
                            if (in_chest.length < 1) {
                                chest.change_frame(58); //op. kamen
                                player.work_rout("stonebreaker", "strength", 1, 3, 2, 3); // stress, stand_exp, skill_exp, abil_p
                            }  else {
                                chest.take_all();
                                player.put_all(in_chest);
                                chest.get_chest(chest);
                                player.work_rout("stonebreaker", "strength", 1, 2, 1, 3); // stress, stand_exp, skill_exp, abil_p
                            }
                            

                            rnd_test = Math.floor(Math.random() * 20);
                            if (rnd_test < 2) {
                                player.add_item(40, 1); // lichen
                            } else {
                                rnd_core = Math.max(15, 40 - player.level("stonebreaker"))
                                rnd_test = Math.floor(Math.random() * rnd_core);
                                if (rnd_test < 2) {
                                    player.add_item(96, 1); // pazourek
                                } else {
                                    rnd_core = Math.max(20, 50 - player.level("stonebreaker"))
                                    rnd_test = Math.floor(Math.random() * rnd_core);
                                    if (rnd_test < 2 && player.level("stonebreaker") > 1) {
                                        player.add_item(49, 1); // uhli
                                    } else {
                                        rnd_test = Math.floor(Math.random() * rnd_core);
                                        if (rnd_test < 2 && player.level("stonebreaker") > 2) {
                                            player.add_item(47, 1); // med. ruda
                                        } else {
                                            rnd_test = Math.floor(Math.random() * rnd_core);
                                            if (rnd_test < 2 && player.level("stonebreaker") > 3) {
                                                player.add_item(48, 1); // cin. ruda
                                            } else {
                                                rnd_test = Math.floor(Math.random() * rnd_core);
                                                if (rnd_test < 2 && player.level("stonebreaker") > 4) {
                                                    player.add_item(61, 1); // zlato
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            
                            
                        break;
                        case 58: //op. kámen
                            index = chest.test_item(21, 1); //kámen
                            console.log(index);
                            if (index > -1) {
                                chest.subtract_item(index, 1);
                                chest.add_item(58, 2); //op. kámen
                                chest.updated = true;
                                player.work_rout("stonebreaker", "strength", 1, 3, 2, 3); // stress, stand_exp, skill_exp, abil_p
                            } else {
                                index = chest.test_item(58, 1);
                                console.log(index);
                                if (index > -1) {
                                    chest.subtract_item(index, 1);
                                    chest.add_item(59,2); //kam. blok
                                    chest.updated = true;
                                    player.work_rout("stonebreaker", "strength", 1, 3, 2, 3); // stress, stand_exp, skill_exp, abil_p
                                } else {
                                    index = chest.test_item(59, 1);
                                    console.log(index);
                                    if (index > -1) {
                                        chest.subtract_item(index, 1);
                                        chest.add_item(60, 1); //kam. nádoba
                                        chest.updated = true;
                                        player.work_rout("stonebreaker", "strength", 1, 3, 2, 3); // stress, stand_exp, skill_exp, abil_p
                                    } 
                                }
                            }
                        break;
                        case 59: //kam. blok
                            chest.change_frame(60); //kam. nádoba
                            player.work_rout("stonebreaker", "strength", 1, 3, 2, 3); // stress, stand_exp, skill_exp, abil_p
                        break;
                        default:
                        break;
                    }                    
                break;
                case 4: //hul
                    switch (chest.closed_frame) {
                        case 21: //kámen
                            in_chest = chest.in_chest_ord();
                            console.log(in_chest.length);
                            
                            if (in_chest.length < 1) {
                                chest.get_chest(chest);
                                index = player.test_item(21, 1);
                                player.subtract_item(index, 1);
                                index = player.unequip();
                                player.subtract_item(index, 1);
                                index = player.add_item(44, 1); // sekeromlat
                                player.equip(index, 44);
                                player.work_rout("toolmaker", "dexterity", 1, 3, 2, 3); // stress, stand_exp, skill_exp, abil_p
                            } else {
                                chest.take_all();
                                player.put_all(in_chest);
                                chest.get_chest(chest);
                                player.work_rout("forager", "exploration", 1, 2, 1, 3); // stress, stand_exp, skill_exp, abil_p
                            }
                        break;
                        case 31: //špalek
                            in_chest = chest.in_chest_ord();
                            console.log(in_chest.length);
                            
                            if (in_chest.length < 1) {
                                chest.get_chest(chest);
                                index = player.test_item(31, 1);
                                player.subtract_item(index, 1);
                                index = player.unequip();
                                player.subtract_item(index, 1);
                                index = player.add_item(38, 1); // palice
                                player.equip(index, 38);
                                player.work_rout("toolmaker", "dexterity", 1, 3, 2, 3); // stress, stand_exp, skill_exp, abil_p
                            } else {
                                chest.take_all();
                                player.put_all(in_chest);
                                chest.get_chest(chest);
                                player.work_rout("forager", "exploration", 1, 2, 1, 3); // stress, stand_exp, skill_exp, abil_p
                            }
                        break;
                    }
                break;
                case 8: //palice
                    switch (chest.closed_frame) {
                        case 29: //prac. stůl
                            in_chest = chest.in_chest_ord();
                            console.log(in_chest.length);
                            
                            if (in_chest.length > 0) {
                                recipe = [{f: 59, q: 20}]; //20 kam. blok
                                if (chest.chest_compare(in_chest, recipe)) {
                                    index = chest.test_item(59, 20);
                                    chest.subtract_item(index, 20);
                                    chest.add_item(64, 1); // kam. pec
                                    chest.updated = true;
                                    player.work_rout("builder", "dexterity", 1, 4, 3, 3); // stress, stand_exp, skill_exp, abil_p
                                }
                            }
                        break;
                        case 31: //špalek
                            in_chest = chest.in_chest_ord();
                            console.log(in_chest.length);
                            
                            if (in_chest.length > 0) {
                                recipe = [{f: 24, q: 4}, {f: 32, q: 2}]; //4 hole, 2 prkna
                                if (chest.chest_compare(in_chest, recipe)) {
                                    index = chest.test_item(24, 4);
                                    chest.subtract_item(index, 4);
                                    index = chest.test_item(32, 2);
                                    chest.subtract_item(index, 2);
                                    chest.add_item(29, 1); // prac. stůl
                                    chest.updated = true;
                                    player.work_rout("toolmaker", "exploration", 1, 4, 3, 3); // stress, stand_exp, skill_exp, abil_p
                                }
                            }
                        break;
                            
                    }
                break;
                
            }
            
        }
    } else {
        
    }
    this.cut = false;
};

Mst.Sword.prototype.create_bullet = function () {
    "use strict";
    var object_name, object_position, object_properties, object;
    
    object_position = {
        x: (this.game_state.prefabs.player.x + (this.game_state.prefabs.player.direction_chest.x * 10)),
        y: (this.game_state.prefabs.player.y + (this.game_state.prefabs.player.direction_chest.y * 10))
    };
    
    object_properties = {
        direction: this.game_state.prefabs.player.direction_chest,
        texture: "magic1",
        firstframe: 0,
        group: "playerbullets"
    };
    
    object = this.b_pool.getFirstDead();
        
    if (!object) {
        object_name = "bullet_" + this.b_pool.countLiving();
        object = new Mst.Bullet(this.game_state, object_name, object_position, object_properties);
    } else {
        object.reset(object_position, object_properties);
    }
};