Mst.HUD = function (game, parent) {
    "use strict";
    Phaser.Plugin.call(this, game, parent);
};

Mst.HUD.prototype = Object.create(Phaser.Plugin.prototype);
Mst.HUD.prototype.constructor = Mst.HUD;

Mst.HUD.prototype.init = function (game_state, hud_data) {
    "use strict";
    var camera_width, camera_height, camera_center;
    this.game_state = game_state;
    this.margins = hud_data.margins;
    camera_width = this.game_state.game.camera.width;
    camera_height = this.game_state.game.camera.height;
    camera_center = new Phaser.Point(camera_width / 2, camera_height / 2);
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
            begin: {x: this.margins.left, y: this.margins.top + 37},
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
    var prefab_name, prefab_parameters, prefab_position, region, prefab, region_name;
    // create the HUD elements from the JSON file
    for (prefab_name in elements) {
        if (elements.hasOwnProperty(prefab_name)) {
            prefab_parameters = elements[prefab_name];
            // find the region beginning positions
            region = this.regions[prefab_parameters.region];
            prefab_position = new Phaser.Point(region.begin.x, region.begin.y);
            
            //console.log(prefab_parameters.properties);
            
            // create the element prefab in the beginning of the region
            prefab = this.game_state.create_prefab(prefab_parameters.type, prefab_name, prefab_position, prefab_parameters.properties);
            // add the element to its correspondent region
            region.elements.push(prefab);
        }
    }
    
    // update the elements position according to the number of elements in each region
    for (region_name in this.regions) {
        if (this.regions.hasOwnProperty(region_name)) {
            this.update_elements_positions(this.regions[region_name]);
        }
    }
};

Mst.HUD.prototype.update_elements_positions = function (region) {
    "use strict";
    var region_dimensions, number_of_elements, step, position;
    region_dimensions = new Phaser.Point(region.end.x - region.begin.x, region.end.y - region.begin.y);
    number_of_elements = region.elements.length;
    if (number_of_elements === 1) {
        // if there is only one element, it should be in the center of the region
        region.elements[0].reset(region.begin.x + (region_dimensions.x / 2), region.begin.y + (region_dimensions.y / 2));
    } else if (number_of_elements === 2) {
        // if there are two elements, they will be in opposite sides of the region
        region.elements[0].reset(region.begin.x, region.begin.y);
        region.elements[1].reset(region.end.x, region.end.y);
    } else if (number_of_elements > 2) {
        // if there are more than two elements, they will be equally spaced in the region
        step = new Phaser.Point(region_dimensions.x / number_of_elements, region_dimensions.y / number_of_elements);
        position = new Phaser.Point(region.begin.x, region.begin.y);
        region.elements.forEach(function (element) {
            element.reset(position.x, position.y);
            position.x += step.x;
            position.y += step.y;
        }, this);
    }
    
    // fix all elements to camera
    region.elements.forEach(function (element) {
        element.fixedToCamera = true;
    }, this);
};
