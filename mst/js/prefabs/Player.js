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
    
    this.walking_speed = +properties.walking_speed;
    this.jumping_speed = +properties.jumping_speed;
    this.bouncing = +properties.bouncing;
    this.direction_sword = {"x": 1, "y": -1};
    this.direction_chest = {"x": 0, "y": 1};
    
    this.health = +properties.stats.health || 100;
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
            stress: 0
        };
    }
    
    if (typeof (properties.abilities) === 'undefined') {
        properties.abilities = {
            strength: 8,
            constitution: 8
        };
    }
    
    if (typeof (properties.relations) === 'undefined') {
        properties.relations = [];
    }
    
    if (typeof (properties.places) === 'undefined') {
        properties.places = [];
    }
    
    this.stats = {
        health_hearts: 5,
        health: +properties.stats.health,
        stress: 0, // parseInt(properties.stats.stress) || 
        moon: +properties.moon || 5,
        moon_max: 5,
        moon_time: 0,
        exp: +properties.skills.standard.exp || +properties.exp || 1,
        level: +properties.skills.standard.level || 1,
        skills: {
            standard: { exp: +properties.skills.standard.exp || +properties.exp || 1,
                        level: +properties.skills.standard.level || +properties.level || 1 },
            fighter: { exp: +properties.skills.fighter.exp || 1, level: +properties.skills.fighter.level || 1 },
            woodcutter: { exp: +properties.skills.woodcutter.exp || 1, level: +properties.skills.woodcutter.level || 1 },
            stonebreaker: { exp: +properties.skills.stonebreaker.exp || 1, level: +properties.skills.stonebreaker.level || 1 }
        },
        abilities: {
            strength: +properties.abilities.strength,
            constitution: +properties.abilities.constitution
        },
        relations: properties.relations,
        places: properties.places,
        equip: properties.equip || -1,
        items: properties.items || load_player.properties.items
    };
    
    this.save = {
        type: "player",
        name: name,
        usr_id: this.game_state.root_data.usr_id,
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
    
    this.stats.health_hearts = Math.ceil(this.health / 20);
    this.stats.health = this.health;
    
    this.save.x = this.x;
    this.save.y = this.y;
    this.save.properties.stats.health = this.health;
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
    this.game_state.game.physics.arcade.moveToObject(enemy, player, -70);
    enemy.knockbacki = 10;
    
    if (player.health < 1) {
        this.save.properties.killed = true;
        this.save.properties.stats.stress = 0;
        this.save.properties.stats.health = 100;
        
        this.game_state.save_data({ "x": 432, "y": 272 }, "assets/maps/map4.json");
        
        this.game_state.game.state.start("BootState", true, false, "assets/maps/map4.json", this.game_state.root_data.usr_id);
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
    
    if (this.opened_bussiness === "") {
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
        console.log(this.stats.relations[key]);
        //if (parseInt(relation.map_int) === parseInt(map.map_int) && parseInt(relation.region) === parseInt(map.region)) {
        if (this.stats.relations[key].name === person.name 
            && this.stats.relations[key].region === person.region
            && this.stats.relations[key].type === type) {
            relation_selected = this.stats.relations[key];
        }
    }
    
    console.log(relation_selected);
    
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
    console.log(this.stats.relations);
};

Mst.Player.prototype.save_player = function (go_position, go_map) {
    "use strict";
    
    this.save.x = go_position.x;
    this.save.y = go_position.y;
    
    this.save.map.old = this.game_state.root_data.map_file;
    this.save.map.new = go_map;
    
    var new_splited = go_map.split("/");
    var new_new = new_splited[new_splited.length - 1];
    new_splited = new_new.split(".");
    new_new = new_splited[0];
    new_new = new_new.slice(3, new_new.length);
    
    this.save.map.new_int = parseInt(new_new);
    
    localStorage.setItem("player", JSON.stringify(this.save));
    
    //console.log(localStorage.player);

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