//const Mst = Mst || {};
//const Phaser = Phaser || {};
//const console = console || {};

Mst.Player = function (game_state, name, position, properties) {
    "use strict";    
    
    console.log("player");
    
    Mst.Prefab.call(this, game_state, "player", position, properties);
    
    /*
    const load_player = JSON.parse(localStorage.getItem("player"));
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
    this.ren_texture = properties.ren_texture;
    
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
    
    if (typeof (properties.stats.sin) === 'undefined') {
        properties.stats.sin = 0;
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
    
    if (typeof (properties.bag) === 'undefined') {
        properties.bag = "";
    }
    
    if (typeof (properties.badges) === 'undefined') {
        properties.badges = {};
    }
    
    if (typeof (properties.rumours) === 'undefined') {
        properties.rumours = [];
    }
    
    if (typeof (properties.newsppr) === 'undefined') {
        properties.newsppr = [];
    }
    this.newsppr = properties.newsppr;
    
    if (typeof (properties.buffs) === 'undefined') {
        properties.buffs = [];
    }    
    
    if (typeof (properties.culprit) !== 'undefined') {
        this.culprit = properties.culprit;
    } else {
        this.culprit = [];
    }
    
    if (typeof (properties.cases) !== 'undefined') {
        this.cases = properties.cases;
        this.cases_loaded = {};
    } else {
        this.cases = [];
        this.cases_loaded = {};
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
    
    if (typeof (properties.expequip) === 'undefined') {
        properties.expequip = [0,0,0,0,0,0,0,0,0];
    }
    
    
//    const dt = new Date();
//    const tm = dt.getTime();
    
    console.log("Equip: " + properties.equip + " " + typeof(properties.equip));
    
    this.stats = {
        health_hearts: 5,
        health: +properties.stats.health,
        health_max: +properties.stats.health_max || 100,
        stress: parseInt(properties.stats.stress),
        sin: parseInt(properties.stats.sin),
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
        badges: properties.badges,
        rumours: properties.rumours,
        quests: properties.quests,
        buffs: properties.buffs,
        equip: properties.equip,
        expequip: properties.expequip,
        items: properties.items,
        bag: properties.bag,
        keys: properties.keys
    };
    
    this.gtime = {};
    this.gtime.ms = parseInt(properties.gtimems);
    this.gtime.obj = new Date(this.gtime.ms);
    
    const dt = new Date();
    const tt = dt.getTime();
    console.log("Time: " + properties.time + " " + tt + " " + (tt - properties.time) + " " + Math.floor(this.gtime.ms/86400000));
    
    //this.stats.gtime = " " + dt.getHours() + ":" + dt.getMinutes();
    this.stats.gtime = this.gtime.obj.toLocaleTimeString();
    console.log("Date:");
    console.log(this.gtime.obj);
    const gtimepom = this.stats.gtime.split(":");
    this.stats.gtime = " " + gtimepom[0] + ":" + gtimepom[1];
     
    const result = this.get_week(this.gtime.ms, 0);
    const result2 = this.get_week(this.gtime.ms, 1);
        
    this.stats.gtimeweek = result;
    this.stats.gtimeday = result2 + " " + this.gtime.obj.toString().substr(0,11);
    
    this.stats.moon_loop -= (tt - properties.time);
    if (this.stats.moon_loop < 1) {
        const p_loop = - this.stats.moon_loop;
        let new_moon = Math.floor(p_loop/180000);
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
    
    this.quests = {};
    
    console.log("Bufs");
    
    for (let i in this.stats.buffs) {
        const buff = this.stats.buffs[i];
        const bufftime = parseInt(buff.endtm) - tt;
        console.log("End time: " + buff.endtm + " A time: " + tt + " Ev time: " + bufftime);
        if (bufftime > 0) {
            this.game_state.game.time.events.add(bufftime, this.close_buff, this, this.stats.buffs[i]);
            console.log(this.game_state.game.time.events);
        } else {
            this.close_buff(this.stats.buffs[i]);
        }
    }
    
    
    this.ftprints = [];
        
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
    this.opened_signpost = "";
    this.opened_overlap = "";
    this.opened_mw = "";
    
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
    
    this.shadow = {};
    
    console.log("Badge: " + this.test_badge(1));

    this.stream = {
        type: "stream",
        name: "stream",
        obj_id: 1,
        x: 0,
        y: 0,
        properties: {
            group: "stream",
            items: "",
            texture: "blank",
            time: ""
        },
        action: "STREAM",
        string: "",
        map_int: 0
    };
    this.stream_sent = false;
    this.stream_new = this.usr_id + "|F" + tt + "|" + this.gtime.ms + "|" + this.x + ";" + this.y;
    console.log("Stream: " + this.stream_new);
    this.stream_put();
    
//    const pusher = new Pusher('6e9750ce5661bfd14c35', {
//      cluster: 'eu'
//    });
//
//    const channel = pusher.subscribe('my-channel');
//    channel.bind('my-event', function(data) {
//      console.log("Pusher: " + JSON.stringify(data));
//    });
};

Mst.Player.prototype = Object.create(Mst.Prefab.prototype);
Mst.Player.prototype.constructor = Mst.Player;

Mst.Player.prototype.update = function () {
    "use strict";
    this.game_state.game.physics.arcade.collide(this, this.game_state.layers.collision, this.collide_layer_tile, null, this);
    this.game_state.game.physics.arcade.overlap(this, this.game_state.layers.collision, this.overlap_layer_tile, null, this);
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.enemies, this.hit_player, null, this);
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.chests, this.open_chest, null, this);
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.signposts, this.open_signpost, null, this);
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.collisions, this.open_collision, null, this);
    this.game_state.game.physics.arcade.overlap(this, this.game_state.groups.overlaps, this.open_overlaps, null, this);
    
    if (this.no_pass_OP) {
        this.game_state.game.physics.arcade.collide(this, this.game_state.groups.otherplayers, this.collide_other_player, null, this);
        this.game_state.game.physics.arcade.collide(this, this.game_state.groups.NPCs, this.collide_NPC, null, this);
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
            let time_str = this.game_state.prefabs.moon.timer_moon.duration.toFixed(0);
            if (typeof (this.game_state.prefabs.moon.timer_first.timer) === 'undefined') {
                console.log("moon und");
                this.game_state.prefabs.moon.timer_first = this.game_state.game.time.events.add(this.stats.moon_loop, this.game_state.prefabs.moon.update_timer_moon, this);
            }
            //console.log("Timer: ")
            //console.log(this.game_state.prefabs.moon.timer_first.timer.duration.toFixed(0));
            //this.game_state.prefabs.moon.timer_first = this.game_state.game.time.events.add(this.stats.moon_loop, this.key_close_delay, this);
            time_str = this.game_state.prefabs.moon.timer_first.timer.duration.toFixed(0);
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
//    
//    if (!this.speak_b) {
//        this.game_state.prefabs.sword.swing();
//    } else {
//        this.speak_b = false;
//        
//        const pins = this.speak_ren.p_id + "|" + this.usr_id + "|0|1|" + this.speak_ren.inp_speak.value;
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

Mst.Player.prototype.final_tests = function () {
    "use strict";
    let nurse = false;
    
    if (this.killed) {
        console.log("KILLED!");
        this.game_state.groups.NPCs.forEachAlive(function (NPC) {
            if (!nurse) {
                //console.log(NPC);
                nurse = NPC.test_nurse();
            }
        }, this);
        
        if (!nurse) {
            this.game_state.groups.otherplayers.forEachAlive(function (otherplayer) {
                if (!nurse) {
                    nurse = otherplayer.test_nurse();
                }
                
                otherplayer.gweek = this.get_week(otherplayer.gtimems, 0);
            }, this);
        }
        
        if (!nurse) {
            const region = parseInt(this.game_state.map_data.map.region);
            
            switch (region) {
                case 2:
                    this.game_state.make_otherplayer({ "x": 170, "y": 487 }, 45, "dead");
                break;
                case 3:
                    this.game_state.make_otherplayer({ "x": 234, "y": 186 }, 53, "dead");
                break;
            }
        }    
        this.killed = false;
        this.save.properties.killed = false;        
    }
    
    const index = this.test_item(195,1);
    console.log("Kompot " + index);
   
    this.game_state.groups.NPCs.forEachAlive(function (NPC) {
        if (NPC.stype === "kerik") {
            if (index > -1) {
                NPC.condi(true);
            }
        }
    }, this);
    
    let sp_dist = 100000;
    let en_sp = {};
    this.game_state.groups.spawners.forEachAlive(function (spawner) {
        console.log("Test spawner: " + spawner.name + " " + spawner.etype);
        if (spawner.etype === "enemy") {
            //console.log(spawner);
            const dist = this.game_state.game.physics.arcade.distanceBetween(spawner, this);
            console.log("Spawner dist: " + dist);
            if (dist < sp_dist) {
                sp_dist = dist;
                en_sp = spawner;
            }
        }
    }, this);
    
    if (typeof (en_sp.etype) !== 'undefined') {
        //console.log(en_sp);
        en_sp.activate();
    }
    
    this.test_culprit();
    this.add_ftprints(0);

    this.prepare_ftprints_onmap();
};

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
    const opened_chest = this.opened_chest;    
    console.log(opened_chest);    
    
    if (opened_chest !== '') {
        const chest = this.game_state.prefabs[opened_chest];
        console.log(chest);
        
        if (chest.stats.items === '') {
            chest.get_chest(chest);
        }
    }
    
};

Mst.Player.prototype.key_close = function () {
    "use strict";
    
    //if (this.close_not_delay) {
        //this.close_not_delay = false;
        const close_state = this.close_state.pop();
        const close_context = this.close_context.pop();
        console.log(close_state);
        switch (close_state) {
          case "Dialogue":
            this.game_state.hud.dialogue.hide_dialogue();
            break;
          case "Abilities":
            this.game_state.prefabs[close_context].hide_window();
            break;
          case "MW":
            this.game_state.hud.middle_window.hide_mw();
            break;
          case "Book":
            this.game_state.hud.book.hide_book();
            break;
          case "Newsppr":
            this.game_state.hud.newsppr.hide_newsppr();
            break;
          case "Question":
            this.game_state.hud.question.hide_question();
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
    
    console.log(this.opened_ren);
    if (this.opened_ren === "") {
        other_player.collide_with_player(player, other_player);
    }
};

Mst.Player.prototype.collide_NPC = function (player, NPC) {
    "use strict";
    
    //console.log(this.opened_ren);
    if (this.opened_ren === "" && NPC.type !== "follower") {
        NPC.touch_player(NPC, player);
    }
    
    if (NPC.stype === "kerik") {
        NPC.kerik_run = false;
        this.game_state.game.physics.arcade.moveToObject(NPC, player, -50);
        //console.log("Not run kerik! " + NPC.name);
    }
};

Mst.Player.prototype.set_opened_ren = function (name) {
    "use strict";
    
    this.opened_ren = name;
};

Mst.Player.prototype.hit_player = function (player, enemy) {
    "use strict";
    if (!enemy.knockbacked) {
        enemy.knockback_by_player(enemy, player);
        
        const attack = enemy.spec_attack(player);
        
        if (attack > 0) {
            player.subtract_health(attack);

            const stress = attack + 2;
            player.work_rout("fighter", "constitution", stress, 1, 1, 3); // stress, stand_exp, skill_exp, abil_p

            this.emitter.x = this.x;
            this.emitter.y = this.y;
        //    let px = enemy.body.velocity.x;
        //    let py = enemy.body.velocity.y;
        //
        //    px *= -0.8 + Math.random()*0.4;
        //    py *= -0.8 + Math.random()*0.4;
        //
        //    this.emitter.minParticleSpeed.set(px, py);
        //    this.emitter.maxParticleSpeed.set(px, py);
            this.emitter.start(true, 1000, null, 8);
        }
    } else {
        console.log("Enemy knockbacked");
    }
};

Mst.Player.prototype.hit_player_by_bullet = function (bullet, player) {
    "use strict";
    const stress = bullet.en_attack + 2;
    
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
    
    const region = parseInt(this.game_state.map_data.map.region);
    
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
        
        console.log("Region: " + region);
        
        switch (region) {
            case 2:
                this.game_state.save_data({ "x": 178, "y": 495 }, 20, "dead");
            break;
            case 3:
                this.game_state.save_data({ "x": 242, "y": 194 }, 41, "dead");
            break;
            default:
                this.game_state.save_data({ "x": 432, "y": 272 }, 4, "dead"); // "assets/maps/map4.json"
            break;
        }
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

Mst.Player.prototype.add_sin = function (quantity) {
    "use strict";

    this.stats.sin += quantity;
};


Mst.Player.prototype.open_chest = function (player, chest) {
    "use strict";
    
    console.log(this.get_chest_timer.length);
    
    if (this.get_chest_timer.length < 1) {
        if (this.opened_chest === "") {
            console.log("Open! " + chest.name + " / Stat: " + chest.stat + " / Owner: " + chest.owner + " UsrID: " + player.usr_id + " / ObjID: " + chest.obj_id + " / Opened chest: " + player.opened_chest + " / Stats: ");
            console.log(chest);
            console.log(chest.stats);
            
            player.opened_chest = chest.name;
            const owner = parseInt(chest.owner);
            
            const d = new Date();
            const n = d.getTime();
            
            console.log("Player - Chest open time > 20: " + (n - chest.time)/100000);
            console.log(n + " " + chest.time + " " + chest.ctime);
            if (chest.stat === 'open' && (n - chest.time)/100000 > 20) {
                const new_stat = "ok";
                chest.set_stat(new_stat);
            }

            if (chest.stat !== "open") {
                chest.open_chest(player, chest);
            } else {
                console.log("Chest is open by other player");
                chest.game_state.hud.alert.show_alert("Otevřel ji někdo jiný!");
                this.get_chest_timer.add(Phaser.Timer.SECOND * 0.7, function(){}, this);
                this.get_chest_timer.start();
                this.opened_chest = "";
            }
        }
    }
    
//    console.log("collide chest");
//    console.log(player.position);
//    console.log(player.body);
    //console.log(tile);
    
    const dist = {
        x: player.x - chest.x,
        y: player.y - chest.y
    };
    
    if (player.direction_chest.x === 0) {
        if (dist.x > 0) {
            player.x++;
        } else {
            player.x--;
        }
    } else {
        if (dist.y > 0) {
            player.y++;
        } else {
            player.y--;
        }
    }
    
};

Mst.Player.prototype.open_chest_fin = function (player, chest) {
    "use strict";
    console.log("Player open chest fin");
    const owner = parseInt(chest.owner);
    
    console.log(owner);
    
    if (chest.stat !== "open") {
        if (owner !== 0) {
            if (owner === player.usr_id) {
                if (chest.stolen) {
                    //if (chest.test_new_cases()) {
                        chest.mw_context = "investigate";
                        this.game_state.hud.middle_window.show_mw("Vykradeno! Chcete to vyšetřit?", chest, ["no", "investigate"]);
                    //}
                }                
                
                chest.open_chest_fin(player, chest);
            } else {
                console.log("Chest is owned by other player");
                chest.mw_context = "steal";
                this.game_state.hud.middle_window.show_mw("To patří jinému!", chest, ["ok", "steal"]);
                this.get_chest_timer.add(Phaser.Timer.SECOND * 0.7, function(){}, this);
                this.get_chest_timer.start();
                //this.opened_chest = "";
            }
        } else {
            chest.open_chest_fin(player, chest);
        }
    }
};

Mst.Player.prototype.open_signpost = function (player, signpost) {
    "use strict";
    console.log("Open signpost player");
    
    if (this.opened_signpost === "") {
        signpost.open_signpost(player);
    }
};

Mst.Player.prototype.open_collision = function (player, collision) {
    "use strict";
    console.log("Open collision player");
    
    collision.open_collision(player);
};

Mst.Player.prototype.open_overlaps = function (player, overlap) {
    "use strict";
    console.log("Open overlap player");
    
    if (this.opened_overlap === "") {
        this.opened_overlap = overlap.name;
        console.log("Opened overlap: " + this.opened_overlap);
        
        this.body.immovable = true;
        this.game_state.game.time.events.add(Phaser.Timer.SECOND * 3, this.hide_overlap, this);
    }    
};

Mst.Player.prototype.open_business = function (player, person) {
    "use strict";
    
    if (this.opened_business === "") {
        person.open_business(player);
    }
};

Mst.Player.prototype.hide_overlap = function () {
    "use strict";
    
    console.log("Hide overlap");
    
    if (this.opened_overlap !== "") {
        const overlap = this.game_state.prefabs[this.opened_overlap];
        console.log(overlap);
        
        overlap.kill();
        this.opened_overlap = "";
        this.add_item(180,1);
        this.body.immovable = false;
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
    
    if (content.length > 0) {
        for (let i in content) {
            const frame = content[i].f;
            const quantity = content[i].q;
            this.add_item(frame, quantity);
        }
    }
};

Mst.Player.prototype.test_item = function (item_frame, quantity) {
    "use strict";
    
    const index = this.game_state.prefabs.items.test_item(item_frame, quantity);
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

Mst.Player.prototype.add_newsppr = function (num) {
    "use strict";
    let ret = false;
    
    if (this.newsppr.indexOf(num) < 0) {
        ret = true;
        this.newsppr.push(num);
        this.save.properties.newsppr = this.newsppr;
        
        this.game_state.prefabs.items.add_item(225, 1);
        
        this.game_state.hud.alert.show_alert("+noviny");
    }
    
    return ret;
};

Mst.Player.prototype.add_exp = function (skill, quantity) {
    "use strict";
    
    function level_add(skill, exp, level) {
        let pom_exp;
        
        quantity = Math.floor(quantity);
        if (quantity < 1) {
            quantity = 1;
        }
        
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
    "use strict";
    let level = 0;
    if (typeof(this.stats.skills[skill]) !== 'undefined') {
        level = parseInt(this.stats.skills[skill].level);
    }    
    return level;
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
    const text = skill + " exp: +" + quantity;
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
    
    console.log("Alert timer end");
    
    const eal = Object.values(this.o_exp_alert.alerts);
    let iz = 0;
    
    for (let i in eal) {
        if (eal[i].q > 0) {
            const skill = eal[i].s;
            const text =  skill + " exp: +" + eal[i].q;
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
    
    if (typeof (this.stats.abilities[ability]) === 'undefined') {
        this.stats.abilities[ability] = 8;
    }
    
    this.stats.abilities[ability] = parseInt(this.stats.abilities[ability]);
    
    let quantity = 0;
    let rnd_test = 0;
    
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
    
    if (ability === 'constitution') {
        this.stats.health_max = Math.ceil(this.stats.abilities[ability]/2);
        const hmpom = Math.ceil(this.stats.abilities[ability]/4 + 80);
        
        if (this.stats.health_max < hmpom) {
            this.stats.health_max = hmpom;
        }
        
        if (this.stats.health_max < 100) {
            this.stats.health_max = 100;
        }
        
        this.save.properties.stats.health = this.stats.health_max;
    }
    
    this.stats.abilities[ability] += quantity;
    this.save.properties.abilities[ability] = this.stats.abilities[ability];
};

Mst.Player.prototype.update_place = function () {
    "use strict";
    var place_selected;
    console.log("Update place");
    
    const map = this.game_state.map_data.map;
    //place_selected = {};
    
    for (let key in this.stats.places) {
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
    var relation_selected, uid, ruid, otype;
    console.log("Update relation");
    console.log(person);
    
    if (person.o_type === 'NPC') {
        uid = person.unique_id;
        otype = "NPC";
    } else {
        if (person.o_type === 'follower') {
            uid = person.unique_id;
            otype = "NPC";
        } else {
            uid = person.usr_id;
            otype = "player";   
        }
    }
    
    for (let key in this.stats.relations) {
        //console.log(this.stats.relations[key]);
        //if (parseInt(relation.map_int) === parseInt(map.map_int) && parseInt(relation.region) === parseInt(map.region)) {
        if (typeof (this.stats.relations[key].uid) === 'undefined') { // jen docasne !!!!!!!!
            let rname = "";
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
                
                for (let i = parseInt(key) + 1; i < this.stats.relations.length; i++) { // jen docasne ... odstran multi
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

Mst.Player.prototype.get_relation = function (uid, type) {
    "use strict";
    var relation_selected;
    
    for (let id in this.stats.relations) {
        const ruid = parseInt(this.stats.relations[id].uid);
        //console.log("Relation [" + key + "] r type: " + this.stats.relations[key].type + " p type: " + person.o_type + " r id: " + ruid + " p id " + uid);
        if (this.stats.relations[id].type === type && ruid === uid) {
            relation_selected = this.stats.relations[id];
            console.log(relation_selected);
            break;
        }
    }
    
    return relation_selected;
};

Mst.Player.prototype.get_relation_name = function (uid, type) {
    "use strict";
    var ruid, name;
    
    name = "";
    for (var id in this.stats.relations) {
        ruid = parseInt(this.stats.relations[id].uid);
        if (this.stats.relations[id].type === type && ruid === uid) {
            name = this.stats.relations[id].name;
            break;
        }
    }
    
    return name;
};

Mst.Player.prototype.return_relation = function (person, type) {
    "use strict";
    var uid, ruid, otype, relation_selected, exp;
    
    exp = -1;
    
    if (person.o_type === 'NPC') {
        uid = person.unique_id;
        otype = "NPC";
    } else {
        uid = person.usr_id;
        otype = "player";
    }
    
    for (var key in this.stats.relations) {
        ruid = parseInt(this.stats.relations[key].uid);
        //console.log("Relation [" + key + "] r type: " + this.stats.relations[key].type + " p type: " + person.o_type + " r id: " + ruid + " p id " + uid);
        if (this.stats.relations[key].type === otype && ruid === uid) {
            relation_selected = this.stats.relations[key];
            console.log(relation_selected);
            exp = parseInt(relation_selected.exp);
            break;
        }
    }
    
    return exp;
};

Mst.Player.prototype.assign_quest = function (quest) {
    "use strict";
    var new_quest, key;
    new_quest = {
        name: quest.name,
        qid: quest.qid,
        owner: quest.properties.owner,
        ot: quest.properties.owner_type,
        target: quest.properties.target,
        tt: quest.properties.target_type,
        endc: quest.properties.ending_conditions,
        acc: {
            is: false,
            q: 0
        }
    };
    console.log(new_quest);
    
    if (this.test_quest("notassign", quest)) {
        console.log("\x1b[106mAssigned " + quest.name);
        
        if (typeof (this.stats.quests.ass) === 'undefined') {
            this.stats.quests.ass = {};
        }
        this.stats.quests.ass[quest.name] = new_quest;
        
        key = quest.ow_name;
        this.game_state.prefabs[key].ren_sprite.quest.state = "ass";
    }
    this.save.properties.quests = this.stats.quests;
    
};

Mst.Player.prototype.test_quest = function (type, condition) {
    "use strict";
    var key, test, ret;
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
        case "idstate":
            ret = "pre";
            if (typeof (this.stats.quests.fin) !== 'undefined') {
                key = this.stats.quests.fin.indexOf(condition);
                test = (key > -1);
                if (test) { ret = "fin" }
            }
            
            if (typeof (this.stats.quests.ass) !== 'undefined') {
                if (typeof (this.stats.quests.ass[condition]) !== 'undefined') {
                    if (this.stats.quests.ass[condition].acc.is !== 'true') {
                        test = true;
                        ret = "ass";
                    } else {
                        ret = "acc";
                    }
                }
            }
            test = ret;
            break;
    }
    
    console.log(type + " " + condition);
    console.log(test);
            
    return test;
};

Mst.Player.prototype.update_quest = function (type, condition) {
    "use strict";
    var item_frame, quantity, cwhere, con, item, return_obj, quest, qtype, key, uid, oid;
    return_obj = {updated: false, accomplished: false};
    
    console.log('\x1b[106mAccomplish ' + type);

    if (typeof(this.stats.quests.ass) !== 'undefined') {
        console.log(this.stats.quests.ass[condition]);

        if (type === "by_quest_name") {
            console.log(this.stats.quests.ass[condition].name);
            console.log(this);
            qtype = this.stats.quests.ass[condition].endc.type;
            switch (qtype) {
                case "have":
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
                break;
    /*            case "put":
                    if(typeof (this.stats.quests.ass[condition].ending_conditions.put) !== 'undefined') {
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
                break;*/
                case "textpow":          
                    return_obj.updated = true;
                    return_obj.accomplished = true;

                    console.log(this);
                    console.log(condition);

                    this.stats.quests.ass[condition].acc.is = 'true';

                    if (this.stats.quests.ass[condition].ot !== 'NPC') {
                        key = this.game_state.playerOfUsrID(this.stats.quests.ass[condition].owner);
                    } else {
                        key = this.game_state.NPCofID(this.stats.quests.ass[condition].owner);
                    }
                    console.log(key);
                    if (key !== "") {
                        this.game_state.prefabs[key].ren_sprite.quest.state = "acc";
                        this.game_state.prefabs[key].show_bubble(5); // ! question mark - quest accomplished
                    }

                    //this.quest_bubble();

                    //this.game_state.hud.alert.show_alert("Úkol byl splněn!");}

                break;
                case "text":          
                    return_obj.updated = true;
                    return_obj.accomplished = true;

                    console.log(this);
                    console.log(condition);

                    this.stats.quests.ass[condition].acc.is = 'true';

                    if (this.stats.quests.ass[condition].ot !== 'NPC') {
                        key = this.game_state.playerOfUsrID(this.stats.quests.ass[condition].owner);
                    } else {
                        key = this.game_state.NPCofID(this.stats.quests.ass[condition].owner);
                    }
                    console.log(key);
                    if (key !== "") {
                        this.game_state.prefabs[key].ren_sprite.quest.state = "acc";
                        this.game_state.prefabs[key].show_bubble(5); // ! question mark - quest accomplished
                    }

                    //this.quest_bubble();

                    //this.game_state.hud.alert.show_alert("Úkol byl splněn!");}

                break;
                case "findps":          
                    return_obj.updated = true;
                    return_obj.accomplished = true;

                    this.stats.quests.ass[condition].acc.is = 'true';

                    if (this.stats.quests.ass[condition].tt !== 'NPC') {
                        key = this.game_state.playerOfUsrID(this.stats.quests.ass[condition].target);
                    } else {
                        key = this.game_state.NPCofID(this.stats.quests.ass[condition].target);
                    }
                    console.log(key);
                    if (key !== "") {
                        this.game_state.prefabs[key].ren_sprite.quest.state = "acc";
                        this.game_state.prefabs[key].show_bubble(5); // ! question mark - quest accomplished
                    }

                    //this.quest_bubble();

                    //this.game_state.hud.alert.show_alert("Úkol byl splněn!");}

                break;
                case "deliver":          
                    return_obj.updated = true;
                    return_obj.accomplished = true;

                    this.stats.quests.ass[condition].acc.is = 'true';

                    if (this.stats.quests.ass[condition].tt !== 'NPC') {
                        key = this.game_state.playerOfUsrID(this.stats.quests.ass[condition].target);
                    } else {
                        key = this.game_state.NPCofID(this.stats.quests.ass[condition].target);
                    }
                    console.log(key);
                    if (key !== "") {
                        this.game_state.prefabs[key].ren_sprite.quest.state = "acc";
                        this.game_state.prefabs[key].show_bubble(5); // ! question mark - quest accomplished
                    }

                    //this.quest_bubble();

                    //this.game_state.hud.alert.show_alert("Úkol byl splněn!");}

                break;
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
                                console.log(item_frame);
                                console.log(condition);
                                if (item_frame === condition.f) {
                                    quantity = parseInt(quest.endc.quantity);
                                    condition.q += parseInt(quest.acc.q);
                                    console.log("cq:" + condition.q + " q:" + quantity);
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
                                            key = this.game_state.NPCofID(quest.owner);
                                        }
                                        console.log(key);
                                        if (key !== "") {
                                            this.game_state.prefabs[key].ren_sprite.quest.state = "acc";
                                            this.game_state.prefabs[key].show_bubble(5); // ! question mark - quest accomplished
                                        }

                                        //this.quest_bubble();

                                        console.log("Ukol byl splnen " + quest.name);
                                        this.game_state.hud.alert.show_alert("Úkol byl splněn!");
                                    }
                                }
                            }
                        break;
                        case "put":
                            console.log("Quest PUT");
                            console.log(condition);
                            if (quest.endc.type === 'put') {
                                item_frame = parseInt(quest.endc.what);
                                if (item_frame === condition.f) {
                                    cwhere = parseInt(quest.endc.where);
                                    if (condition.wr === cwhere) {
                                        return_obj.updated = true;
                                        return_obj.accomplished = true;

                                        quest.acc.is = 'true';                                    

                                        if (quest.ot !== 'NPC') {
                                            key = this.game_state.playerOfUsrID(quest.owner);
                                        } else {                                        
                                            key = this.game_state.NPCofID(quest.owner);
                                        }
                                        console.log(key);
                                        if (key !== "") {
                                            this.game_state.prefabs[key].ren_sprite.quest.state = "acc";
                                            this.game_state.prefabs[key].show_bubble(5); // ! question mark - quest accomplished
                                        }

                                        this.game_state.hud.alert.show_alert("Úkol byl splněn!");
                                    }
                                }
                            }
                        break;
                        case "use":
                            console.log("Quest USE");
                            console.log(condition);
                            if (quest.endc.type === 'use') {
                                item_frame = parseInt(quest.endc.what);
                                if (item_frame === condition.t) {
                                    con = parseInt(quest.endc.on);
                                    if (condition.on === con) {
                                        return_obj.updated = true;
                                        return_obj.accomplished = true;

                                        quest.acc.is = 'true';                                    

                                        if (quest.ot !== 'NPC') {
                                            key = this.game_state.playerOfUsrID(quest.owner);
                                        } else {                                        
                                            key = this.game_state.NPCofID(quest.owner);
                                        }
                                        console.log(key);
                                        if (key !== "") {
                                            this.game_state.prefabs[key].ren_sprite.quest.state = "acc";
                                            this.game_state.prefabs[key].show_bubble(5); // ! question mark - quest accomplished
                                        }

                                        this.game_state.hud.alert.show_alert("Úkol byl splněn!");
                                    }
                                }
                            } else {
                                if (quest.endc.type === 'use2') {
                                    item_frame = parseInt(quest.endc.what);
                                    if (item_frame === condition.t) {
                                        con = parseInt(quest.endc.on);
                                        if (condition.on === con) {
                                            return_obj.updated = true;
                                            return_obj.accomplished = true;

                                            quest.acc.is = 'true';                                    

                                            if (quest.ot !== 'NPC') {
                                                key = this.game_state.playerOfUsrID(quest.owner);
                                            } else {                                        
                                                key = this.game_state.NPCofID(quest.owner);
                                            }
                                            console.log(key);
                                            if (key !== "") {
                                                this.game_state.prefabs[key].ren_sprite.quest.state = "acc";
                                                this.game_state.prefabs[key].show_bubble(5); // ! question mark - quest accomplished
                                            }

                                            this.game_state.hud.alert.show_alert("Úkol byl splněn!");
                                        }
                                    }
                                }
                            }
                        break;
                        case "make":
                            console.log("Quest MAKE");
                            console.log(condition);
                            if (quest.endc.type === 'make') {
                                item_frame = parseInt(quest.endc.what);
                                if (item_frame === condition) {
                                    return_obj.updated = true;
                                    return_obj.accomplished = true;

                                    quest.acc.is = 'true';                                    

                                    if (quest.ot !== 'NPC') {
                                        key = this.game_state.playerOfUsrID(quest.owner);
                                    } else {                                        
                                        key = this.game_state.NPCofID(quest.owner);
                                    }
                                    console.log(key);
                                    if (key !== "") {
                                        this.game_state.prefabs[key].ren_sprite.quest.state = "acc";
                                        this.game_state.prefabs[key].show_bubble(5); // ! question mark - quest accomplished
                                    }

                                    this.game_state.hud.alert.show_alert("Úkol byl splněn!");
                                }
                            }
                        break;
                        case "textpow":
                            if (quest.endc.type === 'textpow') {             
                                return_obj.updated = true;
                                return_obj.accomplished = true;

                                quest.acc.is = 'true';

                                if (quest.ot !== 'NPC') {
                                    key = this.game_state.playerOfUsrID(quest.owner);
                                } else {
                                    key = this.game_state.NPCofID(quest.owner);
                                }
                                console.log(key);
                                if (key !== "") {
                                    this.game_state.prefabs[key].ren_sprite.quest.state = "acc";
                                    this.game_state.prefabs[key].show_bubble(5); // ! question mark - quest accomplished
                                }

                                //this.quest_bubble();

                                //this.game_state.hud.alert.show_alert("Úkol byl splněn!");}
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
    }
    
    this.save.properties.quests = this.stats.quests;
    console.log(this.stats.quests);
            
    return return_obj;
};

