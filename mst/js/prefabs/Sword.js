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
        if (typeof (this.game_state.layers.collision_forrest) !== 'undefined' && this.cut && this.cut_type === "wood") {
            this.game_state.game.physics.arcade.overlap(this, this.game_state.layers.collision_forrest,  this.cut_wood, null, this);
            //console.log(this.game_state.layers.collision_forrest);
        }
        if (typeof (this.game_state.layers.collision_rock) !== 'undefined' && this.cut && this.cut_type === "stone") {
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
            this.game_state.prefabs.player.add_stress(1);
            this.game_state.prefabs.player.add_exp("standard", 1);
            this.game_state.prefabs.player.add_exp("magic", 1);
            this.game_state.prefabs.player.add_ability("intelligence", 3, 0);
            
            this.create_bullet();
        }
    }
};

Mst.Sword.prototype.hit_enemy = function (player, enemy) {
    "use strict";
    
    var enemy_health_max = parseInt(enemy.health_max);
    
    if (enemy.knockbacki < 1 && enemy.alive) {
        var damage = 2 + (player.stats.abilities.strength/2);
        damage += (player.stats.skills.standard.level*2) + (player.stats.skills.fighter.level*3);
        console.log("DM: " + damage);
        enemy.health -= Math.floor(damage);
        
        var axp = Math.floor(damage/2);
        if (axp > enemy_health_max/2) {axp = Math.floor(enemy_health_max/2);}

        player.add_stress(1);
        player.add_exp("standard", axp);
        player.add_exp("fighter", axp);
        player.add_ability("strength", 3, 0);
        this.game_state.game.physics.arcade.moveToObject(enemy, player, -90);
        enemy.knockbacki = 10;
        
        if (enemy.health < 1) {
            player.add_exp("standard", enemy_health_max);
            player.add_exp("fighter", enemy_health_max / 2);
            player.add_item(23, 1); // gel
            
            enemy.kill();
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
        
        player.add_stress(1);
        player.add_item(30, 1); // wood
        player.add_exp("standard", 2);
        player.add_exp("woodcutter", 1);
        player.add_ability("strength", 3, 0);
        
        rnd_test = Math.floor(Math.random() * 20);
        if (rnd_test < 2) {
            player.add_item(33, 1); // apple
        }
    }
    
    this.cut = false;
};

Mst.Sword.prototype.cut_stone = function (tool, stone) {
    "use strict";
    var x, y, tile, player, rnd_test;
    player = this.game_state.prefabs.player;
    
    x = player.direction_chest.x + stone.x;
    y = player.direction_chest.y + stone.y;
    
    //console.log(wood);
    //console.log(this.game_state.layers.collision_forrest.layer.data[y][x]);
    if (this.game_state.map.getTile(x, y, "collision_rock") !== null) {
        console.log("Cut stone");
        
        player.add_stress(1);
        player.add_item(21, 1); // stone
        player.add_exp("standard", 2);
        player.add_exp("stonebreaker", 1);
        player.add_ability("strength", 3, 0);
        
        rnd_test = Math.floor(Math.random() * 20);
        if (rnd_test < 2) {
            player.add_item(40, 1); // lichen
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
            console.log("Chest frame: " + chest.closed_frame);
            console.log("Tool frame: " + tool_frame);
            switch (tool_frame) {
                case 1: //sekera                    
                    switch (chest.closed_frame) {
                        case 7: //dřevo
                            in_chest = chest.in_chest_ord();
                            chest.take_all();
                            player.put_all(in_chest);
                            chest.get_chest(chest);
                        break;
                        case 30: //kmen
                            in_chest = chest.in_chest_ord();
                            console.log(in_chest.length);
                            
                            if (in_chest.length < 1) {
                                chest.closed_frame = 31;
                                chest.opened_frame = 31;
                                chest.frame = 31;
                                chest.add_item(31, 1); //špalek
                                chest.updated = true;
                            }  else {
                                chest.take_all();
                                player.put_all(in_chest);
                                chest.get_chest(chest);
                            }
                        break;
                        case 31: //špalek
                            index = chest.test_item(30, 1); //kmen
                            console.log(index);
                            if (index > -1) {
                                chest.subtract_item(index, 1);
                                chest.add_item(31, 2); //špalek
                                chest.updated = true;  
                            } else {
                                index = chest.test_item(31, 1);
                                console.log(index);
                                if (index > -1) {
                                    chest.subtract_item(index, 1);
                                    chest.add_item(32,2); //prkno
                                    chest.updated = true;
                                } else {
                                    index = chest.test_item(32, 1);
                                    console.log(index);
                                    if (index > -1) {
                                        chest.subtract_item(index, 1);
                                        chest.add_item(24, 2); // hůl
                                        chest.updated = true;    
                                    } 
                                }
                            }
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
                                chest.closed_frame = 58;
                                chest.opened_frame = 58;
                                chest.frame = 58; //op. kámen
                                chest.updated = true;
                            }  else {
                                chest.take_all();
                                player.put_all(in_chest);
                                chest.get_chest(chest);
                            }
                        break;
                        case 58: //op. kámen
                            chest.closed_frame = 59;
                            chest.opened_frame = 59;
                            chest.frame = 59;
                            chest.add_item(59, 1); //kam. blok
                            chest.updated = true;
                        break;
                        case 59: //kam. blok
                            chest.closed_frame = 60;
                            chest.opened_frame = 60;
                            chest.frame = 60; //kam. nádoba
                            chest.updated = true;
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
                            } else {
                                chest.take_all();
                                player.put_all(in_chest);
                                chest.get_chest(chest);
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
                            } else {
                                chest.take_all();
                                player.put_all(in_chest);
                                chest.get_chest(chest);
                            }
                        break;
                    }
                break;
                case 8: //palice
                    switch (chest.closed_frame) {
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