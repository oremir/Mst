const Mst = {};

Mst.BootState = function () {
	"use strict";
	Phaser.State.call(this);
};

Mst.prototype = Object.create(Phaser.State.prototype);
Mst.prototype.constructor = Mst.BootState;

Mst.BootState.prototype.init = function (map_int, usr_id) {
	"use strict";
    
	const d = new Date();
	const n = d.getTime(); 
    
	this.core_file = "assets/maps/core.json";
    this.quest_file = "assets/maps/quest.json";
	this.map_int = map_int;
	this.map_file = "map.php?time="+n+"&uid="+usr_id+"&mapi="+map_int; 
    //this.map_file = "assets/maps/map"+map_int+".json?time="+n+"&uid="+usr_id+"&mapi="+map_int; 
	console.log(this.map_file);
	this.usr_id = usr_id;
};

Mst.BootState.prototype.preload = function () {
	"use strict";
    
	if (this.usr_id > 0) {
		this.load.text("core", this.core_file);
        this.load.text("quest", this.quest_file);
		this.load.text("map", this.map_file);
	} else {
		const a = this.load.image("login", "assets/images/loader2.png");
        //console.log(a);
	}
};

Mst.BootState.prototype.create = function () {
	"use strict";
	const gdata = {};

	if (this.usr_id > 0) {
		let map_text = this.game.cache.getText("map");
        const n = map_text.lastIndexOf(">");
        if (n > -1) {
            map_text = map_text.substring(n + 1);
        }
        
        //console.log(map_text);
		gdata.map = JSON.parse(map_text);
		console.log(gdata.map);

		const core_text = this.game.cache.getText("core");
		gdata.core = JSON.parse(core_text);
        const quest_text = this.game.cache.getText("quest");
		gdata.quest = JSON.parse(quest_text);
        console.log(gdata.quest);
	}
    
	gdata.root = { map_int: this.map_int, usr_id: this.usr_id };
    
	console.log("Boot State");
	console.log(gdata.root);

	this.game.state.start("LoadingState", true, false, gdata);
};
