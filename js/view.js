// TODO: 1) переделать drawTile на id тайлов
// 2) переделать draw чтобы принимал массив того, что нужно отрисовать

const TILESIZE = 48;

class Drawer {
    constructor(canvasId, tileset) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        if(tileset) {
            this.tileset = tileset;
        }

        if(canvasId === 'debugger') {
            this.ctx.textBaseline = "top";
            this.ctx.fillStyle = "#FFF";
            this.ctx.strokeStyle = "#FFF";
            this.ctx.lineWidth=1;
            this.ctx.font = "bold 6pt Open Sans";
        }
    }
    drawTile(tile, point) {
        this.ctx.drawImage(this.tileset, tile.c * TILESIZE, tile.r * TILESIZE, TILESIZE, TILESIZE, point.x * TILESIZE, point.y * TILESIZE, TILESIZE, TILESIZE);
    }
    drawText(text, strNumber, point) {
        let params = [
            text,
            point.x * TILESIZE + 3,
            point.y * TILESIZE + 2 + (12 * strNumber)
        ]
        this.ctx.strokeStyle = "#000";
        this.ctx.strokeText(...params);
        this.ctx.strokeStyle = "#FFF";
        this.ctx.fillText(...params);
    }
    drawCellBorder(point) {
        let params = [
            point.x * TILESIZE,
            point.y * TILESIZE,
            TILESIZE,
            TILESIZE
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
                TILESIZE
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
                TILESIZE
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

        let h = $('#map').height() / TILESIZE;
        let w = $('#map').width() / TILESIZE;
        this.viewport = {
            h,
            w,
            x: Math.floor(this.layers.player.data.position.y - (w / 2)),
            y: Math.floor(this.layers.player.data.position.x - (h / 2))
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
    drawMap() {
        const drawer = this.mapDrawer;
        const data = this.layers.map.data;

        drawer.fill('#000');

        for (let i = 0; i < this.viewport.w; i++) {
            for (let j = 0; j < this.viewport.h; j++) {
                let cell = data[i + this.viewport.x][j + this.viewport.y];
                let tile;
                switch (cell.type) {
                    case 'WL':
                        tile = { // полное говно, надо переписать на айди тайлов
                            c: 0,
                            r: cell.tile
                        }
                        break;
                    case 'F':
                        tile = {
                            c: 1,
                            r: 0
                        }
                        break;
                    case 'D':
                        tile = {
                            c: 2,
                            r: 0
                        }
                        break;

                }
                if (tile) {
                    drawer.drawTile(tile, {
                        x: i,
                        y: j
                    });
                }
            }
        }
    }
    drawPlayer() {
        const drawer = this.playerDrawer;
        const data = this.layers.player.data;
        // console.log(data);
        const tile = {
            c: 3,
            r: 0
        };

        drawer.clear();
        drawer.drawTile(tile, {
            x: data.position.x - this.viewport.x,
            y: data.position.y - this.viewport.y
        });
    }
    drawMonsters() {
        const drawer = this.monstersDrawer;
        const data = this.layers.monsters.data;
        const animatonDelta = 0.33333;
        const tile = {
            c: 4,
            r: 0
        };
        drawer.clear();
        for (let mob of data) {
            drawer.drawTile(tile, {
                x: mob.position.x - this.viewport.x,
                y: mob.position.y - this.viewport.y
            });
        }
    }
    drawFogOfWar() {
        const drawer = this.fogDrawer;
        const playerPosition = this.layers.player.data.position;
        const playerVisionRange = this.layers.player.data.stats.visionRange + 1;
        const map = this.layers.map.data;

        drawer.clear();
        drawer.fill('rgba(0, 0, 0, 0.5)');

        for (let i = 0; i < this.viewport.w; i++) {
            for (let j = 0; j < this.viewport.h; j++) {
                let realPoint = {
                    x: i + this.viewport.x,
                    y: j + this.viewport.y
                }
                const distantion = getDist(playerPosition, realPoint)
                if (distantion < playerVisionRange) {
                    if (this.layers.map.isVisible(realPoint, playerPosition)) {
                        drawer.clear({x: i, y: j});

                        if (distantion <= playerVisionRange && distantion >= playerVisionRange-1) {
                            drawer.fill('rgba(0, 0, 0, 0.3)', {
                                x: i,
                                y: j
                            });
                        }
                        if (distantion < playerVisionRange - 1 && distantion >= playerVisionRange - 2) {
                            drawer.fill('rgba(0, 0, 0, 0.2)', {
                                x: i,
                                y: j
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
                let point = {
                    x: i,
                    y: j
                };
                let cell = map[i + this.viewport.x][j + this.viewport.y];
                // console.log(map[i + this.viewport.x][j + this.viewport.y]);
                drawer.drawText(`x: ${i + this.viewport.x}, y: ${j + this.viewport.y}`, 0, point);
                if(cell.charaster !== undefined) {
                    drawer.drawText(`Prsn: ${cell.charaster}`, 1, point);
                }
                drawer.drawCellBorder(point);
            }
        }
    }
    draw() {
        // console.log('draw');
        this.drawMap();
        this.drawPlayer();
        this.drawFogOfWar();
        this.drawMonsters();
        // this.drawDebugger();
    }
}
