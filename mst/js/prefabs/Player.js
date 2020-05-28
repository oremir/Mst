var Mst = Mst || {};
var Phaser = Phaser || {};
var console = console || {};

Mst.Player = function (game_state, name, position, properties) {
    "use strict";
    var load_player;
    
    console.log("player");
    
    Mst.Prefab.call(this, game_state, "player", position, properties);
    
    /*load_player = JSON.parse(localStorage.getItem("player"));
    if (typeof(load_player) != 'undefined') {
        this.x = load_player.x;
        this.y = load_player.y;
    }*/

    this.region = properties.region;
    this.p_name = properties.p_name;
    this.name = name;
    this.usr_id = this.game_state.root_data.usr_id;
    
    this.walking_speed = +properties.walking_speed;
    this.jumping_speed = +properties.jumping_speed;
    this.bouncing = +properties.bouncing;
    this.direction_sword = {"x": 1, "y": -1};
    this.direction_chest = {"x": 0, "y": 1};
    
    //this.killed = (properties.killed === 'true');
    this.killed = properties.killed;
    //console.log(typeof(this.killed));
    if (typeof(this.killed) === 'string') {
        this.killed = (properties.killed === 'true')
    }
    
    this.no_pass_OP = true;
        
    //console.log(properties.exp);
    
    if (typeof (properties.ren_texture) === 'undefined') {
        properties.ren_texture = "";
    }
    
    if (typeof (properties.gender) === 'undefined') {
        properties.gender = "";
    }
    
    this.gender = properties.gender;
    
    if (typeof (properties.skills) === 'undefined') {
        properties.skills = {
            standard: { exp: 1, level: 1 },
            fighter: { exp: 1, level: 1 },
            woodcutter: { exp: 1, level: 1 },
            stonebreaker: { exp: 1, level: 1 }
        };
    }
    
    if (typeof (properties.stats) === 'undefined') {
        properties.stats = {
            health: 100,
            health_max: 100,
            stress: 0
        };
    }

    this.health = +properties.stats.health || 100;
    
    if (typeof (properties.abilities) === 'undefined') {
        properties.abilities = {
            strength: 8,
            constitution: 8,
            intelligence: 8
        };
    }
    
    if (typeof (properties.relations) === 'undefined') {
        properties.relations = [];
    }
    
    if (typeof (properties.places) === 'undefined') {
        properties.places = [];
    }
    
    if (typeof (properties.quests) === 'undefined') {
        properties.quests = {
            ass: {},
            fin: []
        };
    }
    
    if (typeof (properties.keys) === 'undefined') {
        properties.keys = [];
    }
    
    if (typeof (properties.badges) === 'undefined') {
        properties.badges = {};
    }
    
    if (typeof (properties.broadcast) === 'undefined') {
        properties.broadcast = [];
    }
    
    if (typeof (properties.gtimems) === 'undefined') {
        properties.gtimems = 0;
    }
    
    if (typeof (properties.gtimealpha) === 'undefined') {
        properties.gtimealpha = 0;
    }
        
    this.followers = {};
    if (typeof (properties.followers) === 'undefined') {
        properties.followers = [];
    }
    
    
//    var dt = new Date();
//    var tm = dt.getTime();
    
    //console.log(properties.equip);
    
    this.stats = {
        health_hearts: 5,
        health: +properties.stats.health,
        health_max: +properties.stats.health_max || 100,
        stress: parseInt(properties.stats.stress),
        moon_moon: 5,
        moon: parseInt(properties.moon) || 5,
        moon_max: 5,
        moon_time: +properties.time || 0,
        moon_loop: +properties.moon_loop || 0,
        gtime: "0",
        exp: +properties.skills.standard.exp || +properties.exp || 1,
        level: +properties.skills.standard.level || 1,
        skills: properties.skills,
        abilities: properties.abilities,
        relations: properties.relations,
        places: properties.places,
        quests: properties.quests,
        equip: properties.equip,
        items: properties.items || load_player.properties.items,
        keys: properties.keys
    };
    
    this.gtime = {};
    this.gtime.ms = parseInt(properties.gtimems);
    this.gtime.obj = new Date(this.gtime.ms);
    
    var dt = new Date();
    var tt = dt.getTime();
    console.log("Time: " + properties.time + " " + tt + " " + (tt - properties.time));
    
    //this.stats.gtime = " " + dt.getHours() + ":" + dt.getMinutes();
    this.stats.gtime = this.gtime.obj.toLocaleTimeString();
    console.log(this.gtime.obj);
    var gtimepom = this.stats.gtime.split(":");
    this.stats.gtime = " " + gtimepom[0] + ":" + gtimepom[1];
    
    this.stats.moon_loop -= (tt - properties.time);
    if (this.stats.moon_loop < 1) {
        var p_loop = - this.stats.moon_loop;
        var new_moon = Math.floor(p_loop/180000);
        new_moon += this.stats.moon;
        if (new_moon >= this.stats.moon_max) {
            this.stats.moon = this.stats.moon_max;
            this.stats.moon_loop = 0;
        } else {
            this.stats.moon = new_moon;
            this.stats.moon_loop = 180000 - (p_loop % 180000);
        }
    }

    console.log("parse int moon");
    console.log(this.stats.moon + " loop:" + this.stats.moon_loop);
    
    this.o_exp_alert = {
        timer: {},
        alerts: {}
    };
    
    this.o_exp_alert.timer = this.game_state.time.create(false);
    
    this.get_chest_timer = this.game_state.time.create(false);
        
    this.save = {
        type: "player",
        name: name,
        usr_id: this.usr_id,
        x: this.x,
        y: this.y,
        properties: properties,
        map: {},
        logged: true
    };
    
    console.log(this.save);
    
    this.opened_chest = "";
    this.opened_business = "";
    this.opened_ren = "";
    
    //console.log(properties.items);
    //console.log(this.stats.items);
    
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
    
    this.keys.action.onDown.add(this.key_action, this);
    this.keys.close.onDown.add(this.key_close, this);
    this.keys.change_type.onDown.add(this.key_change_type, this);
    
    this.close_state = [];
    this.close_context = [];
    this.close_not_delay = true;
    this.action_state = "none";
    
    this.emitter = this.game_state.game.add.emitter(0, 0, 100);
    this.emitter.makeParticles('blood', [0,1,2,3,4,5,6]);
    this.emitter.gravity = 120;
    this.emitter.setAlpha(1, 0, 400);
    
    this.update_place();
    //this.quest_bubble();
    
    this.infight = false;
    
    this.speak_b = false;
    this.speak_ren = {};
    this.broadcast = {};
    this.broadcast.player = properties.broadcast;
    this.save.properties.broadcast = [];
    this.read_broadcast();
};

