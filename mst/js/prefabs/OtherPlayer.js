var Mst = Mst || {};

Mst.OtherPlayer = function (game_state, name, position, properties) {
    "use strict";
    
    //console.log(position);
    
    Mst.Prefab.call(this, game_state, name, position, properties);
    
    this.game_state.game.physics.arcade.enable(this);
    
    this.game_state.groups["otherplayers"].add(this);
    
//    this.stats = {
//        items: properties.items
//    };
    
    console.log("other player");
    //console.log(this.game_state.groups["otherplayers"]);
        
    this.region = 0;
    this.p_name = name;
    
    this.ren_texture = "";
    if (typeof (properties.ren_texture) !== 'undefined') {
        this.ren_texture = properties.ren_texture;
    }
    
    if (typeof (properties.gender) === 'undefined') {
        properties.gender = "";
    }
    
    if (typeof (properties.nurse) === 'undefined') {
        this.nurse = false;
    } else {
        this.nurse = true;
    }
    
    this.rumour = {};
    if (typeof (properties.rumours) === 'undefined') {
        this.rumours = [];
    } else {
        this.rumours = properties.rumours;
    }
    
    if (typeof (properties.badges) === 'undefined') {
        this.badges = {};
    } else {
        this.badges = properties.badges;
    }
    
    console.log(this.badges);
    
    this.gender = properties.gender;
    
    var key;
    key = this.game_state.keyOfName(this.name);
    
    this.save = {
        type: "player",
        name: name,        
        usr_id: this.game_state.save.objects[key].usr_id,
//        x: (position.x - (this.game_state.map.tileHeight / 2)),
//        y: (position.y + (this.game_state.map.tileHeight / 2)),
        x: position.x,
        y: position.y,
        properties: properties
    }
    
    this.usr_id = parseInt(this.game_state.save.objects[key].usr_id);
    
    //this.body.immovable = true;
    this.frame = 0;
    this.body.setSize(11, 14, 2.5, 5);
    this.anchor.setTo(0.5);
    
    this.updated = false;
    this.num_of_hits = 0;
    this.player_hit_not_delay = true;
    

    
    this.bubble = this.game_state.groups.bubbles.create(this.x, this.y - 16, 'bubble_spritesheet', 0);
    this.bubble.anchor.setTo(0.5);
    this.bubble.inputEnabled = true;
    this.bubble.events.onInputDown.add(this.hide_bubble, this);
    this.bubble.visible = false;
    this.bubble_showed = false;

    this.o_type = "otherPlayer";
    this.inputEnabled = true;
    this.input.useHandCursor = true;
    
    this.move_out_NPC = "left"; 
    
    
};

Mst.OtherPlayer.prototype = Object.create(Mst.Prefab.prototype);
Mst.OtherPlayer.prototype.constructor = Mst.OtherPlayer;

Mst.OtherPlayer.prototype.update = function () {
    "use strict";
    
    this.game_state.game.physics.arcade.collide(this, this.game_state.layers.collision, this.collide_layer_tile, null, this);
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.enemies);
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.chests);
    this.game_state.groups.otherplayers.forEachAlive(function(one_player) {
        this.game_state.game.physics.arcade.collide(this, one_player);
    }, this);
    
    this.game_state.groups.NPCs.forEachAlive(function(NPC) {
        //console.log(this.game_state.game.physics.arcade.distanceBetween(this, o_player));
        var newx, newy;        
        
        this.game_state.game.physics.arcade.collide(this, NPC);
        
        if (this.game_state.game.physics.arcade.distanceBetween(this, NPC) < 10) {
            switch (this.move_out_NPC) {
                case "left":
                    var newx = this.x - 16;
                    var newy = this.y;
                break;            
                case "right":
                    var newx = this.x + 16;
                    var newy = this.y;
                break;
                case "up":
                    var newx = this.x;
                    var newy = this.y - 16;
                break;
                case "down":
                    var newx = this.x;
                    var newy = this.y + 16;
                break;

            }
            
            this.game_state.game.physics.arcade.moveToXY(this, newx, newy, 30);
            
            //this.game_state.game.physics.arcade.moveToObject(this, NPC, -30);
        }
    }, this);
        
    if (this.bubble_showed) {
        this.bubble.x = this.x;
        this.bubble.y = this.y - 16;
    }
    
    if (Math.abs(this.body.velocity.x) > 7) {
        this.body.velocity.x *= 0.96;
    } else {
        this.body.velocity.x = 0;
    }
    
    if (Math.abs(this.body.velocity.y) > 7) {
        this.body.velocity.y *= 0.96;
    } else {
        this.body.velocity.y = 0;
    }
    
    if (this.updated) {
        
        this.save.properties.items = this.stats.items;
        
        this.updated = false;
    }
};

