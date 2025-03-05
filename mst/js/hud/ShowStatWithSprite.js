Mst.ShowStatWithSprite = function (game_state, name, position, properties) {
    "use strict";
    var text, text_style;
    
    Mst.ShowStat.call(this, game_state, name, position, properties);
    this.visible = false;
    this.stats = [];
    this.stats_spacing = properties.stats_spacing;
    this.stats_group = properties.stats_group;
    // it is necessary to save the initial position because we need it to create the stat sprites
    this.initial_position = new Phaser.Point(this.x, this.y);
    
    this.window_opened = false;
    this.texts = [];
    this.stat_type = "";
    
    text_style = {"font": "11px Arial", "fill": "#FFFFFF"};
    switch (name) {
        case "health": 
            text = this.game_state.prefabs.player.stats.health + "/" + this.game_state.prefabs.player.stats.health_max;
            text += " S:" + this.game_state.prefabs.player.stats.stress;
            this.text_health = this.game_state.game.add.text(this.x + 3, this.y + 13, text, text_style);
            this.text_health.fixedToCamera = true;
            
            this.right_arrow = this.game_state.mGame.groups[this.stats_group].create(460, 67, 'arrow_right');
            this.right_arrow.fixedToCamera = true;
            this.right_arrow.inputEnabled = true;
            this.right_arrow.input.useHandCursor = true;
            this.right_arrow.events.onInputDown.add(this.change_stat, this);
            this.right_arrow.visible = false;
            break;
        case "moon": 
            text = this.game_state.prefabs.player.stats.moon + "/" + this.game_state.prefabs.player.stats.moon_max;
            
            this.text_moon = this.game_state.game.add.text(this.x + 3, this.y + 19, text, text_style);
            this.text_moon.fixedToCamera = true;           
            break;
    }
};

Mst.ShowStatWithSprite.prototype = Object.create(Mst.ShowStat.prototype);
Mst.ShowStatWithSprite.prototype.constructor = Mst.ShowStatWithSprite;

Mst.ShowStatWithSprite.prototype.show_initial_stats = function () {
    "use strict";
    var prefab_name, stat_name, initial_stat, stat_index, stat;
    // show initial stats
    prefab_name = this.stat_to_show.split(".")[0];
    stat_name = this.stat_to_show.split(".")[1];
    initial_stat = this.game_state.prefabs[prefab_name].stats[stat_name];
    for (stat_index = 0; stat_index < initial_stat; stat_index += 1) {
        // create new sprite to show stat
        stat = this.create_new_stat_sprite();
        this.stats.push(stat);
    }
    this.stat = initial_stat;
};

Mst.ShowStatWithSprite.prototype.reset = function (position_x, position_y) {
    "use strict";
    console.log("Reset " + this.name);
    Phaser.Sprite.prototype.reset.call(this, position_x, position_y);
    // it is necessary to save the initial position because we need it to create the stat sprites
    this.initial_position = new Phaser.Point(this.x, this.y);
    this.show_initial_stats();
    this.visible = false;
    
    switch (this.name) {
        case "health": 
            this.text_health.fixedToCamera = false;
            this.text_health.x = position_x + 3;
            this.text_health.y = position_y + 13;
            this.text_health.fixedToCamera = true;
            break;
        case "moon": 
            this.text_moon.fixedToCamera = false;
            this.text_moon.x = position_x + 3;
            this.text_moon.y = position_y + 19;
            this.text_moon.fixedToCamera = true;
            break;
    }
};

Mst.ShowStatWithSprite.prototype.update_stat = function (new_stat) {
    "use strict";
    var stat_difference, stat_index, stat;
    stat_difference = Math.abs(new_stat - this.stat);
    if (new_stat > this.stat) {
        // if the new stat is greater, we must create new stat sprites
        for (stat_index = 0; stat_index < stat_difference; stat_index += 1) {
            stat = this.create_new_stat_sprite();
            this.stats.push(stat);
        }
    } else {
        // if the new stat is lower, we must kill extra stat sprites
        for (stat_index = 0; stat_index < stat_difference; stat_index += 1) {
            stat = this.stats.pop();
            if (stat) stat.kill();
        }
    }
    Mst.ShowStat.prototype.update_stat.call(this, new_stat);
};

Mst.ShowStatWithSprite.prototype.create_new_stat_sprite = function () {
    "use strict";
    var stat_position, stat, stat_property;
    // calculate the next stat position
    stat_position = new Phaser.Point(this.initial_position.x + (this.stats.length * this.stats_spacing.x),
                                          this.initial_position.y + (this.stats.length * this.stats_spacing.y));
    // get the first dead sprite in the stats group
    stat = this.game_state.mGame.groups[this.stats_group].getFirstDead();
    if (stat) {
        // if there is a dead stat, just reset it
        stat.reset(stat_position.x, stat_position.y);
    } else {
        // if there are no dead stats, create a new one
        // stat sprite uses the same texture as the ShowStatWithSprite prefab
        stat = this.game_state.mGame.groups[this.stats_group].create(stat_position.x, stat_position.y, this.texture);
    }
    // stat scale and anchor are the same as the prefab
    stat.scale.setTo(this.scale.x, this.scale.y);
    stat.anchor.setTo(this.anchor.x, this.anchor.y);
    
    stat.inputEnabled = true;
    stat.input.useHandCursor = true;
    stat.events.onInputDown.add(this.action_onclick, this);
    
    stat.fixedToCamera = true;
    return stat;
};

