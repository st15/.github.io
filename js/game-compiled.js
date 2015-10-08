/**
 * Created by Lili on 1.10.2015 �..
 */
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DEBUG_MODE = true;
var pathologicGame;
var GameModule = (function () {
    var game = pathologicGame = pathologicGame || {};
    // constants
    var PADDING = 2;
    var CELL_SIZE = 40;
    var CELL_LINE_THICKNESS = 4;
    var CELL_ROUNDNESS = 14;
    var CIRCLE_RADIUS = 12;
    var COLORS = ["#ffffff", "#334455", "#334455", "#004488", "#ffffff", "#ffffff"];
    //const COLORS = ["#cccccc", "#554433", "#334455", "#004488"];
    var COLOR_CURSOR = "#ffffff";
    var COLOR_GRID = "#ffffff";
    var COLOR_PATH = "#004488";
    // TODO alphas array

    // cell types
    var TYPE_BLOCK = 0;
    var TYPE_EMPTY = 1;
    var TYPE_ITEM_TO_COLLECT = 2;
    var TYPE_PATH = 3;
    //
    var myGrid, myCursor;

    // welcome level json data
    game.levelData = pathologicLevelData;
    game.currentLevelIndex = 0;
    game.isLevelComplete = false;

    var Cursor = (function () {
        function Cursor(grid, x, y) {
            _classCallCheck(this, Cursor);

            this.grid = grid;
            this.grid.cells[x][y].type = TYPE_PATH;
            this.x = x;
            this.y = y;
            this.path = [{ x: x, y: y }];
        }

        _createClass(Cursor, [{
            key: "draw",
            value: function draw(ctx) {
                var posX, posY;
                ctx.shadowBlur = 0;
                ctx.beginPath();
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                ctx.lineWidth = CIRCLE_RADIUS * 2;
                for (var i = 0; i < this.path.length; i++) {
                    posX = this.path[i].x * CELL_SIZE + CELL_SIZE / 2;
                    posY = this.path[i].y * CELL_SIZE + CELL_SIZE / 2;
                    ctx.lineTo(posX, posY);
                }
                ctx.strokeStyle = COLOR_PATH;
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(posX, posY, CIRCLE_RADIUS, 0, 2 * Math.PI);
                ctx.fillStyle = COLOR_CURSOR;
                ctx.fill();
            }
        }, {
            key: "moveLeft",
            value: function moveLeft() {
                this.move(this.x - 1, this.y);
            }
        }, {
            key: "moveUp",
            value: function moveUp() {
                this.move(this.x, this.y - 1);
            }
        }, {
            key: "moveRight",
            value: function moveRight() {
                this.move(this.x + 1, this.y);
            }
        }, {
            key: "moveDown",
            value: function moveDown() {
                this.move(this.x, this.y + 1);
            }
        }, {
            key: "move",
            value: function move(toX, toY) {
                if (this.grid.cells[toX]) {
                    var newCell = this.grid.cells[toX][toY];
                    if (newCell && newCell.canPassThrough()) {
                        newCell.type = TYPE_PATH;
                        this.x = toX;
                        this.y = toY;
                        this.path.push({ x: this.x, y: this.y });
                    }
                }
            }
        }, {
            key: "canMoveToCell",
            value: function canMoveToCell(toX, toY) {
                if (this.grid.cells[toX]) {
                    var newCell = this.grid.cells[toX][toY];
                    if (newCell && newCell.canPassThrough()) {
                        return true;
                    }
                }
                return false;
            }
        }, {
            key: "canMove",
            value: function canMove() {
                return this.canMoveToCell(this.x - 1, this.y) || this.canMoveToCell(this.x, this.y - 1) || this.canMoveToCell(this.x + 1, this.y) || this.canMoveToCell(this.x, this.y + 1);
            }
        }]);

        return Cursor;
    })();

    var Cell = (function () {
        function Cell(x, y, type) {
            _classCallCheck(this, Cell);

            this.x = x;
            this.y = y;
            this.type = type;
        }

        _createClass(Cell, [{
            key: "draw",
            value: function draw(ctx) {
                // TODO glow
                //ctx.shadowOffsetX = 0;
                //ctx.shadowOffsetY = 0;
                //ctx.shadowBlur = 8;
                //ctx.shadowColor = "rgba(68, 170, 255, 0.5)"; //"#ffffff"

                ctx.fillStyle = COLORS[this.type];
                Cell.roundRect(ctx, this.x * CELL_SIZE, this.y * CELL_SIZE, CELL_SIZE, CELL_SIZE, CELL_ROUNDNESS, true, true);
                switch (this.type) {
                    case TYPE_PATH:
                        break;
                    case TYPE_BLOCK:
                        break;
                    case TYPE_ITEM_TO_COLLECT:
                        ctx.beginPath();
                        ctx.arc(this.x * CELL_SIZE + CELL_SIZE / 2, this.y * CELL_SIZE + CELL_SIZE / 2, CIRCLE_RADIUS, 0, 2 * Math.PI);
                        ctx.stroke();
                        break;
                    case TYPE_EMPTY:
                        break;
                }
            }
        }, {
            key: "canPassThrough",
            value: function canPassThrough() {
                return this.type == TYPE_EMPTY || this.type == TYPE_ITEM_TO_COLLECT;
            }

            /**
             * Draws a rounded rectangle using the current state of the canvas.
             * If you omit the last three params, it will draw a rectangle
             * outline with a 5 pixel border radius
             * @param {CanvasRenderingContext2D} ctx
             * @param {Number} x The top left x coordinate
             * @param {Number} y The top left y coordinate
             * @param {Number} width The width of the rectangle
             * @param {Number} height The height of the rectangle
             * @param {Number} [radius = 5] The corner radius; It can also be an object
             *                 to specify different radii for corners
             * @param {Number} [radius.tl = 0] Top left
             * @param {Number} [radius.tr = 0] Top right
             * @param {Number} [radius.br = 0] Bottom right
             * @param {Number} [radius.bl = 0] Bottom left
             * @param {Boolean} [fill = false] Whether to fill the rectangle.
             * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
             */
        }], [{
            key: "roundRect",
            value: function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
                if (typeof stroke == 'undefined') {
                    stroke = true;
                }
                if (typeof radius === 'undefined') {
                    radius = 5;
                }
                if (typeof radius === 'number') {
                    radius = { tl: radius, tr: radius, br: radius, bl: radius };
                } else {
                    var defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
                    for (var side in defaultRadius) {
                        radius[side] = radius[side] || defaultRadius[side];
                    }
                }
                ctx.beginPath();
                ctx.moveTo(x + radius.tl, y);
                ctx.lineTo(x + width - radius.tr, y);
                ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
                ctx.lineTo(x + width, y + height - radius.br);
                ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
                ctx.lineTo(x + radius.bl, y + height);
                ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
                ctx.lineTo(x, y + radius.tl);
                ctx.quadraticCurveTo(x, y, x + radius.tl, y);
                ctx.closePath();
                if (fill) {
                    ctx.fill();
                }
                if (stroke) {
                    ctx.stroke();
                }
            }
        }]);

        return Cell;
    })();

    var Grid = (function () {
        function Grid(dimensions, modifiedCells) {
            _classCallCheck(this, Grid);

            this.cells = new Array(dimensions.x);

            for (var i = 0; i < dimensions.x; i++) {
                this.cells[i] = new Array(dimensions.y);
                for (var j = 0; j < dimensions.y; j++) {
                    this.cells[i][j] = new Cell(i, j, TYPE_EMPTY); // �������� ������ ������
                }
            }
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = modifiedCells[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var modCell = _step.value;

                    this.cells[modCell["x"]][modCell["y"]].type = modCell["type"]; // ����������� ����
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator["return"]) {
                        _iterator["return"]();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }

        _createClass(Grid, [{
            key: "draw",
            value: function draw(ctx) {
                var cell;

                ctx.strokeStyle = COLOR_GRID;
                ctx.lineWidth = CELL_LINE_THICKNESS;
                for (var i = 0, lengthX = this.cells.length; i < lengthX; i++) {
                    for (var j = 0; j < this.cells[i].length; j++) {
                        cell = this.cells[i][j];
                        // Draw using default border radius,
                        // stroke it but no fill (function's default values)
                        cell.draw(ctx);
                    }
                }
            }
        }, {
            key: "isSolved",
            value: function isSolved() {
                for (var i = 0; i < this.cells.length; i++) {
                    for (var j = 0, lengthJ = this.cells[i].length; j < lengthJ; j++) {
                        if (this.cells[i][j].type == TYPE_ITEM_TO_COLLECT) {
                            return false;
                        }
                    }
                }
                return true;
            }
        }]);

        return Grid;
    })();

    var Game = function Game() {
        _classCallCheck(this, Game);
    };

    var redraw = function redraw() {
        var animFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || null;

        animFrame(drawOnCanvas);
    };

    var drawOnCanvas = function drawOnCanvas() {
        var canvas = document.getElementById('draw');
        var ctx = canvas.getContext('2d');

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        myGrid.draw(ctx);
        myCursor.draw(ctx);
    };

    var keyDownHandler = function keyDownHandler(event) {
        var key = event.which || event.keyCode;
        switch (key) {
            case 13:
                // Enter
                if (game.isLevelComplete || DEBUG_MODE) {
                    if (game.currentLevelIndex + 1 < game.levelData.length) {
                        game.currentLevelIndex++;
                    }
                    startNewGame();
                }
                break;
            case 8:
                // backspace
                restartGame();
                break;
            case 37:
                // left key
                myCursor.moveLeft();
                checkForGameOver();
                redraw();
                break;
            case 38:
                // up
                myCursor.moveUp();
                checkForGameOver();
                redraw();
                break;
            case 39:
                // right key
                myCursor.moveRight();
                checkForGameOver();
                redraw();
                break;
            case 40:
                // down
                myCursor.moveDown();
                checkForGameOver();
                redraw();
                break;
            default:
                break;
        }
    };

    var checkForGameOver = function checkForGameOver() {
        var winDiv = document.getElementById('win');
        var loseDiv = document.getElementById('lose');

        if (myGrid.isSolved()) {
            // check if level is solved
            console.log("WIN WIN WIN");
            game.isLevelComplete = true;
            winDiv.setAttribute('class', 'visible');
            loseDiv.setAttribute('class', 'hidden');
        } else if (!myCursor.canMove()) {
            // if cannot move anywhere else => game over
            console.log("game over LOSE");
            winDiv.setAttribute('class', 'hidden');
            loseDiv.setAttribute('class', 'visible');
        }
    };

    var restartGame = function restartGame() {
        startNewGame();
    };

    var startNewGame = function startNewGame() {
        var winDiv = document.getElementById('win');
        var loseDiv = document.getElementById('lose');
        winDiv.setAttribute('class', 'hidden');
        loseDiv.setAttribute('class', 'hidden');

        if (game.currentLevelIndex == 0) {
            showNewLevel();
        } else {
            var canvas = document.getElementById('draw');
            TweenLite.to(canvas, 0.5, {
                width: 0, height: 0, onComplete: showNewLevel
            });
        }
    };

    var showNewLevel = function showNewLevel() {
        game.isLevelComplete = false;
        var currentLevel = game.levelData[game.currentLevelIndex];
        var nameDiv = document.getElementById('level-name');
        nameDiv.innerHTML = "Level name: " + currentLevel.name;
        myGrid = new Grid(currentLevel.dimensions, currentLevel.modifiedCells);
        myCursor = new Cursor(myGrid, currentLevel.cursor.x, currentLevel.cursor.y);

        redraw();
        var canvas = document.getElementById('draw');
        // change size
        var newWidth = currentLevel.dimensions.x * CELL_SIZE + PADDING * 2;
        var newHeight = currentLevel.dimensions.y * CELL_SIZE + PADDING * 2;
        canvas.width = newWidth;
        canvas.height = newHeight;
        // add padding
        canvas.getContext("2d").translate(PADDING, PADDING);
        TweenLite.to(canvas, 0.5, {
            width: newWidth, height: newHeight
        });
    };

    var init = function init() {
        window.addEventListener("keydown", keyDownHandler);
        startNewGame();
    };

    return { init: init };
})();
window.onload = GameModule.init;

//# sourceMappingURL=game-compiled.js.map