Mst.Player.prototype.finish_quest = function (quest) {
    "use strict";
    var key, completed, quest_name, qid, reward, rewa, item_frame, item, quantity;
    
    console.log("\x1b[106mFinish quest: " + quest.name);
    
    completed = false;
    quest_name = quest.name;
    qid = quest.qid;
    reward = quest.properties.reward;
    
    if (typeof(this.stats.quests.ass) !== 'undefined') {
        delete this.stats.quests.ass[quest_name];
    }    
    if (typeof (this.stats.quests.fin) !== 'undefined') {
        key = this.stats.quests.fin.indexOf(qid);
        if (key < 0) {
            this.stats.quests.fin.push(qid);
        }
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
                console.log("Exp +" + quantity);
            break;
            case 'exps':
                quantity = parseInt(rewa[2]);
                this.add_exp(rewa[1], quantity);
                console.log(rewa[1] + " +" + quantity);
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

Mst.Player.prototype.test_badge = function (badge) {
    "use strict";
    var key = "";
    
    console.log(this.stats.badges[badge]);
    if (typeof(this.stats.badges[badge]) !== 'undefined') {
        key = this.stats.badges[badge];
    }
    
    return key;
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
    
    if (typeof (this.broadcast.snt) !== 'undefined') {
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
    }


};

Mst.Player.prototype.get_week = function (time, param) {
    "use strict";
    
    var date = new Date(time);
    var date0 = new Date(0);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    if (param > 0) {
        var week1 = new Date(date.getFullYear(), 0, 4);
    } else {
        var week1 = new Date(date0.getFullYear(), 0, 4);
    }
    var result = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                    - 3 + (week1.getDay() + 6) % 7) / 7);
    return result;
};

