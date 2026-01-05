Mst.WildAnimal = function (name, position, properties) {
    "use strict";
    Mst.Prefab.call(this, name, position, properties);
    
    this.pool = Mst.groups[properties.pool];
    
    this.walking_speed = +properties.walking_speed;
    this.walking_distance = +properties.walking_distance;
    
    this.health_max = 40;
    this.health = this.health_max;
    
    this.en_attack = 2;
    
    this.knockback = {
        i: 0,
        check: function() {
            return this.i > 0;
        },
        update: function() {
            if (this.check) {
                this.i--;
                return false;
            }
            return true;
        },
        reset: function(n) {
            this.i = n;
        }
    };
    
    Mst.game.physics.arcade.enable(this);
    this.body.bounce.setTo(1);
    this.body.collideWorldBounds = true;
    
    this.body.velocity.x = properties.direction * this.walking_speed;
    this.body.velocity.y = Mst.rnd(-20, 20);
    
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
            this.animal_loot = Mst.creatures.partridge.loot;
        break;
        case "doe_spritesheet":
            this.animations.add("go", [0, 1], 5, true);
            this.animations.play("go");
    
            this.anchor.setTo(0.5);
            
            this.animal_type = "doe";
            this.animal_loot = Mst.creatures.doe.loot;
        break;
    }
    
    this.b_pool = Mst.groups.WildAnimalbullets;
    this.w_pool = Mst.groups.overlaps;
    
    this.emitter = new Mst.Emitter();
};

Mst.WildAnimal.prototype = Object.create(Mst.Prefab.prototype);
Mst.WildAnimal.prototype.constructor = Mst.WildAnimal;

Mst.WildAnimal.prototype.update = function () {
    "use strict";
    Mst.game.physics.arcade.collide(this, Mst.layers.collision);
    Mst.game.physics.arcade.collide(this, Mst.groups.chests);
    Mst.groups.wildanimals.forEachAlive(function(one_animal) {
        Mst.game.physics.arcade.collide(this, one_animal, this.knockback_by_other_animal, null, this);
    }, this);
    
    this.scale.setTo(Math.sign(this.body.velocity.x), 1);
    if (this.body.velocity.x === 0) {
        const sc = Math.sign(Mst.player.x - this.x);
        this.scale.setTo(sc, 1);
    }
    
    if (this.body.immovable) {
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
    }

    if (this.knockback.update()) {
        if (Mst.cPlayer.detect(this)) {
            if (!this.body.immovable) Mst.game.physics.arcade.moveToObject(this, Mst.player, -110);
        }
    }

    const sword = Mst.cPlayer.weapon;
    if (sword.alive) {
        if (Mst.game.physics.arcade.distanceBetween(sword, this) < 19) {
            console.log("!!! Hit CUT: " + sword.cut);
            if (sword.cut) {
                this.hit_sword(Mst.player, this);
                sword.cut = false;
                console.log("!!! Hit CUT2: " + sword.cut);
            }
        }
    }
};

Mst.WildAnimal.prototype.knockback_by_other_animal = function (animal, o_animal) {
    "use strict";
    if (!this.body.immovable) {
        Mst.game.physics.arcade.moveToObject(animal, o_animal, -100);
    }
    this.knockback.reset(10);
};

Mst.WildAnimal.prototype.knockback_by_player = function (animal, player) {
    "use strict";
    
    if (!this.body.immovable) {
        Mst.game.physics.arcade.moveToObject(animal, player, -110);
    }
    this.knockback.reset(10);
};

Mst.WildAnimal.prototype.knockback_by_hit = function (animal, player, type) {
    "use strict";
    
    if (type === "magic") {
        if (!this.body.immovable) {
            Mst.game.physics.arcade.moveToObject(animal, player, -60);
        }
        animal.knockback.reset(5);
    } else {
        if (!this.body.immovable) {
            Mst.game.physics.arcade.moveToObject(animal, player, -90);
        }
        animal.knockback.reset(10);
    }
};

