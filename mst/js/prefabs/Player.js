var Mst = Mst || {};

Mst.Player = function (game_state, name, position, properties) {
    "use strict";
    var load_player;
    Mst.Prefab.call(this, game_state, "player", position, properties);
    
    load_player = JSON.parse(localStorage.getItem("player"));
    if (typeof(load_player) != 'undefined') {
        this.x = load_player.x;
        this.y = load_player.y;
    }
    
    this.walking_speed = +properties.walking_speed;
    this.jumping_speed = +properties.jumping_speed;
    this.bouncing = +properties.bouncing;
    this.direction = {"x": 1, "y": 1};
    
    this.health = load_player.properties.health || +properties.health || 100;
    
    this.stats = {
        health: 5,
        defense: +properties.defense,
        attack: +properties.attack,
        money: +properties.money,
        items: load_player.properties.items || properties.items
    };
    
    this.save = {
        type: "player",
        name: name,
        usr_id: this.game_state.root_data.usr_id,
        x: position.x,
        y: position.y,
        properties: properties,
        map: {}
    }
    
    //console.log(this.save);
    
    this.opened_chest = "";
    
    //console.log(properties.items);
    //console.log(this.stats.items);
    
    this.game_state.game.physics.arcade.enable(this);
    this.body.collideWorldBounds = true;
    
    this.game_state.game.camera.follow(this);
    
    //alert(1);
    
    //this.animations.add("walking", [0, 1, 2, 1], 6, true);
    
    this.animations.add('left', [8, 9], 10, true);
    this.animations.add('right', [1, 2], 10, true);
    this.animations.add('up', [12, 13], 10, true);
    this.animations.add('down', [5, 6], 10, true);

    
    this.frame = 0;
    
    this.body.setSize(11, 14, 2.5, 5);
    this.anchor.setTo(0.5);
    
    this.cursors = this.game_state.game.input.keyboard.createCursorKeys();
};

Mst.Player.prototype = Object.create(Mst.Prefab.prototype);
Mst.Player.prototype.constructor = Mst.Player;

Mst.Player.prototype.update = function () {
    "use strict";
    this.game_state.game.physics.arcade.collide(this, this.game_state.layers.collision);
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.enemies, this.hit_player, null, this);
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.chests, this.open_chest, null, this);
    
    this.stats.health = Math.ceil(this.health/20);
    
    if (this.cursors.right.isDown) {
        // move right
        this.body.velocity.x = this.walking_speed;
        this.animations.play("right");
        
        this.direction.x = 1;
        //alert(1);
        //this.scale.setTo(-1, 1);
    } else if (this.cursors.left.isDown) {
        // move left
        this.body.velocity.x = -this.walking_speed;
        this.animations.play("left");
        
        this.direction.x = -1;
        //this.scale.setTo(1, 1);
    } else if (this.cursors.up.isDown) {
        // move up
        this.body.velocity.y = -this.walking_speed;
        this.animations.play("up");
                        
        this.direction.y = -1;
        //this.scale.setTo(1, 1);
    } else if (this.cursors.down.isDown) {
        // move down
        this.body.velocity.y = this.walking_speed;
        this.animations.play("down");
                
        this.direction.y = 1;
        //this.scale.setTo(1, 1);
    } else {
        // stop
        this.body.velocity.set(0);
        this.animations.stop();
        
        this.direction.y = 0;
        //this.frame = 0;
    }
    
    if (this.game_state.game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
        // swing
        this.game_state.prefabs.sword.swing();
    }
    
    if (this.game_state.prefabs.sword.alive) {
        this.game_state.prefabs.sword.x = this.x + this.direction.x * 4;
        this.game_state.prefabs.sword.y = this.y + 2 + this.direction.y * 4;
    }
    
    this.save.x = this.x;
    this.save.y = this.y;
    this.save.properties.health = this.health;
    this.save.properties.items = this.stats.items;
    
    this.game_state.save.player = this.save;
};

Mst.Player.prototype.hit_player = function (player, enemy) {
    "use strict";
    
    player.health--;
    this.game_state.game.physics.arcade.moveToObject(enemy, player, -70);
    enemy.knockbacki = 10;
    
    if (player.health < 1) {
        this.save.properties.health = 100;
        
        this.game_state.save_data({ x: 135, y: 300}, "assets/maps/map2.json");
        
        this.game_state.game.state.start("BootState", true, false, "assets/maps/map2.json", 1);
    }
    
    //this.game_state.restart_map();
};

Mst.Player.prototype.open_chest = function (player, chest) {
    "use strict";
    
    if (this.opened_chest == "") {
        chest.frame = 1;
        this.opened_chest = chest.name;
        this.game_state.prefabs.chestitems.show_initial_stats();
    }
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
    new_new = new_new.slice(3,new_new.length);    
    
    this.save.map.new_int = parseInt(new_new);
    
    localStorage.setItem("player", JSON.stringify(this.save));
    
    console.log(localStorage.player);

};