Mst.Player.prototype = Object.create(Mst.Prefab.prototype);
Mst.Player.prototype.constructor = Mst.Player;

Mst.Player.prototype.update = function () {
    "use strict";
    this.game_state.game.physics.arcade.collide(this, this.game_state.layers.collision, this.collide_layer_tile, null, this);
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.enemies, this.hit_player, null, this);
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.chests, this.open_chest, null, this);
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.collisions, this.open_collision, null, this);
    
    if (this.no_pass_OP) {
        this.game_state.game.physics.arcade.collide(this, this.game_state.groups.otherplayers, this.collide_other_player, null, this);
    }
    
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.NPCs, this.collide_NPC, null, this);
    
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
    
    //if (this.keys.action.isDown) { this.key_action(); }
    //if (this.keys.close.isDown) { this.key_close(); }
    //if (this.keys.change_type.isDown) { this.key_change_type(); }
    
    if (this.keys.attack.isDown) { this.game_state.prefabs.sword.swing(); }
    if (this.keys.attack_alt.isDown) { this.game_state.prefabs.sword.swing(); }
    
    
    /*if (this.game_state.game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
        // swing
        
    }*/
    
    if (this.game_state.prefabs.sword.alive) {
        if (this.game_state.prefabs.sword.cut_type !== "fire") {
            this.game_state.prefabs.sword.x = this.x + this.direction_sword.x * 4;
            this.game_state.prefabs.sword.y = this.y + 2 + this.direction_sword.y;
            this.game_state.prefabs.sword.hit.x = this.x + this.direction_sword.x * 6;
            this.game_state.prefabs.sword.hit.y = this.y;
        } else {
            if (this.direction_chest.y === 0) {
                this.game_state.prefabs.sword.x = this.x + this.direction_chest.x * 18;
                this.game_state.prefabs.sword.y = this.y + this.direction_chest.y * 16 - 8;
            } else {
                this.game_state.prefabs.sword.x = this.x + this.direction_chest.x * 16 - 8;
                this.game_state.prefabs.sword.y = this.y + this.direction_chest.y * 20;
            }
        }
    }
    
    this.stats.health_hearts = Math.ceil(this.health / Math.ceil(this.stats.health_max / 5));
    this.stats.health = this.health;
    
    this.stats.moon_moon = Math.ceil(this.stats.moon / Math.ceil(this.stats.moon_max / 5));
    if (this.game_state.prefabs.player.stats.moon < this.game_state.prefabs.player.stats.moon_max) {
        if (this.stats.moon_loop > 0) {
            if (typeof (this.game_state.prefabs.moon.timer_first.timer) === 'undefined') {
                console.log("moon und");
                this.game_state.prefabs.moon.timer_first = this.game_state.game.time.events.add(this.stats.moon_loop, this.game_state.prefabs.moon.update_timer_moon, this);
            }
            //console.log("Timer: ")
            //console.log(this.game_state.prefabs.moon.timer_first.timer.duration.toFixed(0));
            //this.game_state.prefabs.moon.timer_first = this.game_state.game.time.events.add(this.stats.moon_loop, this.key_close_delay, this);
            var time_str = this.game_state.prefabs.moon.timer_first.timer.duration.toFixed(0);
        } else {
            var time_str = this.game_state.prefabs.moon.timer_moon.duration.toFixed(0);
        }
        this.game_state.prefabs.moon.text_moon.text = this.stats.moon + "/" + this.stats.moon_max + " > " + Math.floor(((time_str / 1000) / 60) % 60) + ":" + Math.floor((time_str / 1000) % 60);
        this.save.properties.moon_loop = time_str;
    } else {
        this.game_state.prefabs.moon.text_moon.text = this.stats.moon + "/" + this.stats.moon_max;
        this.save.properties.moon_loop = 0;
    }
    
    this.save.x = this.x;
    this.save.y = this.y;
    this.save.properties.stats.health = this.health;
    this.save.properties.stats.health_max = this.stats.health_max;
    this.save.properties.stats.stress = this.stats.stress;
    this.save.properties.items = this.stats.items;
    this.save.properties.equip = this.stats.equip;
    
    this.game_state.save.player = this.save;
};

//Mst.Player.prototype.key_attack_enter = function () {
//    "use strict";
//    var pins;
//    
//    if (!this.speak_b) {
//        this.game_state.prefabs.sword.swing();
//    } else {
//        this.speak_b = false;
//        
//        pins = this.speak_ren.p_id + "|" + this.usr_id + "|0|1|" + this.speak_ren.inp_speak.value;
//        console.log(pins);
//        
//        $.get( "broadcast.php", { ins: pins} )
//            .done(function( data ) {
//                console.log( "Data Loaded: " + data );
//        });
//        
//        this.speak_ren.img_speak.kill();
//        this.speak_ren.inp_speak.kill();
//    }
//    
//};

