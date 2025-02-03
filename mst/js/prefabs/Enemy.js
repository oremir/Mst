Mst.Enemy = function (game_state, name, position, properties) {
    "use strict";
    Mst.Prefab.call(this, game_state, name, position, properties);
    
    this.pool = this.game_state.groups[properties.pool];
    
    this.walking_speed = +properties.walking_speed;
    this.walking_distance = +properties.walking_distance;
    
    this.health_max = 40;
    this.health = this.health_max;
    
    this.en_attack = 2;
    
    this.knockbacki = 0;
    this.knockbacked = false;
    
    // saving previous x to keep track of walked distance
    this.previous_x = this.x;
    
    this.game_state.game.physics.arcade.enable(this);
    this.body.bounce.setTo(1);
    this.body.collideWorldBounds = true;
    
    this.body.velocity.x = properties.direction * this.walking_speed;
    this.body.velocity.y = this.game_state.game.rnd.between(-20, 20);
    
    this.scale.setTo(-properties.direction, 1);
    
    console.log("Enemy texture:");
    console.log(this.key);
    this.stand_still = false;
    
    switch (properties.texture) {
        case "slime_spritesheet":
            this.animations.add("go", [0, 1], 5, true);
            this.animations.play("go");
    
            this.anchor.setTo(0.5);
            
            this.monster_type = "slime";
            this.monster_loot = this.game_state.gdata.core.creatures.slime.loot;
        break;
        case "rabite_spritesheet":
            this.health_max = 100;
            this.health = this.health_max;
    
            this.en_attack = 10;
            
            this.animations.add("go", [0, 1, 2, 3, 4, 5, 6], 10, true);
            this.animations.play("go");
    
            this.anchor.setTo(0.7);
            
            this.monster_type = "rabite";
            this.monster_loot = this.game_state.gdata.core.creatures.rabite.loot;
        break;
        case "boar_spritesheet":
            this.health_max = 180;
            this.health = this.health_max;
    
            this.en_attack = 20;
            
            this.animations.add("go", [0, 1], 5, true);
            this.animations.play("go");
    
            this.anchor.setTo(0.5);
            
            this.monster_type = "boar";
            this.monster_loot = this.game_state.gdata.core.creatures.boar.loot;
        break;
        case "wasp_spritesheet":
            this.health_max = 150;
            this.health = this.health_max;
    
            this.en_attack = 15;
            
            this.animations.add("go", [0, 1], 5, true);
            this.animations.play("go");
    
            this.anchor.setTo(0.5);
            
            this.timer_sting = this.game_state.game.time.create(false);
            this.timer_sting.loop(Phaser.Timer.SECOND * 0.6, this.create_bullet, this);
            this.timer_sting.start();
            
            this.monster_type = "wasp";
            this.monster_loot = this.game_state.gdata.core.creatures.wasp.loot;
        break;
        case "spider_spritesheet":
            this.health_max = 200;
            this.health = this.health_max;
    
            this.en_attack = 20;
            
            this.animations.add('left', [6, 7], 10, true);
            this.animations.add('right', [4, 5], 10, true);
            this.animations.add('up', [2, 3], 10, true);
            this.animations.add('down', [0, 1], 10, true);
    
            this.anchor.setTo(0.5);
            
            this.timer_web = this.game_state.game.time.create(false);
            this.timer_web.loop(Phaser.Timer.SECOND * 0.6, this.create_web, this);
            this.timer_web.start();
            
            this.monster_type = "spider";
            this.monster_loot = this.game_state.gdata.core.creatures.spider.loot;
        break;
        case "angostura_spritesheet":
            this.health_max = 100000;
            this.health = this.health_max;
            
            this.animations.add("go", [0, 1], 5, true);
            this.animations.play("go");
    
            this.anchor.setTo(0.5);
            this.body.immovable = true;
            this.body.velocity.x = 0;
            this.body.velocity.y = 0;
            
            this.timer_vyh = this.game_state.game.time.create(false);
            this.timer_vyh.loop(Phaser.Timer.SECOND * 1, this.create_vyh, this);
            this.timer_vyh.start();
            
            this.ang_run = true;
            this.stand_still = true;
            this.monster_type = "angostura";
            this.monster_loot = this.game_state.gdata.core.creatures.angostura.loot;
        break;
        case "angostura-v_spritesheet":
            this.health_max = 15;
            this.health = this.health_max;
            
            this.animations.add("go", [0, 1, 2, 3, 4, 5, 6, 7], 10, true);
            this.animations.play("go");
    
            this.anchor.setTo(0.5);
            this.body.immovable = true;
            this.body.velocity.x = 0;
            this.body.velocity.y = 0;
            
            this.ang_run = true;
            this.stand_still = true;
            this.monster_type = "angostura-v";
            this.monster_loot = this.game_state.gdata.core.creatures["angostura-v"].loot;
        break;
        case "rotulice_spritesheet":
            this.health_max = 150;
            this.health = this.health_max;
            
            this.en_attack = 3;
            
            this.animations.add("go", [0, 1, 2, 3], 15, true);
            this.animations.play("go");
    
            this.anchor.setTo(0.5);            
            
            this.monster_type = "rotulice";
            this.monster_loot = this.game_state.gdata.core.creatures.rotulice.loot;
        break;        
        case "cmelotrysk_spritesheet":
            this.health_max = 150;
            this.health = this.health_max;
    
            this.en_attack = 0;
            
            this.animations.add("go", [0, 1], 5, true);
            this.animations.play("go");
    
            this.anchor.setTo(0.5);
            
            this.monster_type = "cmelotrysk";
            this.monster_loot = this.game_state.gdata.core.creatures.cmelotrysk.loot;
        break;
    }
    
    this.b_pool = this.game_state.groups.enemybullets;
    this.w_pool = this.game_state.groups.overlaps;
    
    this.emitter = this.game_state.game.add.emitter(0, 0, 100);
    this.emitter.makeParticles('blood', [0,1,2,3,4,5,6]);
    this.emitter.gravity = 120;
    this.emitter.setAlpha(1, 0, 400);
    
//    if (typeof (this.game_state.prefabs.player) !== 'undefined') {
//        this.game_state.prefabs.player.infight = true;
//    }
    
    this.stopped = false;


};

