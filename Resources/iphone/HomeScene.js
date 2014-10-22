var HomeScene = function(window, game) {
    function Controls() {
        this.codes = {
            37: "left",
            39: "right",
            38: "forward",
            40: "backward"
        };
        this.states = {
            left: false,
            right: false,
            forward: false,
            backward: false
        };
        game.addEventListener("touchstart", function(e) {
            controls.onTouch(e);
        });
        game.addEventListener("touchmove", function(e) {
            controls.onTouch(e);
        });
        game.addEventListener("touchend", function(e) {
            controls.onTouchEnd(e);
        });
    }
    function Player(x, y, direction) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.weapon = Alloy.Globals.Platino.createSprite({
            width: 319,
            height: 320,
            image: "images/knife_hand.png"
        });
        game.setupSpriteSize(this.weapon);
        this.paces = 0;
    }
    function Map(size) {
        this.size = size;
        this.wallTexture = new Array(120);
        this.wallGrid = new Array(size * size);
        this.skybox = Alloy.Globals.Platino.createSprite({
            width: 2e3,
            height: 750,
            image: "images/deathvalley_panorama.jpg"
        });
        game.setupSpriteSize(this.skybox);
        for (i = 0; 120 > i; i++) {
            this.wallTexture[i] = Alloy.Globals.Platino.createSprite({
                width: 32,
                height: 1024,
                image: "images/wall_texture.png"
            });
            game.setupSpriteSize(this.wallTexture[i]);
        }
        this.light = 0;
    }
    function Camera(myScene, resolution, focalLength) {
        this.ctx = myScene;
        this.width = game.screen.width;
        this.height = game.screen.height;
        this.resolution = resolution;
        this.spacing = this.width / resolution;
        this.focalLength = focalLength || .8;
        this.range = 28;
        this.lightRange = 5;
        this.scale = (this.width + this.height) / 1200;
    }
    function GameLoop() {
        this.lastTime = 0;
        this.callback = function() {};
    }
    var scene = Alloy.Globals.Platino.createScene();
    var onSceneActivated = function() {
        Ti.API.info("HomeScene has been activated.");
        map.randomize();
        loop.start(function(seconds) {
            map.update(seconds);
            player.update(controls.states, map, seconds);
            camera.render(player, map);
        });
        updateTimerID = setInterval(function() {
            loop.frame();
        }, 75);
    };
    var CIRCLE = 2 * Math.PI;
    Controls.prototype.onTouch = function(e) {
        controls.onTouchEnd(e);
        e.y < .25 * game.screen.height ? controls.onKey(true, {
            keyCode: 38
        }) : e.x < .25 * game.screen.width ? controls.onKey(true, {
            keyCode: 37
        }) : e.x > .25 * game.screen.width && controls.onKey(true, {
            keyCode: 39
        });
    };
    Controls.prototype.onTouchEnd = function() {
        controls.states = {
            left: false,
            right: false,
            forward: false,
            backward: false
        };
    };
    Controls.prototype.onKey = function(val, e) {
        var state = controls.codes[e.keyCode];
        if ("undefined" == typeof state) return;
        controls.states[state] = val;
        e.preventDefault && e.preventDefault();
        e.stopPropagation && e.stopPropagation();
    };
    Player.prototype.rotate = function(angle) {
        this.direction = (this.direction + angle + CIRCLE) % CIRCLE;
    };
    Player.prototype.walk = function(distance, map) {
        var dx = Math.cos(this.direction) * distance;
        var dy = Math.sin(this.direction) * distance;
        map.get(this.x + dx, this.y) <= 0 && (this.x += dx);
        map.get(this.x, this.y + dy) <= 0 && (this.y += dy);
        this.paces += distance;
    };
    Player.prototype.update = function(controls, map, seconds) {
        controls.left && this.rotate(-Math.PI * seconds);
        controls.right && this.rotate(Math.PI * seconds);
        controls.forward && this.walk(3 * seconds, map);
        controls.backward && this.walk(-3 * seconds, map);
    };
    Map.prototype.get = function(x, y) {
        x = Math.floor(x);
        y = Math.floor(y);
        if (0 > x || x > this.size - 1 || 0 > y || y > this.size - 1) return -1;
        return this.wallGrid[y * this.size + x];
    };
    Map.prototype.randomize = function() {
        for (var i = 0; i < this.size * this.size; i++) this.wallGrid[i] = Math.random() < .3 ? 1 : 0;
    };
    Map.prototype.cast = function(point, angle, range) {
        function ray(origin) {
            var stepX = step(sin, cos, origin.x, origin.y);
            var stepY = step(cos, sin, origin.y, origin.x, true);
            var nextStep = stepX.length2 < stepY.length2 ? inspect(stepX, 1, 0, origin.distance, stepX.y) : inspect(stepY, 0, 1, origin.distance, stepY.x);
            if (nextStep.distance > range) return [ origin ];
            return [ origin ].concat(ray(nextStep));
        }
        function step(rise, run, x, y, inverted) {
            if (0 === run) return noWall;
            var dx = run > 0 ? Math.floor(x + 1) - x : Math.ceil(x - 1) - x;
            var dy = dx * (rise / run);
            return {
                x: inverted ? y + dy : x + dx,
                y: inverted ? x + dx : y + dy,
                length2: dx * dx + dy * dy
            };
        }
        function inspect(step, shiftX, shiftY, distance, offset) {
            var dx = 0 > cos ? shiftX : 0;
            var dy = 0 > sin ? shiftY : 0;
            step.height = self.get(step.x - dx, step.y - dy);
            step.distance = distance + Math.sqrt(step.length2);
            step.shading = shiftX ? 0 > cos ? 2 : 0 : 0 > sin ? 2 : 1;
            step.offset = offset - Math.floor(offset);
            return step;
        }
        var self = this;
        var sin = Math.sin(angle);
        var cos = Math.cos(angle);
        var noWall = {
            length2: 1/0
        };
        return ray({
            x: point.x,
            y: point.y,
            height: 0,
            distance: 0
        });
    };
    Map.prototype.update = function(seconds) {
        this.light > 0 ? this.light = Math.max(this.light - 10 * seconds, 0) : 5 * Math.random() < seconds && (this.light = 2);
    };
    Camera.prototype.render = function(player, map) {
        this.drawSky(player.direction, map.skybox, map.light);
        this.drawColumns(player, map);
        this.drawWeapon(player.weapon, player.paces);
    };
    Camera.prototype.drawSky = function(direction, sky) {
        var width = sky.width * (this.height / sky.height) * 2;
        var left = direction / CIRCLE * -width;
        if (!skyAdded) {
            sky.width = width;
            sky.height = this.height;
            sky.x = left;
            sky.y = 0;
            this.ctx.add(sky);
            skyAdded = true;
        }
    };
    Camera.prototype.drawColumns = function(player, map) {
        for (var column = 0; column < this.resolution; column++) {
            var x = column / this.resolution - .5;
            var angle = Math.atan2(x, this.focalLength);
            var ray = map.cast(player, player.direction + angle, this.range);
            this.drawColumn(column, ray, angle, map);
        }
        allColumnsAdded = true;
    };
    Camera.prototype.drawWeapon = function(weapon, paces) {
        var bobX = Math.cos(2 * paces) * this.scale * 6;
        var bobY = Math.sin(4 * paces) * this.scale * 6;
        var left = .66 * this.width + bobX;
        var top = .6 * this.height + bobY;
        weapon.x = left;
        weapon.y = top;
        weapon.width = weapon.width * this.scale;
        weapon.height = weapon.height * this.scale;
    };
    Camera.prototype.drawColumn = function(column, ray, angle, map) {
        var drawWall = false;
        var texture = map.wallTexture[column];
        var left = Math.floor(column * this.spacing);
        var width = Math.ceil(this.spacing);
        var hit = -1;
        while (++hit < ray.length && ray[hit].height <= 0) ;
        for (var s = ray.length - 1; s >= 0; s--) {
            var step = ray[s];
            var rainDrops = Math.pow(Math.random(), 3) * s;
            {
                rainDrops > 0 && this.project(.1, angle, step.distance);
            }
            if (s === hit) {
                drawWall = true;
                texture.show();
                {
                    Math.floor(texture.width * step.offset);
                }
                var wall = this.project(step.height, angle, step.distance);
                texture.x = left;
                texture.y = wall.top;
                texture.width = width;
                texture.height = wall.height;
                allColumnsAdded || this.ctx.add(texture);
            }
        }
        drawWall || texture.hide();
    };
    Camera.prototype.project = function(height, angle, distance) {
        var z = distance * Math.cos(angle);
        var wallHeight = this.height * height / z;
        var bottom = this.height / 2 * (1 + 1 / z);
        return {
            top: bottom - wallHeight,
            height: wallHeight
        };
    };
    GameLoop.prototype.start = function(callback) {
        this.callback = callback;
    };
    GameLoop.prototype.frame = function() {
        this.callback(.075);
    };
    var player = new Player(15.3, -1.2, .3 * Math.PI);
    var map = new Map(32);
    var controls = new Controls();
    var camera = new Camera(scene, 120, .8);
    var loop = new GameLoop();
    var skyAdded = false;
    var allColumnsAdded = false;
    var onSceneDeactivated = function() {
        Ti.API.info("HomeScene has been deactivated.");
        scene.dispose();
        scene = null;
    };
    scene.backButtonHandler = function() {};
    scene.addEventListener("activated", onSceneActivated);
    scene.addEventListener("deactivated", onSceneDeactivated);
    return scene;
};

module.exports = HomeScene;