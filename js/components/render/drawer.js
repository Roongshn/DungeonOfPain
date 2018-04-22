// TODO: переделать draw чтобы принимал массив того, что нужно отрисовать
import { TILESIZE } from '../../helpers/consts.js';

class Drawer {
    constructor(canvasId, tileset) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        if (tileset) {
            this.tileset = tileset;
        }

        // if (canvasId === 'debugger') {
        this.ctx.textBaseline = 'top';
        this.ctx.fillStyle = '#FFF';
        this.ctx.strokeStyle = '#FFF';
        this.ctx.lineWidth = 1;
        this.ctx.font = 'bold 20pt Open Sans';
        // }

        this.tilesList = {
            // start x, start y, width, height, corretion x, corretion y
            wall: [0, 54, 48, 48, 0, 0],
            wallWithGreen: [0, 0, 48, 48, 0, 0],
            floor: [54, 108, 48, 48, 0, 0],
            door: [282, 600, 36, 42, 6, 6],
            skull: [620, 484, 30, 24, 9, 26],
            lamp0: [67, 648, 36, 42, 7, 7],
            lamp1: [121, 648, 36, 42, 7, 7],
            // игрок
            solder0: [708, 0, 48, 48, 0, 0],
            solder1: [708, 0, 48, 48, 0, 0],
            knight0: [654, 0, 48, 48, 0, 0],
            knight1: [654, 54, 48, 54, 0, -6],
            // мобы
            goblin0: [330, 120, 48, 48, 0, 6],
            goblin1: [330, 174, 48, 48, 0, 0],
        };
    }
    drawTile(tile, point) {
        const tileArr = this.tilesList[tile];
        const params = [
            this.tileset,
            tileArr[0],
            tileArr[1],
            tileArr[2],
            tileArr[3],
            Math.round(point.x * TILESIZE + tileArr[4]),
            Math.round(point.y * TILESIZE + tileArr[5]),
            tileArr[2],
            tileArr[3],
        ];
        this.ctx.drawImage(...params);
    }
    fill(color, point) {
        this.ctx.fillStyle = color;
        let params = [0, 0, this.canvas.width, this.canvas.height];
        if (point) {
            params = [
                Math.round(point.x * TILESIZE),
                Math.round(point.y * TILESIZE),
                TILESIZE,
                TILESIZE,
            ];
        }
        this.ctx.fillRect(...params);
    }
    drawText(text, strNumber, point, config) {
        const params = [
            text,
            point.x * TILESIZE + 3,
            point.y * TILESIZE + 2 + (12 * strNumber),
        ];
        this.ctx.strokeStyle = config.fillColor;
        this.ctx.fillStyle = config.fillColor;
        this.ctx.font = 'bold 14px Open Sans';
        this.ctx.strokeText(...params);
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
    drawHealthBar(point, health, maxHealth) {
        this.ctx.fillStyle = '#BB0F17';
        let params = [
            point.x * TILESIZE,
            point.y * TILESIZE - (TILESIZE / 6),
            TILESIZE,
            TILESIZE / 8,
        ];
        this.ctx.fillRect(...params);

        this.ctx.fillStyle = '#1C9340';
        params = [
            point.x * TILESIZE,
            point.y * TILESIZE - (TILESIZE / 6),
            TILESIZE * health / (maxHealth / 100) / 100,
            TILESIZE / 8,
        ];
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

export default Drawer;
