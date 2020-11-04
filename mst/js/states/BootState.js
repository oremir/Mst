var Phaser = Phaser || {};
var Mst = Mst || {};

Mst.BootState = function () {
	"use strict";
	Phaser.State.call(this);
};

Mst.prototype = Object.create(Phaser.State.prototype);
Mst.prototype.constructor = Mst.BootState;

Mst.BootState.prototype.init = function (map_int, usr_id) {
	"use strict";
    
	var d = new Date();
	var n = d.getTime(); 
    
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
		var a = this.load.image("login", "assets/images/loader2.png");
        //console.log(a);
	}
};

Mst.BootState.prototype.create = function () {
	"use strict";
	var map_text, map_data, core_text, core_data, root_data, quest_text, quest_data;

	if (this.usr_id > 0) {
		map_text = this.game.cache.getText("map");
        var n = map_text.lastIndexOf(">");
        if (n > -1) {
            map_text = map_text.substring(n + 1);
        }
        
        //console.log(map_text);
		map_data = JSON.parse(map_text);
		console.log(map_data);

		core_text = this.game.cache.getText("core");
		core_data = JSON.parse(core_text);
        quest_text = this.game.cache.getText("quest");
		quest_data = JSON.parse(quest_text);
        console.log(quest_data);
	}
    
	root_data = { map_int: this.map_int, usr_id: this.usr_id };
    
	console.log("Boot State");
	console.log(root_data);

	this.game.state.start("LoadingState", true, false, core_data, map_data, root_data, quest_data);
};