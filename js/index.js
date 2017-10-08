const VIEWPORT_MOVE_DIST = 7;
const BASE_DURATION = 100;
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

// TODO:
/*
Рендер: просто цикл, который беспрерывно отрисовывет модель
В перспективе можно добавить флаги обновления конкретных слоёв, чтобы не пререрисовывать постоянно

Вся игровая механика просто меняет модель с определенными задержками, рендер ничего про это не знает, и просто забирает обновления

*/

class GameEngine {
    constructor(data, tileset) {
        const that = this;

        this.level = new Level(data);
        this.render = new Render(this.level.getData(), tileset);
        this.render.draw();

        function renderCycle() {
            that.render.draw();
            requestAnimFrame(renderCycle)
        }
        renderCycle();
    }
    movePlayer(shift) {
        // const map = this.level.map;
        const player = this.level.player;
        const viewport = this.render.viewport;

        let nextPosition = {
            x: player.position.x + shift[0],
            y: player.position.y + shift[1],
        }
        const moveResult = player.move(nextPosition);

        if(moveResult !== false) {
            let viewportShift;

            if(nextPosition.x - VIEWPORT_MOVE_DIST < viewport.x) {
                viewportShift = [-1, 0];
            }
            if(nextPosition.x + VIEWPORT_MOVE_DIST > viewport.x + viewport.w) {
                viewportShift = [1, 0];
            }
            if(nextPosition.y - VIEWPORT_MOVE_DIST < viewport.y) {
                viewportShift = [0, -1];
            }
            if(nextPosition.y + VIEWPORT_MOVE_DIST > viewport.y + viewport.h) {
                viewportShift = [0, 1];
            }
            if(viewportShift) {
                this.render.moveViewport(...viewportShift);
            } else {
                // this.render.drawPlayer(); // вот эту фигню надо заменить флагами для перерисовки только нужных слоёв, пока можно забить
                // this.render.drawFogOfWar();
            }
        }
        this.doMainCicle();
    }
    doMainCicle() {
        const player = this.level.player;
        const monsters = this.level.monsters;
        const map = this.level.map;

        monsters.data.forEach((monster) => {
            monster.decide(player, map);
        });
        this.render.drawMonsters();
    }
}


(async () => {
    const tileset = new Image();
    let data = await (await fetch('./php/generator.php')).json();

    tileset.addEventListener('load', () => {
        game = new GameEngine(data, tileset);
    });

    addEventListener('keydown', (e) => {
        //прокрутка карты
        if(e.keyCode>=37 && e.keyCode <= 40) {
            let params;
            switch (e.keyCode) {
                case 38:
                    params = [0, -1];
                    break;
                case 39:
                    params = [1, 0];
                    break;
                case 40:
                    params = [0, 1];
                    break;
                case 37:
                    params = [-1, 0];
                    break;
            }
            game.render.moveViewport(...params);
            // game.render.draw();
        }

        if(e.keyCode === 87 || e.keyCode === 65 || e.keyCode === 83 || e.keyCode === 68) {
            let playerShift;
            switch (e.keyCode) {
                case 87:
                    playerShift = [0, -1];
                    break;
                case 65:
                    playerShift = [-1, 0];
                    break;
                case 83:
                    playerShift = [0, 1];
                    break;
                case 68:
                    playerShift = [1, 0];
                    break;
            }
            game.movePlayer(playerShift);
        }
    });

    tileset.src = './tiles/tileset_b.png';
})();
