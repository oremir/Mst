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
        this.body.angularVelocity = this.game_state.prefabs.player.direction_sword.x*500;
        
        if (this.game_state.prefabs.player.direction_sword.x === 1) {
            this.frame = this.fr_right;
        } else {
            this.frame = this.fr_left;
        }
        
        this.cut = true;
        
        this.wooshSound.play();

        this.revive();
    }
};

Mst.Sword.prototype.hit_enemy = function (player, enemy) {
    "use strict";
    
    if (enemy.knockbacki < 1 && enemy.alive){
        enemy.health -= 6;
        player.stats.stress += 1;
        player.add_exp("standard", 6);
        player.add_exp("fighter", 6);
        player.add_ability("strength", 3, 0);
        this.game_state.game.physics.arcade.moveToObject(enemy, player, -90);
        enemy.knockbacki = 10;
        
        if (enemy.health < 1) {
            player.add_exp("standard", enemy.healthmax);
            player.add_exp("fighter", enemy.healthmax / 2);
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
    var x, y, tile, player;
    player = this.game_state.prefabs.player;
    
    x = player.direction_chest.x + wood.x;
    y = player.direction_chest.y + wood.y;    
    
    //console.log(wood);
    //console.log(this.game_state.layers.collision_forrest.layer.data[y][x]);
    
    if (this.game_state.map.getTile(x, y, "collision_forrest") !== null) {
        console.log("Cut wood");
        
        player.stats.stress += 1;
        player.add_item(7, 1); // wood
        player.add_exp("standard", 2);
        player.add_exp("woodcutter", 1);
        player.add_ability("strength", 3, 0);
    }
    
    this.cut = false;    
};

Mst.Sword.prototype.cut_stone = function (tool, stone) {
    "use strict";
    var x, y, tile, player, pom_exp;
    player = this.game_state.prefabs.player;
    
    x = player.direction_chest.x + stone.x;
    y = player.direction_chest.y + stone.y;    
    
    //console.log(wood);
    //console.log(this.game_state.layers.collision_forrest.layer.data[y][x]);
    if (this.game_state.map.getTile(x, y, "collision_rock") !== null) {
        console.log("Cut stone");
        
        player.stats.stress += 1;
        player.add_item(21, 1); // stone
        player.add_exp("standard", 2);
        player.add_exp("stonebreaker", 1);
        player.add_ability("strength", 3, 0);
    }
    
    this.cut = false;
};