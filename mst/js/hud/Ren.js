var Mst = Mst || {};

Mst.Ren = function (game_state, name, position, properties) {
    "use strict";
    Mst.Prefab.call(this, game_state, name, position, properties);
    
    this.fixedToCamera = true;
    
    console.log("Ren: " + this.x + " " + this.y);
    
    this.p_name = properties.p_name;
    this.dialogue_name = properties.dialogue_name;
    this.p_id = properties.p_id;
    this.options = [];
    this.quest = {};
    this.all_quests = {};
    this.b_speak = false;
    
};

Mst.Ren.prototype = Object.create(Mst.Prefab.prototype);
Mst.Ren.prototype.constructor = Mst.Ren;

Mst.Ren.prototype.update = function () {
    "use strict";
    
    if (typeof(this.inp_speak) !== 'undefined') {
        if (this.inp_speak.value !== "") {
            //console.log(player.speak_b);
            if (!this.inp_speak.focus && this.speak_b) {
                console.log("FocusOut");
                this.option_speak_enter();
            }
//            if (this.inp_speak.value !== this.inp_speak_value) {
//                this.inp_speak_value = this.inp_speak.value;
//                console.log(this.inp_speak_value);
//            }
        }
    }
    
};

Mst.Ren.prototype.show_dialogue = function (text, options, type, heart) {
    "use strict";
    
    var okay = false;
    var player = this.game_state.prefabs.player;
    
    //console.log(player);
    
    if (!this.visible && player.opened_ren === "" && !player.infight) {
        player.set_opened_ren(this.name);
        this.show();

        this.game_state.hud.dialogue.show_dialogue(this.dialogue_name, this.p_name, text, type, heart);

        this.quest.showed = true;

        if (typeof(options) !== 'undefined') {
            this.show_options(options);
        }
        
        okay = true;
    } 
    
    return okay;
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
            case "mer_admin":
                text.text = "[správa]";
                text.events.onInputDown.add(this.mer_admin, this);
                break;
            case "quest":
                text.text = "[úkol]";
                text.events.onInputDown.add(this.option_quest, this);
                break;
            case "assign":
                text.text = "[přijmout]";
                text.events.onInputDown.add(this.option_assign, this);
                break;
            case "repeat":
                text.text = "[zopakovat]";
                text.events.onInputDown.add(this.option_repeat, this);
                break;
            case "speak":
                text.text = "[mluvit]";
                text.events.onInputDown.add(this.option_speak, this);
                break;
            case "rumour":
                text.text = "[fáma]";
                text.events.onInputDown.add(this.option_rumour, this);
                break;
            case "lodging":
                text.text = "[přespat]";
                text.events.onInputDown.add(this.option_lodging, this);
                break;
            case "give":
                text.text = "[dát]";
                text.events.onInputDown.add(this.option_give, this);
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
        this.game_state.prefabs.businessitems.set_put_type("sell");
        this.game_state.prefabs.items.set_put_type("sell");
        option.text = "[koupit]";
    } else {
        this.game_state.prefabs.businessitems.set_put_type("buy");
        this.game_state.prefabs.items.set_put_type("buy");
        option.text = "[prodat]";
    }
};

Mst.Ren.prototype.mer_admin = function (option) {
    "use strict";

        this.game_state.prefabs.businessitems.set_put_type("mer_admin");
        this.game_state.prefabs.items.set_put_type("mer_admin");
        option.text = "[správa]";
};

