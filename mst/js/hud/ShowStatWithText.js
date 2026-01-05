Mst.ShowStatWithText = class extends Mst.ShowStat {
    constructor(name, position, properties) {
        super(name, position, properties);
        this.text_style = properties.text_style;
        this.stats_group = properties.stats_group;

        this.stats = { settings: 1 };
    }

    reset(position_x, position_y) {
        console.log("Reset " + this.name);
        super.reset(position_x, position_y);
        // create the text to show the stat value
        this.text = new Phaser.Text(Mst.game, this.x + this.width, this.y - 2, "", this.text_style);
        this.text.fixedToCamera = true;
        this.text.text = this.prefab.stats[this.stat_name];
        this.group.add(this.text);

        if (this.stat_name === 'gtime') {
            this.text1 = new Phaser.Text(Mst.game, this.x + this.width, this.y + 9, "", this.text_style);
            this.text1.fixedToCamera = true;
            this.text1.text = " " + Mst.mPlayer.gtime.day;
            this.group.add(this.text1);
        }
        console.log(this);
    }

    update_stat(new_stat) {
        super.update_stat(new_stat);
        // update the text to show the new stat value
        this.text.text = this.stat;
    }
};