Mst.OtherPlayer.prototype.add_ren = function () {
    "use strict";

    // Call Ren
    
    var ren_name, ren_texture;
    
    ren_name = this.p_name+"_ren";
    
    if (this.ren_texture === "") {
        if (this.gender === "male") {
            ren_texture = "male_ren";
        } else {
            ren_texture = "female_ren";
        }  
    } else {
        ren_texture = this.ren_texture;
    }
    
    
    this.ren_sprite =  new Mst.Ren(this.game_state, ren_name, {x: 0, y:20}, {
        group: "ren", 
        texture: ren_texture, 
        p_name: this.p_name,
        p_id: this.usr_id,
        dialogue_name: this.p_name
    });

    this.ren_sprite.visible = false;
    
    
    this.events.onInputOver.add(this.game_state.hud.alt.show_alt, this);
    this.events.onInputOut.add(this.game_state.hud.alt.hide_alt, this);
};


Mst.OtherPlayer.prototype.collide_layer_tile = function () {
    "use strict";

    switch (this.move_out_NPC) {
        case "left":
            this.move_out_NPC = "right";
        break;            
        case "right":
            this.move_out_NPC = "up";
        break;
        case "up":
            this.move_out_NPC = "down";
        break;
        case "down":
            this.move_out_NPC = "left";
        break;

    }
};


Mst.OtherPlayer.prototype.show_bubble = function (type) {
    "use strict";
    this.bubble_showed = true;
    console.log("Bubble show " + this.usr_id);
    
    this.bubble.loadTexture('bubble_spritesheet', type);
    this.bubble.visible = true;
    
    if (type === 0) {
        this.game_state.game.time.events.add(Phaser.Timer.SECOND * 2, this.hide_bubble, this);
    }
};

Mst.OtherPlayer.prototype.hide_bubble = function (hidecond) {
    "use strict";
    
    console.log("Bubble hide " + this.usr_id);
    this.bubble_showed = false;
    this.bubble.visible = false;
    
    this.test_bubble();
    
    //console.log(this.bubble.visible);
    
    //console.log(hidecond);
    //console.log(this.bubble);
    
    //console.log(this.bubble.visible);
    
//    if (hidecond !== 0) {
//        this.test_quest();
//    }
};

Mst.OtherPlayer.prototype.test_bubble = function () {
    "use strict";
    
    console.log("Test bubble");
    console.log(this.ren_sprite.quest.state);
    if (typeof (this.ren_sprite.quest.state) !== 'undefined') {
        switch (this.ren_sprite.quest.state) {
            case "pre":
                this.show_bubble(3); // ! exclamation mark - quest ready
            break;
            case "ass":
                this.show_bubble(4); // ! exclamation mark - quest assigned
            break;
            case "acc":
                this.show_bubble(5); // ! question mark - quest accomplished
            break;
        }
    }
};

Mst.OtherPlayer.prototype.collide_with_player = function (player, other_player) {
    "use strict";
    var pom_hits, options, heart;
    
    options = [];
    
    if (this.player_hit_not_delay) {
        this.player_hit_not_delay = false;
        
        this.num_of_hits ++;
        pom_hits = this.num_of_hits % 3;
        console.log("NoHits:" + this.num_of_hits + " Mod: " + pom_hits);
        
        switch (pom_hits) {
            case 1:
                this.show_bubble(0); // question
                break;
                
            case 2:
                if (!this.ren_sprite.visible && player.opened_ren === "" && !player.infight) {
                    player.update_relation(other_player, "player", 1);
                    options = ["speak"];
                    var isnotacc = true;
                    if (typeof (this.ren_sprite.quest.state) !== 'undefined') {
                        var quest = this.ren_sprite.quest;
                        var target_id = parseInt(quest.properties.target);
                        console.log(quest);
                        console.log(this.usr_id);
                        if (quest.properties.target_type === "player" && target_id === this.usr_id) {
                            if (quest.properties.ending_conditions.type === 'findps') {
                                player.update_quest("by_quest_name", quest.name);
                                this.ren_sprite.quest.state = "acc";
                                this.show_bubble(5); // ! question mark - quest accomplished
                                this.ren_sprite.option_quest();
                                isnotacc = false;
                                
                            }
                            if (quest.properties.ending_conditions.type === 'deliver') {
                                var item = parseInt(quest.properties.ending_conditions.what);
                                var index = player.test_item(item, 1);
                                if (index > -1) {
                                    player.subtract_item(index, 1);
                                    player.update_quest("by_quest_name", quest.name);
                                    this.ren_sprite.quest.state = "acc";
                                    this.show_bubble(5); // ! question mark - quest accomplished
                                    this.ren_sprite.option_quest();
                                    isnotacc = false;
                                }
                            }
                        } else {
                            quest.close = "close";
                        }
                        
                        if (isnotacc) {
                            options.push("quest");
                        }
                    }
                    
                    this.rumour = this.prepare_rumour();
                    console.log(this.rumour);
                    if (typeof(this.rumour.text) !== 'undefined') {
                        options.push("rumour");
                    }
                    
                    if (isnotacc) {
                        heart = player.return_relation(this, "player");
                        console.log("Heart: " + heart);
                        if (player.gender === "male") {                        
                            this.ren_sprite.show_dialogue("Dobrý den, co byste potřeboval?", options, "", heart);
                        } else {
                            this.ren_sprite.show_dialogue("Dobrý den, co byste potřebovala?", options, "", heart);
                        }
                    }
                }
                break;
                
            case 0:
                player.no_pass_OP = false;
                break;
        }
    
        
        
        this.game_state.game.time.events.add(Phaser.Timer.SECOND * 1.5, this.collide_with_player_delay, this);
    }
    
    
};

