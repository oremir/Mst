var Mst = Mst || {};

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
    
    this.killed = (properties.killed === 'true');
        
    //console.log(properties.exp);
    
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
        properties.quests = {};
    }
    
//    var dt = new Date();
//    var tm = dt.getTime();
    
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
        exp: +properties.skills.standard.exp || +properties.exp || 1,
        level: +properties.skills.standard.level || 1,
        skills: properties.skills,
        abilities: properties.abilities,
        relations: properties.relations,
        places: properties.places,
        quests: properties.quests,
        equip: properties.equip || -1,
        items: properties.items || load_player.properties.items
    };

    console.log("parse int moon");
    console.log(this.stats.moon);
    
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
    
    this.body.setSize(11, 14, 2.5, 5);
    this.anchor.setTo(0.5);
    
    this.cursors = this.game_state.game.input.keyboard.createCursorKeys();
    this.keys = this.game_state.game.input.keyboard.addKeys( { 
        'up': Phaser.KeyCode.W, 
        'down': Phaser.KeyCode.S, 
        'left': Phaser.KeyCode.A, 
        'right': Phaser.KeyCode.D,
        'action': Phaser.KeyCode.X,
        'close': Phaser.KeyCode.C,
        'attack': Phaser.KeyCode.F,
        'attack_alt': Phaser.Keyboard.ENTER
    } );
    
    this.close_state = [];
    this.close_context = [];
    this.close_not_delay = true;
    this.action_state = "none";
    
    this.update_place();
    this.quest_bubble();
};

Mst.Player.prototype = Object.create(Mst.Prefab.prototype);
Mst.Player.prototype.constructor = Mst.Player;

