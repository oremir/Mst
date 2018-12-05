var Mst = Mst || {};

Mst.Ren = function (game_state, name, position, properties) {
    "use strict";
    Mst.Prefab.call(this, game_state, name, position, properties);
    
    this.fixedToCamera = true;
    
    console.log("Ren: " + this.x + " " + this.y)
    
    this.p_name = properties.p_name;
    this.dialogue_name = properties.dialogue_name;
    this.options = [];
    this.quest = {};
    
};

Mst.Ren.prototype = Object.create(Mst.Prefab.prototype);
Mst.Ren.prototype.constructor = Mst.Ren;

Mst.Ren.prototype.show_dialogue = function (text, options) {
    "use strict";
    this.show();
    
    this.game_state.hud.dialogue.show_dialogue(this.dialogue_name, this.p_name, text);
    
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
    
    this.game_state.groups.quests.forEach(function(quest) {
        console.log(quest);
        console.log(this.dialogue_name);
        if (quest.owner.name === this.dialogue_name) {
            console.log("Quest owner: " + quest.owner.name);
            this.quest = quest;
        }
    }, this);
    
    if (typeof (this.quest.quest_text) !== 'undefined') {
        text = this.quest.quest_text;
        this.show_dialogue(text, ["assign"]);
    } else {
        this.game_state.hud.alert.show_alert("Žádný úkol nemám!");
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
    
    update_quest = this.game_state.prefabs.player.update_quest("by_quest_name",this.quest.name);
    if (update_quest.accomplished) {
        this.game_state.hud.alert.show_alert("Podmínky úkolu jsou splněny!");
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