Mst.Player.prototype.set_time = function (time) {
    "use strict";
    
    this.gtime.ms = time;
    this.gtime.obj = new Date(this.gtime.ms);
    
    console.log("DATUM");
    console.log(this.gtime.obj);
    
    this.stats.gtime = this.gtime.obj.toLocaleTimeString();
    var gtimepom = this.stats.gtime.split(":");
    this.stats.gtime = " " + gtimepom[0] + ":" + gtimepom[1];
    this.save.properties.gtimems = this.gtime.ms;
};

Mst.Player.prototype.new_day = function () {
    "use strict";
    
    if (this.gtime.obj.getHours() < 7) {
        this.gtime.obj.setHours(7,0);
    } else {
        this.gtime.obj.setDate(this.gtime.obj.getDate() + 1);
        this.gtime.obj.setHours(7,0);
    }
    
    this.gtime.ms = this.gtime.obj.getTime();
    this.set_time(this.gtime.ms);
    this.save.properties.gtimealpha = 0;
};

Mst.Player.prototype.add_minutes = function (mins) {
    "use strict";
    
    console.log("Hodina: " + this.gtime.obj.getHours());
    if (this.gtime.obj.getHours() < 7 || this.gtime.obj.getHours() > 20) {
        mins = 1;
        if (this.gtime.obj.getHours() < 7) {
            if (this.gtime.obj.getHours() > 2) {
                mins = 0.25;
            }
            if (this.gtime.obj.getHours() > 4) {
                mins = 0.01;
            }
            if (this.gtime.obj.getHours() > 5) {
                mins = 0;
            }
        }
        
        this.save.properties.gtimealpha = this.game_state.night.add_night();
    }
    
    this.gtime.ms += mins * 60000;
    this.set_time(this.gtime.ms);
};