Mst.ShowStatWithSprite.prototype.action_onclick = function (stat) {
    "use strict";
    if (this.window_opened) {
        this.hide_window_onclick();
    } else {
        switch (this.name) {
            case "health":
                this.show_window("Abilities", "skills", "Dovednosti:");
            break;
            case "moon":
                
            break;
            case "settings":
                this.logout();
            break;
        }        
    }
};

Mst.ShowStatWithSprite.prototype.show_window = function (type, stat_type, stat_trans) {
    "use strict";
    var key, skill, index, text, text_style, text_value;
    switch (type) {
        case "Abilities":
            this.game_state.cGame.hud.close.state.push("Abilities");
            this.game_state.cGame.hud.close.context.push(this.name);

            this.window_opened = true;
            this.game_state.mGame.hud.right_window.show("");

            text_style = {"font": "13px Arial", "fill": "#FFFFFF", tabs: 40 };

            text = this.game_state.game.add.text(293, 65, stat_trans, text_style);
            text.fixedToCamera = true;
            this.texts.push(text);
            this.stat_type = stat_type;

            this.right_arrow.visible = true;

            text_style = {"font": "12px Arial", "fill": "#FFFFFF", tabs: 40 };
            index = 0;

            switch (stat_type) {
                case "skills":
                    for (key in this.game_state.prefabs.player.stats.skills) {
                        const skill = this.game_state.prefabs.player.stats.skills[key];
                        const text_value = key + "\t exp:" + skill.exp + "\t lvl:" + skill.level;
                        text = this.game_state.game.add.text(293, 95 + 14 * index, text_value, text_style);
                        text.fixedToCamera = true;
                        this.texts.push(text);
                        index ++;
                    }
                    break;
                case "abilities":
                    for (key in this.game_state.prefabs.player.stats.abilities) {
                        text_value = key + ":\t" + this.game_state.prefabs.player.stats.abilities[key];
                        text = this.game_state.game.add.text(293, 95 + 14 * index, text_value, text_style);
                        text.fixedToCamera = true;
                        this.texts.push(text);
                        index ++;
                    }
                    
                    text_value = "sin:\t" + this.game_state.prefabs.player.stats.sin;
                    text = this.game_state.game.add.text(293, 95 + 14 * (index + 1), text_value, text_style);
                    text.fixedToCamera = true;
                    this.texts.push(text);
                    index ++;
                    break;
                case "quests":
                    for (key in this.game_state.prefabs.player.stats.quests) {
                        text_value = key + "\t" + this.game_state.prefabs.player.stats.quests[key].quest_text;
                        text = this.game_state.game.add.text(293, 95 + 14 * index, text_value, text_style); 
                        text.fixedToCamera = true;
                        this.texts.push(text);
                        index ++;
                    }
                    break;
                default:
                    for (key in this.game_state.prefabs.player.stats) {
                        text_value = key + "\t" + this.game_state.prefabs.player.stats[key];                        
                        console.log(key + ":" + typeof(this.game_state.prefabs.player.stats[key]));
                        console.log(this.game_state.prefabs.player.stats[key]);
                        if (typeof(this.game_state.prefabs.player.stats[key]) !== 'object') {
                            text = this.game_state.game.add.text(293, 95 + 14 * index, text_value, text_style);
                            text.fixedToCamera = true;
                            this.texts.push(text);
                            index ++;
                        }
                    }
                    break;
            }
            break;
    }
};

Mst.ShowStatWithSprite.prototype.change_stat = function () {
    "use strict";
    this.texts.forEach(function (text) {
        text.destroy();
    });
    this.texts = [];
    
    switch (this.stat_type) {
        case "skills":
            this.show_window("Abilities", "abilities", "Vlastnosti:");
            break;
        case "abilities":
            this.show_window("Abilities", "", "Vše");
            break;
        default:
            this.show_window("Abilities", "skills", "Dovednosti:");
            break;
    }
};

Mst.ShowStatWithSprite.prototype.hide_window_onclick = function () {
    "use strict";
    this.game_state.prefabs.player.cPlayer.close.pop();
    this.hide_window();
};

Mst.ShowStatWithSprite.prototype.hide_window = function () {
    "use strict";
    this.window_opened = false;
    this.texts.forEach(function (text) {
        text.destroy();
    });
    this.texts = [];
    this.right_arrow.visible = false;
    this.game_state.mGame.hud.right_window.hide();
};

Mst.ShowStatWithSprite.prototype.logout = function () {
    "use strict";
    this.map_int = this.game_state.gdata.root.map_int;
    this.position = {
        x: this.game_state.prefabs.player.x - 8,
        y: this.game_state.prefabs.player.y + 8
    };

    this.game_state.prefabs.player.cPlayer.set_logoff();
    this.game_state.mGame.save_data(this.position, this.map_int, "logout");
};
