class CEKnockBack {
    constructor(obj, im) {
        this.obj = obj;
        if (!im) im = false;
        this._immovable = im;
        this.timer = Mst.game.time.create(false);
    }

    get immovable() {
        return this._immovable;
    }

    set immovable(b) {
        this._immovable = b;
    }

    get check() {
        return !this.timer.running;
    }

    reset(n) {
        const time = Phaser.Timer.SECOND * n / 10;
        this.timer.add(time, this.stop, this);
        this.timer.start();
    }

    start(obj, oobj, n, res) {
        if (!res) res = 10;
        if (!this.immovable) {
            Mst.game.physics.arcade.moveToObject(obj, oobj, -10 * n);
        }
        this.reset(res);
    }
    
    stop() {
        console.log("Timer knockback stop");
    }

    by_player() {
        console.log("Knokback by player", this.obj, Mst.player);
        this.start(this.obj, Mst.player, 7);
    }

    by_hit(type) {
        console.log("Knokback by hit", this.obj, Mst.player);
        if (type === "magic") {
            this.start(this.obj, Mst.player, 6, 5);
        } else {
            this.start(this.obj, Mst.player, 9);
        }
    }
}

class CEnemy extends CPrefab {
    constructor(vEnemy, name, position, properties) {
        super(vEnemy, name, position, properties);
        this.vEnemy = vEnemy;
        this.mEnemy = this.model;

        this.knockback = new CEKnockBack(this.vEnemy);

        this._stand_still = false;
        this._stunned = false;

        switch (properties.texture) {
            case "wasp_spritesheet":
                this.timer_sting = Mst.game.time.create(false);
                this.timer_sting.loop(Phaser.Timer.SECOND * 0.6, this.create_bullet, this);
                this.timer_sting.start();
            break;
            case "spider_spritesheet":
                this.timer_web = Mst.game.time.create(false);
                this.timer_web.loop(Phaser.Timer.SECOND * 0.6, this.create_web, this);
                this.timer_web.start();
            break;
            case "angostura_spritesheet":
                this.timer_vyh = Mst.game.time.create(false);
                this.timer_vyh.loop(Phaser.Timer.SECOND * 1, this.create_vyh, this);
                this.timer_vyh.start();
            break;
            default:
            break;
        }

        this.movement = {
            body: null,
            x: null,
            init: function(body, x, dir, speed) {
                this.body = body;
                this.x = x;
                this.body.velocity.x = dir * speed;
                this.body.velocity.y = Mst.rnd(-20, 20);
            },
            stop: function() {
                this.body.immovable = true;
                this.body.velocity.x = 0;
                this.body.velocity.y = 0;
            },
            start: function() {
                this.body.immovable = false;
            },
            get directionF() {
                if (Math.abs(this.body.velocity.x) > Math.abs(this.body.velocity.y)) {
                    if (this.body.velocity.x > 0) return "right";
                    return "left";
                } else {
                    if (this.body.velocity.y < 0) return "up";
                    return "down";
                }
            },
            get directionLR() {
                return this.body.velocity.x === 0 ? Math.sign(Mst.player.x - this.x) : Math.sign(this.body.velocity.x);
            },
            reset: function() {
                this.body.velocity.x = Mst.rnd(-40, 50);
                this.body.velocity.y = Mst.rnd(-60, 30);
            }
        };
        this.b_pool = Mst.groups.enemybullets;
        this.w_pool = Mst.groups.overlaps;
    }

    _model() {
        return new MEnemy(this, this.name, this.position, this.properties);
    }

    init(body, x) {
        this.movement.init(body, x, this.properties.direction, this.mEnemy.walking_speed);
    }

    get stand_still() {
        return this._stand_still;
    }

    set stand_still(b) {
        if (b) {
            this.movement.stop();
        } else {
            this.movement.start();
        }
        this._stand_still = b;
    }

    get stunned() {
        return this._stunned;
    }

    set stunned(dur) {
        if (dur < 999) Mst.game.time.events.add(Phaser.Timer.SECOND * dur, this.intomove, this);
        this.movement.stop();
        this._stunned = true;
    }

    intomove() {
        this._stunned = false;
        if (!this.stand_still) this.movement.start();
    }

    axp(d) {
        const enemy_health_max = parseInt(this.health_max);
        const axp =  d > enemy_health_max ? enemy_health_max : d;
        return axp > 2 ? Math.floor(axp / 2) : 1;
    }

    hit_sword() {
        const sword = Mst.cPlayer.weapon;
        if (sword.alive) {
            if (Mst.game.physics.arcade.distanceBetween(sword, this.vEnemy) < 19) {
                console.log("!!! Hit CUT: " + sword.cut);
                if (sword.cut) {
                    this.hit("fighter", "strength", 1.5, 5);
                    sword.cut = false;
                    console.log("!!! Hit CUT2: " + sword.cut);
                }
            }
        }
    }

    hit_magic() {
        this.hit("magic", "intelligence", 1.7, 3);
    }

    hit_arrow() {
        this.hit("archer", "dexterity", 1.7, 3);
    }

    hit_throw() {
        this.hit("thrower", "dexterity", 1.5, 5);
    }

    hit_sling() {
        this.hit("thrower", "dexterity", 1.6, 4);
    }