Mst.Player.prototype.key_right = function () {
    "use strict";
    
    // move right
    this.body.velocity.x = this.walking_speed;
    this.animations.play("right");

    this.direction_sword.x = 1;
    this.game_state.prefabs.sword.hit.scale.setTo(this.direction_sword.x, 1);
    this.direction_chest = {"x": 1, "y": 0};
    //alert(1);
    //this.scale.setTo(-1, 1);
};

Mst.Player.prototype.key_left = function () {
    "use strict";
    // move left
    this.body.velocity.x = -this.walking_speed;
    this.animations.play("left");

    this.direction_sword.x = -1;
    this.game_state.prefabs.sword.hit.scale.setTo(this.direction_sword.x, 1);
    this.direction_chest = {"x": -1, "y": 0};
    //this.scale.setTo(1, 1);
    
};

Mst.Player.prototype.key_up = function () {
    "use strict";
    // move up
    this.body.velocity.y = -this.walking_speed;
    this.animations.play("up");

    this.direction_sword.y = -1;
    this.direction_chest = {"x": 0, "y": -1};
    //this.scale.setTo(1, 1);    
};

Mst.Player.prototype.key_down = function () {
    "use strict";
    // move down
    this.body.velocity.y = this.walking_speed;
    this.animations.play("down");

    this.direction_sword.y = 1;
    this.direction_chest = {"x": 0, "y": 1};
    //this.scale.setTo(1, 1);    
};

Mst.Player.prototype.key_action = function () {
    "use strict";
    var opened_chest = this.opened_chest;    
    console.log(opened_chest);    
    
    if (opened_chest !== "") {
        var chest = this.game_state.prefabs[opened_chest];
        console.log(chest);
        
        if (chest.stats.items == "") {
            chest.get_chest(chest);
        }
    }
    
};

Mst.Player.prototype.key_close = function () {
    "use strict";
    var close_state, close_context;
    
    //if (this.close_not_delay) {
        //this.close_not_delay = false;
        close_state = this.close_state.pop();
        close_context = this.close_context.pop();
        console.log(close_state);
        switch (close_state) {
          case "Dialogue":
            this.game_state.hud.dialogue.hide_dialogue();
            break;
          case "Abilities":
            this.game_state.prefabs[close_context].hide_window();
            break;
        }

        //this.game_state.game.time.events.add(Phaser.Timer.SECOND * 0.5, this.key_close_delay, this);
    //}
};

Mst.Player.prototype.key_change_type = function () {
    "use strict";
    
    if (this.game_state.prefabs.items.text_bot.text !== "") {
        this.game_state.prefabs.items.change_put_type();
    }    
};


//Mst.Player.prototype.key_close_delay = function () {
//    "use strict";
//    this.close_not_delay = true;
//};


Mst.Player.prototype.collide_other_player = function (player, other_player) {
    "use strict";
    
    if (this.opened_ren === "") {
        other_player.collide_with_player(player, other_player);
    }
};

Mst.Player.prototype.collide_NPC = function (player, NPC) {
    "use strict";
    
    if (this.opened_ren === "" && NPC.type !== "follower") {
        NPC.touch_player(NPC, player);
    }
};

Mst.Player.prototype.set_opened_ren = function (name) {
    "use strict";
    
    this.opened_ren = name;
};

Mst.Player.prototype.hit_player = function (player, enemy) {
    "use strict";
    var stress = enemy.en_attack + 2;
    
    player.work_rout("fighter", "constitution", stress, 1, 1, 3); // stress, stand_exp, skill_exp, abil_p
    
    enemy.knockback_by_player(enemy, player);
    
    player.subtract_health(enemy.en_attack);
    
    this.emitter.x = this.x;
    this.emitter.y = this.y;
//    var px = enemy.body.velocity.x;
//    var py = enemy.body.velocity.y;
//
//    px *= -0.8 + Math.random()*0.4;
//    py *= -0.8 + Math.random()*0.4;
//
//    this.emitter.minParticleSpeed.set(px, py);
//    this.emitter.maxParticleSpeed.set(px, py);
    this.emitter.start(true, 1000, null, 8);
};

Mst.Player.prototype.hit_player_by_bullet = function (bullet, player) {
    "use strict";
    var stress = bullet.en_attack + 2;
    
    player.work_rout("fighter", "constitution", stress, 1, 1, 3); // stress, stand_exp, skill_exp, abil_p
    
    player.subtract_health(bullet.en_attack);
    
    this.emitter.x = this.x;
    this.emitter.y = this.y;
    this.emitter.start(true, 1000, null, 8);
};

Mst.Player.prototype.add_health = function (quantity) {
    "use strict";
    
    this.health += quantity;
    
    if (this.health > this.stats.health_max) {this.health = this.stats.health_max}
    this.game_state.prefabs.health.text_health.text = this.health + "/" + this.stats.health_max + " S:" + this.stats.stress;
};

Mst.Player.prototype.subtract_health = function (quantity) {
    "use strict";
    
    this.health -= quantity;
    
    this.add_exp("standard", 1);
    this.add_ability("constitution", 3, 0);
    this.stats.stress += 1;
    
    this.game_state.prefabs.health.text_health.text = this.health + "/" + this.stats.health_max + " S:" + this.stats.stress;

    if (this.health < 1) {
        this.save.properties.killed = true;
        this.stats.stress = 0
        this.save.properties.stats.stress = 0;
        this.health = this.stats.health_max;
        this.stats.health = this.stats.health_hearts;
        this.save.properties.stats.health = this.stats.health_max;
        
        this.game_state.prefabs.moon.subtract_moon();
        this.new_day();
        
        this.game_state.save_data({ "x": 432, "y": 272 }, 4, "dead"); // "assets/maps/map4.json"
    }
};

