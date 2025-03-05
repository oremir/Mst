Mst.Sword = function (game_state, name, position, properties) {
    "use strict";
    Mst.Prefab.call(this, game_state, name, position, properties);

    this.cSword = new CSword(this, name, position, properties);
    this.mSword = this.cSword.mSword;

    this.game_state.game.physics.arcade.enable(this);
    
    this.hit = this.game_state.mGame.groups[this.group].create(position.x, position.y, 'hit');
    this.hit.anchor.setTo(0.5);
    //this.game_state.game.physics.arcade.enable(this.hit);
    this.hit.animations.add('r_hit', [0, 1, 2, 3, 4, 0], 12, false);
    //this.hit.animations['r_hit'].onComplete.add(function () {this.hit.frame = 5}, this);
    this.hit.frame = 5;
    
    this.body.allowRotation = true;
    this.kill();
    
    this.direction = {"x": 1, "y": -1};

    //this.scale.setTo(1, -1);
        
    this.cut = false;
    console.log("!!! Init CUT: " + this.cut);
    
    this.wooshSound = this.game_state.game.add.audio('woosh');
    this.arrowSound = this.game_state.game.add.audio('arrow_sound');

    this.rod = this.game_state.mGame.groups.swords.create(this.x, this.y, 'rod_spritesheet', 0);
    this.rod.anchor.setTo(0.5);
    this.rod.visible = false;
    
    this.float = this.game_state.mGame.groups.swords.create(this.x, this.y, 'rod_spritesheet', 1);
    this.float.anchor.setTo(0.5);
    this.float.animations.add('float', [1, 2], 10, true);
    this.float.visible = false;
    this.float.trembling = false;
};

Mst.Sword.prototype = Object.create(Mst.Prefab.prototype);
Mst.Sword.prototype.constructor = Mst.Sword;

Mst.Sword.prototype.update = function () {
    "use strict";
     
    if (this.alive) {
        if (this.game_state.layers.collision_forrest && this.cut && (this.cut_type === "wood" || this.cut_type === "uni")) {
            this.game_state.game.physics.arcade.overlap(this, this.game_state.layers.collision_forrest,  this.cut_wood, null, this);
            //console.log(this.game_state.layers.collision_forrest);
        }
        if (this.game_state.layers.collision_rock && this.cut && (this.cut_type === "stone" || this.cut_type === "uni")) {
            this.game_state.game.physics.arcade.overlap(this, this.game_state.layers.collision_rock,  this.cut_stone, null, this);
            //console.log(this.game_state.layers.collision_forrest);
        }        
        if (this.game_state.layers.grass && this.cut && this.cut_type === "plant") {
            this.game_state.game.physics.arcade.overlap(this, this.game_state.layers.grass,  this.cut_grass, null, this);
            //console.log(this.game_state.layers.collision_forrest);
        }
        if (this.cut_type !== "fire" && this.body.rotation > 40 && this.body.rotation < 80) {
            this.kill();
        }
    }
};

Mst.Sword.prototype.player_update = function (x, y, cdir) {
    "use strict";
    if (this.alive) {
        if (this.cSword.cut_type !== "fire") {
            this.x = x + this.direction.x * 4;
            this.y = y + 2 + this.direction.y;
            this.hit.x = x + this.direction.x * 6;
            this.hit.y = y;
        } else {
            if (cdir.y === 0) {
                this.x = x + cdir.x * 18;
                this.y = y + cdir.y * 16 - 8;
            } else {
                this.x = x + cdir.x * 16 - 8;
                this.y = y + cdir.y * 20;
            }
        }
    }
};

