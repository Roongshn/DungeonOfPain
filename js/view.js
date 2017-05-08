const TILESIZE = 24;

class Drawer {
    constructor(canvasId, tileset) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.tileset = tileset;
    }
    drawTile(tile, point) {
        this.ctx.drawImage(this.tileset, tile.c * TILESIZE, tile.r * TILESIZE, TILESIZE, TILESIZE, point.x * TILESIZE, point.y * TILESIZE, TILESIZE, TILESIZE);
    }
    fill(color, point) {
        this.ctx.fillStyle = color;
        let params = [0, 0, this.canvas.width, this.canvas.height];
        if(point) {
            params = [point.x*  TILESIZE, point.y * TILESIZE, TILESIZE, TILESIZE];
        }
        this.ctx.fillRect(...params);
    }
    clear(point) {
        let params = [0, 0, this.canvas.width, this.canvas.height];
        if(point) {
            params = [point.x * TILESIZE, point.y * TILESIZE, TILESIZE, TILESIZE];
        }
        this.ctx.clearRect(...params);
    }
}

class Render {
    constructor(data, tileset) {
        this.mapDrawer = new Drawer('map', tileset);
        this.playerDrawer = new Drawer('player', tileset);
        this.fogDrawer = new Drawer('fog', tileset);

        this.layers = data;

        let h = $('#map').height() / TILESIZE;
        let w = $('#map').width() / TILESIZE;
        console.log(h, w);
        this.viewport = {
            h,
            w,
            x: Math.floor(this.layers.player.data.position.y - (w/2)),
            y: Math.floor(this.layers.player.data.position.x - (h/2)),
        }
        console.log(this.viewport);
    }
    moveViewport(x, y) {
        if((this.viewport.x + x) >=0 && (this.viewport.x + x + this.viewport.w) <= this.layers.map.data.length) {
            this.viewport.x += x;
        }
        if((this.viewport.y + y) >=0 && (this.viewport.y + y + this.viewport.h) <= this.layers.map.data[0].length) {
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
                        tile = {
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
                if(tile) {
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

        drawer.clear();
        drawer.drawTile({
            c: 3,
            r: 0
        }, {
            x: data.position.x - this.viewport.x,
            y: data.position.y - this.viewport.y
        });
    }
    drawFogOfWar() {
        const drawer = this.fogDrawer;
        const playerPosition = this.layers.player.data.position;
        const playerVisionRange = this.layers.player.data.vision_range + 1;
        const map = this.layers.map.data;

        drawer.clear();
        drawer.fill('rgba(0, 0, 0, 0.5)');

        for (let i = 0; i < this.viewport.w; i++) {
            for (let j = 0; j < this.viewport.h; j++) {
                let realPoint = {
                    x: i + this.viewport.x,
                    y: j + this.viewport.y,
                }
                const distantion = getDist(playerPosition, realPoint)
                if (distantion <= playerVisionRange) {
                    if(this.layers.map.isVisible(playerPosition, realPoint)) {
                        drawer.clear({x: i, y: j});
                        if(distantion === playerVisionRange) {
                            drawer.fill('rgba(0, 0, 0, 0.3)', {x: i, y: j});
                        }
                        if(distantion === playerVisionRange-1) {
                            drawer.fill('rgba(0, 0, 0, 0.2)', {x: i, y: j});
                        }
                    }
                }
            }
        }

    }
    draw() {
        this.drawMap();
        this.drawPlayer();
        this.drawFogOfWar();
    }
}
