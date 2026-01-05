Mst.Enemy = class extends Mst.Prefab {
    constructor(name, position, properties) {
        super(name, position, properties);
        this.cEnemy = this.controller;
        this.mEnemy = this.model;
    
        this.pool = Mst.groups[properties.pool];
        
        Mst.game.physics.arcade.enable(this);
        this.body.bounce.setTo(1);
        this.body.collideWorldBounds = true;
        this.cEnemy.init(this.body, this.x);
        this.anchor.setTo(this.mEnemy.anchor_value);
        
        this.scale.setTo(-properties.direction, 1);
        
        console.log("Enemy texture:");
        console.log(this.key);
        this.cEnemy.stand_still = false;
        
        switch (properties.texture) {
            case "slime_spritesheet":
                this.animations.add("go", [0, 1], 5, true);
                this.animations.play("go");
            break;
            case "rabite_spritesheet":
                this.animations.add("go", [0, 1, 2, 3, 4, 5, 6], 10, true);
                this.animations.play("go");
            break;
            case "boar_spritesheet":
                this.animations.add("go", [0, 1], 5, true);
                this.animations.play("go");
            break;
            case "wasp_spritesheet":
                this.animations.add("go", [0, 1], 5, true);
                this.animations.play("go");
            break;
            case "spider_spritesheet":
                this.animations.add('left', [6, 7], 10, true);
                this.animations.add('right', [4, 5], 10, true);
                this.animations.add('up', [2, 3], 10, true);
                this.animations.add('down', [0, 1], 10, true);
            break;
            case "angostura_spritesheet":
                this.animations.add("go", [0, 1], 5, true);
                this.animations.play("go");
            break;
            case "angostura-v_spritesheet":
                this.animations.add("go", [0, 1, 2, 3, 4, 5, 6, 7], 10, true);
                this.animations.play("go");
            break;
            case "rotulice_spritesheet":
                this.animations.add("go", [0, 1, 2, 3], 15, true);
                this.animations.play("go");
            break;
            case "cmelotrysk_spritesheet":
                this.animations.add("go", [0, 1], 5, true);
                this.animations.play("go");
            break;
        }

        this.emitter = new Mst.Emitter();
    }
    
    _controller() {
        return new CEnemy(this, this.name, this._position, this.properties);
    }

    get distance_player() {
        return Mst.cPlayer.distance(this);
    }

    get detect_player() {
        return Mst.cPlayer.detect(this);
    }

    update() {
        Mst.game.physics.arcade.collide(this, Mst.layers.collision);
        Mst.game.physics.arcade.collide(this, Mst.groups.chests);
        Mst.groups.enemies.forEachAlive(function(one_enemy) {
            Mst.game.physics.arcade.collide(this, one_enemy, this.knockback_by_other_enemy, null, this);
        }, this);
        
        if (this.monster_type === 'spider') {
            const dirF = this.cEnemy.movement.directionF;
            this.animations.play(dirF);
        } else {
            const sc = this.cEnemy.movement.directionLR;
            this.scale.setTo(sc, 1);
        }
        
        if (this.body.immovable) this.cEnemy.movement.stop();
        
        if (!this.cEnemy.knockback.check) {
            if (this.detect_player) {
                Mst.cPlayer.fight.open(this.distance_player);
                if(!this.body.immovable) {
                    if (this.distance_player > 45) {
                        Mst.game.physics.arcade.moveToObject(this, Mst.player, 60);
                    } else {
                        Mst.game.physics.arcade.accelerateToObject(this, Mst.player, 60);
                    }
                }
            }
        }
        
        this.cEnemy.hit_sword();
    }

    knockback_by_other_enemy(enemy, o_enemy) {
        this.cEnemy.knockback.start(enemy, o_enemy, 10);
    }

    reset(name, position, properties) {
        super.reset(name, position, properties);
        this.cEnemy.movement.reset();

        console.log("Reset Enemy key: " + this.key);
        if (this.key == "wasp_spritesheet") {
            this.timer_sting.loop(Phaser.Timer.SECOND * 0.6, this.create_bullet, this);
            this.timer_sting.start();
            console.log(this.timer_sting);
        }
        
        if (this.key == "spider_spritesheet") {
            this.timer_web.loop(Phaser.Timer.SECOND * 0.6, this.create_web, this);
            this.timer_web.start();
            console.log(this.timer_web);
        }
    }
};

Mst.Slime = class extends Mst.Enemy {
    constructor(name, position, properties) {
        super(name, position, properties);

    }
};