Mst.Enemy.prototype = Object.create(Mst.Prefab.prototype);
Mst.Enemy.prototype.constructor = Mst.Enemy;

Mst.Enemy.prototype.update = function () {
    "use strict";
    var direction;
    
    this.game_state.game.physics.arcade.collide(this, this.game_state.layers.collision);
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.chests);
    //this.game_state.game.physics.arcade.collide(this, this.game_state.groups.enemies.forEachAlive(null, this));
    this.game_state.groups.enemies.forEachAlive(function(one_enemy) {
        this.game_state.game.physics.arcade.collide(this, one_enemy, this.knockback_by_other_enemy, null, this);
    }, this);
    
    //console.log(this.name + " " + this.body.facing + " " + Math.sign(this.body.velocity.x));
    if (this.monster_type === 'spider') {
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
    } else {
        this.scale.setTo(Math.sign(this.body.velocity.x), 1);
        if (this.body.velocity.x === 0) {
            var sc = Math.sign(this.game_state.prefabs.player.x - this.x);
            this.scale.setTo(sc, 1);
        }
    }
    
    if (this.body.immovable) {
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
    }
    
    if (this.knockbacki > 0) {
        this.knockbacki--;
    } else {
        this.knockbacked = false;
        if (this.detect_player() && !this.body.immovable) {
            if (this.game_state.game.physics.arcade.distanceBetween(this, this.game_state.prefabs.player) > 45) {
                this.game_state.game.physics.arcade.moveToObject(this, this.game_state.prefabs.player, 60);
            } else {
                this.game_state.game.physics.arcade.accelerateToObject(this, this.game_state.prefabs.player, 60);
            }
        }
    } /*else {
        if (this.body.speed > this.walking_speed) {
            console.log(this.body.speed+" "+this.body.velocity.x+" "+this.body.velocity.y);
            var rnd_vel_cor = this.game_state.game.rnd.between(7, 9);
            
            
            
            this.body.velocity.x *= rnd_vel_cor*0.1;
            this.body.velocity.y *= rnd_vel_cor*0.1;
            
            console.log(rnd_vel_cor+" "+this.body.velocity.x+" "+this.body.velocity.y);
        }
    }*/
    
    if (this.game_state.prefabs.sword.alive) {
        if (this.game_state.game.physics.arcade.distanceBetween(this, this.game_state.prefabs.sword) < 19) {
            this.hit_enemy_sword(this.game_state.prefabs.player, this);
        }
    }
};

