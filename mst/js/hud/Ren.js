var Mst = Mst || {};

Mst.Ren = function (game_state, name, position, properties) {
    "use strict";
    Mst.Prefab.call(this, game_state, name, position, properties);
    
    this.fixedToCamera = true;
    
    console.log("Ren: " + this.x + " " + this.y)
    
    this.p_name = properties.p_name;
    this.dialogue_name = properties.dialogue_name;
    this.p_id = properties.p_id;
    this.options = [];
    this.quest = {};
    this.b_speak = false;
    
};

Mst.Ren.prototype = Object.create(Mst.Prefab.prototype);
Mst.Ren.prototype.constructor = Mst.Ren;

Mst.Ren.prototype.show_dialogue = function (text, options, type) {
    "use strict";
    this.show();
    
    this.game_state.hud.dialogue.show_dialogue(this.dialogue_name, this.p_name, text, type);
    
    if (typeof(options) !== 'undefined') {
        this.show_options(options);
    }
};

Mst.Ren.prototype.show_options = function (options) {
    "use strict";
    var key, x, y, text, text_style;
    
    x = this.game_state.hud.dialogue.x + 8;
    y = this.game_state.hud.dialogue.y + 80;
    
    text_style = {"font": "12px Arial", "fill": "#BF9F00"};
    for (key in options) {
        text = this.game_state.game.add.text(x + (60 * key), y, "", text_style);
        text.fixedToCamera = true;
        text.inputEnabled = true;
        text.input.useHandCursor = true;        
        
        switch (options[key]) {
            case "buy_sell":
                text.text = "[prodat]";
                text.events.onInputDown.add(this.buy_sell, this);
                break;
            case "quest":
                text.text = "[úkol]";
                text.events.onInputDown.add(this.option_quest, this);
                break;
            case "assign":
                text.text = "[přijmout]";
                text.events.onInputDown.add(this.option_assign, this);
                break;
            case "speak":
                text.text = "[mluvit]";
                text.events.onInputDown.add(this.option_speak, this);
                break;
            case "lodging":
                text.text = "[přespat]";
                text.events.onInputDown.add(this.option_lodging, this);
                break;
        }
        
        this.options.push(text);
    }
};

Mst.Ren.prototype.hide_options = function () {
    "use strict";
    this.options.forEach(function (option) {
        option.destroy();
    });
};

Mst.Ren.prototype.buy_sell = function (option) {
    "use strict";
    if (this.game_state.prefabs.businessitems.type_buy) {
        this.game_state.prefabs.businessitems.type_buy = false;
        this.game_state.prefabs.items.set_put_type("sell");
        option.text = "[koupit]";
    } else {
        this.game_state.prefabs.businessitems.type_buy = true;
        this.game_state.prefabs.items.set_put_type("buy");
        option.text = "[prodat]";
    }
};

Mst.Ren.prototype.option_quest = function (option) {
    "use strict";
    var key, text;
    this.game_state.hud.dialogue.hide_dialogue_onclick();
    
//    this.game_state.groups.quests.forEach(function(quest) {
//        console.log(quest);
//        console.log(this.dialogue_name);
//        if (quest.owner === this.p_id) {
//            console.log("Quest owner: " + quest.owner);
//            this.quest = quest;
//        }
//    }, this);
    
    if (typeof (this.quest.state) !== 'undefined') {
        if (this.quest.state === "pre") {
            text = this.quest.properties.quest_text;
            this.show_dialogue(text, ["assign"]);
            this.game_state.prefabs[this.dialogue_name].show_bubble(3); // ! exclamation mark - quest ready
        } else {
            if (this.quest.state === "ass") {
                this.show_dialogue("Tento  úkol není dosud dokončen!");
                this.game_state.prefabs[this.dialogue_name].show_bubble(4); // ! exclamation mark - quest assigned
            } else {
                if (this.quest.state === "acc") {
                    this.show_dialogue("Výborně! Tady máte odměnu!", [], "item");
                    this.game_state.prefabs.player.finish_quest(this.quest);
                    this.game_state.prefabs[this.dialogue_name].hide_bubble();
                }
            }
        }

    } else {
        this.show_dialogue("Žádný úkol nemám!");
    } 
};

Mst.Ren.prototype.option_assign = function (option) {
    "use strict";
    var update_quest;
//    this.quest.assigned.push({name: this.game_state.prefabs.player.name,
//                              region: this.game_state.prefabs.player.region
//                             });
//    this.quest.save.properties.assigned = this.quest.assigned;
    
    this.game_state.prefabs.player.assign_quest(this.quest);
    
    this.game_state.hud.dialogue.hide_dialogue_onclick();
    
    this.game_state.prefabs[this.dialogue_name].show_bubble(4); // ! exclamation mark - quest assigned
    
//    update_quest = this.game_state.prefabs.player.update_quest("by_quest_name",this.quest.name);
//    if (update_quest.accomplished) {
//        this.game_state.hud.alert.show_alert("Podmínky úkolu jsou splněny!");
//    }
};

Mst.Ren.prototype.option_speak = function () {
    "use strict";
    
    this.game_state.hud.dialogue.hide_dialogue_onclick();
    var player = this.game_state.prefabs.player;
    
    var game = this.game_state.game;
    Phaser.Device.whenReady(function () {
        game.plugins.add(PhaserInput.Plugin);
    });
    
    this.img_speak = game.add.sprite(20, 310, 'alt_160_20');

    this.inp_speak = game.add.inputField(22, 304, {
            font: '12px Verdana',
            fill: '#444444',
            fillAlpha: 0,
            fontWeight: 'bold',
            width: 150,
            max: 20,
            padding: 8,
            borderWidth: 1,
            borderColor: '#000',
            borderRadius: 6,
            placeHolder: 'Speak',
            textAlign: 'left',
            zoom: true
    });
    
    //this.inp_speak.blockInput = false;
    
    player.speak_b = true;
    player.speak_ren = this;
};

Mst.Ren.prototype.option_lodging = function () {
    "use strict";
    var index_gold, cost, constitution, player;
    
    cost = 10;
    player = this.game_state.prefabs.player;
    constitution = parseInt(player.stats.abilities.constitution)/2 + 50;
    if (constitution < 100) {constitution = 100;}
    
    // ------------------------------------- test player gold --------------------------------------

    index_gold = this.game_state.prefabs.items.test_player_gold(cost);

    console.log("Index gold:" + index_gold);

    if (index_gold != -1 && player.stats.moon > 0) {

        // ------------------------------------- Player - gold ---------------------------------------

        player.subtract_item(index_gold, cost);
        
        player.add_health(constitution);
        player.subtract_stress(constitution);
        this.game_state.prefabs.moon.subtract_moon();
        this.game_state.save_data({ "x": 503, "y": 512 }, 12, "lodging");

    } else {
        // Na to nemas
    }
};

Mst.Ren.prototype.show = function () {
    "use strict";
    this.visible = true;  
};

Mst.Ren.prototype.hide = function () {
    "use strict";
    this.visible = false;    
    this.game_state.prefabs.player.opened_ren = "";    
    this.hide_options();
};