Mst.Player.prototype.add_stress = function (quantity) {
    "use strict";
    
    this.add_ability("constitution", 2, 0);
    this.stats.stress += quantity;

    if (this.stats.stress > (50 + this.stats.abilities.constitution)) {
        this.subtract_health(1);
    }

    this.game_state.prefabs.health.text_health.text = this.health + "/" + this.stats.health_max + " S:" + this.stats.stress;
};

Mst.Player.prototype.subtract_stress = function (quantity) {
    "use strict";
    
    this.stats.stress -= quantity;

    if (this.stats.stress < 0) {
        this.stats.stress = 0;
    }
    
    this.game_state.prefabs.health.text_health.text = this.health + "/" + this.stats.health_max + " S:" + this.stats.stress;
};


Mst.Player.prototype.open_chest = function (player, chest) {
    "use strict";
    var owner;
    
    console.log(this.get_chest_timer.length);
    
    if (this.get_chest_timer.length < 1) {
          
        
        if (this.opened_chest === "") {
            console.log("Open! " + chest.name + " / Stat: " + chest.stat + " / Owner: " + chest.owner + " UsrID: " + player.usr_id + " / ObjID: " + chest.obj_id + " / Opened chest: " + player.opened_chest + " / Stats: ");      
            console.log(chest.stats);
            
            player.opened_chest = chest.name;
            owner = parseInt(chest.owner);

            if (chest.stat !== "open") {
                if (owner !== 0) {
                    if (owner === player.usr_id) {
                        chest.open_chest(player, chest);
                    } else {
                        console.log("Chest is owned by other player");
                        chest.game_state.hud.alert.show_alert("To patří jinému!");
                        this.get_chest_timer.add(Phaser.Timer.SECOND * 0.7, function(){}, this);
                        this.get_chest_timer.start();
                        this.opened_chest = "";
                    }
                } else {
                    chest.open_chest(player, chest);
                }
            } else {
                console.log("Chest is open by other player");
                chest.game_state.hud.alert.show_alert("Otevřel ji někdo jiný!");
                this.get_chest_timer.add(Phaser.Timer.SECOND * 0.7, function(){}, this);
                this.get_chest_timer.start();
                this.opened_chest = "";
            }
        }
    }
    
};

Mst.Player.prototype.open_collision = function (player, collision) {
    "use strict";
    console.log("Open collision player");
    
    collision.open_collision(player);
};

Mst.Player.prototype.open_business = function (player, person) {
    "use strict";
    
    if (this.opened_business === "") {
        person.open_business(player);
    }
};

Mst.Player.prototype.add_item = function (item_frame, quantity) {
    "use strict";
    
    return this.game_state.prefabs.items.add_item(item_frame, quantity);
};

Mst.Player.prototype.subtract_item = function (item_index, quantity) {
    "use strict";
    
    this.game_state.prefabs.items.subtract_item(item_index, quantity);
};

Mst.Player.prototype.subtract_all = function (item_index) {
    "use strict";
    
    return this.game_state.prefabs.items.subtract_all(item_index);
};

Mst.Player.prototype.put_all = function (content) {
    "use strict";
    var frame, quantity;
    
    if (content.length > 0) {
        for (var i = 0; i < content.length; i++) {
            frame = content[i].f;
            quantity = content[i].q;
            this.add_item(frame, quantity);
        }
    }
};

Mst.Player.prototype.test_item = function (item_frame, quantity) {
    "use strict";
    var index;
    
    index = this.game_state.prefabs.items.test_item(item_frame, quantity);
    console.log(index);
    return index;
};

Mst.Player.prototype.equip = function (item_index, item_frame) {
    "use strict";
    
    this.game_state.prefabs.equip.equip(item_index, item_frame);
};

Mst.Player.prototype.unequip = function () {
    "use strict";
    
    return this.game_state.prefabs.equip.unequip();
};

Mst.Player.prototype.add_exp = function (skill, quantity) {
    "use strict";
    var text;
    
    function level_add(skill, exp, level) {
        var pom_exp;
        
        switch (skill) {
          case "fighter":
            pom_exp = Math.pow(1.5, level) * 400;
            break;
          case "woodcutter":
            pom_exp = Math.pow(1.4, level) * 350;
            break;
          case "stonebreaker":
            pom_exp = Math.pow(1.4, level) * 350;
            break;
          case "forager":
            pom_exp = Math.pow(1.4, level) * 340;
            break;
          case "magic":
            pom_exp = Math.pow(1.4, level) * 380;
            break;
          default:
            pom_exp = Math.pow(1.6, level) * 500;
            break;
        }
        
        if (exp > pom_exp) {
            return 1;
        } else {
            return 0;
        }
    }
    
    if (typeof (this.stats.skills[skill]) === 'undefined') {
        this.stats.skills[skill] = { exp: 1, level: 1 };
    }
    
    this.stats.skills[skill].exp = parseInt(this.stats.skills[skill].exp);
    this.stats.skills[skill].level = parseInt(this.stats.skills[skill].level);
    
    this.stats.skills[skill].exp += quantity;
    this.stats.skills[skill].level += level_add(skill, this.stats.skills[skill].exp, this.stats.skills[skill].level);
    
    this.save.properties.skills[skill].exp = this.stats.skills[skill].exp;
    this.save.properties.skills[skill].level = this.stats.skills[skill].level;
    
    if (skill === "standard") {
        this.stats.exp = this.stats.skills[skill].exp;
        this.stats.level = this.stats.skills[skill].level;
    }
    
    this.alert_exp(skill, quantity);
};

Mst.Player.prototype.level = function (skill) {
    return parseInt(this.stats.skills[skill].level);
};

Mst.Player.prototype.work_rout = function (skill, ability, stress, stand_exp, skill_exp, abil_p) {
    "use strict";

    this.add_minutes(4);
    this.add_stress(stress);
    this.add_exp("standard", stand_exp);
    this.add_exp(skill, skill_exp);
    this.add_ability(ability, abil_p, 0);
};