    hit_pet() {
        this.hit("fighter", "strength", 1.5, 5);
    }

    hit_meat() {
        const damage = Mst.mPlayer.damage("dexterity", 5, "thrower", 1.5);
        const axp = this.axp(damage);

        this.cPlayer.work_rout("thrower", "dexterity", 1, axp, axp, 3); // stress, stand_exp, skill_exp, abil_p

        this.cEnemy.stunned = 5;
    }

    hit(skill, ability, sc, ac) {
        const damage = Mst.mPlayer.damage(ability, ac, skill, sc);
        console.log(damage, this);

        if (this.vEnemy.alive) {
            const sub = this.mEnemy.health.sub(damage);
            const axp = this.axp(damage);

            Mst.cPlayer.work_rout(skill, ability, 1, axp, axp, 3); // stress, stand_exp, skill_exp, abil_p

            this.knockback.by_hit(skill);

            this.vEnemy.emitter.start({ x: this.x, y: this.y });

            console.log("Hit Enemy", this.mEnemy.health);

            if (sub < 1) {
                Mst.mPlayer.add_exp("standard", axp * 2);
                Mst.mPlayer.add_exp(skill, axp);

                for (const loot of this.mEnemy.monster_loot) {
                    Mst.cPlayer.items.add(loot, 1); // loot
                }

                this.vEnemy.kill();
                if (this.mEnemy.monster_type == "wasp_spritesheet") {
                    this.timer_sting.stop();
                }

                if (this.mEnemy.monster_type == "spider_spritesheet") {
                    this.timer_web.stop();
                }

                console.log("Enemy count:", this.vEnemy.pool.countLiving());
                console.log(this.vEnemy.pool);

                if (this.vEnemy.pool.countLiving() < 1) Mst.cPlayer.fight.close();
            }
        }
    }

    create_bullet() {
        const sc = this.movement.directionLR;
        const object_position = {
            x: this.vEnemy.x + sc * 10,
            y: this.vEnemy.y
        };

        const object_properties = {
            direction: { "x": sc, "y": 0 },
            texture: "sting",
            firstframe: 0,
            group: "enemybullets"
        };

        let object = this.b_pool.getFirstDead();

        if (!object) {
            const object_name = "bullet_" + this.b_pool.countLiving();
            object = new Mst.Bullet(object_name, object_position, object_properties);
        } else {
            object.reset(object_position, object_properties);
        }
    }

    create_web() {
        const sc = this.movement.directionLR;
        const object_position = {
            x: this.vEnemy.x + sc * 10,
            y: this.vEnemy.y
        };

        const object_properties = {
            direction: { "x": sc, "y": 0 },
            texture: "web",
            firstframe: 0,
            group: "overlaps"
        };

        let object = this.w_pool.getFirstDead();

        if (!object) {
            const object_name = "web_" + this.w_pool.countLiving();
            object = new Mst.Prefab(object_name, object_position, object_properties);

        } else {
            object.reset(object_position, object_properties);
        }

        Mst.game.physics.arcade.enable(object);
        object.anchor.setTo(0.5);
        object.body.immovable = true;

        console.log("Web");
        console.log(object);
    }

    create_vyh() {
        const player = Mst.player;

        if (this.vEnemy.distance_player < 45) {
            const object_position = {
                x: player.x + player.cPlayer.chest.direction.x * 14,
                y: player.y + player.cPlayer.chest.direction.y * 14
            };

            const sc = this.cEnemy.movement.directionLR;
            const object_properties = {
                direction: { "x": sc, "y": player.y },
                texture: "angostura-v_spritesheet",
                firstframe: 0,
                group: "enemies",
                pool: "enemies"
            };


            let object = this.pool.getFirstDead();

            if (!object) {
                const object_name = "angvyh_" + this.w_pool.countLiving();
                object = new Mst.Enemy(object_name, object_position, object_properties);
            } else {
                object.reset(object_position, object_properties);
            }

            object.stand_still = true;

            if (!this.cEnemy.stunned) {
                Mst.game.time.events.add(Phaser.Timer.SECOND * 0.4, this.kill, object);
            }

            console.log("vyhonek");
            console.log(object);
        }
    }

    cmelo_stop() {
        "use strict";

        this.stunned = 999;

        this.cmelotrysk_sprite =  new Mst.NPC("cmelotrysk", {x: this.x, y: this.y}, {
                    group: "NPCs",
                    pool: "NPCs",
                    texture: "blank_image",
                    p_name: "cmelotrysk",
                    unique_id: 0,
                    stype: "cmelotrysk",
                    relations_allowed : "false",
                    region: 0,
                    o_type: "NPC"
                });
        this.cmelotrysk_sprite.add_ren();

        const position = { x: Mst.player.x, y: Mst.player.y };
        const properties = {
            group: "shadows",
            pool: "shadows",
            stype: "shadow",
            items: "",
            closed_frame: 41,
            opened_frame: 41,
            texture: "blank_image"
        };

        Mst.player.shadow = new Mst.Chest("cpgive", position, properties);
        Mst.cPlayer.chest.open(Mst.player.shadow);
        //player.shadow.mChest.open_chest(player, player.shadow);

        Mst.cPlayer.fight.close();
        this.cmelotrysk_sprite.touch_player();
    }
}
