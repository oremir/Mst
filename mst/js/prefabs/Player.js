Mst.Player = function (game_state, name, position, properties) {
    "use strict";
    
    console.log("player");
    
    Mst.Prefab.call(this, game_state, "player", position, properties);
    
    this.usr_id = game_state.gdata.root.usr_id;
    properties.usr_id = this.usr_id;

    this.cPlayer = new CPlayer(this, name, position, properties);
    this.mPlayer = this.cPlayer.mPlayer;
    this.stats = this.mPlayer.stats;
    console.log(this.stats);

    const weapon = this.game_state.gdata.core.objects.sword;
    //console.log(weapon);
    this.cPlayer.weapon = this.game_state.create_object(weapon);    
    this.cPlayer.weapon.reequip(this.stats.equip);
    console.log(this.cPlayer.weapon);

    /*
    const load_player = JSON.parse(localStorage.getItem("player"));
    if (typeof(load_player) != 'undefined') {
        this.x = load_player.x;
        this.y = load_player.y;
    }*/
    
    this.game_state.game.physics.arcade.enable(this);
    this.body.collideWorldBounds = true;
    this.smoothed = false;
    
    this.game_state.game.camera.follow(this);
    
    //alert(1);
    
    //this.animations.add("walking", [0, 1, 2, 1], 6, true);
    
    this.animations.add('left', [4, 5], 10, true);
    this.animations.add('right', [6, 7], 10, true);
    this.animations.add('up', [2, 3], 10, true);
    this.animations.add('down', [0, 1], 10, true);

    
    this.frame = 0;
    
    //this.body.setSize(11, 14, 2.5, 5);
    this.body.setSize(12, 14, 2, 2);
    this.anchor.setTo(0.5);
    
    this.emitter = this.game_state.game.add.emitter(0, 0, 100);
    this.emitter.makeParticles('blood', [0,1,2,3,4,5,6]);
    this.emitter.gravity = 120;
    this.emitter.setAlpha(1, 0, 400);

    this.cursors = this.game_state.game.input.keyboard.createCursorKeys();
    this.keys = this.game_state.game.input.keyboard.addKeys({
        'up': Phaser.KeyCode.W,
        'down': Phaser.KeyCode.S,
        'left': Phaser.KeyCode.A,
        'right': Phaser.KeyCode.D,
        'action': Phaser.KeyCode.X,
        'close': Phaser.KeyCode.C,
        'change_type': Phaser.KeyCode.L,
        'shift':Phaser.KeyCode.SHIFT,
        'attack': Phaser.KeyCode.F,
        'attack_alt': Phaser.Keyboard.ENTER
    });
    
    this.keys.action.onDown.add(this.cPlayer.key_action, this);
    this.keys.close.onDown.add(this.cPlayer.key_close, this);
    this.keys.change_type.onDown.add(this.cPlayer.key_change_type, this);
};

Mst.Player.prototype = Object.create(Mst.Prefab.prototype);
Mst.Player.prototype.constructor = Mst.Player;

Mst.Player.prototype.update = function () {
    "use strict";
    this.game_state.game.physics.arcade.collide(this, this.game_state.layers.collision, this.collide_layer_tile, null, this);
    this.game_state.game.physics.arcade.overlap(this, this.game_state.layers.collision, this.overlap_layer_tile, null, this);
    this.game_state.game.physics.arcade.collide(this, this.game_state.mGame.groups.enemies, this.hit_player, null, this);
    this.game_state.game.physics.arcade.collide(this, this.game_state.mGame.groups.chests, this.open_chest, null, this);
    this.game_state.game.physics.arcade.collide(this, this.game_state.mGame.groups.signposts, this.open_signpost, null, this);
    this.game_state.game.physics.arcade.collide(this, this.game_state.mGame.groups.collisions, this.open_collision, null, this);
    this.game_state.game.physics.arcade.overlap(this, this.game_state.mGame.groups.overlaps, this.open_overlaps, null, this);
    
    if (this.cPlayer.no_pass_OP) {
        this.game_state.game.physics.arcade.collide(this, this.game_state.mGame.groups.otherplayers, this.collide_other_player, null, this);
        this.game_state.game.physics.arcade.collide(this, this.game_state.mGame.groups.NPCs, this.collide_NPC, null, this);
    }
    
    if (typeof (this.game_state.layers.collision_forrest) !== 'undefined') {
        this.game_state.game.physics.arcade.collide(this, this.game_state.layers.collision_forrest);
    }
    
    if (this.cursors.right.isDown) { this.key_right(); }
        else if (this.cursors.left.isDown) { this.key_left(); }
        else if (this.cursors.up.isDown) { this.key_up(); }
        else if (this.cursors.down.isDown) { this.key_down(); }
        else if (this.keys.right.isDown) { this.key_right(); }
        else if (this.keys.left.isDown) { this.key_left(); }
        else if (this.keys.up.isDown) { this.key_up(); }
        else if (this.keys.down.isDown) { this.key_down(); }
    else {
        // stop
        this.body.velocity.set(0);
        this.animations.stop();
    }
    
    if (this.body.immovable) {
        this.body.velocity.set(0);
        this.animations.stop();
    }
        
    if (this.keys.attack.isDown) this.cPlayer.weapon.swing();
    if (this.keys.attack_alt.isDown) this.cPlayer.weapon.swing();
    
    this.cPlayer.weapon.player_update(this.x, this.y, this.cPlayer.chest.direction);
    
    this.stats.health_hearts = Math.ceil(this.mPlayer.health / Math.ceil(this.stats.health_max / 5));
    
    this.mPlayer.moon.update();
};

Mst.Player.prototype.key_right = function () {
    "use strict";
    // move right
    this.body.velocity.x = this.mPlayer.walking_speed;
    this.animations.play("right");

    this.cPlayer.key_right();
};