Mst.WildAnimal.prototype.hit_sword = function (player, animal) {
    const damage = Mst.mPlayer.damage("strength", 5, "fighter", 1.5);
    this.hit_animal(player, animal, "fighter", "strength", damage);
};

Mst.WildAnimal.prototype.hit_magic = function (player, animal) {
    const damage = Mst.mPlayer.damage("intelligence", 5, "magic", 1.5);
    this.hit_animal(player, animal, "magic", "intelligence", damage);
};

Mst.WildAnimal.prototype.hit_arrow = function (player, animal) {
    const damage = Mst.mPlayer.damage("dexterity", 5, "archer", 1.5);
    this.hit_animal(player, animal, "archer", "dexterity", damage);
};

Mst.WildAnimal.prototype.hit_throw = function (player, animal) {
    const damage = Mst.mPlayer.damage("dexterity", 5, "thrower", 1.5);
    this.hit_animal(player, animal, "thrower", "dexterity", damage);
};

Mst.WildAnimal.prototype.hit_sling = function (player, animal) {
    const damage = Mst.mPlayer.damage("dexterity", 5, "thrower", 1.5);
    this.hit_animal(player, animal, "thrower", "dexterity", damage);
};

Mst.WildAnimal.prototype.hit_meat = function (player, animal) {
    const damage = Mst.mPlayer.damage("dexterity", 5, "thrower", 1.5);
    let axp = Math.floor(damage/2);
    const animal_health_max = parseInt(animal.health_max);
    if (axp > animal_health_max/2) axp = Math.floor(animal_health_max/2);
    
    player.cPlayer.work_rout("thrower", "dexterity", 1, axp, axp, 3); // stress, stand_exp, skill_exp, abil_p
    
    Mst.game.time.events.add(Phaser.Timer.SECOND * 5, this.intomove, this);
    this.body.immovable = true;
};

Mst.WildAnimal.prototype.hit_animal_pet = function (player, animal) {
    const damage = Mst.mPlayer.damage("strength", 5, "fighter", 1.5);
    this.hit_animal(player, animal, "fighter", "strength", damage);
};

Mst.WildAnimal.prototype.hit_animal = function (player, animal, type, ability, damage) {
    "use strict";
    
    const animal_health_max = parseInt(animal.health_max);
    
    if (animal.alive) {
        animal.health -= damage;
        
        let axp = Math.floor(damage/2);
        if (axp > animal_health_max/2) axp = Math.floor(animal_health_max/2);

        player.cPlayer.work_rout(type, ability, 1, axp, axp, 3); // stress, stand_exp, skill_exp, abil_p
        
        animal.knockback_by_hit(animal, player, type);
        
        this.emitter.start({ x: animal.x, y: animal.y });
        
        console.log("Hit animal");
        
        if (animal.health < 1) {
            player.mPlayer.add_exp("standard", animal_health_max);
            player.mPlayer.add_exp(type, animal_health_max / 2);
            player.mPlayer.add_exp("hunter", animal_health_max / 2);
            player.mPlayer.add_sin(1);
            console.log("Player sin: " + player.stats.sin);
            
            for (const loot of this.animal_loot) {
                player.cPlayer.items.add(loot, 1); // loot
            }
                        
            animal.kill();
            
            console.log("animal count:" + this.pool.countLiving());
            console.log(this.pool);
            
            if (this.pool.countLiving() < 1) Mst.cPlayer.fight.close();
            
        }
    }
};

Mst.WildAnimal.prototype.intomove = function () {
    "use strict";
    
    if (!this.stand_still) this.body.immovable = false;
};

Mst.WildAnimal.prototype.reset = function (position) {
    "use strict";
    
    this.position_x = position.x;
    this.position_y = position.y;
    
    Phaser.Sprite.prototype.reset.call(this, this.position_x, this.position_y, this.health_max);
    
    this.body.velocity.x = Mst.rnd(-40, 50);
    this.body.velocity.y = Mst.rnd(-60, 30);

    console.log("Reset animal key: " + this.key);
};