Mst.OtherPlayer.prototype.collide_with_player_delay = function () {
    "use strict";    
    this.player_hit_not_delay = true;
    this.game_state.prefabs.player.no_pass_OP = true;
};

Mst.OtherPlayer.prototype.prepare_rumour = function () {
    "use strict";
    var key, rumour, act_rumour, index, ri, test_q;
    var pom_rumours = [];    
    rumour = {};
    
    for (var i = 0; i < this.rumours.length; i++) {
        ri = this.rumours[i].tid;
        
        test_q = this.cond_rumour(this.rumours[i]);
        
        key = this.game_state.prefabs.player.stats.rumours.indexOf(ri);
        if (key < 0 && test_q) {
            pom_rumours.push(this.rumours[i]);
        }
    }
    
    if (pom_rumours.length < 1) {
        for (var i = 0; i < this.game_state.quest_data.act_rumours.length; i++) {
            act_rumour = this.game_state.quest_data.act_rumours[i];
            ri = act_rumour.tid;

            test_q = this.cond_rumour(act_rumour);

            key = this.game_state.prefabs.player.stats.rumours.indexOf(ri);
            if (key < 0 && test_q) {
                pom_rumours.push(act_rumour);
            }
        }
    }
    
    if (pom_rumours.length > 0) {
        index = this.game_state.game.rnd.between(0, pom_rumours.length - 1);
        rumour = pom_rumours[index];
    }
        
    return rumour;
};


Mst.OtherPlayer.prototype.cond_rumour = function (rumour) {
    "use strict";
    var key, rumour, index, rc, rci, rci1, ri, test_q;
    
    ri = rumour.tid;
    rc = rumour.rconditions;

    test_q = true;
    for (var j = 0; j < rc.length; j++) {
        rci = rc[j].split("_");
        console.log(rci);
        switch (rci[0]) {
            case "pr":
                //console.log(condi1);
                key = this.game_state.prefabs.player.stats.rumours.indexOf(rci[1]);
                test_q = key > 0 && test_q;

                console.log(test_q);
            break;
            case "badge":
                //console.log(condi1);
                key = this.game_state.prefabs.player.test_badge(rci[1]);
                test_q = key !== "" && test_q;
                
                key = this.test_badge(rci[1]);
                test_q = key !== "" && test_q;

                console.log(test_q);
            break;
        }
    }
    
    return test_q;
};

Mst.OtherPlayer.prototype.test_badge = function (badge) {
    "use strict";
    var key = "";
    
    console.log(this.badges[badge]);
    if (typeof(this.badges[badge]) !== 'undefined') {
        key = this.badges[badge];
    }
    
    return key;
};

Mst.OtherPlayer.prototype.test_nurse = function () {
    "use strict";
    
    if (this.game_state.prefabs.player.killed && this.nurse) {
        console.log(this);
        
        if (this.usr_id === 53) {
            this.ren_sprite.show_dialogue("Říkám to pořád, zelenáči by se měli držet máminy sukně. Ale ne, oni prostě musí vlézt do lesa, kde zakopávaji o vlastní stín, plaší zvěř a krmí slimy. Máš štěstí, ze jsem tě našel dřív, než jsi vykrvácel, nebo si na tobě pochutnali ghúlové.");
        } else {
            this.ren_sprite.show_dialogue("Měl jste štěstí, že vás našli včas. Jinak by už bylo po vás.");
        }
        
        this.game_state.prefabs.player.update_relation(this, "player", 5);
        

    }
    
    return this.nurse;
};

