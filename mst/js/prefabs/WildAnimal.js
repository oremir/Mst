Mst.WildAnimal = function (game_state, name, position, properties) {
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
    
    console.log("WildAnimal texture:");
    console.log(this.key);
    this.stand_still = false;
    
    switch (properties.texture) {
        case "partridge_spritesheet":
            this.animations.add("go", [0, 1], 5, true);
            this.animations.play("go");
    
            this.anchor.setTo(0.5);
            
            this.animal_type = "partridge";
            this.animal_loot = this.game_state.gdata.core.creatures.partridge.loot;
        break;
        case "doe_spritesheet":
            this.animations.add("go", [0, 1], 5, true);
            this.animations.play("go");
    
            this.anchor.setTo(0.5);
            
            this.animal_type = "doe";
            this.animal_loot = this.game_state.gdata.core.creatures.doe.loot;
        break;
    }
    
    this.b_pool = this.game_state.groups.WildAnimalbullets;
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

Mst.WildAnimal.prototype = Object.create(Mst.Prefab.prototype);
Mst.WildAnimal.prototype.constructor = Mst.WildAnimal;

Mst.WildAnimal.prototype.update = function () {
    "use strict";
    var direction;
    
    this.game_state.game.physics.arcade.collide(this, this.game_state.layers.collision);
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.chests);
    //this.game_state.game.physics.arcade.collide(this, this.game_state.groups.enemies.forEachAlive(null, this));
    this.game_state.groups.wildanimals.forEachAlive(function(one_animal) {
        this.game_state.game.physics.arcade.collide(this, one_animal, this.knockback_by_other_animal, null, this);
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
            this.game_state.game.physics.arcade.moveToObject(this, this.game_state.prefabs.player, -110);
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
            this.hit_animal_sword(this.game_state.prefabs.player, this);
        }
    }
};

Mst.WildAnimal.prototype.knockback_by_other_animal = function (animal, o_animal) {
    "use strict";
    if (!this.body.immovable) {
        this.game_state.game.physics.arcade.moveToObject(animal, this.game_state.prefabs.player, -100);
    }
    this.knockbacki = 10;
};

Mst.WildAnimal.prototype.knockback_by_player = function (animal, player) {
    "use strict";
    
    if (!this.body.immovable) {
        this.game_state.game.physics.arcade.moveToObject(animal, player, -110);
    }
    this.knockbacki = 10;
    this.knockbacked = true;
};

Mst.WildAnimal.prototype.knockback_by_hit = function (animal, player, type) {
    "use strict";
    
    if (type === "magic") {
        if (!this.body.immovable) {
            this.game_state.game.physics.arcade.moveToObject(animal, player, -60);
        }
        animal.knockbacki = 5;
    } else {
        if (!this.body.immovable) {
            this.game_state.game.physics.arcade.moveToObject(animal, player, -90);
        }
        this.knockbacki = 10;
    }
    this.knockbacked = true;

};

Mst.WildAnimal.prototype.hit_animal_sword = function (player, animal) {
    var sword_cut = this.game_state.prefabs.sword.cut;
    //console.log(this.game_state.prefabs.sword);
    console.log("!!! Hit CUT: " + sword_cut);
    
    if (sword_cut) {
        var damage = 2 + (player.stats.abilities.strength/5);
        damage += player.level("standard") + (player.level("fighter")*1.5);
        damage = Math.floor(damage);
        console.log("DM: " + damage);

        this.hit_animal(player, animal, "fighter", "strength", damage);
        
        this.game_state.prefabs.sword.cut = false;
        console.log("!!! Hit2 CUT: " + this.game_state.prefabs.sword.cut);
    }
};

Mst.WildAnimal.prototype.hit_animal_magic = function (player, animal) {
    var damage = 2 + (player.stats.abilities.intelligence/5);
    damage += player.level("standard") + (player.level("magic")*1.5);
    damage = Math.floor(damage);
    console.log("DM: " + damage);
    
    this.hit_animal(player, animal, "magic", "intelligence", damage);
};

Mst.WildAnimal.prototype.hit_animal_arrow = function (player, animal) {
    var damage = 2 + (player.stats.abilities.dexterity/5);
    damage += player.level("standard") + (player.level("archer")*1.5);
    damage = Math.floor(damage);
    console.log("DM: " + damage);
    
    this.hit_animal(player, animal, "archer", "dexterity", damage);
};

Mst.WildAnimal.prototype.hit_animal_throw = function (player, animal) {
    var damage = 2 + (player.stats.abilities.dexterity/5);
    damage += player.level("standard") + (player.level("thrower")*1.5);
    damage = Math.floor(damage);
    console.log("DM: " + damage);
    
    this.hit_animal(player, animal, "thrower", "dexterity", damage);
};

