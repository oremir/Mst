Mst.Bullet = function (game_state, name, position, properties) {
    "use strict";
    Mst.Prefab.call(this, game_state, name, position, properties);
    
    this.walking_speed = 400;
    
    this.health_max = 40;
    this.health = this.health_max;
    this.knockbacki = 0;
    
    this.en_attack = 2;
        
    this.game_state.game.physics.arcade.enable(this);
    this.body.bounce.setTo(1);
    this.body.collideWorldBounds = true;
    
    this.body.velocity.x = properties.direction.x * this.walking_speed;
    this.body.velocity.y = properties.direction.y * this.walking_speed;
    
    this.anchor.setTo(0.5);
    
    this.b_type = 2;
    this.angle = -45 * Math.abs(properties.direction.x) - 90 * properties.direction.x + 45 * Math.abs(properties.direction.y) - 90 * properties.direction.y;
    
    this.ctype = properties.ctype;
    this.oldframe = properties.oldframe;
    
    console.log(properties.texture);
    if (properties.texture === "sting") {
        this.b_type = 1;
        this.angle = 0;
        this.scale.setTo(Math.sign(this.body.velocity.x), 1);
    }
    console.log("C " + properties.direction.x + ":" + properties.direction.y + " Bullet angle: " + this.angle);
    
    console.log(this.group);
};

Mst.Bullet.prototype = Object.create(Mst.Prefab.prototype);
Mst.Bullet.prototype.constructor = Mst.Bullet;

Mst.Bullet.prototype.update = function () {
    "use strict";
    this.game_state.game.physics.arcade.collide(this, this.game_state.layers.collision, this.kill, null, this);
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.chests, this.hit_chest, null, this);
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.otherplayers, this.hit_other_player, null, this);
    if (this.group == "enemybullets") {
        this.game_state.game.physics.arcade.collide(this, this.game_state.prefabs.player, this.hit_player, null, this);
    } else {
        this.game_state.game.physics.arcade.collide(this, this.game_state.groups.enemies, this.hit_enemy, null, this);
        this.game_state.game.physics.arcade.collide(this, this.game_state.groups.wildanimals, this.hit_animal, null, this);
    }
    
    
    
};

Mst.Bullet.prototype.reset = function (position, properties) {
    "use strict";
    
    this.position_x = position.x;
    this.position_y = position.y;
    
    Phaser.Sprite.prototype.reset.call(this, this.position_x, this.position_y, this.health_max);

    this.body.velocity.x = properties.direction.x * this.walking_speed;
    this.body.velocity.y = properties.direction.y * this.walking_speed;
    
    this.angle = -45 * Math.abs(properties.direction.x) - 90 * properties.direction.x + 45 * Math.abs(properties.direction.y) - 90 * properties.direction.y;
    if (this.b_type == 1) {
        this.angle = 0;
        this.scale.setTo(Math.sign(this.body.velocity.x), 1);
    }
    console.log("R " + properties.direction.x + ":" + properties.direction.y + " Bullet angle: " + this.angle);
};

Mst.Bullet.prototype.hit_chest = function (bullet, chest) {
    "use strict";
    
    if (this.oldframe > -1) {
        chest.add_item_u(this.oldframe, 1);        
    }
    bullet.kill();
};

Mst.Bullet.prototype.hit_other_player = function (bullet, other_player) {
    "use strict";
    
    bullet.kill();
};

Mst.Bullet.prototype.hit_player = function (bullet, player) {
    "use strict";
    
    player.hit_player_by_bullet(bullet, player);
    bullet.kill();
};

Mst.Bullet.prototype.hit_enemy = function (bullet, enemy) {
    "use strict";
    
    var player = this.game_state.prefabs.player;
    
    console.log("Bullet texture:");
    console.log(this.key);
    
    if (this.key === "magic1") {
        enemy.hit_enemy_magic(player, enemy);
    } else {
        console.log(this.frame);
        if (this.frame === 0) {
            enemy.hit_enemy_arrow(player, enemy);
        } else {
            if (this.frame === 2) {
                enemy.hit_enemy_meat(player, enemy);
            } else {
                if (this.ctype === 'sling') {
                    enemy.hit_enemy_sling(player, enemy);
                } else {
                    enemy.hit_enemy_throw(player, enemy);
                }                
            }            
        }
        
    }
    
    bullet.kill();
};

Mst.Bullet.prototype.hit_animal = function (bullet, enemy) {
    "use strict";
    
    var player = this.game_state.prefabs.player;
    
    console.log("Bullet texture:");
    console.log(this.key);
    
    if (this.key === "magic1") {
        enemy.hit_animal_magic(player, enemy);
    } else {
        console.log(this.frame);
        if (this.frame === 0) {
            enemy.hit_animal_arrow(player, enemy);
        } else {
            if (this.frame === 2) {
                enemy.hit_animal_meat(player, enemy);
            } else {
                enemy.hit_animal_throw(player, enemy);
            }            
        }
        
    }
    
    bullet.kill();
};
