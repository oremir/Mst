Mst.OtherPlayer = function (game_state, name, position, properties) {
    "use strict";
    
    //console.log(position);
    
    Mst.Prefab.call(this, game_state, name, position, properties);
    
    this.game_state.game.physics.arcade.enable(this);
    
    this.game_state.mGame.groups.otherplayers.add(this);
    
    console.log("other player");
        
    this.region = 0;
    this.p_name = name;
    
    this.ren_texture = properties.ren_texture ? properties.ren_texture : "";
    
    if (!properties.gender) {
        properties.gender = "";
        this.gender = "";
    } else {
        this.gender = properties.gender;
    }
    
    this.nurse = properties.nurse ? true : false;
    
    this.rumour = null;
    this.rumours = properties.rumours ? properties.rumours : [];
    
    this.badges = properties.badges ? properties.badges : {};
    console.log(this.badges);
    
    this.gtimems = parseInt(properties.gtimems);
    this.gweek = 0;
    
    this.usr_id = this.game_state.mGame.get_usr_id(this.name);
    
    this.save = {
        type: "player",
        name: name,        
        usr_id: this.usr_id,
        x: position.x,
        y: position.y,
        properties: properties
    };
    
    //this.body.immovable = true;
    this.frame = 0;
    this.body.setSize(11, 14, 2.5, 5);
    this.anchor.setTo(0.5);
    
    this.num_of_hits = 0;
    this.player_hit_not_delay = true;
    
    this.bubble = this.game_state.mGame.groups.bubbles.create(this.x, this.y - 16, 'bubble_spritesheet', 0);
    this.bubble.anchor.setTo(0.5);
    this.bubble.inputEnabled = true;
    this.bubble.events.onInputDown.add(this.hide_bubble, this);
    this.bubble.visible = false;
    this.bubble_showed = false;

    this.o_type = "otherPlayer";
    this.inputEnabled = true;
    this.input.useHandCursor = true;
    
    this.move_out_NPC = "left";
    this.moving_to = false;
};

Mst.OtherPlayer.prototype = Object.create(Mst.Prefab.prototype);
Mst.OtherPlayer.prototype.constructor = Mst.OtherPlayer;