Mst.Player.prototype.alert_exp = function (skill, quantity) {
    "use strict";
    var text = skill + " exp: +" + quantity;
    console.log(text);

    if (!this.o_exp_alert.timer.running) {
        console.log("Timer is not running");
        this.game_state.hud.alert.show_alert(text);
        
        this.o_exp_alert.timer.loop(Phaser.Timer.SECOND * 1.8, this.alert_exp_done, this);
        this.o_exp_alert.timer.start();
    } else {
        console.log("Timer is running");
        if (this.o_exp_alert.alerts[skill] !== undefined) {
            this.o_exp_alert.alerts[skill].q += quantity;
        } else {
            eval("this.o_exp_alert.alerts." + skill + " = {}");
            this.o_exp_alert.alerts[skill].s = skill;
            this.o_exp_alert.alerts[skill].q = quantity;
        }
    }
};

Mst.Player.prototype.alert_exp_done = function () {
    "use strict";
    var text, skill, iz;
    
    console.log("Timer end");
    
    var eal = Object.values(this.o_exp_alert.alerts);
    iz = 0;
    
    for (var i = 0; i < eal.length; i++) {
        if (eal[i].q > 0) {
            skill = eal[i].s;
            text =  skill + " exp: +" + eal[i].q;
            this.game_state.hud.alert.show_alert(text);
            iz += eal[i].q;
            this.o_exp_alert.alerts[skill].q = 0;
        }
    }
    
    if (iz < 1) {
        this.o_exp_alert.timer.stop();
    }
    
    //this.o_exp_alert.timer.add(Phaser.Timer.SECOND * 3.5, this.alert_exp_done, this);
    //this.o_exp_alert.timer.start();
};


Mst.Player.prototype.add_ability = function (ability, num1, num2) {
    "use strict";
    var quantity, rnd_test;
    
    if (typeof (this.stats.abilities[ability]) === 'undefined') {
        this.stats.abilities[ability] = 8;
    }
    
    this.stats.abilities[ability] = parseInt(this.stats.abilities[ability]);
    
    quantity = 0;
    
    if (this.stats.abilities[ability] < 100) {
        rnd_test = Math.floor(Math.random() * 200);
    } else {
        if (this.stats.abilities[ability] < 500) {
            rnd_test = Math.floor(Math.random() * 1000);
        } else {
            if (this.stats.abilities[ability] < 900) {
                rnd_test = Math.floor(Math.random() * 5000);
            } else {
                if (this.stats.abilities[ability] < 999) {
                    rnd_test = Math.floor(Math.random() * 10000);
                } else {
                    rnd_test = 10000;
                    this.stats.abilities[ability] = 999;
                }
            }
        }
    }
    
    if (rnd_test < num1) {
        quantity = 1;
    }
    
    if (this.stats.abilities[ability] < 999) {
        quantity += num2;
    } else {
        this.stats.abilities[ability] = 999;
    }
    
    this.stats.abilities[ability] += quantity;
    this.save.properties.abilities[ability] = this.stats.abilities[ability];
};

Mst.Player.prototype.update_place = function () {
    "use strict";
    var map, key, place_selected;
    console.log("Update place");
    
    map = this.game_state.map_data.map;
    //place_selected = {};
    
    for (key in this.stats.places) {
        //console.log(this.stats.places[key]);
        //if (parseInt(place.map_int) === parseInt(map.map_int) && parseInt(place.region) === parseInt(map.region)) {
        if (this.stats.places[key].map_int === map.map_int && this.stats.places[key].region === map.region) {
            place_selected = this.stats.places[key];
        }
    }
    
    //console.log(place_selected);
    
    if (typeof (place_selected) === 'undefined') {
        place_selected = {
            map_int: map.map_int,
            region: map.region,
            visit: 1
        };
        this.stats.places.push(place_selected);
        //console.log(place_selected);
    } else {
        place_selected.visit++;
        //console.log(place_selected);
    }
    this.save.properties.places = this.stats.places;
    console.log(this.stats.places);
};

Mst.Player.prototype.update_relation = function (person, type, exp) {
    "use strict";
    var key, relation_selected, uid, ruid, rname, otype;
    console.log("Update relation");
    console.log(person);
    
    if (person.o_type === 'NPC') {
        uid = person.unique_id;
        otype = "NPC";
    } else {
        uid = person.usr_id;
        otype = "player";
    }
    
    for (key in this.stats.relations) {
        //console.log(this.stats.relations[key]);
        //if (parseInt(relation.map_int) === parseInt(map.map_int) && parseInt(relation.region) === parseInt(map.region)) {
        if (typeof (this.stats.relations[key].uid) === 'undefined') { // jen docasne !!!!!!!!
            if (person.name === 'nun_1') {
                rname = "nun";
            }
            if (person.name === 'merchant_0') {
                rname = "merchant";
            }
            if (this.stats.relations[key].name === rname
                    && this.stats.relations[key].region === person.region
                    && this.stats.relations[key].type === type) {
                relation_selected = {
                    name: person.p_name,
                    uid: uid,
                    type: type,
                    exp: this.stats.relations[key].exp
                };
                this.stats.relations[key] = relation_selected;
                relation_selected = this.stats.relations[key];
            }
        } else {
            ruid = parseInt(this.stats.relations[key].uid);
            console.log("Relation [" + key + "] r type: " + this.stats.relations[key].type + " p type: " + person.o_type + " r id: " + ruid + " p id " + uid);
            if (this.stats.relations[key].type === otype && ruid === uid) {
                relation_selected = this.stats.relations[key];
                console.log(relation_selected);
                
                for (var i = parseInt(key) + 1; i < this.stats.relations.length; i++) { // jen docasne ... odstran multi
                    ruid = parseInt(this.stats.relations[i].uid);
                    if (this.stats.relations[i].type === otype && ruid === uid) {
                        relation_selected.exp = parseInt(relation_selected.exp);
                        relation_selected.exp += parseInt(this.stats.relations[i].exp);
                        this.stats.relations.splice(i, 1);
                        break;
                    }
                }
                
                break;
            }
        }

    }
    
    //console.log(relation_selected);
    
    if (typeof (relation_selected) === 'undefined') {
        relation_selected = {
            name: person.p_name,
            uid: uid,
            type: type,
            exp: 1
        };
        this.stats.relations.push(relation_selected);
        console.log("Push");
        console.log(relation_selected);
    } else {
        console.log("Update");
        relation_selected.exp = exp + parseInt(relation_selected.exp);
        console.log(relation_selected);
    }
    this.save.properties.relations = this.stats.relations;
    //console.log(this.stats.relations);
};

