function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "index";
    if (arguments[0]) {
        {
            __processArg(arguments[0], "__parentSymbol");
        }
        {
            __processArg(arguments[0], "$model");
        }
        {
            __processArg(arguments[0], "__itemTemplate");
        }
    }
    var $ = this;
    var exports = {};
    $.__views.win = Ti.UI.createWindow({
        backgroundColor: "black",
        top: 0,
        height: "100%",
        width: "100%",
        id: "win",
        fullscreen: "true",
        navbarHidden: "true",
        orientationModes: "[Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT]"
    });
    $.__views.win && $.addTopLevelView($.__views.win);
    $.__views.sceneView = Ti.UI.createView({
        backgroundColor: "black",
        id: "sceneView",
        width: Ti.Platform.displayCaps.platformWidth,
        height: Ti.Platform.displayCaps.platformHeight,
        top: "0",
        left: "0",
        borderColor: "black",
        borderWidth: "0"
    });
    $.__views.win.add($.__views.sceneView);
    $.__views.sceneText = Ti.UI.createTextField({
        color: "white",
        id: "sceneText"
    });
    $.__views.sceneView.add($.__views.sceneText);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var window = $.win;
    var sceneView = $.sceneView;
    var game = Alloy.Globals.Platino.createGameView();
    game.fps = 30;
    game.color(0, 0, 0);
    game.debug = false;
    game.enableOnDrawFrameEvent = false;
    var targetWidth = 1138;
    var targetHeight = 640;
    game.TARGET_SCREEN = {
        width: targetWidth,
        height: targetHeight
    };
    game.imageSuffix = Ti.Platform.displayCaps.platformWidth >= 768 && Ti.Platform.displayCaps.dpi > 250 ? "@3x" : Ti.Platform.displayCaps.platformWidth >= 320 && (Ti.Platform.displayCaps.dpi > 200 || Ti.Platform.displayCaps.platformWidth >= 640) ? "@2x" : "";
    var marginWidth = 0;
    var updateMargins = function() {
        marginWidth = Math.ceil(.5 * (game.screen.width - game.TARGET_SCREEN.width));
        game.STAGE_START = {
            x: marginWidth,
            y: 0
        };
        game.STAGE_END = {
            x: game.screen.width - marginWidth,
            y: game.screen.height
        };
        game.TI_STAGE_START = {
            x: Math.floor(game.STAGE_START.x / game.touchScaleX),
            y: game.STAGE_START.y / game.touchScaleY
        };
        game.TI_STAGE_END = {
            x: Math.ceil(game.STAGE_END.x / game.touchScaleX),
            y: game.STAGE_END.y / game.touchScaleY
        };
        game.TI_STAGE_SIZE = {
            width: game.TI_STAGE_END.x - game.TI_STAGE_START.x,
            height: game.TI_STAGE_END.y - game.TI_STAGE_START.y
        };
    };
    var updateScreenSize = function() {
        var screenScale = game.size.height / game.TARGET_SCREEN.height;
        game.screen = {
            width: game.size.width / screenScale,
            height: game.size.height / screenScale
        };
        game.touchScaleX = game.screen.width / game.size.width;
        game.touchScaleY = game.screen.height / game.size.height;
        game.screenScale = game.screen.height / game.TARGET_SCREEN.height;
        updateMargins();
    };
    game.addEventListener("onload", function() {
        updateScreenSize();
        var HomeScene = require("HomeScene");
        game.currentScene = new HomeScene(window, game);
        game.pushScene(game.currentScene);
        game.start();
    });
    game.addEventListener("onsurfacechanged", function(e) {
        game.orientation = e.orientation;
        updateScreenSize();
    });
    game.getTiScale = function(x, y) {
        return {
            x: x / game.touchScaleX,
            y: y / game.touchScaleY
        };
    };
    game.setupSpriteSize = function(sprite) {
        var width = sprite.width / game.screenScale;
        var height = sprite.height / game.screenScale;
        sprite.width = 1 > width ? 1 : width;
        sprite.height = 1 > height ? 1 : height;
    };
    game.locationInView = function(_e) {
        var e = {
            type: _e.type,
            x: _e.x,
            y: _e.y,
            source: _e.source
        };
        var x = e.x * game.touchScaleX;
        var y = e.y * game.touchScaleY;
        e.x = x;
        e.y = y;
        return e;
    };
    window.addEventListener("androidback", function() {
        game.currentScene && game.currentScene.backButtonHandler && game.currentScene.backButtonHandler();
    });
    window.addEventListener("close", function() {
        game = null;
    });
    sceneView.add(game);
    window.open();
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;