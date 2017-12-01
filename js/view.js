// TODO: переделать draw чтобы принимал массив того, что нужно отрисовать

const TILESIZE = 48;

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
            lamp0: [67, 648, 36, 42, 6, 6],
            lamp1: [121, 648, 36, 42, 6, 6],
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
        this.ctx.drawImage(this.tileset, tileArr[0], tileArr[1], tileArr[2], tileArr[3], point.x * TILESIZE + tileArr[4], point.y * TILESIZE + tileArr[5], tileArr[2], tileArr[3]);
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
        this.infoDrawer = new Drawer('info');

        this.layers = data;

        const h = Math.floor($('#map').height() / TILESIZE);
        const w = Math.floor($('#map').width() / TILESIZE);

        $('canvas').attr('height', h * TILESIZE);
        $('canvas').attr('width', w * TILESIZE);

        this.lastRenderTime = Date.now();
        this.FPSLimiter = 1000 / 60; // 60 fps

        this.lastAnimationTime = Date.now();
        this.currentAnimationState = 0;
        this.animationSpeed = 450;

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
            monsters: [],
        };
        for (const monster of this.layers.monsters.data) {
            this.trasitionVars.monsters.push({
                x: monster.position.x,
                y: monster.position.y,
                health: monster.health,
            });
        }
        this.emergingNumbers = [];
    }
    transitVars() {
        // TODO: отрисовка не успевает за моделью, наверное надо блокировать управление

        function getNextValue(modelVar, transVar) {
            return fixMathError(transVar + 0.1 * Math.sign(modelVar - transVar));
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
        // monsters
        const monsters = this.layers.monsters.data;
        for (const index in this.trasitionVars.monsters) {
            if (this.trasitionVars.monsters[index].x !== monsters[index].position.x) {
                this.trasitionVars.monsters[index].x = getNextValue(monsters[index].position.x, this.trasitionVars.monsters[index].x);
            }
            if (this.trasitionVars.monsters[index].y !== monsters[index].position.y) {
                this.trasitionVars.monsters[index].y = getNextValue(monsters[index].position.y, this.trasitionVars.monsters[index].y);
            }
            if (this.trasitionVars.monsters[index].health !== monsters[index].health) {
                this.emergingNumbers.push({
                    value: monsters[index].health - this.trasitionVars.monsters[index].health,
                    opacity: 1,
                    type: 'health',
                    position: {
                        x: this.trasitionVars.monsters[index].x,
                        y: this.trasitionVars.monsters[index].y,
                    },
                });
                this.trasitionVars.monsters[index].health = monsters[index].health;
            }
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
                switch (cell.type) {
                case 'WL':
                    drawer.drawTile((cell.tile) ? 'wallWithGreen' : 'wall', {
                        x: i + this.getViewportCorrection('x'),
                        y: j + this.getViewportCorrection('y'),
                    });
                    break;
                case 'F':
                    drawer.drawTile('floor', {
                        x: i + this.getViewportCorrection('x'),
                        y: j + this.getViewportCorrection('y'),
                    });
                    break;
                case 'L':
                    drawer.drawTile('wall', {
                        x: i + this.getViewportCorrection('x'),
                        y: j + this.getViewportCorrection('y'),
                    });
                    drawer.drawTile('lamp' + this.currentAnimationState, {
                        x: i + this.getViewportCorrection('x'),
                        y: j + this.getViewportCorrection('y'),
                    });
                    break;
                case 'D':
                    drawer.drawTile('wall', {
                        x: i + this.getViewportCorrection('x'),
                        y: j + this.getViewportCorrection('y'),
                    });
                    drawer.drawTile('door', {
                        x: i + this.getViewportCorrection('x'),
                        y: j + this.getViewportCorrection('y'),
                    });
                    break;

                }
            }
        }
    }
    drawPlayer() {
        const drawer = this.playerDrawer;
        const data = this.trasitionVars.playerPosition;

        drawer.clear();
        drawer.drawTile('knight' + this.currentAnimationState, {
            x: data.x - this.trasitionVars.viewport.x,
            y: data.y - this.trasitionVars.viewport.y,
        });
    }
    drawMonsters() {
        const monstersDrawer = this.monstersDrawer;
        const infoDrawer = this.infoDrawer;
        const monsters = this.layers.monsters.data;
        const monstersPositions = this.trasitionVars.monsters;

        monstersDrawer.clear();
        infoDrawer.clear();

        for (const i in monstersPositions) {
            const monsterPos = monstersPositions[i];
            const monsterInfo = monsters[i];

            const point = {
                x: monsterPos.x - this.trasitionVars.viewport.x,
                y: monsterPos.y - this.trasitionVars.viewport.y,
            };

            if (monsterInfo.health > 0) {
                monstersDrawer.drawTile('goblin' + this.currentAnimationState, point);
                if (monsterInfo.health < monsterInfo.stats.health) {
                    infoDrawer.drawHealthBar(point, monsterInfo.health, monsterInfo.stats.health);
                }
            }
            else {
                monstersDrawer.drawTile('skull', point);
            }
        }
    }
    drawFogOfWar() {
        const drawer = this.fogDrawer;
        const playerPosition = this.layers.player.data.position;
        const playerVisionRange = this.layers.player.data.stats.visionRange + 1;
        const map = this.layers.map.data;

        // drawer.clear();
        drawer.fill('rgba(0, 0, 0, 1)');

        for (let i = 0; i < this.viewport.w; i++) {
            for (let j = 0; j < this.viewport.h; j++) {
                const realPoint = {
                    x: i + this.viewport.x,
                    y: j + this.viewport.y,
                };
                if (map[realPoint.x][realPoint.y].explored) {
                    drawer.clear({
                        x: i + this.getViewportCorrection('x'),
                        y: j + this.getViewportCorrection('y'),
                    });

                    const distantion = getDist(playerPosition, realPoint);
                    if (distantion < playerVisionRange && this.layers.map.isVisible(realPoint, playerPosition)) {
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
                    else {
                        drawer.fill('rgba(0, 0, 0, 0.6)', {
                            x: i + this.getViewportCorrection('x'),
                            y: j + this.getViewportCorrection('y'),
                        });
                    }
                }
            }
        }
    }
    drawInfo() {
        const infoDrawer = this.infoDrawer;

        this.emergingNumbers.map((number) => {
            if (number.opacity < 0) {return;}

            const point = {
                x: number.position.x - this.trasitionVars.viewport.x + 0.3,
                y: number.position.y - this.trasitionVars.viewport.y,
            };

            infoDrawer.drawText(number.value, -1, point, {
                fillColor: (number.value > 0) ? `rgba(0, 176, 27, ${number.opacity})` : `rgba(237, 28, 36, ${number.opacity})`,
            });
            number.position.y -= 0.01;
            number.opacity -= 0.02;
        });
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
        const now = Date.now();

        if (now - this.lastAnimationTime >= this.animationSpeed) {
            this.currentAnimationState = (this.currentAnimationState) ? 0 : 1;
            this.lastAnimationTime = now;
        }

        if (now - this.lastRenderTime >= this.FPSLimiter) {
            this.transitVars();

            this.drawMap();
            this.drawPlayer();
            this.drawMonsters();
            this.drawInfo();
            this.drawFogOfWar();
            // this.drawDebugger();
            this.lastRenderTime = now;
        }

    }
}