Mst.Enemy.prototype.knockback_by_other_enemy = function (enemy, o_enemy) {
    "use strict";
    if (!this.body.immovable) {
        this.game_state.game.physics.arcade.moveToObject(enemy, this.game_state.prefabs.player, -100);
    }
    this.knockbacki = 10;
};

Mst.Enemy.prototype.knockback_by_player = function (enemy, player) {
    "use strict";
    
    if (!this.body.immovable) {
        this.game_state.game.physics.arcade.moveToObject(enemy, player, -70);
    }
    this.knockbacki = 10;
    this.knockbacked = true;
};

Mst.Enemy.prototype.knockback_by_hit = function (enemy, player, type) {
    "use strict";
    
    if (type === "magic") {
        if (!this.body.immovable) {
            this.game_state.game.physics.arcade.moveToObject(enemy, player, -60);
        }
        enemy.knockbacki = 5;
    } else {
        if (!this.body.immovable) {
            this.game_state.game.physics.arcade.moveToObject(enemy, player, -90);
        }
        this.knockbacki = 10;
    }
    this.knockbacked = true;

};

Mst.Enemy.prototype.hit_enemy_sword = function (player, enemy) {
    var sword_cut = this.game_state.prefabs.sword.cut;
    //console.log(this.game_state.prefabs.sword);
    console.log("!!! Hit CUT: " + sword_cut);
    
    if (sword_cut) {
        var damage = 2 + (player.stats.abilities.strength/5);
        damage += player.level("standard") + (player.level("fighter")*1.5);
        damage = Math.floor(damage);
        console.log("DM: " + damage);

        this.hit_enemy(player, enemy, "fighter", "strength", damage);
        
        this.game_state.prefabs.sword.cut = false;
        console.log("!!! Hit2 CUT: " + this.game_state.prefabs.sword.cut);
    }
};

Mst.Enemy.prototype.hit_enemy_magic = function (player, enemy) {
    var damage = 2 + (player.stats.abilities.intelligence/3);
    damage += player.level("standard") + (player.level("magic")*1.7);
    damage = Math.floor(damage);
    console.log("DM: " + damage);
    
    this.hit_enemy(player, enemy, "magic", "intelligence", damage);
};

Mst.Enemy.prototype.hit_enemy_arrow = function (player, enemy) {
    var damage = 4 + (player.stats.abilities.dexterity/3);
    damage += player.level("standard") + (player.level("archer")*1.7);
    damage = Math.floor(damage);
    console.log("DM: " + damage);
    
    this.hit_enemy(player, enemy, "archer", "dexterity", damage);
};

Mst.Enemy.prototype.hit_enemy_throw = function (player, enemy) {
    var damage = 2 + (player.stats.abilities.dexterity/5);
    damage += player.level("standard") + (player.level("thrower")*1.5);
    damage = Math.floor(damage);
    console.log("DM: " + damage);
    
    this.hit_enemy(player, enemy, "thrower", "dexterity", damage);
};

Mst.Enemy.prototype.hit_enemy_sling = function (player, enemy) {
    var damage = 3 + (player.stats.abilities.dexterity/4);
    damage += player.level("standard") + (player.level("thrower")*1.6);
    damage = Math.floor(damage);
    console.log("DM: " + damage);
    
    this.hit_enemy(player, enemy, "thrower", "dexterity", damage);
};

Mst.Enemy.prototype.hit_enemy_meat = function (player, enemy) {
    var damage = 2 + (player.stats.abilities.dexterity/5);
    damage += player.level("standard") + (player.level("thrower")*1.5);
    damage = Math.floor(damage);
    console.log("DM: " + damage);
    var axp = Math.floor(damage/2);
    var enemy_health_max = parseInt(enemy.health_max);
    if (axp > enemy_health_max/2) {axp = Math.floor(enemy_health_max/2);}
    
    player.work_rout("thrower", "dexterity", 1, axp, axp, 3); // stress, stand_exp, skill_exp, abil_p
    
    this.game_state.game.time.events.add(Phaser.Timer.SECOND * 5, this.intomove, this);
    this.body.immovable = true;
    if (this.monster_type === "angostura") {
        this.ang_run = false;
    }
};

Mst.Enemy.prototype.hit_enemy_pet = function (player, enemy) {
    var damage = 2 + (player.stats.abilities.strength/5);
    damage += player.level("standard") + (player.level("fighter")*1.5);
    damage = Math.floor(damage);
    console.log("DM: " + damage);
    
    this.hit_enemy(player, enemy, "fighter", "strength", damage);
};