//Mst.Player.prototype.quest_bubble = function () {
//    "use strict";
//    
//    this.game_state.groups.NPCs.forEachAlive(function (NPC) {
//        console.log("Quest bubble: " + NPC.name);
//        NPC.test_quest();
//    }, this);
//};

Mst.Player.prototype.assign_quest = function (quest) {
    "use strict";
    var new_quest, key;
    new_quest = {
        name: quest.name,
        qid: quest.qid,
        owner: quest.properties.owner,
        ot: quest.properties.owner_type,
        endc: quest.properties.ending_conditions,
        acc: {
            is: false,
            q: 0
        }
    };
    console.log(new_quest);
    
    if (this.test_quest("notassign", quest)) {
        console.log("Assigned");
        
        if (typeof (this.stats.quests.ass) === 'undefined') {
            this.stats.quests.ass = {};
        }
        this.stats.quests.ass[quest.name] = new_quest;
        
        if (new_quest.ot !== 'NPC') {
            key = this.game_state.playerOfUsrID(new_quest.owner);
        } else {
            key = quest.ow_name;
        }
        this.game_state.prefabs[key].ren_sprite.quest.state = "ass";
    }
    this.save.properties.quests = this.stats.quests;
    
};

Mst.Player.prototype.test_quest = function (type, condition) {
    "use strict";
    var key, test;
    test = false;
    
    switch (type) {
        case "notassign":
            if (typeof (this.stats.quests.ass) !== 'undefined') {
                if (typeof (this.stats.quests.ass[condition.name]) === 'undefined') {
                    test = true;
                    
                    if (typeof (this.stats.quests.fin) !== 'undefined') {
                        key = this.stats.quests.fin.indexOf(condition.qid);
                        test = (key < 0);
                    }
                }
            } else {
                test = true;
                 
                if (typeof (this.stats.quests.fin) !== 'undefined') {
                    key = this.stats.quests.fin.indexOf(condition.qid);
                    test = (key < 0);
                }
            }
            break;
        case "owner":
            for (key in this.stats.quests) {
                console.log(this.stats.quests[key]);
                if (this.stats.quests[key].type !== "completed") {
                    if (this.stats.quests[key].owner === condition) {
                        test = true;
                    }
                }
            }
            break;
        case "idass":
            if (typeof (this.stats.quests.ass) !== 'undefined') {
                if (typeof (this.stats.quests.ass[condition]) !== 'undefined') {
                    if (this.stats.quests.ass[condition].acc.is !== 'true') {
                        test = true;
                    }
                }
            } 
            break;
        case "idacc":
            if (typeof (this.stats.quests.ass) !== 'undefined') {
                if (typeof (this.stats.quests.ass[condition]) !== 'undefined') {
                    test = (this.stats.quests.ass[condition].acc.is === 'true');
                }
            }
            break;
        case "idfin":
            if (typeof (this.stats.quests.fin) !== 'undefined') {
                key = this.stats.quests.fin.indexOf(condition);
                test = (key > -1);
            }
            break;
    }
    
    console.log(test);
            
    return test;
};

