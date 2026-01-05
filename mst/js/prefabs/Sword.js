Mst.Sword = class extends Mst.Prefab {
    constructor(name, position, properties) {
        super(name, position, properties);

        this.cSword = new CSword(this);
        this.mSword = this.cSword.mSword;

        Mst.game.physics.arcade.enable(this);
        
        console.log(this);
        this.hit = Mst.groups.swords.create(position.x, position.y, 'hit');
        this.hit.anchor.setTo(0.5);
        this.hit.animations.add('r_hit', [0, 1, 2, 3, 4, 0], 12, false);
        this.hit.frame = 5;
        
        this.body.allowRotation = true;
        this.kill();

        this.direction = {"x": 1, "y": -1};

        //this.scale.setTo(1, -1);

        this.cut = false;
        console.log("!!! Init CUT: " + this.cut);

        this.wooshSound = Mst.game.add.audio('woosh');
        this.arrowSound = Mst.game.add.audio('arrow_sound');

        this.rod = Mst.groups.swords.create(this.x, this.y, 'rod_spritesheet', 0);
        this.rod.anchor.setTo(0.5);
        this.rod.visible = false;

        this.float = Mst.groups.swords.create(this.x, this.y, 'rod_spritesheet', 1);
        this.float.anchor.setTo(0.5);
        this.float.animations.add('float', [1, 2], 10, true);
        this.float.visible = false;
        this.float.trembling = false;
    }

    update() {
        if (this.alive) {
            if (Mst.layers.collision_forrest && this.cut && (this.cut_type === "wood" || this.cut_type === "uni")) {
                Mst.game.physics.arcade.overlap(this, Mst.layers.collision_forrest,  this.cut_wood, null, this);
            }
            if (Mst.layers.collision_rock && this.cut && (this.cut_type === "stone" || this.cut_type === "uni")) {
                Mst.game.physics.arcade.overlap(this, Mst.layers.collision_rock,  this.cut_stone, null, this);
            }
            if (Mst.layers.grass && this.cut && this.cut_type === "plant") {
                Mst.game.physics.arcade.overlap(this, Mst.layers.grass,  this.cut_grass, null, this);
            }
            if (this.cut_type !== "fire" && this.body.rotation > 40 && this.body.rotation < 80) {
                this.kill();
            }
        }
    }

    player_update(x, y, cdir) {
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
    }
    
    swing() {
        const player = Mst.player;
        
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
    
                    Mst.game.time.events.add(Phaser.Timer.SECOND * 0.2, this.hide_bow, this);
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

                        if (Mst.layers.water && btest) {
                            this.rod.visible = true;
                            this.float.visible = true;

                            Mst.game.time.events.add(Phaser.Timer.SECOND * 5, this.move_float, this);
                        }
                    }
                }
            }
            console.log("!!! CUT: " + this.cut);
            console.log(this);
        }
    }
    
    check_rod() {
        if (this.rod.visible) {
            this.rod.visible = false;
            this.float.visible = false;
            this.float.trembling = false;
            this.float.animations.stop();

            return false;
        } else {
            return true;
        }
    }
    
    move_float() {
        if (this.rod.visible) {
            this.float.animations.play("float");
            this.float.trembling = true;
        }
    }
    
    hide_bow() {
        console.log("Hide bow");
        this.cSword.create_bullet(0, 125);

        this.kill();
    }
    
    reequip(ef) {
        this.cSword.reequip(ef);
    }
    
    cut_wood(tool, wood) {
        console.log("wood!!!");

        if (Mst.getTileDir(wood, "collision_forrest")) {
            console.log("Cut wood");
            
            this.cSword.cut_wood();
            
            this.cut = false;
            console.log("!!! Wood CUT: " + this.cut);
        }
    }
    
    cut_stone(tool, stone) {
        console.log("stone!!!");
        
        if (Mst.getTileDir(stone, "collision_rock")) {
            console.log("Cut stone");

            this.cSword.cut_stone();

            this.cut = false;
            console.log("!!! Stone CUT: " + this.cut);
        }
    }
    
    cut_grass(tool, grass) {
        console.log("Position player " + Math.floor(Mst.player.x/16) + "|" + Math.floor(Mst.player.y/16) + " grass " + x + "|" + y);
        console.log("cut grass!!!");
    
        if (Mst.getTileDir(grass, "grass")) {
            console.log("Cut grass");
    
            this.cSword.cut_grass(this.frame);

            this.cut = false;
            console.log("!!! Grass CUT: " + this.cut);
        }
    }
    
    rnd_take(frame, skill) {
        this.cSword.rnd_take(frame, skill);
    }
    
    cut_chest(chest) {
        console.log("Cut chest");
        console.log(chest);
        
        this.cSword.cut_chest(chest, this.frame);

        this.cut = false;
        console.log("!!! Chest CUT: " + this.cut);
    }
};