Mst.OtherPlayer.prototype.test_quest_in = function () { /// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    "use strict";
    
    var quests, owner_id, target_id, player, test_q, is_quest, condi, condi1;
    //console.log(this.game_state.quest_data);
    
    player = this.game_state.prefabs.player;
    quests = player.quests;
    is_quest = false;
    
//    if (this.game_state.prefabs.player.test_quest("owner", this.usr_id)) {
//        this.show_bubble(3); // ! exclamation mark - quest
//    }
    
    
    for (key in quests) {
        console.log(quests[key]);
        
        owner_id = parseInt(quests[key].properties.owner);
        target_id = parseInt(quests[key].properties.target);
        
        if (quests[key].properties.target_type === "player" && target_id === this.usr_id) {
            //console.log(quests[i]);
            test_q = true;
            
            if (typeof(quests[key].properties.qconditions) !== 'undefined') {
                var cond = quests[key].properties.qconditions;
                for (var j = 0; j < cond.length; j++) {
                    condi = cond[j].split("_");
                    switch (condi[0]) {
                        case "pq":
                            //condi1 = parseInt(condi[1]);
                            test_q = player.test_quest("idfin", condi[1]);
                        break;
                        case "badge":
                            
                        break;
                    }
                }
            }
            
            test_q = !test_q;
            
            if (!test_q) {
                if (quest[key].state !== "new") {
                    this.ren_sprite.quest = quests[key];
                    this.ren_sprite.quest.state = quest[key].state;
                    
                    if(quest[key].state !== "ass") {
                        this.show_bubble(4); // ! exclamation mark - quest assigned
                    } else {
                        this.show_bubble(5); // ! question mark - quest accomplished
                    }
                    is_quest = true;
                    break;
                }
            }
        }
        
        if (quests[key].properties.owner_type === "player" && owner_id === this.usr_id) {
            console.log(quests[key]);
            test_q = true;
            
            if (typeof(quests[key].properties.qconditions) !== 'undefined') {
                var cond = quests[key].properties.qconditions;
                for (var j = 0; j < cond.length; j++) {
                    condi = cond[j].split("_");
                    console.log(condi);
                    switch (condi[0]) {
                        case "pq":
                            condi1 = parseInt(condi[1]);
                            //console.log(condi1);
                            test_q = player.test_quest("idfin", condi[1]);
                            console.log(test_q);
                        break;
                    }
                }
            }
            
            test_q = !test_q;
            
            if (!test_q) {
                this.ren_sprite.quest = quests[key];
                this.ren_sprite.quest.state = quest[key].state;
                
                if (isNaN(target_id)) {
                    if (quest[key].state !== "ass") {
                        this.show_bubble(4); // ! exclamation mark - quest assigned
                    }
                        
                    if (quest[key].state !== "acc") {
                        this.show_bubble(5); // ! question mark - quest accomplished
                    }
                }
                
                if (quest[key].state !== "pre") {
                    if (quests[key].properties.ending_conditions.type === 'textpow') {
                        console.log('\x1b[102mShow dialogue pre ' + quests[key].name);
                        this.ren_sprite.show_dialogue(quests[key].properties.quest_text);
                        player.assign_quest(quests[key]);
                        player.update_quest("by_quest_name", quests[key].name);
                    }
                }
                
                is_quest = true;
                break;
            }
        }
    }
    
    console.log(this.ren_sprite.quest);
    
    return is_quest;
};