Mst.Player.prototype.index_buff = function (btype) {
    "use strict";
    
    var index = -1;
    console.log(this.stats.buffs);
    for (var i = 0; i < this.stats.buffs.length; i++) {
        console.log(btype + " " + this.stats.buffs[i].btp);
        if (btype === parseInt(this.stats.buffs[i].btp)) {
            index = i;
            break;
        }
    }
    
    console.log("Buff index: " + index);
    
    return index;
};

Mst.Player.prototype.add_buff = function (btype, time) {
    "use strict";
    
    var btnm, endtime, dt, tt, index, newendtime;
    
    index = this.index_buff(btype);
    
    dt = new Date();
    tt = dt.getTime();
    
    endtime = tt + time * 1000;
    
    switch (btype) {
            case 1:
                btnm = "Antilevitace";
            break;
    }
    
    if (index < 0) {
        var new_buff = {
            "btp" : btype,
            "btnm" : btnm,
            "endtm" : endtime
        }

        this.stats.buffs.push(new_buff);
    } else {
        newendtime = time * 1000 + parseInt(this.stats.buffs[index].endtm);
        new_buff = this.stats.buffs[index];
        this.stats.buffs[index].endtm = newendtime;
    }
    
    this.game_state.game.time.events.add(Phaser.Timer.SECOND * time, this.close_buff, this, new_buff);
    console.log(this.stats.buffs);
};