Mst.Enemy.prototype.hit_enemy = function (player, enemy, type, ability, damage) {
    "use strict";
    
    var enemy_health_max = parseInt(enemy.health_max);
    
    if (enemy.alive) {
        enemy.health -= damage;
        
        var axp = Math.floor(damage/2);
        if (axp > enemy_health_max/2) {axp = Math.floor(enemy_health_max/2);}

        player.work_rout(type, ability, 1, axp, axp, 3); // stress, stand_exp, skill_exp, abil_p
        
        enemy.knockback_by_hit(enemy, player, type);
        
        this.emitter.x = this.x;
        this.emitter.y = this.y;
        this.emitter.start(true, 1000, null, 8);
        
        console.log("Hit Enemy");
        
        if (enemy.health < 1) {
            player.add_exp("standard", enemy_health_max);
            player.add_exp(type, enemy_health_max / 2);
            
            var i_frame;
            var m_length = this.monster_loot.length;
            for (var i = 0; i < m_length; i++) {
                i_frame = this.monster_loot[i];
                player.key_close();
                player.add_item(i_frame, 1); // loot
            }
                        
            enemy.kill();
            if (enemy.key == "wasp_spritesheet") {
                enemy.timer_sting.stop();
            }
            
            if (enemy.key == "spider_spritesheet") {
                enemy.timer_web.stop();
            }
            
            console.log("Enemy count:" + this.pool.countLiving());
            console.log(this.pool);
            
            if (this.pool.countLiving() < 1) {
                this.game_state.prefabs.player.infight = false;
            }
            
        }
    }
};

Mst.Enemy.prototype.intomove = function () {
    "use strict";
    
    if (!this.stand_still) {
        this.body.immovable = false;
    }
    
    if (this.monster_type === "angostura") {
        this.ang_run = true;
    }
};

Mst.Enemy.prototype.reset = function (position) {
    "use strict";
    
    this.position_x = position.x;
    this.position_y = position.y;
    
    Phaser.Sprite.prototype.reset.call(this, this.position_x, this.position_y, this.health_max);
    
    this.body.velocity.x = this.game_state.game.rnd.between(-40, 50);
    this.body.velocity.y = this.game_state.game.rnd.between(-60, 30);

    console.log("Reset Enemy key: " + this.key);
    if (this.key == "wasp_spritesheet") {
        this.timer_sting.loop(Phaser.Timer.SECOND * 0.6, this.create_bullet, this);
        this.timer_sting.start();
        console.log(this.timer_sting);
    }
    
    if (this.key == "spider_spritesheet") {
        this.timer_web.loop(Phaser.Timer.SECOND * 0.6, this.create_web, this);
        this.timer_web.start();
        console.log(this.timer_web);
    }
    
    //this.game_state.prefabs.player.infight = true;
};

Mst.Enemy.prototype.detect_player = function () {
    "use strict";
    var distance_to_player;
    distance_to_player = this.game_state.game.physics.arcade.distanceBetween(this, this.game_state.prefabs.player);
    if (distance_to_player <= 70) {
        this.game_state.prefabs.player.infight = true;
    } else {
        this.game_state.game.time.events.add(Phaser.Timer.SECOND * 10, this.close_fight, this);
    }

    return distance_to_player <= 200;
};

Mst.Enemy.prototype.close_fight = function () {
    "use strict";
    if (this.game_state.prefabs.player.infight) {
        console.log("Close fight");
        this.game_state.prefabs.player.infight = false;
    }
};

Mst.Enemy.prototype.create_bullet = function () {
    "use strict";
    var object_name, object_position, object_properties, object;
    
    object_position = {
        x: (this.x + (Math.sign(this.body.velocity.x) * 10)),
        y: (this.y )
    };
    
    object_properties = {
        direction: {"x": Math.sign(this.body.velocity.x), "y": 0},
        texture: "sting",
        firstframe: 0,
        group: "enemybullets"
    };
    
    object = this.b_pool.getFirstDead();
        
    if (!object) {
        object_name = "bullet_" + this.b_pool.countLiving();
        object = new Mst.Bullet(this.game_state, object_name, object_position, object_properties);
    } else {
        object.reset(object_position, object_properties);
    }
};

