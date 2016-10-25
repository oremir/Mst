var Phaser = Phaser || {};
var Engine = Engine || {};
var Mst = Mst || {};

Mst.ShowStatWithSprite = function (game_state, name, position, properties) {
    "use strict";
    Mst.ShowStat.call(this, game_state, name, position, properties);
    this.visible = false;
    this.stats = [];
    this.stats_spacing = properties.stats_spacing;
    this.stats_group = properties.stats_group;
    // it is necessary to save the initial position because we need it to create the stat sprites
    this.initial_position = new Phaser.Point(this.x, this.y);
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
    Phaser.Sprite.prototype.reset.call(this, position_x, position_y);
    // it is necessary to save the initial position because we need it to create the stat sprites
    this.initial_position = new Phaser.Point(this.x, this.y);
    this.show_initial_stats();
    this.visible = false;
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
            stat.kill();
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
    stat = this.game_state.groups[this.stats_group].getFirstDead();
    if (stat) {
        // if there is a dead stat, just reset it
        stat.reset(stat_position.x, stat_position.y);
    } else {
        // if there are no dead stats, create a new one
        // stat sprite uses the same texture as the ShowStatWithSprite prefab
        stat = this.game_state.groups[this.stats_group].create(stat_position.x, stat_position.y, this.texture);
    }
    // stat scale and anchor are the same as the prefab
    stat.scale.setTo(this.scale.x, this.scale.y);
    stat.anchor.setTo(this.anchor.x, this.anchor.y);
    stat.fixedToCamera = true;
    return stat;
};
