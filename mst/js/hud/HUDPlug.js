Mst.HUD = function (game, parent) {
    "use strict";
    Phaser.Plugin.call(this, game, parent);
};

Mst.HUD.prototype = Object.create(Phaser.Plugin.prototype);
Mst.HUD.prototype.constructor = Mst.HUD;

Mst.HUD.prototype.init = function (mHud, hud_data) {
    "use strict";
    this.mHud = mHud;
    this.margins = hud_data.margins;
    const camera_width = Mst.game.camera.width;
    const camera_height = Mst.game.camera.height;
    const camera_center = new Mst.Position(camera_width / 2, camera_height / 2);
    // define the HUD regions (begin and end points)
    this.regions = {
        top_left: {
            begin: {x: this.margins.left, y: this.margins.top},
            end: {x: (camera_width / 3) - this.margins.right, y: this.margins.top},
            elements: []
        },
        center_top: {
            begin: {x: (camera_width / 3) + this.margins.left - 50, y: this.margins.top},
            end: {x: (2 * camera_width / 3) - this.margins.right + 30, y: this.margins.top},
            elements: []
        },
        center_top_left: {
            begin: {x: (camera_width / 3) - this.margins.right, y: this.margins.top + 37},
            end: {x: (2 * camera_width / 3) - this.margins.right, y: this.margins.top + 37},
            elements: []
        },
        top_right: {
            begin: {x: (2 * camera_width / 3) + this.margins.left, y: this.margins.top},
            end: {x: camera_width - this.margins.right, y: this.margins.top},
            elements: []
        },
        center_right: {
            begin: {x: camera_width - this.margins.right, y: (camera_height / 3) + this.margins.top},
            end: {x: camera_width - this.margins.right, y: (2 * camera_height / 3) + this.margins.top},
            elements: []
        },
        bottom_right: {
            begin: {x: (2 * camera_width / 3) + this.margins.left, y: camera_height - this.margins.bottom},
            end: {x: camera_width - this.margins.right, y: camera_height - this.margins.bottom},
            elements: []
        },
        center_bottom: {
            begin: {x: (camera_width / 3) + this.margins.left, y: camera_height - this.margins.bottom},
            end: {x: (2 * camera_width / 3) - this.margins.right, y: camera_height - this.margins.bottom},
            elements: []
        },
        bottom_left: {
            begin: {x: this.margins.left, y: camera_height - this.margins.bottom - 12},
            end: {x: (camera_width / 3) - this.margins.right, y: camera_height - this.margins.bottom - 12},
            elements: []
        },
        center_left: {
            begin: {x: this.margins.left, y: (camera_height / 3) + this.margins.top},
            end: {x: this.margins.left, y: (2 * camera_height / 3) - this.margins.bottom},
            elements: []
        },
        center: {
            begin: {x: (camera_width / 3) + this.margins.left, y: camera_center.y},
            end: {x: (2 * camera_width / 3) - this.margins.right, y: camera_center.y},
            elements: []
        },
        right_window: {
            begin: {x: (camera_width / 3) + this.margins.left + 35, y: camera_center.y - 120},
            end: {x: (2 * camera_width / 3) - this.margins.right + 35, y: camera_center.y - 120},
            elements: []
        }
    };

    // create the HUD elements
    this.create_elements(hud_data.elements);
};

Mst.HUD.prototype.create_elements = function (elements) {
    "use strict";
    // create the HUD elements from the JSON file
    console.log("Hud elements", elements, this);
    for (let name in elements) {
        if (elements.hasOwnProperty(name)) {
            const parameters = elements[name];
            // find the region beginning positions
            const region = this.regions[parameters.region];
            const position = new Mst.Position(region.begin);

            // create the element prefab in the beginning of the region
            console.log("Hud Create element", name, region, position, parameters);
            const phud = this.mHud.create_hud(parameters.type, name, position, parameters.properties);
            // add the element to its correspondent region
            if (phud) region.elements.push(phud);
        }
    }

    // update the elements position according to the number of elements in each region
    for (let region_name in this.regions) {
        if (this.regions.hasOwnProperty(region_name)) {
            this.update_elements_positions(region_name);
        }
    }

    console.log("HUDPlug", this);
};

Mst.HUD.prototype.update_elements_positions = function (region_name) {
    "use strict";
    const region = this.regions[region_name];
    const region_dimensions = new Mst.Position(region.end);
    console.log("Hud Update region dim", region_dimensions);
    region_dimensions.sub(region.begin);
    console.log(region_dimensions);
    const number_of_elements = region.elements.length;
    if (number_of_elements === 1) {
        // if there is only one element, it should be in the center of the region
        const position = new Mst.Position(region.begin.x, region.begin.y + (region_dimensions.y / 2));
        console.log("Hud Update element", region_name, region.elements[0].name, region, position);
        region.elements[0].reset(position.x, position.y);
    } else if (number_of_elements === 2) {
        // if there are two elements, they will be in opposite sides of the region
        const position1 = new Mst.Position(region.begin);
        console.log("Hud Update element", region_name, region.elements[0].name, region, position1);
        region.elements[0].reset(position1.x, position1.y);
        const position2 = new Mst.Position(region.end.x, region.end.y);
        console.log("Hud Update element", region_name, region.elements[0].name, region, position2);
        region.elements[1].reset(position2.x, position2.y);
    } else if (number_of_elements > 2) {
        // if there are more than two elements, they will be equally spaced in the region
        const step = {
            x: region_dimensions.x / number_of_elements,
            y: region_dimensions.y / number_of_elements
        };
        console.log(region_dimensions, number_of_elements, step);
        const position = new Mst.Position(region.begin);
        region.elements.forEach(function (element) {
            console.log("Hud Update element", region_name, element.name, region, position, step, element);
            element.reset(position.x, position.y);
            position.add(step);
        }, this);
    }

    // fix all elements to camera
    region.elements.forEach(function (element) {
        element.fixedToCamera = true;
    }, this);
};
