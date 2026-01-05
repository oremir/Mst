Mst.Spawner = class extends Mst.Prefab {
    constructor(name, position, properties) {
        properties.texture = "blank_image";
        super(name, position, properties);

        this.group_name = properties.group;
        this.pool = Mst.groups[properties.pool];
        
        this.dif = {
            x: parseInt(properties.xdif)*16,
            y: parseInt(properties.ydif)*16
        };
    }    
    
    activate() {
        this.spawn();
    }
    
    spawn() {
        if (this.pool.spawn_check) {
            this.pool.spawn_new();
            this.spawn();
        }
    }
};
