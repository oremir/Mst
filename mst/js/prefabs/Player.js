Mst.Player = class extends Mst.Prefab {
    constructor(name, position, properties) {
        console.log("player");

        properties.usr_id = Mst.usr_id;

        super("player", position, properties);

        this.usr_id = properties.usr_id;

        this.cPlayer = new CPlayer(this, name, position, properties);
        this.mPlayer = this.cPlayer.mPlayer;
        this.stats = this.mPlayer.stats;
        console.log(this.stats);

        /*
        const load_player = JSON.parse(localStorage.getItem("player"));
        if (typeof(load_player) != 'undefined') {
            this.x = load_player.x;
            this.y = load_player.y;
        }*/

        Mst.game.physics.arcade.enable(this);
        this.body.collideWorldBounds = true;
        this.smoothed = false;

        Mst.game.camera.follow(this);

        this.animations.add('left', [4, 5], 10, true);
        this.animations.add('right', [6, 7], 10, true);
        this.animations.add('up', [2, 3], 10, true);
        this.animations.add('down', [0, 1], 10, true);


        this.frame = 0;

        this.body.setSize(12, 14, 2, 2);
        this.anchor.setTo(0.5);

        this.emitter = new Mst.Emitter();

        this.cursors = Mst.game.input.keyboard.createCursorKeys();
        this.keys = Mst.game.input.keyboard.addKeys({
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

        Mst.init_player(this);
    }

    update() {
        Mst.game.physics.arcade.collide(this, Mst.layers.collision, this.collide_layer_tile, null, this);
        Mst.game.physics.arcade.overlap(this, Mst.layers.collision, this.overlap_layer_tile, null, this);
        Mst.game.physics.arcade.collide(this, Mst.groups.enemies, this.hit_player, null, this);
        Mst.game.physics.arcade.collide(this, Mst.groups.chests, this.open_chest, null, this);
        Mst.game.physics.arcade.collide(this, Mst.groups.signposts, this.open_signpost, null, this);
        Mst.game.physics.arcade.collide(this, Mst.groups.collisions, this.open_collision, null, this);
        Mst.game.physics.arcade.overlap(this, Mst.groups.overlaps, this.open_overlaps, null, this);

        if (this.cPlayer.no_pass_OP) {
            Mst.game.physics.arcade.collide(this, Mst.groups.otherplayers, this.collide_other_player, null, this);
            Mst.game.physics.arcade.collide(this, Mst.groups.NPCs, this.collide_NPC, null, this);
        }

        if (Mst.layers.collision_forrest) Mst.game.physics.arcade.collide(this, Mst.layers.collision_forrest);

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
    }
    
    key_right() {
        // move right
        this.body.velocity.x = this.mPlayer.walking_speed;
        this.animations.play("right");
    
        this.cPlayer.key_right();
    }
    
    key_left() {
        // move left
        this.body.velocity.x = -this.mPlayer.walking_speed;
        this.animations.play("left");
    
        this.cPlayer.key_left();
    }
    
    key_up() {
        // move up
        this.body.velocity.y = -this.mPlayer.walking_speed;
        this.animations.play("up");

        this.cPlayer.key_up();
    }
    
    key_down() {
        // move down
        this.body.velocity.y = this.mPlayer.walking_speed;
        this.animations.play("down");

        this.cPlayer.key_down();
    }
    
    collide_other_player(player, other_player) {
        console.log(this.cPlayer.ren.opened);
        if (!this.cPlayer.ren.opened) other_player.collide_with_player(player, other_player);
    }

    collide_NPC(player, NPC) {
        if (!this.cPlayer.ren.opened && NPC.type !== "follower") NPC.touch_player();
        
        if (NPC.stype === "kerik") {
            NPC.kerik_run = false;
            Mst.game.physics.arcade.moveToObject(NPC, player, -50);
            //console.log("Not run kerik! " + NPC.name);
        }
        if (NPC.stype === "tlustocerv") {
            //NPC.tlustocerv_run = false;
            Mst.game.physics.arcade.moveToObject(NPC, player, -50);
            console.log("Not run tlustocerv! " + NPC.name);
        }
    }
    
    hit_player(player, enemy) {
        const knockback = enemy.cEnemy.knockback;
        if (!knockback.check) {
            knockback.by_player();

            const attack = enemy.mEnemy.attack;

            if (attack > 0) {
                player.mPlayer.subtract_health(attack);

                const stress = attack + 2;
                player.cPlayer.work_rout("fighter", "constitution", stress, 1, 1, 3); // stress, stand_exp, skill_exp, abil_p
    
                this.emitter.start({ x: player.x, y: player.y });
            }
        } else {
            console.log("Enemy knockbacked", knockback.timer.duration);
        }
    }

    hit_player_by_bullet(bullet, player) {
        const stress = bullet.en_attack + 2;
        
        player.cPlayer.work_rout("fighter", "constitution", stress, 1, 1, 3); // stress, stand_exp, skill_exp, abil_p
        
        player.mPlayer.subtract_health(bullet.en_attack);

        this.emitter.start({ x: player.x, y: player.y });
    }
    
    open_chest(player, chest) {
        if (!this.cPlayer.chest.opened) this.cPlayer.chest.open(chest);
    }
    
    open_signpost(player, signpost) {
        console.log("Open signpost player");
        if (!this.cPlayer.signpost.opened) this.cPlayer.signpost.open(signpost);
    }
    
    open_collision(player, collision) {
        console.log("Open collision player");
        collision.open_collision(player);
    }
    
    open_overlaps(player, overlap) {
        console.log("Open overlap player");
        if (!this.cPlayer.overlap.opened) {
            this.cPlayer.overlap.open(overlap);
            console.log("Opened overlap: " + this.this.cPlayer.overlap.opened.name);

            this.body.immovable = true;
        }
    }
    
    equip(item) {
        Mst.hud.equip.equip(item);
    }
    
    unequip() {
        return Mst.hud.equip.unequip();
    }
        
    collide_layer_tile(player, tile) {
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
    }
    
    overlap_layer_tile(player, tile) {
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
    }
};

