var Mst = Mst || {};

Mst.Enemy = function (game_state, name, position, properties) {
    "use strict";
    Mst.Prefab.call(this, game_state, name, position, properties);
    
    this.walking_speed = +properties.walking_speed;
    this.walking_distance = +properties.walking_distance;
    
    this.health_max = 40;
    this.health = this.health_max;
    
    this.en_attack = 2;
    
    
    
    
    this.knockbacki = 0;
    
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
    
    switch (properties.texture) {
        case "slime_spritesheet":
            this.animations.add("go", [0, 1], 5, true);
            this.animations.play("go");
    
            this.anchor.setTo(0.5);
            this.monster_type = "slime";
            this.monster_loot = this.game_state.core_data.creatures["slime"].loot;
        break;
        case "rabite_spritesheet":
            this.health_max = 100;
            this.health = this.health_max;
    
            this.en_attack = 10;
            
            this.animations.add("go", [0, 1, 2, 3, 4, 5, 6], 10, true);
            this.animations.play("go");
    
            this.anchor.setTo(0.7);
            this.monster_type = "rabite";
            this.monster_loot = this.game_state.core_data.creatures["rabite"].loot;
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
            this.monster_loot = this.game_state.core_data.creatures["wasp"].loot;
        break;
    }
    
    this.b_pool = this.game_state.groups.enemybullets;
    
    this.emitter = this.game_state.game.add.emitter(0, 0, 100);
    this.emitter.makeParticles('blood', [0,1,2,3,4,5,6]);
    this.emitter.gravity = 120;
    this.emitter.setAlpha(1, 0, 400);


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
    this.scale.setTo(Math.sign(this.body.velocity.x), 1);
    
    if (this.knockbacki > 0) {
        this.knockbacki--;
    } else if (this.detect_player()) {
        if (this.game_state.game.physics.arcade.distanceBetween(this, this.game_state.prefabs.player) > 45) {
            this.game_state.game.physics.arcade.moveToObject(this, this.game_state.prefabs.player, 60);
        } else {
            this.game_state.game.physics.arcade.accelerateToObject(this, this.game_state.prefabs.player, 60);
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
    
    this.game_state.game.physics.arcade.moveToObject(enemy, this.game_state.prefabs.player, -100);
    this.knockbacki = 10;
};

Mst.Enemy.prototype.knockback_by_player = function (enemy, player) {
    "use strict";
    
    this.game_state.game.physics.arcade.moveToObject(enemy, player, -70);
    this.knockbacki = 10;
};

Mst.Enemy.prototype.knockback_by_hit = function (enemy, player, type) {
    "use strict";
    
    if (type === "magic") {
        this.game_state.game.physics.arcade.moveToObject(enemy, player, -60);
        enemy.knockbacki = 5;
    } else {
        this.game_state.game.physics.arcade.moveToObject(enemy, player, -90);
        this.knockbacki = 10;
    }

};

Mst.Enemy.prototype.hit_enemy_sword = function (player, enemy) {
    var sword_cut = this.game_state.prefabs.sword.cut;
    console.log(this.game_state.prefabs.sword);
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
    var damage = 2 + (player.stats.abilities.intelligence/5);
    damage += player.level("standard") + (player.level("magic")*1.5);
    damage = Math.floor(damage);
    console.log("DM: " + damage);
    
    this.hit_enemy(player, enemy, "magic", "intelligence", damage);
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
        
        if (enemy.health < 1) {
            player.add_exp("standard", enemy_health_max);
            player.add_exp(type, enemy_health_max / 2);
            
            var i_frame;
            var m_length = this.monster_loot.length;
            for (var i = 0; i < m_length; i++) {
                i_frame = this.monster_loot[i];
                player.add_item(i_frame, 1); // loot
            }
                        
            enemy.kill();
            if (enemy.key == "wasp_spritesheet") {
                enemy.timer_sting.stop();
            }
            
        }
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
};

Mst.Enemy.prototype.detect_player = function () {
    "use strict";
    var distance_to_player;
    distance_to_player = this.game_state.game.physics.arcade.distanceBetween(this, this.game_state.prefabs.player);

    return distance_to_player <= 200;
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

