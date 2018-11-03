var Phaser = Phaser || {};
var Mst = Mst || {};

var game = new Phaser.Game(550, 400, Phaser.CANVAS);
game.state.add("BootState", new Mst.BootState());
game.state.add("LoadingState", new Mst.LoadingState());
game.state.add("GameState", new Mst.TiledState());
game.state.start("BootState", true, false, 1, 0);