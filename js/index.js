import Render from './components/render/render.js';
import Level from './components/map/level.js';
import {
    requestAnimFrame,
    viewportKeysResolver,
    playerKeysResolver,
} from './helpers/helpers.js';

/*
Игровая механика:

Каждое действие игрока вызывает некоторое количество игровых циклов, в которые обрабатывается поведение мира
Продумать: связь числового параметра типа скорость передвижения или атаки и частотой действий
Видится что-то вроде:
0 - это 100%,
-100(штраф) = 0%
+100 полная прокачка = 200%

прокачка:
скорость 5 = 105% = каждые 95 тиков

игрок и все мобы помещаются в односвязный список и имеют продолжительность
каждое действие игрока увеличивает его продолжительность
после каждого действия игрока мобы могут действовать, пока их продолжительность <= продолжительности игрока
Эффекты действуют также. При наложении им выставляется продолжительность игрока и конечная продолжительность
У голода и автолечения продолжительность -1, бесконечные

*/

/*
Боевая система:

    Статы:
        Сила
        Ловкость
        Интеллект
        Скорость
        Удача

        Здоровье
        Мана

    Урон в ближнем бою:
        (Урон оружия = рандом(минУронб максУрон))  * сила

    Урон в дальнем бою:
        (Урон оружия = рандом(минУронб максУрон))  * ловкость

 */

/* TODO: В перспективе НУЖНО добавить флаги обновления конкретных слоёв, чтобы не пререрисовывать постоянно

Вообще надо исследовать рендер на предмет избыточности

Попробовать уменьшить количество пикселей

*/

class GameEngine {
    constructor(data, tileset) {
        const that = this;

        this.level = new Level(data);
        this.render = new Render(this.level.getData(), tileset);

        this.actions = {
            melee(person, opponent) {
                const opponentArmor = 1;
                let damage = person.attack() - opponentArmor;
                damage = (damage > 0 ? damage : 0);

                opponent.health -= damage;

                that.render.addEmergingNumber(opponent.position, -damage, 'health');

                return !!damage;
            },
        };

        this.exploreMap(this.level.player.position);

        function renderCycle() {
            that.render.draw();
            requestAnimFrame(renderCycle);
        }
        renderCycle();

        // that.render.drawPlayerInventory();

        addEventListener('keydown', (e) => {
            if (this.render.animationInProgress) {
                return;
            }
            // прокрутка карты
            const viewportShift = viewportKeysResolver(e.keyCode);
            if (viewportShift) {
                this.render.moveViewport(...viewportShift);
            }
            // управление игроком
            const playerShift = playerKeysResolver(e.keyCode);
            if (playerShift) {
                this.actionHandler(playerShift);
            }
        });

        addEventListener('click', (e) => {
            const directionKeyCode = e.target.attributes['data-direction'];
            if (!directionKeyCode) {
                return;
            }

            const playerShift = playerKeysResolver(directionKeyCode.value);
            if (playerShift) {
                this.actionHandler(playerShift);
            }
        });

    }
    exploreMap(playerPosition) {
        const map = this.level.map;
        const playerVisionRange = this.level.player.stats.visionRange + 1;

        for (let i = -playerVisionRange; i < playerVisionRange; i++) {
            for (let j = -playerVisionRange; j < playerVisionRange; j++) {
                const realPoint = {
                    x: i + playerPosition.x,
                    y: j + playerPosition.y,
                };
                if (map.isVisible(realPoint, playerPosition)) {
                    // TODO: Есть идея сделать "забывание" карты. Тогда "разведанность" клетки станет числом, которое будет убавляться по какому-то принципу
                    map.data[realPoint.x][realPoint.y].explored = true;
                }
            }
        }
    }
    actionHandler(shift) {
        const player = this.level.player;

        if (player.health === 0) {return;}

        const map = this.level.map.data;
        const monsters = this.level.monsters.data;
        const viewport = this.render.viewport;

        const viewportShiftDist = Math.round(Math.min(viewport.h, viewport.w) / 4);

        const nextPosition = {
            x: player.position.x + shift[0],
            y: player.position.y + shift[1],
        };

        const monster = monsters[map[nextPosition.x][nextPosition.y].charaster];

        if (monster && monster.status !== 'dead') {
            this.actions.melee(player, monster);
        }
        else {
            const moveResult = player.move(nextPosition);

            if (moveResult !== false) {
                let viewportShift;

                if (nextPosition.x - viewportShiftDist < viewport.x) {
                    viewportShift = [-1, 0];
                }
                if (nextPosition.x + viewportShiftDist > viewport.x + viewport.w) {
                    viewportShift = [1, 0];
                }
                if (nextPosition.y - viewportShiftDist < viewport.y) {
                    viewportShift = [0, -1];
                }
                if (nextPosition.y + viewportShiftDist > viewport.y + viewport.h) {
                    viewportShift = [0, 1];
                }

                if (viewportShift) {
                    this.render.moveViewport(...viewportShift);
                }

                // разведка карты
                this.exploreMap(nextPosition);
            }
        }

        this.doMainCicle();
    }
    doMainCicle() {
        const player = this.level.player;
        const monsters = this.level.monsters;
        // const map = this.level.map;

        monsters.data.forEach((monster) => {
            monster.decide(player, this.actions);
        });
    }
}

(async() => {
    const tileset = new Image();
    const data = await (await fetch('./php/generator.php')).json();
    // const game;

    tileset.addEventListener('load', () => {
        const game = new GameEngine(data, tileset);
    });

    tileset.src = './tiles/full_tileset_b.png';
})();
