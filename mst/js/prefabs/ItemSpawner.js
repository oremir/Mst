Mst.ItemSpawner = class extends Mst.Spawner {
    constructor(name, position, properties) {
        properties.texture = "blank_image";
        super(name, position, properties);

        this.etype = "item";
        this.stype = properties.stype;
        
        this.pool = Mst.groups.chests;
        this.pool.spawner = this;
        this.pool.spawn_max = properties.max_number;
    }

    activate() {
        Mst.init_itemSpawner(this);
        this.pool.init_spawn();
        this.spawn();
    }

    spawn() {
        console.log("Spawn Item:", this.pool.spawn_check);
        if (this.pool.spawn_check) {
            this.pool.spawn_new_chest();
            this.spawn();
        }
    }
};