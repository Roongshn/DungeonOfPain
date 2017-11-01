// TODO: 1) переделать drawTile на id тайлов
// 2) переделать draw чтобы принимал массив того, что нужно отрисовать

const TILESIZE = 48;

class Drawer {
    constructor(canvasId, tileset) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        if (tileset) {
            this.tileset = tileset;
        }

        if (canvasId === 'debugger') {
            this.ctx.textBaseline = 'top';
            this.ctx.fillStyle = '#FFF';
            this.ctx.strokeStyle = '#FFF';
            this.ctx.lineWidth = 1;
            this.ctx.font = 'bold 6pt Open Sans';
        }
    }
    drawTile(tile, point) {
        this.ctx.drawImage(this.tileset, tile.c * TILESIZE, tile.r * TILESIZE, TILESIZE, TILESIZE, point.x * TILESIZE, point.y * TILESIZE, TILESIZE, TILESIZE);
    }
    drawText(text, strNumber, point) {
        const params = [
            text,
            point.x * TILESIZE + 3,
            point.y * TILESIZE + 2 + (12 * strNumber),
        ];
        this.ctx.strokeStyle = '#000';
        this.ctx.strokeText(...params);
        this.ctx.strokeStyle = '#FFF';
        this.ctx.fillText(...params);
    }
    drawCellBorder(point) {
        const params = [
            point.x * TILESIZE,
            point.y * TILESIZE,
            TILESIZE,
            TILESIZE,
        ];
        this.ctx.strokeRect(...params);
    }
    fill(color, point) {
        this.ctx.fillStyle = color;
        let params = [0, 0, this.canvas.width, this.canvas.height];
        if (point) {
            params = [
                point.x * TILESIZE,
                point.y * TILESIZE,
                TILESIZE,
                TILESIZE,
            ];
        }
        this.ctx.fillRect(...params);
    }
    clear(point) {
        let params = [0, 0, this.canvas.width, this.canvas.height];
        if (point) {
            params = [
                point.x * TILESIZE,
                point.y * TILESIZE,
                TILESIZE,
                TILESIZE,
            ];
        }
        this.ctx.clearRect(...params);
    }
}

