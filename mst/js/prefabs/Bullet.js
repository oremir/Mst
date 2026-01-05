Mst.Bullet = class extends Mst.Prefab {
    constructor(name, position, properties) {
        super(name, position, properties);
        
        this.walking_speed = 400;

        this.health_max = 40;
        this.health = this.health_max;

        this.en_attack = 2;

        Mst.game.physics.arcade.enable(this);
        this.body.bounce.setTo(1);
        this.body.collideWorldBounds = true;

        this.body.velocity.x = properties.direction.x * this.walking_speed;
        this.body.velocity.y = properties.direction.y * this.walking_speed;

        this.anchor.setTo(0.5);

        this.b_type = 2;
        this.angle = -45 * Math.abs(properties.direction.x) - 90 * properties.direction.x + 45 * Math.abs(properties.direction.y) - 90 * properties.direction.y;

        this.ctype = properties.ctype;
        this.oldframe = properties.oldframe;

        console.log(properties.texture);
        if (properties.texture === "sting") {
            this.b_type = 1;
            this.angle = 0;
            this.scale.setTo(Math.sign(this.body.velocity.x), 1);
        }
        console.log("C " + properties.direction.x + ":" + properties.direction.y + " Bullet angle: " + this.angle);

        console.log(this.group);
    }

    update() {
        "use strict";
        Mst.game.physics.arcade.collide(this, Mst.layers.collision, this.kill, null, this);
        Mst.game.physics.arcade.collide(this, Mst.groups.chests, this.hit_chest, null, this);
        Mst.game.physics.arcade.collide(this, Mst.groups.otherplayers, this.hit_other_player, null, this);
        if (this.group_name == "enemybullets") {
            Mst.game.physics.arcade.collide(this, Mst.player, this.hit_player, null, this);
        } else {
            Mst.game.physics.arcade.collide(this, Mst.groups.enemies, this.hit_enemy, null, this);
            Mst.game.physics.arcade.collide(this, Mst.groups.wildanimals, this.hit_animal, null, this);
        }
    }
    
    reset(position, properties) {
        this.position_x = position.x;
        this.position_y = position.y;

        super.reset(this.name, position, properties);
    
        this.body.velocity.x = properties.direction.x * this.walking_speed;
        this.body.velocity.y = properties.direction.y * this.walking_speed;

        this.angle = -45 * Math.abs(properties.direction.x) - 90 * properties.direction.x + 45 * Math.abs(properties.direction.y) - 90 * properties.direction.y;
        if (this.b_type == 1) {
            this.angle = 0;
            this.scale.setTo(Math.sign(this.body.velocity.x), 1);
        }
        console.log("R " + properties.direction.x + ":" + properties.direction.y + " Bullet angle: " + this.angle);
    }
    
    hit_chest(bullet, chest) {
        if (this.oldframe > -1) chest.cChest.items.add(this.oldframe, 1);
        bullet.kill();
    }
    
    hit_other_player(bullet, other_player) {
        bullet.kill();
    }
    
    hit_player(bullet, player) {
        player.hit_player_by_bullet(bullet, player);
        bullet.kill();
    }

    hit_enemy(bullet, enemy) {
        console.log("Bullet texture:");
        console.log(this.key);
        const ce = enemy.cEnemy;

        if (this.key === "magic1") {
            ce.hit_magic();
        } else {
            console.log(this.frame);
            if (this.frame === 0) {
                ce.hit_arrow();
            } else {
                if (this.frame === 2) {
                    ce.hit_meat();
                } else {
                    if (this.ctype === 'sling') {
                        ce.hit_sling();
                    } else {
                        ce.hit_throw();
                    }
                }
            }            
        }
        bullet.kill();
    }
    
    hit_animal(bullet, animal) {
        const player = Mst.player;

        console.log("Bullet texture:");
        console.log(this.key);

        if (this.key === "magic1") {
            animal.hit_magic(player, animal);
        } else {
            console.log(this.frame);
            if (this.frame === 0) {
                animal.hit_arrow(player, animal);
            } else {
                if (this.frame === 2) {
                    animal.hit_meat(player, animal);
                } else {
                    animal.hit_throw(player, animal);
                }
            }
        }
        bullet.kill();
    }
};
