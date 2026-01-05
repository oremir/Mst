Mst.Follower = class extends Mst.Prefab {
    constructor(name, position, properties) {
        super(name, position, properties);
        
        Mst.game.physics.arcade.enable(this);
        
    //    this.stats = {
    //        items: properties.items
    //    };
        
        console.log("Follower");
        //console.log(this);
        
        this.unique_id = parseInt(properties.unique_id);
        this.p_name = properties.p_name;
        this.stype = properties.stype;
        this.relations_allowed = (properties.relations_allowed === 'true');
        this.region = properties.region;
        this.o_type = "NPC";
        this.type = "follower";
        
        this.stats = {
            items: properties.items || ""
        };
        
        let offset = 2;
        if (typeof (properties.offset) !== 'undefined') offset = parseInt(properties.offset);
        
        this.save = {
            type: properties.ftype,
            name: name,
            obj_id: this.unique_id,
            x: (position.x - (Mst.tileHeight / 2)),
            y: (position.y + (Mst.tileHeight / 2)),
            properties: properties
        };
        
        if (typeof (properties.sprtype) === 'undefined') {
            this.sprtype = 10;
        } else {
            this.sprtype = parseInt(properties.sprtype);
        }
        
        if (this.sprtype === 2) {
            this.animations.add("go", [0, 1], 5, true);
        } else {
            this.animations.add('left', [4, 5], 10, true);
            this.animations.add('right', [6, 7], 10, true);
            this.animations.add('up', [2, 3], 10, true);
            this.animations.add('down', [0, 1], 10, true);
        }
        this.frame = 0;
        
        this.body.setSize(12, 14, 2, offset);
        this.anchor.setTo(0.5);

        // Call Ren
        
        this.ren_name = this.stype + "_ren";
        if (this.stype === "pet") this.ren_name = properties.ren_texture;
        
        this.bubble = Mst.groups.bubbles.create(this.x, this.y - 16, 'bubble_spritesheet', 0);
        this.bubble.anchor.setTo(0.5);
        this.bubble.inputEnabled = true;
        this.bubble.events.onInputDown.add(this.hide_bubble, this);
        this.bubble.visible = false;
        this.bubble_showed = false;
        
        this.following = false;
        this.action = "follow";
    }

    update() {
        Mst.game.physics.arcade.collide(this, Mst.layers.collision);
        Mst.game.physics.arcade.collide(this, Mst.groups.chests);
        
        Mst.groups.enemies.forEachAlive(function(one_enemy) {
            const player_dist = Mst.game.physics.arcade.distanceBetween(this, Mst.player);
            const enemy_dist = Mst.game.physics.arcade.distanceBetween(this, one_enemy);
            if (enemy_dist < 30) {
                this.action = "attack";
                Mst.game.physics.arcade.moveToObject(this, one_enemy, 120);
            }
            Mst.game.physics.arcade.collide(this, one_enemy, this.hit_enemy, null, this);
        }, this);
        
        if (Mst.game.physics.arcade.distanceBetween(this, Mst.player) > 70) {
            this.action = "follow";
        }
        
        Mst.game.physics.arcade.collide(this, Mst.groups.players);
        if (Mst.game.physics.arcade.distanceBetween(this, Mst.player) > 30 && this.action === 'follow') {
            Mst.game.physics.arcade.moveToObject(this, Mst.player, 130);
            this.following = true;
        } else {
            this.stop_follow();
        }
        
        if (Mst.game.physics.arcade.distanceBetween(this, Mst.player) < 24 && this.action === 'follow') {
            this.body.velocity.set(0);
            this.animations.stop();
        }
        
        //console.log("Follower velocity x: " + Math.floor(this.body.velocity.x) + " y: " + Math.floor(this.body.velocity.y));
        if (this.sprtype === 2) {
            this.animations.play("go");
            if (Math.sign(this.body.velocity.x) !== 0) {
                this.scale.setTo(-Math.sign(this.body.velocity.x), 1);
            }
        } else {
            if (Math.abs(this.body.velocity.x) > Math.abs(this.body.velocity.y)) {
                if (this.body.velocity.x > 0) {
                    this.animations.play("right");
                } else {
                    this.animations.play("left");
                }
            } else {
                if (this.body.velocity.y < 0) {
                    this.animations.play("up");
                } else {
                    this.animations.play("down");
                }
            }
        }
    }
    
    get uid() {
        return this.unique_id;
    }
    
    get otype() {
        return "NPC";
    }
    
    add_ren() {
        this.ren_sprite =  new Mst.Ren(this.ren_name, {x: 0, y:20}, {
            group: "ren", 
            texture: this.ren_name, 
            p_name: this.p_name, 
            p_id: this.unique_id,
            dialogue_name: this.name
        }, this);
        
        this.ren_sprite.visible = false;
    }
    
    show_bubble(type) {
        this.bubble_showed = true;
        
        this.bubble.loadTexture('bubble_spritesheet', type);
        this.bubble.visible = true;
        
        if (type === 0) {
            Mst.game.time.events.add(Phaser.Timer.SECOND * 2, this.hide_bubble, this);
        }
    }
    
    hide_bubble() {
        this.bubble_showed = false;
        console.log("Bubble hide");
        
        this.bubble.visible = false;
    }
    
    hit_enemy(follower, enemy) {
        enemy.cEnemy.hit_pet();        
        this.action = "follow";
    }
    
    stop_follow() {
        if (this.following) {
            Mst.game.physics.arcade.moveToObject(this, Mst.player, 50);
        }
        this.following = false;
    }
    
    touch_player() {
        var open = false;
        
        if (!this.ren_sprite.visible && !Mst.cPlayer.ren.opened && !Mst.cPlayer.fight.opened) {
            if (this.relations_allowed) {
                Mst.cPlayer.relations.update(Follower, 1);
            }
    
            if (!Mst.cPlayer.business.opened && Follower.stype === "merchant") {
                console.log("merchant");
                this.open_business();
                this.ren_sprite.show_dialogue("Chcete si něco koupit nebo prodat?", ["buy_sell", "quest"]);
                open = true;
            } 
            
            if (Follower.stype === "hospod") {
                console.log("hospod");
                this.ren_sprite.show_dialogue("Chcete tu přespat za 10G?", ["lodging"]);
                open = true;
            } 
    
            if (!open) {
                this.ren_sprite.show_dialogue("Dobrý den, co byste potřeboval?");
            }
        }
    }
    
    open_business() {
        Mst.cPlayer.business.open(this);
        console.log("Open business");
        Mst.hud.businessitems.show_initial_stats();
    }
    
    close_business() {
        Mst.hud.businessitems.kill_stats();
        Mst.cPlayer.business.close();
    }
    
    test_nurse() {
        return false;
    }
    
    hide_ren() {
        this.ren_sprite.hide();
        
        if (Mst.cPlayer.business.opened) this.close_business();
        
        if (!this.ren_sprite.quest.state) this.hide_bubble();
    }
    
    save_follower(go_position, go_map_int) {
        const follower = this;
        const name = this.name;
        this.save.action = "SAVE";
        this.save.type = "follower";
        this.save.x = go_position.x;
        this.save.y = go_position.y;
        this.save.map_int = go_map_int;
        
        const n = Mst.time;
        this.save.properties.time = n;
    
        console.log("SAVE Follower");
        console.log(this.save);
    
        $.post("object.php?time=" + n + "&uid=" + Mst.usr_id, this.save)
            .done(function (data) {
                console.log("Follower save success");
                console.log(data);
            })
            .fail(function (data) {
                console.log("Follower save error");
                console.log(data);
            });
    
        console.log("save follower save");
    }
};