Mst.Player.prototype.close_buff = function (buff) {
    "use strict";
    
    console.log(buff);
    
    var index = this.index_buff(buff.btp);
    
    if (index > -1) {
        this.stats.buffs.splice(index, 1);
    }
    
    console.log(this.stats.buffs);
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

Mst.Player.prototype.add_rumour = function (rumour) {
    "use strict";
    
    var key = this.stats.rumours.indexOf(rumour);
    if (key < 0) {
        this.stats.rumours.push(rumour);
        this.save.properties.rumours = this.stats.rumours;
    }
    console.log(this.stats.rumours);
};

Mst.Player.prototype.load_witness = function (pcasel) {
    "use strict";
    var model_wcase, new_wcase, uidw, witness, ntype, a_wit, pcid;
    
    console.log(pcasel);
    
    if (typeof (this.cases_loaded.witness) === 'undefined') {
        this.cases_loaded.witness = {};
        this.cases_loaded.witness.cases = [];
    }
    
    model_wcase = {
        uid: "",
        type: "",
        map: pcasel.M,                
        cid: pcasel.CID,
        id: pcasel.ID,
        pcid: pcasel.PCID,
        culprit: false
    };
    
    pcid = pcasel.PCID;
    
    this.cases_loaded.witness.cases.push(pcasel.PCID);
    
    for (var m in pcasel.witness) {
        console.log(m);
        if (m !== 'lid') {
            witness = pcasel.witness[m];
            console.log(witness);

            ntype = 'player';
            a_wit = witness.p;

            for (var id in a_wit) {
                console.log(ntype + " i: " + id + " uid " + a_wit[id]);
                uidw = a_wit[id];
                
                new_wcase = JSON.parse(JSON.stringify(model_wcase));
                new_wcase.map = m;
                new_wcase.type = ntype;
                new_wcase.uid = uidw;

                if (uidw === pcasel.Culprit) {
                    new_wcase.culprit = true;
                } else {
                    new_wcase.culprit = false;
                }

                if (typeof(this.cases_loaded.witness[ntype]) === 'undefined') {
                    this.cases_loaded.witness[ntype] = {};
                }
                if (typeof(this.cases_loaded.witness[ntype][uidw]) === 'undefined') {
                    this.cases_loaded.witness[ntype][uidw] = {};
                }                        
                this.cases_loaded.witness[ntype][uidw][pcid] = new_wcase;
                console.log(new_wcase);
                console.log(this.cases_loaded.witness[ntype]);
            }

            ntype = 'NPC';
            a_wit = witness.n;

            for (var id in a_wit) {
                console.log(ntype + " i: " + id + " uid " + a_wit[id]);
                uidw = a_wit[id];
                
                new_wcase = JSON.parse(JSON.stringify(model_wcase));
                new_wcase.map = m;
                new_wcase.type = ntype;
                new_wcase.uid = uidw;

                if (typeof(this.cases_loaded.witness[ntype]) === 'undefined') {
                    this.cases_loaded.witness[ntype] = {};
                }
                if (typeof(this.cases_loaded.witness[ntype][uidw]) === 'undefined') {
                    this.cases_loaded.witness[ntype][uidw] = {};
                }                        
                this.cases_loaded.witness[ntype][uidw][pcid] = new_wcase;
                console.log(new_wcase);
                console.log(this.cases_loaded.witness[ntype]);
            }
        }
    }
    console.log(this.cases_loaded.witness);
};

Mst.Player.prototype.test_witness = function (n, uid, type) {
    "use strict";
    var pcase, witness, a_wit, uids, key, new_wcase, f_witness, ntype;
    var map = this.game_state.root_data.map_int;
    uids = String(uid);
    console.log(uids);
    console.log(type);
        
    if (n < 0) {
        for (var pcid in this.cases) {
            pcase = this.get_full_case(pcid, "test witness");
            console.log(pcase);
            if (typeof (pcase.pcl) !== 'undefined') {
                if (typeof (this.cases_loaded.witness) === 'undefined') {
                    this.load_witness(pcase.pcl);
                } else {
                    key = this.cases_loaded.witness.cases.indexOf(pcid);
                    if (key < 0) {
                        this.load_witness(pcase.pcl);
                    }
                }
                console.log(this.cases_loaded.witness[type]);
                console.log(this.cases_loaded.witness[type][uids]);
                if (typeof (this.cases_loaded.witness[type]) !== 'undefined') {
                    if (typeof (this.cases_loaded.witness[type][uids]) !== 'undefined') {
                        f_witness = this.cases_loaded.witness[type][uids];
                    }
                }
            }
        }
    } else {
        pcase = this.get_full_case(n, "test witness");
        if (typeof (pcase.pcl) !== 'undefined') {            
            if (typeof (this.cases_loaded.witness) === 'undefined') {
                this.load_witness(pcase.pcl);
            } else {
                key = this.cases_loaded.witness.cases.indexOf(pcid);
                if (key < 0) {
                    this.load_witness(pcase.pcl);
                }
            }

            if (typeof (this.cases_loaded.witness[type]) !== 'undefined') {
                if (typeof (this.cases_loaded.witness[type][uids]) !== 'undefined') {
                    f_witness = this.cases_loaded.witness[type][uids];
                }
            }
        }
    }
    
    return f_witness;
};

Mst.Player.prototype.unpack_witness = function (wit) {
    "use strict";
    var a_wit, o_wit, key, val;
    
    a_wit = wit.split("|");
    
    o_wit = {
        type: a_wit[0],
        uid: a_wit[1]        
    };
    
    o_wit.o = {};
    
    for (var i = 2; i < a_wit.length; i++) {
        key = a_wit[i].substr(0,1);
        val = a_wit[i].substr(1,a_wit[i].length);
        o_wit.o[key] = val;
    }
    
    return o_wit;
};

Mst.Player.prototype.prepare_ftprints_onmap = function () {
    "use strict";
    
    var map = this.game_state.root_data.map_int;
    var a_pcid = [];
    
    for (var pcid in this.cases) {
        this.get_full_case(pcid, "Prepare ftp");
    }
    
    this.game_state.groups.chests.forEachAlive(function(chest) {
        var ccase, ftprints, new_ftprints, b_in, m, gweek, pcid, pcl, p_in;
        
        //console.log(chest.cases);
        
        for (var cid in chest.cases) {
            ccase = chest.cases[cid];
            b_in = false;
            
            p_in = false;
            pcid = parseInt(ccase.PCID);
            pcl = this.cases_loaded[pcid];
            if (typeof (pcl) !== 'undefined') {
                if (pcl.ftp_vis === 1) {
                    p_in = true;
                } else {
                    pcl.ftp_vis = 1;
                }
            }
            
            if (!p_in) {
                ftprints = ccase.ftprints;
                gweek = parseInt(ccase.gweek) + 3;
                for (var id in ftprints) {
                    m = parseInt(ftprints[id].m);
                    //console.log(m + "|" + map + " " + gweek + "|" + this.stats.gtimeweek);

                    if (m === map && gweek > this.stats.gtimeweek) {
                        new_ftprints = JSON.parse(JSON.stringify(ftprints[id]));
                        new_ftprints.cid = ccase.CID;
                        new_ftprints.id = ccase.ID;
                        new_ftprints.fid = id;
                        new_ftprints.pcid = ccase.PCID;
                        new_ftprints.owner = ccase.Owner;
                        new_ftprints.culprit = ccase.Culprit;
                        this.ftprints.push(new_ftprints);
                        b_in = true;
                    }
                }

                if (b_in && ccase.Owner === this.usr_id) {
                    a_pcid.push(ccase.PCID);
                }
            }
        }
    }, this);
    console.log("Prepared ftprints");
    console.log(this.ftprints);
};

Mst.Player.prototype.return_ftprints = function () {
    "use strict";
    var x, y, dist;
    var ftp = [];
    
    for (var id in this.ftprints) {
        x = parseInt(this.ftprints[id].x);
        y = parseInt(this.ftprints[id].y);
        dist = this.game_state.game.physics.arcade.distanceToXY(this, x, y);
        console.log(dist);
        
        if (typeof (this.ftprints[id].v) === 'undefined') {
            this.ftprints[id].v = 0;
        }
        
        if (dist < 35 && this.ftprints[id].v < 1) {
            this.ftprints[id].v = 1;
            this.ftprints[id].mfid = id;
            ftp.push(this.ftprints[id]);
            break;
        }
    }
    
    return ftp;
};

Mst.Player.prototype.near_ftprints = function (ftp) {
    "use strict";
    var x, y, dist, a_ftp, n_ftp, n_ftp2, fid, bf;
    
    bf = false;
    
    a_ftp = ftp.split("|");
    console.log(a_ftp);
    
    if (a_ftp[0] === 'ftp') {
        if (typeof (a_ftp[4]) !== 'undefined') {
            fid = parseInt(a_ftp[4]);
            
            if (typeof (this.ftprints[fid]) !== 'undefined') {
                x = parseInt(this.ftprints[fid].x);
                y = parseInt(this.ftprints[fid].y);
                dist = this.game_state.game.physics.arcade.distanceToXY(this, x, y);
                console.log(dist);

                n_ftp = this.ftprints[fid].x + "|" + this.ftprints[fid].y;
                n_ftp2 = a_ftp[2] + "|" + a_ftp[3];

                if (dist < 40 && n_ftp === n_ftp2) {
                    bf = true;
                }
            }
        } else {
            for (var id in this.ftprints) {
                x = parseInt(this.ftprints[id].x);
                y = parseInt(this.ftprints[id].y);
                dist = this.game_state.game.physics.arcade.distanceToXY(this, x, y);
                console.log(dist);

                n_ftp = this.ftprints[id].x + "|" + this.ftprints[id].y;
                n_ftp2 = a_ftp[2] + "|" + a_ftp[3];

                if (dist < 40 && n_ftp === n_ftp2) {
                    bf = true;
                }
            }
        }
    }
    
    return bf;
};

Mst.Player.prototype.test_ftprint = function (nid, ftp) {
    "use strict";
    
    const ret = {
        b: false,
        n: -1,
        s: "",
        l: -1
    };
    const a_ftp = ftp[nid].split("|");
    console.log(a_ftp);
    
    if (a_ftp[0] === 'ftp') {        
        if (typeof (a_ftp[4]) !== 'undefined') {
            let n_ftp = 0;
            let n_oev14 = 0
            let l_oev14 = -1;
            let last_a2 = "";
            for (let id in ftp) {
                const a2_ftp = ftp[id].split("|");
                
                if (a2_ftp[0] === 'ftp') { 
                    n_ftp++;
                } else {
                    if (a2_ftp[0] === '14') {
                        n_oev14++;
                        l_oev14 = id;
                        ret.s = a2_ftp[1];
                        ret.l = a2_ftp.length;
                        console.log(a2_ftp);
                        console.log(ret);                        
                        last_a2 = a2_ftp[ret.l - 1].substr(0,1);
                        console.log(last_a2);
                    }
                }
            }
            
            console.log("F: " + n_ftp + " 14: " + (ret.l - 2));
            ret.b = (n_ftp > (ret.l - 2));
            
            if (last_a2 === 'M') {
                ret.b = false;
            }
            
            ret.n = l_oev14;        
            console.log(ret);
        }
    }
    
    return ret;
};

Mst.Player.prototype.investigate_ftprint = function (nid, ftp) {
    "use strict";
    var a_ftp, fid, len, oev14_type, oev14_id, t_ftp, pcid, uid, full_case, n_evidence, uid, cont2, badge, ubadge, ub_val, bb;
    
    console.log("Investigate ftp: " + ftp[nid]);
    
    n_evidence = "";    
    a_ftp = ftp[nid].split("|");
    console.log(a_ftp);
    
    if (a_ftp[0] === 'ftp') {        
        if (typeof (a_ftp[4]) !== 'undefined') {
            fid = parseInt(a_ftp[4]);
            t_ftp = this.ftprints[fid];
            
            bb = this.test_ftprint(nid, ftp);
            if (bb.b) {
                oev14_type = "new";
                if (bb.n > -1) {
                    oev14_type = bb.s;
                    oev14_id = bb.n;
                }
                
                console.log(oev14_type);
                
                switch (oev14_type) {
                    case "new":
                        pcid = parseInt(this.ftprints[fid].pcid);
                        cont2 = "14|W|" + pcid  + "|" + nid;
                        full_case = this.get_full_case(pcid, cont2);
                        
                        console.log(pcid);
                        console.log(full_case);
                        
                        if (typeof (full_case.pcl) !== 'undefined') {
                            n_evidence = "14|W|" + full_case.pcl.gweek + "|" + oev14_id;
                        }
                    break;
                    case "W":
                        len = bb.l;
                        console.log(len);
                        switch (len) {
                            case 3:
                                cont2 = ftp[oev14_id] + "|F|" + this.ftprints[fid].pcid + "|" + oev14_id;
                                uid = parseInt(this.ftprints[fid].culprit);
                                
                                ub_val = this.get_badge_val("14", "F", uid, "player", cont2);
                                if (ub_val !== '') {
                                    n_evidence = ftp[oev14_id] + "|F" + ub_val + "|" + oev14_id;
                                }
                            break;
                            case 4:
                                cont2 = ftp[oev14_id] + "|S|" + this.ftprints[fid].pcid + "|" + oev14_id;
                                uid = parseInt(this.ftprints[fid].culprit);
                                
                                ub_val = this.get_badge_val("14", "S", uid, "player", cont2);
                                if (ub_val !== '') {
                                    n_evidence = ftp[oev14_id] + "|S" + ub_val + "|" + oev14_id;
                                }
                            break;
                            case 5:
                                cont2 = ftp[oev14_id] + "|H|" + this.ftprints[fid].pcid + "|" + oev14_id;
                                uid = parseInt(this.ftprints[fid].culprit);
                                
                                ub_val = this.get_badge_val("14", "H", uid, "player", cont2);
                                if (ub_val !== '') {
                                    n_evidence = ftp[oev14_id] + "|H" + ub_val + "|" + oev14_id;
                                }
                            break;                            
                            case 6:
                                cont2 = ftp[oev14_id] + "|M|" + this.ftprints[fid].pcid + "|" + oev14_id;
                                uid = parseInt(this.ftprints[fid].culprit);
                                
                                ub_val = this.get_badge_val("14", "M", uid, "player", cont2);
                                if (ub_val !== '') {
                                    n_evidence = ftp[oev14_id] + "|M" + ub_val + "|" + oev14_id;
                                }
                            break;
                        }
                    break;
                }
            }
        }
    }
    
    return n_evidence;
};

Mst.Player.prototype.get_full_case = function (pcid, context) {
    "use strict";
    var full_case, oid, cid, oname, obj;
    full_case = {};
    
    full_case.pc = this.cases[pcid];    
    
    if (typeof (this.cases_loaded[pcid]) === 'undefined') {
        oid = parseInt(full_case.pc.ID);
        cid = parseInt(full_case.pc.CID);
        oname = this.game_state.objectofID(oid);
        console.log(oname);
        
        if (oname !== "") {
            obj = this.game_state.prefabs[oname];
            this.cases_loaded[pcid] = JSON.parse(JSON.stringify(obj.cases[cid]));
            full_case.pcl = JSON.parse(JSON.stringify(obj.cases[cid]));
        } else {
            this.game_state.make_object({ "x": 0, "y": 0 }, oid, context);
        }
    } else {
        full_case.pcl = JSON.parse(JSON.stringify(this.cases_loaded[pcid]));
    }
    
    return full_case;
};

Mst.Player.prototype.get_full_person = function (uid, type, context) {
    "use strict";
    var oid, cid, uname, person, cont2;
    
    if (type === 'player') {
        if (typeof (this.cases_loaded.person) !== 'undefined') {
            person = this.cases_loaded.person[uid];
        } else {
            person = this.cases_loaded.person;
            this.cases_loaded.person = {};
        }
        
        if (typeof (person) === 'undefined') {
            uname = this.game_state.playerOfUsrID(uid);
            if (uname !== '') {
                person = this.game_state.prefabs[uname];
                this.cases_loaded.person[uid] = person;

                return person
            } else {
                cont2 = "investigate|" + context;
                this.game_state.make_otherplayer({ "x": 0, "y": 0 }, uid, cont2);
            }
        } else {
            return person;
        }
    } else {
        if (typeof (this.cases_loaded.NPC) !== 'undefined') {
            person = this.cases_loaded.NPC[uid];
        } else {
            person = this.cases_loaded.NPC;
            this.cases_loaded.NPC = {};
        } 
        
        if (typeof (person) === 'undefined') {
            uname = this.game_state.NPCofID(uid);
            if (uname !== '') {
                person = this.game_state.prefabs[uname];
                this.cases_loaded.NPC[uid] = person;

                return person
            } else {
                cont2 = "investigate|" + context;
                //this.game_state.make_otherplayer({ "x": 0, "y": 0 }, uid, cont2); !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            }
        } else {
            return person;
        }
    }
};

Mst.Player.prototype.get_badge_val = function (b_id, b_key, uid, type, context) {
    "use strict";
    
    var ret = "";
    var ubadge = this.unpack_badge(b_id, uid, type, context);
    
    if (typeof (ubadge) !== 'undefined') {
        ret = ubadge[b_key];
    }
    
    return ret;
};

Mst.Player.prototype.unpack_badge = function (b_id, uid, type, context) {
    "use strict";
    
    var full_person = this.get_full_person(uid, type, context);
    
    console.log(uid);
    console.log(full_person);

    if (typeof (full_person) !== 'undefined') {
        var ubadge = full_person.unpack_badge(b_id);
    }
    
    return ubadge;
};

Mst.Player.prototype.add_ftprints_tocase = function (ftp) {
    "use strict";
    var owner, pcid, fpcid, cpcid, n_ftp, o_ftp, bf, aid;
    
    pcid = -1;
    aid = -1;
    owner = parseInt(ftp.owner);
    fpcid = parseInt(ftp.pcid);
    if (owner = this.usr_id) {
        for (var id in this.cases) {
            cpcid = parseInt(this.cases[id].PCID);
            if (fpcid === cpcid) {
                n_ftp = "ftp|";
                n_ftp += ftp.m + "|" + ftp.x + "|" + ftp.y + "|" + ftp.mfid;
                
                if (typeof (this.cases[id].evidences) === 'undefined') {
                    this.cases[id].evidences = [];
                }
                
                o_ftp = this.cases[id].evidences;
                bf = true;
                
                for (var eid in o_ftp) {
                    if (o_ftp[eid] === n_ftp) {
                        bf = false;
                    }
                }
                
                if (bf) {
                    console.log(n_ftp);
                    this.cases[id].evidences.push(n_ftp);
                    aid = id;
                }
            }
        }
    }
    
    console.log(this.cases);
    return aid;
};

Mst.Player.prototype.add_case = function (c) {
    "use strict";
    var new_case, p_id, c_id, p_cid, c_cid, pcid, bcc;
    
    for (var id in c.cases) {
        bcc = false;
        c_id = parseInt(c.cases[id].ID);
        c_cid = parseInt(c.cases[id].CID);
        for (var idp in this.cases) {
            p_id = parseInt(this.cases[idp].ID);
            p_cid = parseInt(this.cases[idp].CID);
            if (p_id === c_id && p_cid === c_cid) {
                bcc = true;
            }
        }
        
        if (!bcc) {
            if (typeof (c.cases[id].type) === 'undefined') {
                c.cases[id].type = "stolen";
            }
            
            pcid = this.cases.length;
            new_case = {
                "PCID": pcid,
                "CID": c_cid,
                "ID": c_id,
                "M": c.cases[id].M,
                "type": c.cases[id].type,
                "questions": "",
                "witness": {},
                "evidences": []
            };
            
            this.cases.push(new_case);
            this.save.properties.cases = this.cases;
            this.cases_loaded[pcid] = JSON.parse(JSON.stringify(c.cases[id]));
            c.add_case_pcid(id, pcid);
            
            console.log(this.cases);
            console.log(this.cases_loaded);
        }
    }
    
    
};

Mst.Player.prototype.add_culprit = function (culprit) {
    "use strict";
    
    this.culprit.push(culprit);
    this.save.properties.culprit = this.culprit;
    
    return this.culprit.length - 1;
};

Mst.Player.prototype.rollback_culprit = function (id) {
    "use strict";
    
    this.culprit.splice(id, 1);
    this.save.properties.culprit = this.culprit;
};

Mst.Player.prototype.test_culprit = function () {
    "use strict";
    
    var map = this.game_state.root_data.map_int;
    var new_culprit = [];
    var count, wt, mapc;
    
    for (var key in this.culprit) {
        count = parseInt(this.culprit[key].count);
        wt = parseInt(this.culprit[key].wt);
        mapc = parseInt(this.culprit[key].M);
        if (map !== mapc) {
            count++;
        }
        
        this.culprit[key].count = count;
        
        if (count < 6) {
            new_culprit.push(this.culprit[key]);
        } else {
            if (wt < 1 && count < 15) {
                new_culprit.push(this.culprit[key]);
            }
        }
    }
        
    this.culprit = new_culprit;
    this.save.properties.culprit = new_culprit;
};

Mst.Player.prototype.add_ftprints = function (cc) {
    "use strict";
    
    console.log("Add ftprints");
    
    var map = this.game_state.root_data.map_int;
    
    var ftprint = {
        m: map,
        x: Math.round((this.game_state.prefabs.player.x - 8 )/16)*16 + 8,
        y: Math.round((this.game_state.prefabs.player.y + 8 )/16)*16 - 8
    };
    
    var witness = "";
    
    if (cc === 0) {
        var players = this.game_state.get_players();
        var NPCs = this.game_state.get_NPCs();
        
        if (players.length > 0 || NPCs.length > 0) {
            witness = {
                "m": map,
                "p": players,
                "n": NPCs,
                "id": 0
            };
        }
    }
    
    console.log(this.culprit);
    for (var key in this.culprit) {
        if (this.culprit[key].M === map) {
            console.log("Ft same map");
            
            var ccase = this.game_state.objectofID(this.culprit[key].ID);
            this.game_state.prefabs[ccase].steal_add_ftprints(this.culprit[key].CID);
            if (this.open_chest !== ccase) {
                this.game_state.prefabs[ccase].save_chest();
            }
        } else {
            console.log("Ft other map");
            var ftprint_save = {
                type: "ftprint",
                name: "ftprint",
                obj_id: this.culprit[key].ID,
                x: 0,
                y: 0,
                properties: {
                    group: "ftprint",
                    items: "",
                    texture: "blank",
                    time: "",
                    cid: this.culprit[key].CID
                },
                action: "FTPRINT",
                ftprint: ftprint,
                witness: witness,
                map_int: map
            };
            
            var d = new Date();
            var n = d.getTime();
            ftprint_save.properties.time = n;
            var usr_id = this.usr_id;
            
            console.log("Ftprint insert:");
            console.log(ftprint_save);
            
            $.post("object.php?time=" + n + "&uid=" + usr_id, ftprint_save)
                .done(function (data) {
                    console.log("Ftprint save success");
                    console.log(data);
                    var resp = JSON.parse(data);

                    console.log("Ftprint is saved");
                })
                .fail(function (data) {
                    console.log("Ftprint save error");
                    console.log(data);
                });
        }
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
    
    this.add_ftprints(1);
    
    this.save.x = go_position.x;
    this.save.y = go_position.y;
    
    this.save.properties.stats.health = this.health;
    this.save.properties.stats.health_max = this.stats.health_max;
    this.save.properties.stats.stress = this.stats.stress;
    this.save.properties.stats.sin = this.stats.sin;
    this.save.properties.items = this.stats.items;
    this.save.properties.equip = this.stats.equip;
    this.save.properties.expequip = this.stats.expequip;
    
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

Mst.Player.prototype.overlap_layer_tile = function (player, tile) {
    "use strict";
    var dist;
    
 //   console.log("collide:");
//    console.log(player.position);
//    console.log(player.body);
    //console.log(tile);
    
    //console.log("L: " + tile.faceLeft + " R: " + tile.faceRight + " T: " + tile.faceTop + " B: " + tile.faceBottom);
    
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

Mst.Player.prototype.stream_put = function () {
    "use strict";

    if (!this.stream_sent) {
        var d = new Date();
        var n = d.getTime();
        this.stream.properties.time = n;
        
        var usr_id = this.usr_id;
        var player = this;
        
        this.stream_sent = true;
        this.stream.string = this.stream_new;
        
        console.log("Stream sent: " + this.stream_new);
        console.log(this.stream);
        console.log(JSON.stringify(this.stream));
        
        $.post("object.php?time=" + n + "&uid=" + usr_id, this.stream)
            .done(function (data) {
                console.log("Stream save success");
                console.log(data);
                var resp = JSON.parse(data);
                player.stream_load(resp);
            
                console.log("Stream is saved");
            })
            .fail(function (data) {
                console.log("Stream save error");
                console.log(data);
            });
    }
};

Mst.Player.prototype.stream_load = function (stream) {
    "use strict";
    
    var gtime = stream.obj.gtime * 1000;
    console.log(gtime);
    console.log(this.gtime.ms);
    console.log(this.gtime.obj);
    
    var result = this.get_week(gtime, 0);
    
    var datex = new Date(gtime);
    var day = datex.getDay();
    if (day < 1) { day = 7 };
    var date1 = new Date(gtime - ((day - 1) * 86400000));
    date1.setHours(7,0);
    
    console.log(result);
    console.log(datex);
    console.log(date1);
    console.log(datex.getDay());
    
    if (date1 > this.gtime.obj) {
        console.log("New week from other player");
        
        var date1t = date1.getTime();
        var result = this.get_week(date1t, 0);
        var result2 = this.get_week(date1t, 1);
        
        this.stats.gtimeweek = result;
        this.stats.gtimeday = result2 + " " + date1.toString().substr(0,11);
        this.game_state.prefabs.time.text1.text = " " + this.stats.gtimeday;
        
        this.set_time(date1t);
    }
    
    
};