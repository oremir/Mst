var Mst = Mst || {};

Mst.Ren = function (game_state, name, position, properties) {
    "use strict";
    Mst.Prefab.call(this, game_state, name, position, properties);
    
    this.fixedToCamera = true;
    
    console.log("Ren: " + this.x + " " + this.y)
    
    this.p_name = properties.p_name;
    this.dialogue_name = properties.dialogue_name;
    this.options = [];
    
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
        text = this.game_state.game.add.text(x, y + (30 * key), "", text_style);
        text.fixedToCamera = true;
        text.inputEnabled = true;
        text.input.useHandCursor = true;        
        
        switch (options[key]) {
            case "buy_sell":
                text.text = "[prodat]";
                text.events.onInputDown.add(this.buy_sell, this);
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

Mst.Ren.prototype.show = function () {
    "use strict";
    this.visible = true;  
};

Mst.Ren.prototype.hide = function () {
    "use strict";
    this.visible = false;
    
    this.hide_options();
};