Mst.OtherPlayer.prototype.update = function () {
    "use strict";
    
    this.game_state.game.physics.arcade.collide(this, this.game_state.layers.collision, this.collide_layer_tile, null, this);
    this.game_state.game.physics.arcade.collide(this, this.game_state.mGame.groups.enemies);
    this.game_state.game.physics.arcade.collide(this, this.game_state.mGame.groups.chests);
    this.game_state.mGame.groups.otherplayers.forEachAlive(function(one_player) {
        this.game_state.game.physics.arcade.collide(this, one_player);
    }, this);
    
    this.game_state.mGame.groups.NPCs.forEachAlive(function(NPC) {
        //console.log(this.game_state.game.physics.arcade.distanceBetween(this, o_player));
        let newx = 0;
        let newy = 0;
        
        this.game_state.game.physics.arcade.collide(this, NPC, this.collide_NPC, null, this);
        
        if (this.game_state.game.physics.arcade.distanceBetween(this, NPC) < 10) {
            switch (this.move_out_NPC) {
                case "left":
                    newx = this.x - 16;
                    newy = this.y;
                break;            
                case "right":
                    newx = this.x + 16;
                    newy = this.y;
                break;
                case "up":
                    newx = this.x;
                    newy = this.y - 16;
                break;
                case "down":
                    newx = this.x;
                    newy = this.y + 16;
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
    
    if (!this.moving_to) {
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
    }
};

Mst.OtherPlayer.prototype.get_uid = function () {
    "use strict";
    return this.usr_id;
};

Mst.OtherPlayer.prototype.get_otype = function () {
    "use strict";
    return "player";
};

Mst.OtherPlayer.prototype.add_ren = function () {
    "use strict";

    // Call Ren
    
    const ren_name = this.p_name+"_ren";
    
    let ren_texture = this.ren_texture;
    if (this.ren_texture === "") ren_texture = this.gender === "male" ? "male_ren" : "female_ren";
    
    const heart = this.game_state.prefabs.player.cPlayer.relations.return(this);
    
    this.ren_sprite =  new Mst.Ren(this.game_state, ren_name, {x: 0, y:20}, {
        group: "ren", 
        texture: ren_texture,
        p_name: this.p_name,
        o_name: this.name,
        o_type: "player",
        gender: this.gender,
        heart: heart,
        p_id: this.usr_id,
        dialogue_name: this.p_name
    }, this);

    this.ren_sprite.visible = false;    
    
    this.events.onInputOver.add(this.show_alt, this);
    this.events.onInputOut.add(this.hide_alt, this);
};

Mst.OtherPlayer.prototype.show_alt = function (op) {
    "use strict";
    this.game_state.mGame.hud.alt.show(op);
};

Mst.OtherPlayer.prototype.hide_alt = function () {
    "use strict";
    this.game_state.mGame.hud.alt.hide();
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

Mst.OtherPlayer.prototype.collide_NPC = function (oplayer, NPC) {
    "use strict";
            
    if (NPC.stype === "kerik") {
        NPC.kerik_run = false;
        this.game_state.game.physics.arcade.moveToObject(NPC, oplayer, -50);
        console.log("Not run kerik! " + NPC.name);
    }
    if (NPC.stype === "tlustocerv") {
        //NPC.tlustocerv_run = false;
        this.game_state.game.physics.arcade.moveToObject(NPC, oplayer, -30);
        console.log("Not run tlustocerv! " + NPC.name);
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

Mst.OtherPlayer.prototype.hide_bubble = function () {
    "use strict";
    
    console.log("Bubble hide " + this.usr_id);
    this.bubble_showed = false;
    this.bubble.visible = false;
    
    this.test_bubble();
};

Mst.OtherPlayer.prototype.test_bubble = function () {
    "use strict";
    
    console.log("Test bubble");
    console.log(this.ren_sprite.quest);
    if (this.ren_sprite.quest) {
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
    
    const options = [];
    
    if (this.player_hit_not_delay) {
        this.player_hit_not_delay = false;
        
        this.num_of_hits ++;
        const pom_hits = this.num_of_hits % 3;
        console.log("NoHits:" + this.num_of_hits + " Mod: " + pom_hits);
        
        switch (pom_hits) {
            case 1:
                this.show_bubble(0); // question
                break;
                
            case 2:
                console.log("Case 2 " + this.ren_sprite.visible + " " + player.cPlayer.ren.opened + " " + player.infight);
                if (!this.ren_sprite.visible && !player.cPlayer.ren.opened && !player.infight) {
                    const wit = player.cPlayer.cases.init_witness(-1, other_player.usr_id, "player");
                    console.log(wit);
                    const is_investg = !player.cPlayer.cases.is_empty;
                    
                    player.cPlayer.relations.update(other_player, 1);
                    options.push("speak");
                    let isnotacc = true;
                    if (this.ren_sprite.quest) {
                        const quest = this.ren_sprite.quest;
                        console.log(quest);
                        console.log(this.usr_id);
                        const pers = {
                            type: "player",
                            uid: this.usr_id
                        };
                        const bfp = quest.update("findps", pers);
                        if (bfp) isnotacc = false;
                        const bdl = quest.update("deliver", pers);
                        if (bdl) isnotacc = false;
                        const bdh = quest.update("have");
                        if (bdh) isnotacc = false;
                        
                        if (isnotacc) {
                            options.push("quest");
                        } else {
                            this.show_bubble(5); // ! question mark - quest accomplished
                            this.ren_sprite.option_quest();
                        }
                    }
                    
                    this.rumour = this.prepare_rumour();
                    console.log(this.rumour);
                    if (this.rumour) options.push("rumour");
                    
                    if (is_investg) options.push("investigate");
                    
                    if (isnotacc) {
                        const heart = player.cPlayer.relations.return(this);
                        console.log("Heart: " + heart);
                        if (player.mPlayer.gender === "male") {
                            this.ren_sprite.show_dialogue("Dobrý den, co byste potřeboval?", options, heart);
                        } else {
                            this.ren_sprite.show_dialogue("Dobrý den, co byste potřebovala?", options, heart);
                        }
                    }
                }
                break;
                
            case 0:
                player.cPlayer.no_pass_OP = false;
                break;
        }
        
        this.game_state.game.time.events.add(Phaser.Timer.SECOND * 1.5, this.collide_with_player_delay, this);
    }
};

Mst.OtherPlayer.prototype.collide_with_player_delay = function () {
    "use strict";    
    this.player_hit_not_delay = true;
    this.game_state.prefabs.player.cPlayer.no_pass_OP = true;
};

Mst.OtherPlayer.prototype.prepare_rumour = function () {
    "use strict";
    const pom_rumours = [];
    
    console.log(this.rumours);
    
    for (const ri of this.rumours) {
        const rii = parseInt(ri);
        const act_rumour = this.game_state.gdata.quest.texts[rii];
        
        const test_q = this.cond_rumour(act_rumour, 0);
        
        const key = this.game_state.prefabs.player.stats.rumours.indexOf(ri);
        if (key < 0 && test_q) pom_rumours.push(act_rumour);
    }
    
    if (pom_rumours.length < 1) {
        for (const act_rumour of this.game_state.gdata.quest.act_rumours) {
            const ri = act_rumour.tid;

            const test_q = this.cond_rumour(act_rumour, 1);

            const key = this.game_state.prefabs.player.stats.rumours.indexOf(ri);
            if (key < 0 && test_q) pom_rumours.push(act_rumour);
        }
    }
    
    if (pom_rumours.length > 0) {
        const index = this.game_state.game.rnd.between(0, pom_rumours.length - 1);
        return pom_rumours[index];
    }
    return null;
};


Mst.OtherPlayer.prototype.cond_rumour = function (rumour, run) {
    "use strict";
    const ri = rumour.tid;
    const rc = rumour.rconditions;

    let test_q = true;
    for (var j = 0; j < rc.length; j++) {
        const rci = rc[j].split("_");
        console.log(rci);
        switch (rci[0]) {
            case "pr":
                //console.log(condi1);
                const key = this.game_state.prefabs.player.stats.rumours.indexOf(rci[1]);
                test_q = key > 0 && test_q;
                console.log(test_q);
            break;
            case "badge":
                test_q = this.game_state.prefabs.player.mPlayer.stats.badges[rci[1]] && test_q;
                test_q = this.badges[rci[1]] && test_q;
                console.log(test_q);
            break;
            case "newspaper":
                if (run === 1) test_q = false;
                console.log(test_q);
            break;
        }
    }
    
    return test_q;
};

Mst.OtherPlayer.prototype.unpack_badge = function (badge) {
    "use strict";
    console.log(this.badges[badge]);
    if (this.badges[badge]) {
        const val = this.badges[badge];
        const ab = val.split("|");
        console.log(val);
        
        if (ab[1]) {
            const ret = {};
            for (let id in ab) {
                const key = ab[id].substr(0,1);
                const val2 = ab[id].substr(1,ab[id].length);
                ret[key] = val2;
            }
            return ret;
        }
        return val;
    }
    return null;
};

Mst.OtherPlayer.prototype.test_nurse = function () {
    "use strict";
    
    console.log("Test nurse: " + this.usr_id + " " + this.name);    
    console.log(this.game_state.prefabs.player.mPlayer.killed);
    console.log(this.nurse);
    
    if (this.game_state.prefabs.player.mPlayer.killed && this.nurse) {
        console.log(this);
        
        if (this.usr_id === 53) {
            this.ren_sprite.show_dialogue("Říkám to pořád, zelenáči by se měli držet máminy sukně. Ale ne, oni prostě musí vlézt do lesa, kde zakopávaji o vlastní stín, plaší zvěř a krmí slimy. Máš štěstí, ze jsem tě našel dřív, než jsi vykrvácel, nebo si na tobě pochutnali ghúlové.");
        } else {
            this.ren_sprite.show_dialogue("Měl jste štěstí, že vás našli včas. Jinak by už bylo po vás.");
        }
        
        this.game_state.prefabs.player.cPlayer.relations.update(this, 5);
    }    
    return this.nurse;
};

Mst.OtherPlayer.prototype.init_quest = function () { /// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    "use strict";
    const player = this.game_state.prefabs.player;
    const cpQuests = player.cPlayer.quests;
    const quests = cpQuests.new_quest;
    
    const players_end = {};
    players_end[this.usr_id] = true;

    for (let key in quests) {
        const quest = quests[key];
        
        if (quest.target_type === "player" && quest.target === this.usr_id) {
            if (quest.is_prev_fin()) {
                if (quest.state === "ass" || quest.state === "acc") {
                    this.ren_sprite.set_quest(quest);
                    this.ren_sprite.quest.state = quest.state;
                    const bub = quest.state === "ass" ? 4 : 5;
                    this.show_bubble(bub);
                    break;
                }
            }
        }

        if (quest.properties.owner_type === "player" && quest.owner === this.usr_id && players_end[this.usr_id]) {
            console.log(quest);
            let test_q = quest.is_prev_fin();
            if (!test_q) players_end[this.usr_id] = false;

            if (test_q) {
                this.ren_sprite.set_quest(quest);
                this.ren_sprite.quest.state = quest.state;

                if (quest.state === "ass" || quest.state === "acc") {
                    if (isNaN(quest.target)) {
                        const bub = quest.state === "ass" ? 4 : 5;
                        this.show_bubble(bub);
                    }
                }
                if (quest.state === "pre") {
                    this.show_bubble(3); // ! exclamation mark - quest ready
                    
                    const btp = quest.update("textpow");
                    if (btp) {
                        console.log('\x1b[102mShow dialogue pre ' + quest.name);
                        this.ren_sprite.show_dialogue(quest.quest_text);
                    }
                }
                break;
            }
        }
    }
    console.log(this.ren_sprite.quest);
};

Mst.OtherPlayer.prototype.save_player = function () {
    "use strict";
    
    this.save.x = this.x;
    this.save.y = this.y;
    
    const key = this.game_state.mGame.keyOfName(this.name);

    if (key) {
        this.game_state.mGame.save.objects[key] = this.save;
    } else {
        this.game_state.mGame.save.objects.push(this.save);
    }

    console.log(this.game_state.mGame.save.objects);
};

Mst.OtherPlayer.prototype.hide_ren = function () {
    "use strict";
    
    this.ren_sprite.hide();
};
