Mst.FactoryItems = class extends Mst.FactoryHud {
    constructor(group, name) {
        super(group, name);
    }

    _template() {
        return new MHArrayItemSprite(this.group, this.id, this.position, this._properties.texture, this._properties.frame);
    }

    get new_position() {
        if (this.name === "chestitems") {
            const stats_spacing_y = Math.floor(this.id/12) * this._spacing.x;
            const new_stats_length = this.id % 12;
            return {
                x: this._position_template.x + (new_stats_length * this._spacing.x),
                y: this._position_template.y + stats_spacing_y
            };
        }
        return super.new_position;
    }
};

Mst.GroupItems = class extends Mst.GroupHud {
    constructor(name, arr) {
        super(name, arr);
    }
    
    _template_factory() {
        return new Mst.FactoryItems(this, this.name);
    }
};


Mst.ShowItems = class extends Mst.ShowStat {
    constructor(name, position, properties) {
        super(name, position, properties);
        this.visible = false;
        this.showed = false;
        this.stats_spacing = properties.stats_spacing;
        this.prefab_frame = 0;

        // it is necessary to save the initial position because we need it to create the stat sprites
        this.initial_position = new Mst.Position(this);
        console.log("show items position", this.name, position, this.initial_position);

        this.group = new Mst.GroupItems();

        if (this.prefab_name === "player") {
            this.put_type = "equip";
            this.group = new Mst.GroupItems("items", Mst.mPlayer.items);
        } else {
            this.put_type = "put";
            this.group = new Mst.GroupItems("chestitems");
        }
        this.group.init_factory("item", this.initial_position, properties);
        if (Mst.groups[this.stats_group]) Mst.groups[this.stats_group].destroy();
        Mst.groups[this.stats_group] = this.group;

    }
};

Mst.ShowItems.prototype.show_initial_stats = function () {
    "use strict";

    // show initial stats
    console.log("show initial stats");

    const cPlayer = Mst.cPlayer;
    const mPlayer = Mst.mPlayer;
    
    this.stat = "";
    this.prefab_frame = 0;
    
    console.log(this.prefab_name);
    if (this.prefab_name !== "player") {
        this.prefab_name = "";
        if (cPlayer.chest.opened) {
            this.prefab = cPlayer.chest.opened;
            this.cprefab = cPlayer.chest.opened.cChest;
            this.cprefab.items.init_view(this);
            this.group.arr = this.cprefab.items;
            this.prefab_name = cPlayer.chest.opened.name;
            this.prefab_frame = cPlayer.chest.opened.mChest.closed_frame;
        }
    } else {
        this.prefab = Mst.player;
        this.cprefab = Mst.cPlayer;
        cPlayer.items.init_view(this);
        if(!this.frame_bot) {
            this.frame_bot = new MHFrameBot(this, this.initial_position);
            this.frame_bot.init(Mst.groups.hud, Mst.hud);
        }
        this.frame_bot.show(this.put_type);
        console.log(this);
    }
    
    if (this.prefab_name !== "") this.stat = this.prefab.stats.items;
    
    console.log("Init " + this.prefab_name + ": " + this.stat, this.cprefab);
    
    if (this.stat !== "") {
        this.stat_splited = this.stat.split("_");
        
        for (const item of this.cprefab.items) {
            const stat = this.group.get_next();
            stat.init(this, item, this.prefab_frame);
            console.log(stat);
            item.view = stat;
        }
        this.showed = true;
    } else {
        this.stat_splited = [];
    }
    const itms = this.cprefab ? this.cprefab.items : null;
    console.log("show initial stats fin", this.name, itms, this.group, this);
};

Mst.ShowItems.prototype.reset = function (position_x, position_y) {
    "use strict";
    
    console.log("Reset " + this.prefab_name + ": " + this.stat);
    
    Phaser.Sprite.prototype.reset.call(this, position_x, position_y);
    // it is necessary to save the initial position because we need it to create the stat sprites
    this.initial_position = new Mst.Position(this);
    console.log("show items position reset", this.name, position_x, position_y, this.initial_position);
    this.group.factory.init_position(this.initial_position);
    this.show_initial_stats();
    this.visible = false;
};

Mst.ShowItems.prototype.kill_stats = function () {
    "use strict";
    console.log("Kill Stats", this.name, this.group, this.prefab);
    if (this.prefab) {
        this.prefab.stats.items = this.cprefab.items.save();
        if (this.prefab_name !== "player") {
            const frame = this.prefab.frame;
            this.prefab.updated(frame);
        }
    }
    this.group.reset();
    
    Mst.hud.alt.hide();
    if (this.prefab_name === "player" && this.frame_bot) this.frame_bot.hide();
    this.showed = false;
};

Mst.ShowItems.prototype.set_put_type = function (put_type) {
    "use strict";
    this.put_type = put_type;
    if(this.frame_bot) this.frame_bot.put_type = put_type;
};

