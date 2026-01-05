const Mst = {
	_game_state: null,
	_game: null,
	_mgame: null,
	_gdata: null,
	_map: null,
	_groups: null,
	_prefabs: null,
	_layers: null,
	_hud: null,
	_gtimeweek: null,
	_player: null,
    _workItems: null,
	_itemSpawner: null,
	init: function (game_state) {
		this._game_state = game_state;
	},
	init_game: function (game) {
		this._game = game;
		console.log(this);
	},
	init_mgame: function (game) {
		this._mgame = game;
		console.log(this);
	},
	init_gdata: function (gdata) {
		this._gdata = gdata;
		console.log(this);
	},
	init_map: function (map) {
		this._map = map;
		console.log(this);
	},
	init_groups: function (groups) {
		this._groups = groups;
		console.log(this);
	},
	init_prefabs: function (prefabs) {
		this._prefabs = prefabs;
		console.log(this);
	},
	init_layers: function (layers) {
		this._layers = layers;
		console.log(this);
	},
	init_hud: function (hud) {
		this._hud = hud;
		console.log(this);
	},
	init_gtimeweek: function (gtw) {
		this._gtimeweek = gtw;
	},
	init_player: function (player) {
		this._player = player;
	},
    init_workItems: function (wi) {
		this._workItems = wi;
	},
	init_itemSpawner: function (is) {
		this._itemSpawner = is;
	},
	check_init: function (o, type) {
		if (!o) {
			console.log("Error", this);
			throw new Error("Not initialized Mst " + type);
		}
		return true;
	},
	get mGame () {
		if (this.check_init(this._mgame, "MGame")) return this._mgame;
	},
	get cGame () {
		if (this.check_init(this._game_state, "GameState")) return this._game_state.cGame;
	},
	get map () {
		if (this.check_init(this._map, "Map")) return this._map;
	},
	get tileHeight () {
		if (this.check_init(this._game_state, "GameState")) return this._game_state.map.tileHeight;
	},
	get night () {
		if (this.check_init(this._game_state, "GameState")) return this._game_state.night;
	},
	get game () {
		if (this.check_init(this._game, "Game")) return this._game;
	},
	get groups () {
		if (this.check_init(this._groups, "Groups")) return this._groups;
	},
	get prefabs () {
		if (this.check_init(this._prefabs, "Prefabs")) return this._prefabs;
	},
	get layers () {
		if (this.check_init(this._layers, "Layers")) return this._layers;
	},
	get hud () {
		if (this.check_init(this._hud, "Hud")) return this._hud;
	},
	get gtimeweek () {
		if (this.check_init(this._gtimeweek, "GTimeWeek")) return this._gtimeweek;
	},
	get player() {
		if (this.check_init(this._player, "Player")) return this._player;
	},
	get cPlayer() {
		if (this.check_init(this._player, "cPlayer")) return this._player.cPlayer;
	},
	get mPlayer() {
		if (this.check_init(this._player, "mPlayer")) return this._player.mPlayer;
	},
    get workItems () {
		if (this.check_init(this._workItems, "WorkItems")) return this._workItems;
	},
	get usr_id() {
		if (this.check_init(this._gdata, "GData")) return this._gdata.root.usr_id;
	},
	get map_int() {
		if (this.check_init(this._gdata, "GData")) return this._gdata.root.map_int;
	},
	get logged() {
		if (this.check_init(this._gdata, "GData")) return this._gdata.root.usr_id > 0;
	},
	get core() {
		if (this.check_init(this._gdata, "GData")) return this._gdata.core;
	},
	get items() {
		if (this.check_init(this._gdata, "GData")) return this._gdata.core.items;
	},
	get creatures() {
		if (this.check_init(this._gdata, "GData")) return this._gdata.core.creatures;
	},
	get quest() {
		if (this.check_init(this._gdata, "GData")) return this._gdata.quest;
	},
	get itemSpawner() {
		if (this.check_init(this._itemSpawner, "ItemSpawner")) return this._itemSpawner;
	},
	get time() {
		const d = new Date();
        return d.getTime();
	},
	get load_mst() {
		const load_mst = JSON.parse(localStorage.getItem("mst"));
		console.log(load_mst);
		if (load_mst) {
			if (load_mst.login) {
				return {
					map_int: parseInt(load_mst.map),
					usr_id: parseInt(load_mst.usr_id)
				};
			}
		}
		return null;
	},
	save_mst: function (usr_id, map, login) {
        const mst_inst = {
            "usr_id": usr_id,
            "map": map,
            "login": login
        };
		localStorage.setItem("mst", JSON.stringify(mst_inst));
	},
	create_object: function (obj) {
		if (this.check_init(this._game_state, "GameState")) return this._game_state.create_object(obj);
	},
	rnd: function(a, b) {
		return this.game.rnd.between(a, b);
	},
	pointDistance: (a, b) => {
		const x = Math.pow(a.x - b.x, 2);
        const y = Math.pow(a.y - b.y, 2);
        return Math.sqrt(x + y);
	},
	parseInt: (val) => {
        if (!val) return 0;
        const ival = parseInt(val);
        return !isNaN(ival) ? ival : 0;
	},
	parseIntNull: function (val) {
		if (!val) return null;
		return this.parseInt(val);
	},
	parseBool: (val) => {
		if (typeof val === "boolean") return val;
		if (!val) return null;
		if (typeof val === "string") return val === "true";
		return Boolean(val);
	},
	chekUndefined: (...vals) => {
		let bt = false;
		for (let i in vals) {
			if (i === 0) continue;
			if (!vals[i]) {
				console.log("Check Undefined", i, vals[i]);
				bt = true;
			}
		}
		if (bt) console.log("Check Undefined Main", vals[0]);
	}
};

Mst.Position = class extends Phaser.Point {
	constructor(x, y) {
		const nx = y ? x : x.x;
		const ny = y ? y : x.y;
		super(nx, ny);
	}

	add(x, y) {
		const nx = y ? x : x.x;
		const ny = y ? y : x.y;
		this.x += nx;
		this.y += ny;
	}

	sub(x, y) {
		const nx = y ? x : x.x;
		const ny = y ? y : x.y;
		this.x -= nx;
		this.y -= ny;
	}
};

Mst.RndPosition = class extends Mst.Position {
	constructor(a, dif) {
		super(a);
		this.x = Mst.rnd(-dif.x, dif.x) + this.x;
		this.y = Mst.rnd(-dif.y, dif.y) + this.y;
	}
};

Mst.Emitter = class {
	constructor() {
		this._emitter = Mst.game.add.emitter(0, 0, 100);
		this._emitter.makeParticles('blood', [0,1,2,3,4,5,6]);
        this._emitter.gravity = 120;
        this._emitter.setAlpha(1, 0, 400);
	}

	start(position) {
		this._emitter.x = position.x;
		this._emitter.y = position.y;
		this._emitter.start(true, 1000, null, 8);
	}
};

Mst.Model = {};