Mst.Player.prototype.update = function () {
    "use strict";
    this.game_state.game.physics.arcade.collide(this, this.game_state.layers.collision, this.collide_layer_tile, null, this);
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.otherplayers, this.collide_other_player, null, this);
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.enemies, this.hit_player, null, this);
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.chests, this.open_chest, null, this);
    
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
    
    if (this.keys.action.isDown) { this.key_action(); }    
    if (this.keys.close.isDown) { this.key_close(); }
    
    if (this.keys.attack.isDown) { this.game_state.prefabs.sword.swing(); }
    if (this.keys.attack_alt.isDown) { this.game_state.prefabs.sword.swing(); }
    
    
    /*if (this.game_state.game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
        // swing
        
    }*/
    
    if (this.game_state.prefabs.sword.alive) {
        this.game_state.prefabs.sword.x = this.x + this.direction_sword.x * 4;
        this.game_state.prefabs.sword.y = this.y + 2 + this.direction_sword.y;
        this.game_state.prefabs.sword.hit.x = this.x + this.direction_sword.x * 6;
        this.game_state.prefabs.sword.hit.y = this.y;
    }
    
    this.stats.health_hearts = Math.ceil(this.health / Math.ceil(this.stats.health_max / 5));
    this.stats.health = this.health;
    
    this.stats.moon_moon = Math.ceil(this.stats.moon / Math.ceil(this.stats.moon_max / 5));
    if (this.game_state.prefabs.player.stats.moon < this.game_state.prefabs.player.stats.moon_max) {
        if (this.stats.moon_loop > 0 ) {
            if (typeof (this.game_state.prefabs.moon.timer_first.timer) == 'undefined') {
                console.log("und");
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
    
};

Mst.Player.prototype.key_close = function () {
    "use strict";
    var close_state, close_context;
    
    if (this.close_not_delay) {
        this.close_not_delay = false;
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

        this.game_state.game.time.events.add(Phaser.Timer.SECOND * 0.5, this.key_close_delay, this);
    }
};

Mst.Player.prototype.key_close_delay = function () {
    "use strict";    
    this.close_not_delay = true;
};


Mst.Player.prototype.collide_other_player = function (player, other_player) {
    "use strict";
    
    other_player.show_bubble(0); // question
};

Mst.Player.prototype.hit_player = function (player, enemy) {
    "use strict";
    
    player.add_exp("standard", 1);
    player.add_ability("constitution", 5, 0);
    player.health--;
    player.stats.stress += 5;
    this.game_state.prefabs.health.text_health.text = player.health + "/" + player.stats.health_max;
    this.game_state.game.physics.arcade.moveToObject(enemy, player, -70);
    enemy.knockbacki = 10;
    
    if (player.health < 1) {
        this.save.properties.killed = true;
        this.save.properties.stats.stress = 0;
        this.save.properties.stats.health = this.stats.health_max;
        
        this.game_state.prefabs.moon.subtract_moon();
        
        this.game_state.save_data({ "x": 432, "y": 272 }, 4, "dead"); // "assets/maps/map4.json"
    }
    
    //this.game_state.restart_map();
};

Mst.Player.prototype.open_chest = function (player, chest) {
    "use strict";
    
    if (this.opened_chest === "") {
        chest.open_chest(player);
    }
};

Mst.Player.prototype.open_business = function (player, person) {
    "use strict";
    
    if (this.opened_business === "") {
        person.open_business(player);
    }
};

Mst.Player.prototype.add_item = function (item_frame, quantity) {
    "use strict";
    
    this.game_state.prefabs.items.add_item(item_frame, quantity);
};

Mst.Player.prototype.subtract_item = function (item_index, quantity) {
    "use strict";
    
    this.game_state.prefabs.items.subtract_item(item_index, quantity);
};

Mst.Player.prototype.add_exp = function (skill, quantity) {
    "use strict";
    
    function level_add(skill, exp, level) {
        var pom_exp;
        
        switch (skill) {
          case "fighter":
            pom_exp = Math.pow(1.5, level) * 400;
            break;
          case "woodcutter":
            pom_exp = Math.pow(1.4, level) * 350;
            break;
          case "stonbreaker":
            pom_exp = Math.pow(1.4, level) * 350;
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
    
    if (typeof(this.stats.skills[skill]) === 'undefined') {
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
};

Mst.Player.prototype.add_ability = function (ability, num1, num2) {
    "use strict";
    var quantity, rnd_test;
    
    quantity = 0;
    rnd_test = Math.floor(Math.random() * 100);
    if (rnd_test < num1) {
        quantity = 1;
    }
    
    quantity += num2;
    
    this.stats.abilities[ability] = parseInt(this.stats.abilities[ability]);
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
        }
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
    var key, relation_selected;
    console.log("Update relation");
    
    for (key in this.stats.relations) {
        //console.log(this.stats.relations[key]);
        //if (parseInt(relation.map_int) === parseInt(map.map_int) && parseInt(relation.region) === parseInt(map.region)) {
        if (this.stats.relations[key].name === person.name 
            && this.stats.relations[key].region === person.region
            && this.stats.relations[key].type === type) {
            relation_selected = this.stats.relations[key];
        }
    }
    
    //console.log(relation_selected);
    
    if (typeof (relation_selected) === 'undefined') {
        relation_selected = {
            name: person.name,
            p_name: person.p_name,
            region: person.region,
            type: type,
            exp: 1
        }
        this.stats.relations.push(relation_selected);
        console.log(relation_selected);
    } else {
        relation_selected.exp = exp + parseInt(relation_selected.exp);
        console.log(relation_selected);
    }
    this.save.properties.relations = this.stats.relations;
    //console.log(this.stats.relations);
};

Mst.Player.prototype.quest_bubble = function () {
    "use strict";
    
    this.game_state.groups.NPCs.forEachAlive(function(NPC) {
        console.log("Quest bubble: " + NPC.name);
        NPC.test_quest();
    }, this);
};

Mst.Player.prototype.assign_quest = function (quest) {
    "use strict";
    var new_quest;
    new_quest = {
        name: quest.name,
        owner: quest.owner,
        ending_conditions: quest.ending_conditions,
        accomplished: {},
        type: "assigned",
        reward: quest.reward
    };
    console.log(new_quest);
    
    if (this.test_quest("assign", quest.name)) {
        console.log("Assigned");
        this.stats.quests[quest.name] = new_quest;
    }
    this.save.properties.quests = this.stats.quests;
    
};

Mst.Player.prototype.test_quest = function (type, condition) {
    "use strict";
    var key, test;
    test = false;
    
    switch (type) {
        case "assign":
            if (typeof (this.stats.quests[condition]) === 'undefined') {
                test = true;
            } else {
                if (this.stats.quests[condition].type === "completed") {
                    test = true;
                }
            }
            break;
        case "owner":
            for (key in this.stats.quests) {
                console.log(this.stats.quests[key]);
                if (this.stats.quests[key].type !== "completed") {
                    if (this.stats.quests[key].owner.unique_id === condition) {
                        test = true;
                    }
                }
            }
            break;
    }
    
    console.log(test);
            
    return test;
};

Mst.Player.prototype.update_quest = function (type, condition) {
    "use strict";
    var item_frame, item, return_obj;
    return_obj = {updated: false, accomplished: false};
    
    if (type === "by_quest_name") {
        if(typeof (this.stats.quests[condition].ending_conditions.have) !== 'undefined') {
            item_frame = parseInt(this.stats.quests[condition].ending_conditions.what);
            item = this.game_state.prefabs.items.index_by_frame(item_frame);
            
            if (parseInt(this.stats.quests[condition].ending_conditions.have) < item.quantity) {
                this.stats.quests[condition].accomplished.have = this.stats.quests[condition].ending_conditions.have;
                return_obj.updated = true;
                return_obj.accomplished = true;
            } else {
                this.stats.quests[condition].accomplished.have = item.quantity;
                return_obj.updated = true;
            }
        }
    } else {
        this.stats.quests.forEach(function(quest) {
            switch (quest.type) {
                case "assigned":
                    if (typeof (quest.ending_conditions[type]) !== 'undefined') {
                        switch (type) {
                            case "have":
                                if (typeof (condition) === 'undefined') {
                                    item_frame = parseInt(quest.ending_conditions.what);
                                    item = this.game_state.prefabs.items.index_by_frame(item_frame);
                                    condition = item.quantity;
                                }
                                if (parseInt(quest.ending_conditions[type]) <= condition) {
                                    quest.accomplished[type] = quest.ending_conditions[type];
                                    return_obj.updated = true;
                                    return_obj.accomplished = true;
                                } else {
                                    quest.accomplished[type] = condition;
                                    return_obj.updated = true;
                                }
                                break;
                            default: //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                                if (typeof (quest.accomplished[type]) !== 'undefined') {
                                    quest.accomplished[type] = 1;

                                } else {
                                    quest.accomplished[type] = parseInt(quest.accomplished[type]) + 1;
                                }

                                if (quest.accomplished[type] > (quest.ending_conditions[type] - 1)) {
                                    quest.type = "accomplished";


                                }
                        }
                    }
                    break;
                case "accomplished":

                    break;
            }
        });  
    }
    
    
    this.save.properties.quests = this.stats.quests;
            
    return return_obj;
};

Mst.Player.prototype.finish_quest = function (owner) {
    "use strict";
    var key, completed, quest_name, item_frame, item, quantity;
    completed = false;
    quest_name = "";
    
    for (key in this.stats.quests) {
        console.log(this.stats.quests[key]);
        if (this.stats.quests[key].type !== "completed") {
            if (this.stats.quests[key].owner.unique_id === owner) {
                quest_name = key;
            }
        }
    }
    
    if (quest_name !== "") {
        if(typeof (this.stats.quests[quest_name].ending_conditions.have) !== 'undefined') {
            item_frame = parseInt(this.stats.quests[quest_name].ending_conditions.what);
            item = this.game_state.prefabs.items.index_by_frame(item_frame);
            quantity = parseInt(this.stats.quests[quest_name].ending_conditions.have);
            
            if (quantity < item.quantity) {
                this.stats.quests[quest_name].accomplished.have = quantity;
                completed = true;
                
                this.subtract_item(item.index, quantity);
                this.game_state.hud.alert.show_alert("-" + quantity + "x " + this.game_state.core_data.items[item_frame].name);
                this.game_state.hud.alert.show_alert("Úkol byl dokončen!");
            } else {
                this.stats.quests[condition].accomplished.have = item.quantity;
            }
        }
    }
    
    console.log(completed);
            
    return completed;
};

Mst.Player.prototype.save_player = function (go_position, go_map_int) {
    "use strict";
    
    this.save.x = go_position.x;
    this.save.y = go_position.y;
    
    var dt = new Date();
    this.save.properties.time = dt.getTime();
    this.save.properties.moon = this.stats.moon;
    
    this.save.map.old_int = this.game_state.root_data.map_int;
    this.save.map.new_int = go_map_int;
    
    localStorage.setItem("player", JSON.stringify(this.save));
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