Mst.Ren.prototype.option_quest = function (option) {
    "use strict";
    var key, text;
    console.log(this.game_state.prefabs.player.opened_ren);
    console.log(this.quest);
    if (this.game_state.prefabs.player.opened_ren !== '') {
        this.game_state.hud.dialogue.hide_dialogue_onclick(1);
    }
    
//    this.game_state.groups.quests.forEach(function(quest) {
//        console.log(quest);
//        console.log(this.dialogue_name);
//        if (quest.owner === this.p_id) {
//            console.log("Quest owner: " + quest.owner);
//            this.quest = quest;
//        }
//    }, this);
    
    this.quest.close = "close";
    
    if (typeof (this.quest.state) !== 'undefined') {
        if (this.quest.state === "pre") {
            text = this.quest.properties.quest_text;
            console.log("\x1b[102mQuest Pre dialogue: " + this.quest.name);
            if (this.quest.properties.ending_conditions.type !== 'text') {
                this.quest.close = "close";
                this.show_dialogue(text, ["assign"]);
            } else {
                this.quest.close = "";
                this.show_dialogue(text, []);
            }            
            this.game_state.prefabs[this.dialogue_name].show_bubble(3); // ! exclamation mark - quest ready
        } else {
            if (this.quest.state === "ass") {
                this.show_dialogue("Tento  úkol není dosud dokončen!", ["repeat"]);
                if (typeof(this.quest.properties.target) === 'undefined') {
                    this.game_state.prefabs[this.dialogue_name].show_bubble(4); // ! exclamation mark - quest assigned
                }
            } else {
                if (this.quest.state === "acc") {
                    this.show_dialogue("Výborně! Tady máte odměnu!", [], "item");
                    console.log("\x1b[102mQuest Fin dialogue: Výborně! Tady máte odměnu! " + this.quest.name);
                    this.quest.state = "fin";
                    this.game_state.prefabs.player.finish_quest(this.quest);
                    this.game_state.prefabs[this.dialogue_name].hide_bubble(0);
                    if (typeof(this.quest.properties.nextq) === 'undefined') {
                        this.quest = {};
                        console.log("Ren - Test Quest");
                        this.game_state.prefabs[this.dialogue_name].test_quest();
                    }
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
    this.quest.ow_name = this.dialogue_name;
    
    this.game_state.prefabs.player.assign_quest(this.quest);
    
    this.game_state.hud.dialogue.hide_dialogue_onclick();
    
    console.log(this.quest);
    if (typeof(this.quest.properties.target) === 'undefined') {
      this.game_state.prefabs[this.dialogue_name].show_bubble(4); // ! exclamation mark - quest assigned
    }
    
//    update_quest = this.game_state.prefabs.player.update_quest("by_quest_name",this.quest.name);
//    if (update_quest.accomplished) {
//        this.game_state.hud.alert.show_alert("Podmínky úkolu jsou splněny!");
//    }
};

Mst.Ren.prototype.option_repeat = function (option) {
    "use strict";
    console.log("Repeat quest");
    this.game_state.hud.dialogue.hide_dialogue_onclick(1);
    
    if (this.quest.state === "ass") {
        var text = this.quest.properties.quest_text;
        this.show_dialogue(text);
        if (typeof(this.quest.properties.target) === 'undefined') {
            this.game_state.prefabs[this.dialogue_name].show_bubble(4); // ! exclamation mark - quest assigned
        }
    }
};

Mst.Ren.prototype.option_rumour = function (option) {
    "use strict";
    console.log("Rumour");
    this.game_state.hud.dialogue.hide_dialogue_onclick(1);
    
    var rumour = this.game_state.prefabs[this.dialogue_name].rumour;
    
    if (typeof(rumour.text) !== 'undefined') {
        this.show_dialogue(rumour.text);
    }
};

Mst.Ren.prototype.option_speak = function () {
    "use strict";
    
    console.log("Speak");
    this.game_state.hud.dialogue.hide_dialogue_onclick(1);
    var player = this.game_state.prefabs.player;
    
    var game = this.game_state.game;
    Phaser.Device.whenReady(function () {
        game.plugins.add(PhaserInput.Plugin);
    });
    
    this.img_speak = game.add.sprite(20, 310, 'alt_500_20');
    this.img_speak.fixedToCamera = true;

    this.inp_speak = game.add.inputField(22, 304, {
            font: '12px Verdana',
            fill: '#FFFFFF',
            fillAlpha: 0,
            fontWeight: 'bold',
            width: 450,
            max: 80,
            padding: 8,
            borderWidth: 1,
            borderColor: '#000',
            borderRadius: 6,
            placeHolder: 'Speak',
            textAlign: 'left',
            zoom: true
    });
    
    this.inp_speak.fixedToCamera = true;
    //this.inp_speak.focusOutOnEnter = false;
    
    this.inp_speak_value = "";
    
    
    
    
    //this.inp_speak.blockInput = false;
    
    this.speak_b = true;
    player.speak_ren = this;
    this.inp_speak.startFocus();
    
    //this.inp_speak.keys = this.game_state.game.input.keyboard.addKeys({
    //    'enter': Phaser.Keyboard.ENTER
    //});
    
    //this.inp_speak.keys.enter.onDown.add(this.option_speak_enter, this);
    

    //this.inp_speak.events.onInputDown.add(this.option_speak_enter, this);
    console.log(player.speak_ren);
};

Mst.Ren.prototype.option_speak_enter = function () {
    "use strict";
    var pins;
    var player = this.game_state.prefabs.player;    
    console.log("Input down");
    
    if (this.inp_speak.value !== "" && this.speak_b) {
        this.speak_b = false;
        
        pins = this.p_id + "|" + player.usr_id + "|0|1|" + this.inp_speak.value;
        console.log(pins);

        $.get( "broadcast.php", { ins: pins} )
            .done(function( data ) {
                console.log( "Data Loaded: " + data );
        });

        this.img_speak.kill();
        this.inp_speak.kill();
        player.speak_ren = {};
    }


};

Mst.Ren.prototype.option_speak_close = function () {
    "use strict";
    console.log("Input close");
    
    if (this.inp_speak.value === "" && this.speak_b) {


        this.img_speak.kill();
        this.inp_speak.kill();
    }


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
        player.new_day();
        this.game_state.prefabs.moon.subtract_moon();
        this.game_state.save_data({ "x": 503, "y": 512 }, 12, "lodging");

    } else {
        // Na to nemas
    }
};

Mst.Ren.prototype.option_give = function () {
    "use strict";
    
    var player = this.game_state.prefabs.player;
    
    if (player.opened_chest === "") {
        var position = { x: player.x, y: player.y };
        var properties = {
            group: "shadows",
            pool: "shadows",
            stype: "shadow",
            items: "",
            closed_frame: 41,
            opened_frame: 41,        
            texture: "blank_image"
        };

        player.shadow = new Mst.Chest(this.game_state, "cpgive", position, properties);
        player.opened_chest = "cpgive";
        player.shadow.open_chest(player, player.shadow);
    }
};

Mst.Ren.prototype.show = function () {
    "use strict";
    this.visible = true;  
};

Mst.Ren.prototype.hide = function () {
    "use strict";
    this.visible = false;    
    this.game_state.prefabs.player.set_opened_ren("");
    this.hide_options();
};