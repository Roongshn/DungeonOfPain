(async () => {
    const tileset = new Image();
    let data = await (await fetch('./php/generator.php')).json();
    const level = new Level(data);
    const render = new Render(level.getData(), tileset);

    tileset.addEventListener('load', () => {
        render.draw();
    });

    addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowUp':
                render.moveViewport(0, -1);
                render.draw();
                break;
            case 'ArrowRight':
                render.moveViewport(1, 0);
                render.draw();
                break;
            case 'ArrowDown':
                render.moveViewport(0, 1);
                render.draw();
                break;
            case 'ArrowLeft':
                render.moveViewport(-1, 0);
                render.draw();
                break;

        }
    });

    tileset.src = './tiles/tileset.png';
})();
