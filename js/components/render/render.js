import Drawer from './drawer.js';
import { TILESIZE } from '../../helpers/consts.js';
import { fixMathError, getDist } from '../../helpers/helpers.js';

class Render {
    constructor(data, tileset) {
        this.mapDrawer = new Drawer('map', tileset);
        this.charastersDrawer = new Drawer('charasters', tileset);
        this.floorDrawer = new Drawer('floor', tileset);
        this.infoDrawer = new Drawer('info');
        this.fogDrawer = new Drawer('fog', tileset);

        this.debuggerDrawer = new Drawer('debugger');

        this.layers = data;

        this.lastRenderTime = Date.now();
        this.FPSLimiter = 1000 / 60; // 60 fps

        this.lastAnimationTime = Date.now();
        this.currentAnimationState = 0;
        this.animationSpeed = 450;
        this.animationInProgress = false;

        const initCanvasAndViewport = () => {
            const canvases = document.getElementsByTagName('canvas');
            const h = Math.floor(canvases[0].offsetHeight / TILESIZE);
            const w = Math.floor(canvases[0].offsetWidth / TILESIZE);

            for (const canvas of canvases) {
                canvas.setAttribute('height', h * TILESIZE);
                canvas.setAttribute('width', w * TILESIZE);
            }

            this.viewport = {
                h,
                w,
                x: Math.floor(this.layers.player.data.position.x - (w / 2)),
                y: Math.floor(this.layers.player.data.position.y - (h / 2)),
            };
        };

        initCanvasAndViewport();

        window.addEventListener('resize', () => {
            initCanvasAndViewport();
        });

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
        function getNextValue(modelVar, transVar) {
            return fixMathError(transVar + 0.1 * Math.sign(modelVar - transVar)); // TODO: 0.1 ведет к огромному количеству округлений везде далее. Надо подумать об этом
        }
        let animationInProgress = false;

        // player
        const player = this.layers.player.data;
        if (this.trasitionVars.playerPosition.x !== player.position.x) {
            this.trasitionVars.playerPosition.x = getNextValue(player.position.x, this.trasitionVars.playerPosition.x);
            animationInProgress = true;
        }
        if (this.trasitionVars.playerPosition.y !== player.position.y) {
            this.trasitionVars.playerPosition.y = getNextValue(player.position.y, this.trasitionVars.playerPosition.y);
            animationInProgress = true;
        }
        // viewport
        if (this.trasitionVars.viewport.x !== this.viewport.x) {
            if (Math.abs(this.trasitionVars.viewport.x - this.viewport.x) > 1) {
                this.trasitionVars.viewport.x = this.viewport.x;
            }
            else {
                this.trasitionVars.viewport.x = getNextValue(this.viewport.x, this.trasitionVars.viewport.x);
                animationInProgress = true;
            }
        }
        if (this.trasitionVars.viewport.y !== this.viewport.y) {
            if (Math.abs(this.trasitionVars.viewport.y - this.viewport.y) > 1) {
                this.trasitionVars.viewport.y = this.viewport.y;
            }
            else {
                this.trasitionVars.viewport.y = getNextValue(this.viewport.y, this.trasitionVars.viewport.y);
                animationInProgress = true;
            }

        }
        // monsters
        const monsters = this.layers.monsters.data;
        for (const index in this.trasitionVars.monsters) {
            if (this.trasitionVars.monsters[index].x !== monsters[index].position.x) {
                this.trasitionVars.monsters[index].x = getNextValue(monsters[index].position.x, this.trasitionVars.monsters[index].x);
                animationInProgress = true;
            }
            if (this.trasitionVars.monsters[index].y !== monsters[index].position.y) {
                this.trasitionVars.monsters[index].y = getNextValue(monsters[index].position.y, this.trasitionVars.monsters[index].y);
                animationInProgress = true;
            }
            // забрать сюда управление всплывающими цифрами с уроном
        }
        this.animationInProgress = animationInProgress;
    }
    addEmergingNumber(position, value, type) {
        this.emergingNumbers.push({
            value: value,
            opacity: 1,
            type: type,
            position: {
                ...position,
            },
        });
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
    getPlayerMovingDelta() {
        if (this.layers.player.data.position.x !== this.viewport.playerPosition.x) {
            return Math.abs(this.layers.player.data.position.x - this.viewport.playerPosition.x);
        }
        if (this.layers.player.data.position.y !== this.viewport.playerPosition.y) {
            return Math.abs(this.layers.player.data.position.y - this.viewport.playerPosition.y);
        }
        return 0;
    }
    drawMapAndFog() {
        const mapDrawer = this.mapDrawer;
        const fogDrawer = this.fogDrawer;

        const playerPosition = this.layers.player.data.position;
        const playerVisionRange = this.layers.player.data.stats.visionRange + 1;

        const map = this.layers.map;
        const mapData = this.layers.map.data;

        mapDrawer.clear();
        fogDrawer.fill('rgba(0, 0, 0, 1)');

        for (let i = 0; i < this.viewport.w; i++) {
            for (let j = 0; j < this.viewport.h; j++) {

                const realPoint = {
                    x: i + this.viewport.x,
                    y: j + this.viewport.y,
                };

                const correctedPoint = {
                    x: i + this.getViewportCorrection('x'),
                    y: j + this.getViewportCorrection('y'),
                };

                const cell = mapData[realPoint.x][realPoint.y];

                // рисуем карту

                switch (cell.type) {
                case 'WL':
                    mapDrawer.drawTile((cell.tile) ? 'wallWithGreen' : 'wall', correctedPoint);
                    break;
                case 'F':
                    mapDrawer.drawTile('floor', correctedPoint);
                    break;
                case 'L':
                    mapDrawer.drawTile('wall', correctedPoint);
                    mapDrawer.drawTile('lamp' + this.currentAnimationState, correctedPoint);
                    break;
                case 'D':
                    mapDrawer.drawTile('wall', correctedPoint);
                    mapDrawer.drawTile('door', correctedPoint);
                    break;
                }

                // рисуем туман войны
                // фактически 2 тумана ?
                if (cell.explored) {
                    fogDrawer.clear(correctedPoint);

                    const distantion = getDist(playerPosition, realPoint);
                    if (distantion < playerVisionRange && map.isVisible(realPoint, playerPosition)) {
                        if (distantion <= playerVisionRange && distantion >= playerVisionRange - 1) {
                            fogDrawer.fill('rgba(0, 0, 0, 0.3)', correctedPoint);
                        }
                        if (distantion < playerVisionRange - 1 && distantion >= playerVisionRange - 2) {
                            fogDrawer.fill('rgba(0, 0, 0, 0.2)', correctedPoint);
                        }
                    }
                    else {
                        fogDrawer.fill('rgba(0, 0, 0, 0.6)', correctedPoint);
                    }
                }
            }
        }
    }
    drawCharasters() {
        const charastersDrawer = this.charastersDrawer;
        const infoDrawer = this.infoDrawer;
        const floorDrawer = this.floorDrawer;

        const playerPositions = this.trasitionVars.playerPosition;
        const monstersPositions = this.trasitionVars.monsters;

        const monsters = this.layers.monsters.data;

        charastersDrawer.clear();
        infoDrawer.clear();
        floorDrawer.clear();

        // player
        charastersDrawer.drawTile('knight' + this.currentAnimationState, {
            x: playerPositions.x - this.trasitionVars.viewport.x,
            y: playerPositions.y - this.trasitionVars.viewport.y,
        });

        // monsters
        for (const i in monstersPositions) {
            const monsterPos = monstersPositions[i];
            const monsterInfo = monsters[i];

            const point = {
                x: monsterPos.x - this.trasitionVars.viewport.x,
                y: monsterPos.y - this.trasitionVars.viewport.y,
            };

            // alive
            if (monsterInfo.health > 0) {
                charastersDrawer.drawTile('goblin' + this.currentAnimationState, point);
                if (monsterInfo.health < monsterInfo.stats.health) {
                    infoDrawer.drawHealthBar(point, monsterInfo.health, monsterInfo.stats.health);
                }
            } // dead
            else {
                floorDrawer.drawTile('skull', point);
            }
        }
    }
    drawPlayerInventory() {
        // const player = this.layers.player.data;

        // player interface
        // player.inventory.backpack.forEach((item, index) => {
        //     const inventoryCell = $(`.b-inventory__cell:eq(${index}) span`);
        //     if (inventoryCell.attr('class') !== `i-${item.data.sprite}`) {
        //         inventoryCell.attr('class', `i-${item.data.sprite}`);
        //         if (item.data.equipped) {
        //             inventoryCell.parent().addClass('equipped');
        //             $(`.b-equip__cell--${item.data.equipSlot} span`).attr('class', `i-${item.data.sprite}`);
        //         }
        //         else {
        //             inventoryCell.parent().removeClass('equipped');
        //         }
        //     }
        // });
    }
    drawEffects() {
        // TODO: нехорошо полагаться на очисту слоя в предыдущем методе, надо или это туда перенести, или что-то придумать с очисткой
        // TODO: сейчас объект хранит все старые еффекты, надо придумать очистку
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
            number.position.y -= 0.02;
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
            // console.time('Render');
            this.transitVars();

            this.drawMapAndFog();
            this.drawCharasters();
            this.drawEffects();
            // this.drawDebugger();
            this.lastRenderTime = now;
            // console.timeEnd('Render');
        }
    }
}

export default Render;