Mst.Player.prototype.key_left = function () {
    "use strict";
    // move left
    this.body.velocity.x = -this.mPlayer.walking_speed;
    this.animations.play("left");

    this.cPlayer.key_left();
};

Mst.Player.prototype.key_up = function () {
    "use strict";
    // move up
    this.body.velocity.y = -this.mPlayer.walking_speed;
    this.animations.play("up");

    this.cPlayer.key_up();
};

Mst.Player.prototype.key_down = function () {
    "use strict";
    // move down
    this.body.velocity.y = this.mPlayer.walking_speed;
    this.animations.play("down");

    this.cPlayer.key_down();
};

Mst.Player.prototype.collide_other_player = function (player, other_player) {
    "use strict";
    
    console.log(this.cPlayer.ren.opened);
    if (!this.cPlayer.ren.opened) other_player.collide_with_player(player, other_player);
};

Mst.Player.prototype.collide_NPC = function (player, NPC) {
    "use strict";
    
    if (!this.cPlayer.ren.opened && NPC.type !== "follower") NPC.touch_player(NPC, player);
    
    if (NPC.stype === "kerik") {
        NPC.kerik_run = false;
        this.game_state.game.physics.arcade.moveToObject(NPC, player, -50);
        //console.log("Not run kerik! " + NPC.name);
    }
    if (NPC.stype === "tlustocerv") {
        //NPC.tlustocerv_run = false;
        this.game_state.game.physics.arcade.moveToObject(NPC, player, -50);
        console.log("Not run tlustocerv! " + NPC.name);
    }
};

Mst.Player.prototype.hit_player = function (player, enemy) {
    "use strict";
    if (!enemy.knockbacked) {
        enemy.knockback_by_player(enemy, player);
        
        const attack = enemy.spec_attack(player);
        
        if (attack > 0) {
            player.mPlayer.subtract_health(attack);

            const stress = attack + 2;
            player.cPlayer.work_rout("fighter", "constitution", stress, 1, 1, 3); // stress, stand_exp, skill_exp, abil_p

            this.emitter.x = this.x;
            this.emitter.y = this.y;
            this.emitter.start(true, 1000, null, 8);
        }
    } else {
        console.log("Enemy knockbacked");
    }
};

Mst.Player.prototype.hit_player_by_bullet = function (bullet, player) {
    "use strict";
    const stress = bullet.en_attack + 2;
    
    player.cPlayer.work_rout("fighter", "constitution", stress, 1, 1, 3); // stress, stand_exp, skill_exp, abil_p
    
    player.mPlayer.subtract_health(bullet.en_attack);
    
    this.emitter.x = this.x;
    this.emitter.y = this.y;
    this.emitter.start(true, 1000, null, 8);
};

Mst.Player.prototype.open_chest = function (player, chest) {
    "use strict";    
    if (!this.cPlayer.chest.opened) this.cPlayer.chest.open(chest);
};

Mst.Player.prototype.open_signpost = function (player, signpost) {
    "use strict";
    console.log("Open signpost player");
    
    if (!this.cPlayer.signpost.opened) this.cPlayer.signpost.open(signpost);
};

Mst.Player.prototype.open_collision = function (player, collision) {
    "use strict";
    console.log("Open collision player");
    
    collision.open_collision(player);
};

Mst.Player.prototype.open_overlaps = function (player, overlap) {
    "use strict";
    console.log("Open overlap player");
    
    if (!this.cPlayer.overlap.opened) {
        this.cPlayer.overlap.open(overlap);
        console.log("Opened overlap: " + this.this.cPlayer.overlap.opened.name);
        
        this.body.immovable = true;
    }    
};

Mst.Player.prototype.equip = function (item_index, item_frame) {
    "use strict";    
    this.game_state.prefabs.equip.equip(item_index, item_frame);
};

Mst.Player.prototype.unequip = function () {
    "use strict";    
    return this.game_state.prefabs.equip.unequip();
};



Mst.Player.prototype.collide_layer_tile = function (player, tile) {
    "use strict";
    
    const dist = {
        x: player.x - (tile.worldX + 8),
        y: player.y - (tile.worldY + 8)
    };
    
    if (player.cPlayer.chest.direction.x === 0) {
        if (tile.faceLeft && tile.faceRight) {
            if (dist.x > 0) {
                player.x++;
            } else {
                player.x--;
            }
        } else {
            if (tile.faceLeft) {
                player.x--;
            }
            if (tile.faceRight) {
                player.x++;
            }
        }
    } else {
        if (tile.faceTop && tile.faceBottom) {
            if (dist.y > 0) {
                player.y++;
            } else {
                player.y--;
            }
        } else {
            if (tile.faceTop) {
                player.y--;
            }
            if (tile.faceBottom) {
                player.y++;
            }
        }
    }
};

Mst.Player.prototype.overlap_layer_tile = function (player, tile) {
    "use strict";
    
    const dist = {
        x: player.x - (tile.worldX + 8),
        y: player.y - (tile.worldY + 8)
    };
    
    if (player.cPlayer.chest.direction.x === 0) {
        if (tile.faceLeft && tile.faceRight) {
            if (dist.x > 0) {
                player.x++;
            } else {
                player.x--;
            }
        } else {
            if (tile.faceLeft) {
                player.x--;
            }
            if (tile.faceRight) {
                player.x++;
            }
        }
    } else {
        if (tile.faceTop && tile.faceBottom) {
            if (dist.y > 0) {
                player.y++;
            } else {
                player.y--;
            }
        } else {
            if (tile.faceTop) {
                player.y--;
            }
            if (tile.faceBottom) {
                player.y++;
            }
        }
    }
};