Mst.WildAnimal.prototype.hit_animal_meat = function (player, animal) {
    var damage = 2 + (player.stats.abilities.dexterity/5);
    damage += player.level("standard") + (player.level("thrower")*1.5);
    damage = Math.floor(damage);
    console.log("DM: " + damage);
    var axp = Math.floor(damage/2);
    var animal_health_max = parseInt(animal.health_max);
    if (axp > animal_health_max/2) {axp = Math.floor(animal_health_max/2);}
    
    player.work_rout("thrower", "dexterity", 1, axp, axp, 3); // stress, stand_exp, skill_exp, abil_p
    
    this.game_state.game.time.events.add(Phaser.Timer.SECOND * 5, this.intomove, this);
    this.body.immovable = true;
    if (this.monster_type === "angostura") {
        this.ang_run = false;
    }
};

Mst.WildAnimal.prototype.hit_animal_pet = function (player, animal) {
    var damage = 2 + (player.stats.abilities.strength/5);
    damage += player.level("standard") + (player.level("fighter")*1.5);
    damage = Math.floor(damage);
    console.log("DM: " + damage);
    
    this.hit_animal(player, animal, "fighter", "strength", damage);
};

Mst.WildAnimal.prototype.hit_animal = function (player, animal, type, ability, damage) {
    "use strict";
    
    var animal_health_max = parseInt(animal.health_max);
    
    if (animal.alive) {
        animal.health -= damage;
        
        var axp = Math.floor(damage/2);
        if (axp > animal_health_max/2) {axp = Math.floor(animal_health_max/2);}

        player.work_rout(type, ability, 1, axp, axp, 3); // stress, stand_exp, skill_exp, abil_p
        
        animal.knockback_by_hit(animal, player, type);
        
        this.emitter.x = this.x;
        this.emitter.y = this.y;
        this.emitter.start(true, 1000, null, 8);
        
        console.log("Hit animal");
        
        if (animal.health < 1) {
            player.add_exp("standard", animal_health_max);
            player.add_exp(type, animal_health_max / 2);
            player.add_exp("hunter", animal_health_max / 2);
            player.add_sin(1);
            console.log("Player sin: " + player.stats.sin);
            
            var i_frame;
            var m_length = this.animal_loot.length;
            for (var i = 0; i < m_length; i++) {
                i_frame = this.animal_loot[i];
                player.key_close();
                player.add_item(i_frame, 1); // loot
            }
                        
            animal.kill();
            if (animal.key == "wasp_spritesheet") {
                animal.timer_sting.stop();
            }
            
            console.log("animal count:" + this.pool.countLiving());
            console.log(this.pool);
            
            if (this.pool.countLiving() < 1) {
                this.game_state.prefabs.player.infight = false;
            }
            
        }
    }
};

Mst.WildAnimal.prototype.intomove = function () {
    "use strict";
    
    if (!this.stand_still) {
        this.body.immovable = false;
    }
    
    if (this.monster_type === "angostura") {
        this.ang_run = true;
    }
};

Mst.WildAnimal.prototype.reset = function (position) {
    "use strict";
    
    this.position_x = position.x;
    this.position_y = position.y;
    
    Phaser.Sprite.prototype.reset.call(this, this.position_x, this.position_y, this.health_max);
    
    this.body.velocity.x = this.game_state.game.rnd.between(-40, 50);
    this.body.velocity.y = this.game_state.game.rnd.between(-60, 30);

    console.log("Reset animal key: " + this.key);
    if (this.key == "wasp_spritesheet") {
        this.timer_sting.loop(Phaser.Timer.SECOND * 0.6, this.create_bullet, this);
        this.timer_sting.start();
        console.log(this.timer_sting);
    }
    
    //this.game_state.prefabs.player.infight = true;
};

Mst.WildAnimal.prototype.detect_player = function () {
    "use strict";
    var distance_to_player;
    distance_to_player = this.game_state.game.physics.arcade.distanceBetween(this, this.game_state.prefabs.player);
    if (distance_to_player <= 70) {
        this.game_state.prefabs.player.infight = true;
    }

    return distance_to_player <= 200;
};

Mst.WildAnimal.prototype.create_bullet = function () {
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
        group: "animalbullets"
    };
    
    object = this.b_pool.getFirstDead();
        
    if (!object) {
        object_name = "bullet_" + this.b_pool.countLiving();
        object = new Mst.Bullet(this.game_state, object_name, object_position, object_properties);
    } else {
        object.reset(object_position, object_properties);
    }
};