class Render {
    constructor(data, tileset) {
        this.mapDrawer = new Drawer('map', tileset);
        this.playerDrawer = new Drawer('player', tileset);
        this.monstersDrawer = new Drawer('monsters', tileset);
        this.fogDrawer = new Drawer('fog', tileset);
        this.debuggerDrawer = new Drawer('debugger');

        this.layers = data;

        const h = $('#map').height() / TILESIZE;
        const w = $('#map').width() / TILESIZE;

        this.viewport = {
            h,
            w,
            x: Math.floor(this.layers.player.data.position.y - (w / 2)),
            y: Math.floor(this.layers.player.data.position.x - (h / 2)),
        };

        this.trasitionVars = {
            playerPosition: {
                x: this.layers.player.data.position.x,
                y: this.layers.player.data.position.y,
            },
            viewport: {
                x: this.viewport.x,
                y: this.viewport.y,
            },
        };
    }
    transitVars() {
        // TODO: отрисовка не успевает за моделью, наверное надо блокировать управление

        function getNextValue(modelVar, transVar) {
            return Number((transVar + 0.1 * Math.sign(modelVar - transVar)).toFixed(1));
        }

        // player
        const player = this.layers.player.data;
        if (this.trasitionVars.playerPosition.x !== player.position.x) {
            this.trasitionVars.playerPosition.x = getNextValue(player.position.x, this.trasitionVars.playerPosition.x);
        }
        if (this.trasitionVars.playerPosition.y !== player.position.y) {
            this.trasitionVars.playerPosition.y = getNextValue(player.position.y, this.trasitionVars.playerPosition.y);
        }
        // viewport
        if (this.trasitionVars.viewport.x !== this.viewport.x) {
            this.trasitionVars.viewport.x = getNextValue(this.viewport.x, this.trasitionVars.viewport.x);
        }
        if (this.trasitionVars.viewport.y !== this.viewport.y) {
            this.trasitionVars.viewport.y = getNextValue(this.viewport.y, this.trasitionVars.viewport.y);
        }
    }
    moveViewport(x, y) {
        if ((this.viewport.x + x) >= 0 && (this.viewport.x + x + this.viewport.w) <= this.layers.map.data.length) {
            this.viewport.x += x;
        }
        if ((this.viewport.y + y) >= 0 && (this.viewport.y + y + this.viewport.h) <= this.layers.map.data[0].length) {
            this.viewport.y += y;
        }
    }
    getViewportCorrection(axis) {
        return this.viewport[axis] - this.trasitionVars.viewport[axis];
    }
    drawMap() {
        const drawer = this.mapDrawer;
        const data = this.layers.map.data;

        drawer.fill('#000');

        for (let i = 0; i < this.viewport.w; i++) {
            for (let j = 0; j < this.viewport.h; j++) {
                const cell = data[i + this.viewport.x][j + this.viewport.y];
                let tile;
                switch (cell.type) {
                case 'WL':
                    tile = { // полное говно, надо переписать на айди тайлов
                        c: 0,
                        r: cell.tile,
                    };
                    break;
                case 'F':
                    tile = {
                        c: 1,
                        r: 0,
                    };
                    break;
                case 'D':
                    tile = {
                        c: 2,
                        r: 0,
                    };
                    break;

                }
                if (tile) {
                    drawer.drawTile(tile, {
                        x: i + this.getViewportCorrection('x'),
                        y: j + this.getViewportCorrection('y'),
                    });
                }
            }
        }
    }
    drawPlayer() {
        const drawer = this.playerDrawer;
        const tile = {
            c: 3,
            r: 0,
        };

        drawer.clear();
        drawer.drawTile(tile, {
            x: this.trasitionVars.playerPosition.x - this.trasitionVars.viewport.x,
            y: this.trasitionVars.playerPosition.y - this.trasitionVars.viewport.y,
        });
    }
    drawMonsters() {
        const drawer = this.monstersDrawer;
        const data = this.layers.monsters.data;
        const tile = {
            c: 4,
            r: 0,
        };
        drawer.clear();
        for (const mob of data) {
            drawer.drawTile(tile, {
                x: mob.position.x - this.trasitionVars.viewport.x,
                y: mob.position.y - this.trasitionVars.viewport.y,
            });
        }
    }
    drawFogOfWar() {
        const drawer = this.fogDrawer;
        const playerPosition = this.layers.player.data.position;
        const playerVisionRange = this.layers.player.data.stats.visionRange + 1;
        // const map = this.layers.map.data;

        drawer.clear();
        drawer.fill('rgba(0, 0, 0, 0.5)');

        for (let i = 0; i < this.viewport.w; i++) {
            for (let j = 0; j < this.viewport.h; j++) {
                const realPoint = {
                    x: i + this.viewport.x,
                    y: j + this.viewport.y,
                };
                const distantion = getDist(playerPosition, realPoint);
                if (distantion < playerVisionRange) {
                    if (this.layers.map.isVisible(realPoint, playerPosition)) {
                        drawer.clear({
                            x: i + this.getViewportCorrection('x'),
                            y: j + this.getViewportCorrection('y'),
                        });

                        if (distantion <= playerVisionRange && distantion >= playerVisionRange - 1) {
                            drawer.fill('rgba(0, 0, 0, 0.3)', {
                                x: i + this.getViewportCorrection('x'),
                                y: j + this.getViewportCorrection('y'),
                            });
                        }
                        if (distantion < playerVisionRange - 1 && distantion >= playerVisionRange - 2) {
                            drawer.fill('rgba(0, 0, 0, 0.2)', {
                                x: i + this.getViewportCorrection('x'),
                                y: j + this.getViewportCorrection('y'),
                            });
                        }
                    }
                }
            }
        }

    }
    drawDebugger() {
        const map = this.layers.map.data;
        const drawer = this.debuggerDrawer;
        drawer.clear();

        for (let i = 0; i < this.viewport.w; i++) {
            for (let j = 0; j < this.viewport.h; j++) {
                const point = {
                    x: i,
                    y: j,
                };
                const cell = map[i + this.viewport.x][j + this.viewport.y];
                drawer.drawText(`x: ${i + this.viewport.x}, y: ${j + this.viewport.y}`, 0, point);
                if (cell.charaster !== undefined) {
                    drawer.drawText(`Prsn: ${cell.charaster}`, 1, point);
                }
                drawer.drawCellBorder(point);
            }
        }
    }
    draw() {
        this.transitVars();

        this.drawMap();
        this.drawPlayer();
        this.drawFogOfWar();
        this.drawMonsters();
        // this.drawDebugger();
    }
}