Mst.Player.prototype.update_quest = function (type, condition) {
    "use strict";
    var item_frame, quantity, item, return_obj, quest, key, uid, oid;
    return_obj = {updated: false, accomplished: false};
    
    if (type === "by_quest_name") {
        if(typeof (this.stats.quests.ass[condition].ending_conditions.have) !== 'undefined') {
            item_frame = parseInt(this.stats.quests.ass[condition].ending_conditions.what);
            item = this.game_state.prefabs.items.index_by_frame(item_frame);
            
            if (parseInt(this.stats.quests.ass[condition].ending_conditions.have) < item.quantity) {
                this.stats.quests.ass[condition].accomplished.have = this.stats.quests[condition].ending_conditions.have;
                return_obj.updated = true;
                return_obj.accomplished = true;
            } else {
                this.stats.quests[condition].accomplished.have = item.quantity;
                return_obj.updated = true;
            }
        }
    } else {
        console.log(this.stats.quests.ass);
        for (var q_name in this.stats.quests.ass) {
            quest = this.stats.quests.ass[q_name];
            console.log(quest);
        //this.stats.quests.ass.forEach(function(quest) {
            if (quest.acc.is !== 'true') {
                switch (type) {
                    case "have":
                        if (quest.endc.type === 'have') {
                            item_frame = parseInt(quest.endc.what);
                            if (item_frame === condition.f) {
                                quantity = parseInt(quest.endc.quantity);
                                if (condition.q < quantity) {
                                    return_obj.updated = true;
                                    quest.acc.q = condition.q;
                                } else {
                                    return_obj.updated = true;
                                    return_obj.accomplished = true;
                                    
                                    quest.acc.is = 'true';
                                    quest.acc.q = condition.q;
                                    
                                    
                                    if (quest.ot !== 'NPC') {
                                        key = this.game_state.playerOfUsrID(quest.owner);
                                    } else {                                        
                                        key = "";
                                        for (var object_key in this.game_state.prefabs) {
                                            
                                            if (typeof(this.game_state.prefabs[object_key].unique_id) !== 'undefined') {
                                                oid = parseInt(quest.owner);
                                                uid = parseInt(this.game_state.prefabs[object_key].unique_id);
                                                if (uid === oid) {
                                                    key = object_key;
                                                    console.log(key);
                                                }
                                            }
                                        }
                                    }
                                    console.log(key);
                                    if (key !== "") {
                                        this.game_state.prefabs[key].ren_sprite.quest.state = "acc";
                                        this.game_state.prefabs[key].show_bubble(5); // ! question mark - quest accomplished
                                    }
                                    
                                    //this.quest_bubble();
                                    
                                    this.game_state.hud.alert.show_alert("Úkol byl splněn!");
                                }
                            }
                        }
                    break;
                }
            }
            console.log(quest);
            
//            switch (quest.type) {
//                case "assigned":
//                    if (typeof (quest.endc[type]) !== 'undefined') {
//                        switch (type) {
//                            case "have":
//                                if (typeof (condition) === 'undefined') {
//                                    item_frame = parseInt(quest.ending_conditions.what);
//                                    item = this.game_state.prefabs.items.index_by_frame(item_frame);
//                                    condition = item.quantity;
//                                }
//                                if (parseInt(quest.ending_conditions[type]) <= condition) {
//                                    quest.accomplished[type] = quest.ending_conditions[type];
//                                    return_obj.updated = true;
//                                    return_obj.accomplished = true;
//                                } else {
//                                    quest.accomplished[type] = condition;
//                                    return_obj.updated = true;
//                                }
//                                break;
//                            default: //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//                                if (typeof (quest.accomplished[type]) !== 'undefined') {
//                                    quest.accomplished[type] = 1;
//
//                                } else {
//                                    quest.accomplished[type] = parseInt(quest.accomplished[type]) + 1;
//                                }
//
//                                if (quest.accomplished[type] > (quest.ending_conditions[type] - 1)) {
//                                    quest.type = "accomplished";
//
//
//                                }
//                        }
//                    }
//                    break;
//                case "accomplished":
//
//                    break;
//            }
                
        //});
        }
    }
    
    
    this.save.properties.quests = this.stats.quests;
    console.log(this.stats.quests);
            
    return return_obj;
};

Mst.Player.prototype.finish_quest = function (quest) {
    "use strict";
    var key, completed, quest_name, qid, reward, rewa, item_frame, item, quantity;
    completed = false;
    quest_name = quest.name;
    qid = quest.qid;
    reward = quest.properties.reward;
    
    delete this.stats.quests.ass[quest_name];
    if (typeof (this.stats.quests.fin) !== 'undefined') {
        this.stats.quests.fin.push(qid);
    } else {
        this.stats.quests.fin = [];
        this.stats.quests.fin.push(qid);
    }
    
    console.log(this.stats.quests);
    
    for (var i = 0; i < reward.length; i++) {
        rewa = reward[i].split("_");
        
        switch (rewa[0]) {
            case 'exp':
                quantity = parseInt(rewa[1]);
                this.add_exp("standard", quantity);
            break;
            case 'itm':
                item_frame = parseInt(rewa[1]);
                quantity = parseInt(rewa[2]);
                this.add_item(item_frame, quantity);
            break;
        }
    }
    
        
//    for (key in this.stats.quests) {
//        console.log(this.stats.quests[key]);
//        if (this.stats.quests[key].type !== "completed") {
//            if (this.stats.quests[key].owner.unique_id === owner) {
//                quest_name = key;
//            }
//        }
//    }
//    
//    if (quest_name !== "") {
//        if(typeof (this.stats.quests[quest_name].ending_conditions.have) !== 'undefined') {
//            item_frame = parseInt(this.stats.quests[quest_name].ending_conditions.what);
//            item = this.game_state.prefabs.items.index_by_frame(item_frame);
//            quantity = parseInt(this.stats.quests[quest_name].ending_conditions.have);
//            
//            if (quantity < item.quantity) {
//                this.stats.quests[quest_name].accomplished.have = quantity;
//                completed = true;
//                
//                this.subtract_item(item.index, quantity);
//                this.game_state.hud.alert.show_alert("-" + quantity + "x " + this.game_state.core_data.items[item_frame].name);
//                this.game_state.hud.alert.show_alert("Úkol byl dokončen!");
//            } else {
//                this.stats.quests[condition].accomplished.have = item.quantity;
//            }
//        }
//    }
//    
//    console.log(completed);
//            
//    return completed;
};

Mst.Player.prototype.read_broadcast = function () {
    "use strict";
    var b_snt, d, n, player;
    
    player = this;
    d = new Date();
    n = d.getTime();

    b_snt = $.get( "broadcast.php", { snt: this.usr_id, n: n} )
        .done(function( data ) {
            console.log( "Data Loaded: " + data );
            b_snt = JSON.parse(data);
            console.log(b_snt);
            player.set_broadcast(b_snt);
    });
    
};

Mst.Player.prototype.set_broadcast = function (snt) {
    "use strict";
    
    this.broadcast.snt = snt;
    this.next_broadcast();
    
};