Mst.Enemy.prototype.create_web = function () {
    "use strict";
    var object_name, object_position, object_properties, object;
    
    object_position = {
        x: (this.x + (Math.sign(this.body.velocity.x) * 10)),
        y: (this.y )
    };
    
    object_properties = {
        direction: {"x": Math.sign(this.body.velocity.x), "y": 0},
        texture: "web",
        firstframe: 0,
        group: "overlaps"
    };
    
    
    object = this.w_pool.getFirstDead();
        
    if (!object) {
        object_name = "web_" + this.w_pool.countLiving();
        object = new Mst.Prefab(this.game_state, object_name, object_position, object_properties);
        
        //this.game_state.groups[this.stats_group].create(stat_position.x - 4, stat_position.y + 20, 'frame_bot');
        
    } else {
        object.reset(object_position, object_properties);
    }
    
    object.game_state.game.physics.arcade.enable(object);
    object.anchor.setTo(0.5);    
    object.body.immovable = true;
    
    console.log("Web");
    console.log(object);
};

Mst.Enemy.prototype.create_vyh = function () {
    "use strict";
    var object_name, object_position, object_properties, object;
    
    if (this.game_state.game.physics.arcade.distanceBetween(this, this.game_state.prefabs.player) < 45) {
        object_position = {
            x: this.game_state.prefabs.player.x + this.game_state.prefabs.player.direction_chest.x * 14,
            y: this.game_state.prefabs.player.y + this.game_state.prefabs.player.direction_chest.y * 14
        };
        
        object_properties = {
            direction: {"x": Math.sign(this.body.velocity.x), "y": this.game_state.prefabs.player.y},
            texture: "angostura-v_spritesheet",
            firstframe: 0,
            group: "enemies",
            pool: "enemies"
        };


        object = this.pool.getFirstDead();

        if (!object) {
            object_name = "web_" + this.w_pool.countLiving();
            object = new Mst.Enemy(this.game_state, object_name, object_position, object_properties);

            //this.game_state.groups[this.stats_group].create(stat_position.x - 4, stat_position.y + 20, 'frame_bot');

        } else {
            object.reset(object_position, object_properties);
        }

        object.game_state.game.physics.arcade.enable(object);
        object.anchor.setTo(0.5);    
        object.body.immovable = true;
        
        if (this.ang_run) {
            object.game_state.game.time.events.add(Phaser.Timer.SECOND * 0.4, this.kill, object);
        }

        console.log("vyhonek");
        console.log(object);
    }
};

Mst.Enemy.prototype.c_stop = function (player) {
    "use strict";
    
    this.body.immovable = true;
};

Mst.Enemy.prototype.cmelo_stop = function (player) {
    "use strict";
    
    this.body.immovable = true;
    //const player = this.game_state.prefabs.player;
    
    this.cmelotrysk_sprite =  new Mst.NPC(this.game_state, "cmelotrysk", {x: this.x, y: this.y}, {
                group: "NPCs",
                pool: "NPCs",
                texture: "blank_image",
                p_name: "cmelotrysk",
                unique_id: 0,
                stype: "cmelotrysk",
                relations_allowed : "false",
                region: 0,
                o_type: "NPC"
            });
    this.cmelotrysk_sprite.add_ren();
    
    var position = { x: player.x, y: player.y };
    var properties = {
        group: "shadows",
        pool: "shadows",
        stype: "shadow",
        items: "",
        closed_frame: 41,
        opened_frame: 41,        
        texture: "blank_image"
    };

    player.shadow = new Mst.Chest(this.game_state, "cpgive", position, properties);
    player.opened_chest = "cpgive";
    player.shadow.open_chest(player, player.shadow);
    
    player.infight = false;                        
    this.cmelotrysk_sprite.touch_player(this.cmelotrysk_sprite, player);        
};

Mst.Enemy.prototype.spec_attack = function (player) {
    "use strict";
    var attack = this.en_attack;
    
    switch (this.monster_type) {
        case "rotulice":
            if (player.index_buff(1) < 0) {
                attack = player.stats.health_max + 1;
            }
        break;
        case "cmelotrysk":
            console.log("čmelotrysk");
            var index = player.test_item(112, 1); //kopřiva
            if (index > -1) {
                attack = 0;
                this.game_state.game.time.events.add(Phaser.Timer.SECOND * 0.3, this.cmelo_stop, this);
            } else {
                attack = 20;
            }
        break;
        default:
        break;
    }
    
    return attack;
};