Mst.OtherPlayer.prototype.test_quest = function () { /// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    "use strict";
    
    var quests, owner_id, target_id, player, test_q, is_quest, condi, condi1, players_end;
    //console.log(this.game_state.quest_data);
    quests = this.game_state.quest_data.quests;
    player = this.game_state.prefabs.player;
    players_end = {};
    players_end[this.usr_id] = true;
    is_quest = false;
    
//    if (this.game_state.prefabs.player.test_quest("owner", this.usr_id)) {
//        this.show_bubble(3); // ! exclamation mark - quest
//    }

    for (var i = 0; i < quests.length; i++) {
        owner_id = parseInt(quests[i].properties.owner);
        target_id = parseInt(quests[i].properties.target);
        //console.log(quests[i]);
        //console.log("Other Player ID: " + this.usr_id);
        test_q = player.test_quest("idfin", quests[i].qid);
        if (!test_q) {
            if (quests[i].properties.target_type === "player" && target_id === this.usr_id) {
                //console.log(quests[i]);
                test_q = true;

                if (typeof(quests[i].properties.qconditions) !== 'undefined') {
                    var cond = quests[i].properties.qconditions;
                    for (var j = 0; j < cond.length; j++) {
                        condi = cond[j].split("_");
                        switch (condi[0]) {
                            case "pq":
                                //condi1 = parseInt(condi[1]);
                                test_q = player.test_quest("idfin", condi[1]);
                            break;
                            case "badge":

                            break;
                        }
                    }
                }

                if (test_q) {
                    test_q = player.test_quest("idfin", quests[i].qid);
                } else {
                    test_q = true;
                }            

                if (!test_q) {                
                    test_q = player.test_quest("idass", quests[i].name);

                    if (test_q) {
                        this.ren_sprite.quest = quests[i];
                        this.ren_sprite.quest.state = "ass";
                        this.show_bubble(4); // ! exclamation mark - quest assigned
                        is_quest = true;
                        break;
                    } else {
                        test_q = player.test_quest("idacc", quests[i].name);
                        if (test_q) {
                            this.ren_sprite.quest = quests[i];
                            this.ren_sprite.quest.state = "acc";
                            this.show_bubble(5); // ! question mark - quest accomplished
                            is_quest = true;
                            break;            
                        }
                    }
                }
            }

            //console.log(test_q);

            if (quests[i].properties.owner_type === "player" && owner_id === this.usr_id && players_end[this.usr_id]) {
                console.log(quests[i]);
                test_q = true;

                if (typeof(quests[i].properties.qconditions) !== 'undefined') {
                    var cond = quests[i].properties.qconditions;
                    for (var j = 0; j < cond.length; j++) {
                        condi = cond[j].split("_");
                        console.log(condi);
                        switch (condi[0]) {
                            case "pq":
                                condi1 = parseInt(condi[1]);
                                //console.log(condi1);
                                test_q = player.test_quest("idfin", condi[1]);
                                console.log(test_q);
                                players_end[this.usr_id] = false;
                                console.log("Players end false");
                            break;
                        }
                    }
                }

                if (test_q) {
                    test_q = player.test_quest("idfin", quests[i].qid);
                } else {
                    test_q = true;
                }

                if (!test_q) {                
                    test_q = player.test_quest("idass", quests[i].name);

                    if (test_q) {
                        this.ren_sprite.quest = quests[i];
                        this.ren_sprite.quest.state = "ass";
                        if (isNaN(target_id)) {
                            this.show_bubble(4); // ! exclamation mark - quest assigned
                        }
                        is_quest = true;
                        break;
                    } else {
                        test_q = player.test_quest("idacc", quests[i].name);
                        if (test_q) {
                            this.ren_sprite.quest = quests[i];
                            this.ren_sprite.quest.state = "acc";
                            //console.log(target_id);
                            //console.log(isNaN(target_id));
                            if (isNaN(target_id)) {
                                this.show_bubble(5); // ! question mark - quest accomplished
                            }
                            is_quest = true;
                            break;            
                        } else {
                            this.ren_sprite.quest = quests[i];
                            this.ren_sprite.quest.state = "pre";
                            this.show_bubble(3); // ! exclamation mark - quest ready
                            is_quest = true;

                            if (quests[i].properties.ending_conditions.type === 'textpow') {
                                console.log('\x1b[102mShow dialogue pre ' + quests[i].name);
                                this.ren_sprite.show_dialogue(quests[i].properties.quest_text);
                                player.assign_quest(quests[i]);
                                player.update_quest("by_quest_name", quests[i].name);
                            }

    //                        if (quests[i].properties.ending_conditions.type === 'text') {
    //                            player.assign_quest(quests[i]);
    //                            player.update_quest("by_quest_name", quests[i].name);
    //                        }
                            break;
                        }
                    }
                }
            }
        }
    }
  
    
    console.log(this.ren_sprite.quest);
    
    return is_quest;
};

Mst.OtherPlayer.prototype.save_player = function () {
    "use strict";
    var key;
    
//    this.save.x = this.x - (this.game_state.map.tileHeight / 2);
//    this.save.y = this.y + (this.game_state.map.tileHeight / 2);
    
    this.save.x = this.x;
    this.save.y = this.y;
    
    key = this.game_state.keyOfName(this.name);
    
    //console.log(key);

    if (key != "") {
        this.game_state.save.objects[key] = this.save;
    } else {
        this.game_state.save.objects.push(this.save);
    }

    console.log(this.game_state.save.objects);

};

Mst.OtherPlayer.prototype.hide_ren = function () {
    "use strict";
    this.ren_sprite.hide();
};
