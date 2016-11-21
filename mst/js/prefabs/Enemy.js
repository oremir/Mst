var Mst = Mst || {};

Mst.Enemy = function (game_state, name, position, properties) {
    "use strict";
    Mst.Prefab.call(this, game_state, name, position, properties);
    
    this.walking_speed = +properties.walking_speed;
    this.walking_distance = +properties.walking_distance;
    
    this.healthmax = 40;
    this.health = this.healthmax;
    this.knockbacki = 0;
    
    // saving previous x to keep track of walked distance
    this.previous_x = this.x;
    
    this.game_state.game.physics.arcade.enable(this);
    this.body.bounce.setTo(1);
    this.body.collideWorldBounds = true;
    
    this.body.velocity.x = properties.direction * this.walking_speed;
    this.body.velocity.y = this.game_state.game.rnd.between(-20, 20);
    
    this.scale.setTo(-properties.direction, 1);

    this.animations.add("go", [0, 1], 5, true);
    this.animations.play("go");
    
    this.anchor.setTo(0.5);
};

Mst.Enemy.prototype = Object.create(Mst.Prefab.prototype);
Mst.Enemy.prototype.constructor = Mst.Enemy;

Mst.Enemy.prototype.update = function () {
    "use strict";
    this.game_state.game.physics.arcade.collide(this, this.game_state.layers.collision);
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.chests);
    //this.game_state.game.physics.arcade.collide(this, this.game_state.groups.enemies.forEachAlive(null, this));
    this.game_state.groups.enemies.forEachAlive(function(one_enemy) {
        this.game_state.game.physics.arcade.collide(this, one_enemy, this.knockback_enemy, null, this);
    }, this)
    
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
        if (this.game_state.game.physics.arcade.distanceBetween(this, this.game_state.prefabs.sword) < 18) {
            this.game_state.prefabs.sword.hit_enemy(this.game_state.prefabs.player, this);
        }
    }
};

Mst.Enemy.prototype.knockback_enemy = function () {
    "use strict";
    
    this.game_state.game.physics.arcade.moveToObject(this, this.game_state.prefabs.player, -100);
    this.knockbacki = 10;
};

Mst.Enemy.prototype.reset = function (position) {
    "use strict";
    
    this.position_x = position.x;
    this.position_y = position.y;
    
    Phaser.Sprite.prototype.reset.call(this, this.position_x, this.position_y, this.healthmax);
    
    this.body.velocity.x = this.game_state.game.rnd.between(-40, 50);
    this.body.velocity.y = this.game_state.game.rnd.between(-60, 30);
};

Mst.Enemy.prototype.detect_player = function () {
    "use strict";
    var distance_to_player;
    distance_to_player = this.game_state.game.physics.arcade.distanceBetween(this, this.game_state.prefabs.player);

    return distance_to_player <= 200;
};