Mst.Sword.prototype.swing = function () {
    "use strict";
    const player = this.game_state.prefabs.player;
    
    if (this.alive === false) {
        const [cut_type, frame, ind, btest] = this.cSword.swing();        
        this.frame = frame;

        if (cut_type === "fire") {
            if (ind > -1) {
                this.body.rotation = 0;
                this.body.angularVelocity = 0;
                this.revive();

                console.log(this.body.rotation);
                
                if (player.cPlayer.chest.direction.y === 0) {
                    this.scale.setTo(-player.cPlayer.chest.direction.x, 1);
                } else {
                    this.scale.setTo(1, -player.cPlayer.chest.direction.y);
                }

                this.game_state.game.time.events.add(Phaser.Timer.SECOND * 0.2, this.hide_bow, this);
                this.arrowSound.play();
            }
        } else {
            this.hit.animations.play("r_hit");

            this.body.rotation = -135;
            this.body.angularVelocity = this.direction.x * 500;
            this.cut = true;

            console.log("!!! CUT: " + this.cut);

            this.wooshSound.play();

            this.revive();
            
            if (cut_type === "rod") {
                console.log(this.rod);
                if (this.rod.visible) {                    
                    this.rod.visible = false;
                    this.float.visible = false;
                    this.float.trembling = false;
                    this.float.animations.stop();
                } else {
                    this.rod.scale.setTo(this.direction.x, 1);
                                                            
                    this.rod.x = player.x + this.direction.x * 12;
                    this.rod.y = player.y + this.direction.y - 3;
                    this.float.x = player.x + this.direction.x * 20;
                    this.float.y = player.y + 5 ;
                    
                    if (this.game_state.layers.water && btest) {
                        this.rod.visible = true;
                        this.float.visible = true;
                        
                        this.game_state.game.time.events.add(Phaser.Timer.SECOND * 5, this.move_float, this);
                    }
                }
            }
        }
        console.log("!!! CUT: " + this.cut);
        console.log(this);
    }
};

Mst.Sword.prototype.check_rod = function () {
    "use strict";
    
    if (this.rod.visible) {
        this.rod.visible = false;
        this.float.visible = false;
        this.float.trembling = false;
        this.float.animations.stop();        
        
        return false;
    } else {
        return true;
    }
};

Mst.Sword.prototype.move_float = function () {
    "use strict";
    
    if (this.rod.visible) {
        this.float.animations.play("float");
        this.float.trembling = true;
    }
};

Mst.Sword.prototype.hide_bow = function () {
    console.log("Hide bow");
    this.cSword.create_bullet(0, 125);
    
    this.kill();
};

Mst.Sword.prototype.reequip = function (ef) {
    "use strict";
    this.cSword.reequip(ef);
};

Mst.Sword.prototype.cut_wood = function (tool, wood) {
    "use strict";
    
    const player = this.game_state.prefabs.player;
    
    const x = player.cPlayer.chest.direction.x + wood.x;
    const y = player.cPlayer.chest.direction.y + wood.y;
    
    
    console.log("wood!!!");
    //console.log(wood);
    //console.log(this.game_state.layers.collision_forrest.layer.data[y][x]);
    
    if (this.game_state.map.getTile(x, y, "collision_forrest") !== null) {
        console.log("Cut wood");
        
        this.cSword.cut_wood();
        
        this.cut = false;
        console.log("!!! Wood CUT: " + this.cut);
    }
};

Mst.Sword.prototype.cut_stone = function (tool, stone) {
    "use strict";
    
    const player = this.game_state.prefabs.player;
    
    const x = player.cPlayer.chest.direction.x + stone.x;
    const y = player.cPlayer.chest.direction.y + stone.y;
    
    console.log("stone!!!");
    //console.log(wood);
    //console.log(this.game_state.layers.collision_forrest.layer.data[y][x]);
    if (this.game_state.map.getTile(x, y, "collision_rock") !== null) {
        console.log("Cut stone");
        
        this.cSword.cut_stone();
        
        this.cut = false;
        console.log("!!! Stone CUT: " + this.cut);
    }
};

Mst.Sword.prototype.cut_grass = function (tool, grass) {
    "use strict";
    
    const player = this.game_state.prefabs.player;
    
    const x = player.cPlayer.chest.direction.x + Math.floor(player.x / 16);
    const y = player.cPlayer.chest.direction.y + Math.floor(player.y / 16);
    
    console.log("Position player " + Math.floor(player.x/16) + "|" + Math.floor(player.y/16) + " grass " + x + "|" + y); 
    console.log("cut grass!!!");

    if (this.game_state.map.getTile(x, y, "grass") !== null) {
        console.log("Cut grass");

        this.cSword.cut_grass(this.frame);
        
        this.cut = false;
        console.log("!!! Grass CUT: " + this.cut);
    }
};

Mst.Sword.prototype.rnd_take = function (frame, skill) {
    "use strict";
    this.cSword.rnd_take(frame, skill);
};

Mst.Sword.prototype.cut_chest = function (chest) {
    "use strict";
    console.log("Cut chest");
    console.log(chest);
    
    this.cSword.cut_chest(chest, this.frame);
    
    this.cut = false;
    console.log("!!! Chest CUT: " + this.cut);
};
