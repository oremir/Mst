var Mst = Mst || {};

Mst.Bullet = function (game_state, name, position, properties) {
    "use strict";
    Mst.Prefab.call(this, game_state, name, position, properties);
    
    this.walking_speed = 400;
    
    this.health_max = 40;
    this.health = this.health_max;
    this.knockbacki = 0;
        
    this.game_state.game.physics.arcade.enable(this);
    this.body.bounce.setTo(1);
    this.body.collideWorldBounds = true;
    
    this.body.velocity.x = properties.direction.x * this.walking_speed;
    this.body.velocity.y = properties.direction.y * this.walking_speed;
    
    this.anchor.setTo(0.5);
    
    this.angle = -45 * Math.abs(properties.direction.x) - 90 * properties.direction.x + 45 * Math.abs(properties.direction.y) - 90 * properties.direction.y;
    console.log("C " + properties.direction.x + ":" + properties.direction.y + " Bullet angle: " + this.angle);
};

Mst.Bullet.prototype = Object.create(Mst.Prefab.prototype);
Mst.Bullet.prototype.constructor = Mst.Bullet;

Mst.Bullet.prototype.update = function () {
    "use strict";
    this.game_state.game.physics.arcade.collide(this, this.game_state.layers.collision, this.kill, null, this);
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.chests, this.hit_chest, null, this);
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.otherplayers, this.hit_other_player, null, this);
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.enemies, this.hit_enemy, null, this);
    
    
};

Mst.Bullet.prototype.reset = function (position, properties) {
    "use strict";
    
    this.position_x = position.x;
    this.position_y = position.y;
    
    Phaser.Sprite.prototype.reset.call(this, this.position_x, this.position_y, this.health_max);

    this.body.velocity.x = properties.direction.x * this.walking_speed;
    this.body.velocity.y = properties.direction.y * this.walking_speed;
    
    this.angle = -45 * Math.abs(properties.direction.x) - 90 * properties.direction.x + 45 * Math.abs(properties.direction.y) - 90 * properties.direction.y;
    console.log("R " + properties.direction.x + ":" + properties.direction.y + " Bullet angle: " + this.angle);
};

Mst.Bullet.prototype.hit_chest = function (bullet, chest) {
    "use strict";
    
    bullet.kill();
};

Mst.Bullet.prototype.hit_other_player = function (bullet, other_player) {
    "use strict";
    
    bullet.kill();
};

Mst.Bullet.prototype.hit_enemy = function (bullet, enemy) {
    "use strict";
    
    var enemy_health_max = parseInt(enemy.health_max);
    var player = this.game_state.prefabs.player;
    
    if (enemy.knockbacki < 1 && enemy.alive){
        enemy.health -= 5;
        player.stats.stress += 1;
        player.add_exp("standard", 5);
        player.add_exp("magic", 5);
        player.add_ability("strength", 3, 0);
        this.game_state.game.physics.arcade.moveToObject(enemy, player, -150);
        enemy.knockbacki = 10;
        
        if (enemy.health < 1) {
            player.add_exp("standard", enemy_health_max);
            player.add_exp("magic", enemy.health_max / 2);
            player.add_item(23, 1); // gel
            
            enemy.kill();
        }
    }
    
    bullet.kill();
};
