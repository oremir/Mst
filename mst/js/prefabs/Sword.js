var Mst = Mst || {};

Mst.Sword = function (game_state, name, position, properties) {
    "use strict";
    Mst.Prefab.call(this, game_state, name, position, properties);

    this.game_state.game.physics.arcade.enable(this);
    
    this.body.allowRotation = true;
    this.kill();
};

Mst.Sword.prototype = Object.create(Mst.Prefab.prototype);
Mst.Sword.prototype.constructor = Mst.Sword;

Mst.Sword.prototype.update = function () {
    "use strict";
     
    if (this.alive) {
        if (this.body.rotation > 40 && this.body.rotation < 80) {
            this.kill();
        }
    }   
    
};

Mst.Sword.prototype.swing = function () {
    "use strict";
    
    if (this.alive === false) {
        this.body.rotation = -135;     
        this.body.angularVelocity = this.game_state.prefabs.player.direction.x*500;

        this.revive(); 
    }
};

Mst.Sword.prototype.hit_enemy = function (player, enemy) {
    "use strict";
    
    if (enemy.knockbacki < 1) {
        enemy.health -= 6;
        this.game_state.game.physics.arcade.moveToObject(enemy, player, -90);
        enemy.knockbacki = 10;
        
        if (enemy.health < 1) {
            enemy.kill();
        }
    }
    
    //this.game_state.restart_map();
};