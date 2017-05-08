const VIEWPORT_MOVE_DIST = 5;

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

*/

(async () => {
    const tileset = new Image();
    let data = await (await fetch('./php/generator.php')).json();
    const level = new Level(data);
    const render = new Render(level.getData(), tileset);

    tileset.addEventListener('load', () => {
        render.draw();
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
            render.moveViewport(...params);
            render.draw();
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
            let nextPosition = {
                x: level.player.data.position.x + playerShift[0],
                y: level.player.data.position.y + playerShift[1],
            }
            if(level.map.isMovable(nextPosition)) {
                level.player.move(...playerShift);
                let viewportShift;

                if(nextPosition.x - VIEWPORT_MOVE_DIST < render.viewport.x) {
                    viewportShift = [-1, 0];
                }
                if(nextPosition.x + VIEWPORT_MOVE_DIST > render.viewport.x + render.viewport.w) {
                    viewportShift = [1, 0];
                }
                if(nextPosition.y - VIEWPORT_MOVE_DIST < render.viewport.y) {
                    viewportShift = [0, -1];
                }
                if(nextPosition.y + VIEWPORT_MOVE_DIST > render.viewport.y + render.viewport.h) {
                    viewportShift = [0, 1];
                }

                if(viewportShift) {
                    render.moveViewport(...viewportShift);
                    render.draw();
                } else {
                    render.drawPlayer();
                    render.drawFogOfWar();
                }
            }
        }
    });

    tileset.src = './tiles/tileset_s.png';
})();