Mst.Player.prototype.next_broadcast = function () {
    "use strict";
    var b_nxt, b_nxtt, b_nexta, key;
    
    b_nxt = this.broadcast.snt.shift();
    
    console.log("Broadcast SNT: " + b_nxt);
    
    if (typeof(b_nxt) !== 'undefined') {
        b_nexta = b_nxt.split("|");
    
        console.log(b_nexta);

        key = this.game_state.playerOfUsrID(b_nexta[1]);
        if (key !== "") {
            this.game_state.prefabs[key].ren_sprite.show_dialogue(b_nexta[4]);
        } else {
            this.save.properties.broadcast.push(b_nxt);
            console.log("PUSH broadcast.player " + JSON.stringify(this.broadcast.player));
            console.log("PUSH save.properties.broadcast " + JSON.stringify(this.save.properties.broadcast));
            this.next_broadcast();
        }
    } else {
        console.log("broadcast.player " + JSON.stringify(this.broadcast.player));
        console.log("save.properties.broadcast " + JSON.stringify(this.save.properties.broadcast));
        b_nxt = this.broadcast.player.shift();
        b_nxtt = this.save.properties.broadcast[0];
        
        if (b_nxt !== b_nxtt) { console.log("!!!!!!!!!!!!") };
        
        console.log("Broadcast Player: " + b_nxt + " Save: " + b_nxtt);
        
        if (typeof(b_nxt) !== 'undefined') {
            b_nexta = b_nxt.split("|");

            console.log(b_nexta);

            key = this.game_state.playerOfUsrID(b_nexta[1]);
            if (key !== "") {
                this.game_state.prefabs[key].ren_sprite.show_dialogue(b_nexta[4]);
            } else {
                this.save.properties.broadcast.push(b_nxt);
                this.next_broadcast();
            }
        }
    }
    

};

Mst.Player.prototype.new_day = function () {
    "use strict";
    
    if (this.gtime.obj.getHours() < 7) {
        this.gtime.obj.setHours(7);
    } else {
        this.gtime.obj.setDate(this.gtime.obj.getDate() + 1);
        this.gtime.obj.setHours(7);
    }
    this.gtime.ms = this.gtime.obj.getTime();
    console.log("DATUM");
    console.log(this.gtime.obj);
    this.save.properties.gtimealpha = 0;
    this.save.properties.gtimems = this.gtime.ms;
};

Mst.Player.prototype.add_minutes = function (mins) {
    "use strict";
    
    console.log("Hodina: " + this.gtime.obj.getHours());
    if (this.gtime.obj.getHours() < 7 || this.gtime.obj.getHours() > 20) {
        mins = 1;
        if (this.gtime.obj.getHours() > 2) {
            mins = 0.25;
        }
        if (this.gtime.obj.getHours() > 4) {
            mins = 0.01;
        }
        if (this.gtime.obj.getHours() > 5) {
            mins = 0;
        }
        
        this.save.properties.gtimealpha = this.game_state.night.add_night();
    }
    
    this.gtime.ms += mins * 60000;
    this.gtime.obj = new Date(this.gtime.ms);
    
    this.stats.gtime = this.gtime.obj.toLocaleTimeString();
    var gtimepom = this.stats.gtime.split(":");
    this.stats.gtime = " " + gtimepom[0] + ":" + gtimepom[1];
    
    console.log("DATUM");
    console.log(this.gtime.obj);
    
    this.save.properties.gtimems = this.gtime.ms;
};

Mst.Player.prototype.make_followers = function () {
    "use strict";
    var follower, followers;
    
    followers =  this.save.properties.followers;
    this.followers = {};
    
    for (var i = 0; i < followers.length; i++) {
        var fwr = followers[i];
        follower = this.create_follower(fwr);
        if (typeof(follower) !== 'undefined') {
            this.followers[fwr] = follower;
        }
    }
};

Mst.Player.prototype.create_follower = function (fwr) {
    "use strict";
    var follower, afwr, type, id, name, position, properties;
    
    if (typeof(this.game_state.prefabs[fwr]) !== 'undefined') {        
        name = this.game_state.prefabs[fwr].name;
        position = this.game_state.prefabs[fwr].position;
        properties = this.game_state.prefabs[fwr].save.properties;
        
        console.log(this.game_state.prefabs[fwr]);
        console.log(properties);
        
        this.game_state.prefabs[fwr].destroy();
        
        console.log(position);
        console.log(properties);
        
        follower = new Mst.Follower(this.game_state, name, position, properties);
        
        console.log(follower);
    } else {
        afwr = fwr.split("_");
        type = afwr[0];
        id = afwr[1];
    }
    console.log(follower);
    return follower;
};

Mst.Player.prototype.save_followers = function (go_position, go_map_int) {
    "use strict";
    
    console.log(this.followers);
    
    for (var key in this.followers) {
        this.followers[key].save_follower(go_position, go_map_int);
    }

};

Mst.Player.prototype.save_player = function (go_position, go_map_int) {
    "use strict";
    var name, dt;
    
    this.body.immovable = true;
    
    if (this.opened_chest !== "") {
        name = this.opened_chest;
        this.game_state.prefabs[name].close_chest();
    }
    
    this.save.x = go_position.x;
    this.save.y = go_position.y;
    
    this.save.properties.stats.health = this.health;
    this.save.properties.stats.health_max = this.stats.health_max;
    this.save.properties.stats.stress = this.stats.stress;
    this.save.properties.items = this.stats.items;
    this.save.properties.equip = this.stats.equip;
    
    dt = new Date();
    this.save.properties.time = dt.getTime();
    this.save.properties.moon = this.stats.moon;
    console.log("moon: " + this.stats.moon);
    
    this.save.properties.gtimems = this.gtime.ms;
    
    this.save.map.old_int = this.game_state.root_data.map_int;
    this.save.map.new_int = go_map_int;
    
    this.game_state.save.player = this.save;
    
    localStorage.setItem("player", JSON.stringify(this.save));

    this.save_followers(go_position, go_map_int);
};

Mst.Player.prototype.set_logoff = function () {
    "use strict";
    
    this.save.logged = false;

};

Mst.Player.prototype.collide_layer_tile = function (player, tile) {
    "use strict";
    var dist;
    
//    console.log("collide:");
//    console.log(player.position);
//    console.log(player.body);
    //console.log(tile);
    
    dist = {
        x: player.x - (tile.worldX + 8),
        y: player.y - (tile.worldY + 8)
    };
    
    if (player.direction_chest.x === 0) {
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
    
    //console.log(dist);
    
};