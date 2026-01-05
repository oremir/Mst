Mst.ShowStat = class extends Phaser.Sprite {
    constructor(name, position, properties) {
        super(Mst.game, position.x, position.y, properties.texture);
        this.name = name;
        this.prefab_name = properties.stat_to_show.split(".")[0];
        this.stat_name = properties.stat_to_show.split(".")[1];
        this.stats_group = properties.stats_group;
        this.group = Mst.groups[this.stats_group];
        this.group.add(this);
        this.init();
    }
    
    init() {
        this.prefab = this.prefab_name === 'player' ? Mst.player: null;
        if (this.prefab) this.stat = this.prefab.stats[this.stat_name];
    }
    
    update() {
        if (this.prefab) {
            const new_stat = this.prefab.stats[this.stat_name];
            // check if the stat has changed
            if (this.stat !== new_stat) this.update_stat(new_stat); // update the stat with the new value
        }
    }

    update_stat(new_stat) {
        this.stat = new_stat;
    }
};
