<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Dungeon of Pain 0.2.5</title>
        <link rel="shortcut icon" href="favicon.ico">
        <link rel="stylesheet" href="./css/style.css">
        <link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet">
        <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body>
        <div class="b-player" style="display: none;">
            <div class="b-player__avatar"></div>
            <div class="b-player__health b-player__bar">
                <div class="b-player__bar-progress"></div>
            </div>
            <div class="b-player__equip b-equip">
                <div class="b-equip__cell b-equip__cell--head">
                    <span></span>
                </div>
                <div class="b-equip__cell b-equip__cell--body">
                    <span></span>
                </div>
                <div class="b-equip__cell b-equip__cell--legs">
                    <span></span>
                </div>
                <div class="b-equip__cell b-equip__cell--lhand">
                    <span></span>
                </div>
                <div class="b-equip__cell b-equip__cell--rhand">
                    <span></span>
                </div>
            </div>
            <div class="b-player__inventory b-inventory">
                <div class="b-inventory__cell">
                    <span></span>
                </div>
                <div class="b-inventory__cell ">
                    <span></span>
                </div>
                <div class="b-inventory__cell">
                    <span></span>
                </div>
                <div class="b-inventory__cell">
                    <span></span>
                </div>
                <div class="b-inventory__cell">
                    <span></span>
                </div>
                <div class="b-inventory__cell">
                    <span></span>
                </div>
                <div class="b-inventory__cell ">
                    <span></span>
                </div>
                <div class="b-inventory__cell">
                    <span></span>
                </div>
                <div class="b-inventory__cell">
                    <span></span>
                </div>
                <div class="b-inventory__cell">
                    <span></span>
                </div>
            </div>
        </div>
        <div class="b-mobile-ui">
            <button type="button" name="button" class="b-mobile-ui__btn b-mobile-ui__btn--up" data-direction="87"></button>
            <button type="button" name="button" class="b-mobile-ui__btn b-mobile-ui__btn--right" data-direction="68"></button>
            <button type="button" name="button" class="b-mobile-ui__btn b-mobile-ui__btn--bottom" data-direction="83"></button>
            <button type="button" name="button" class="b-mobile-ui__btn b-mobile-ui__btn--left" data-direction="65"></button>
        </div>
        <div class="game">
            <canvas id='map'>Your browser suck</canvas>
            <canvas id='floor'>Your browser suck</canvas>
            <canvas id='charasters'>Your browser suck</canvas>
            <canvas id='info'>Your browser suck</canvas>
            <canvas id='fog'>Your browser suck</canvas>
            <canvas id='debugger'>Your browser suck</canvas>
        </div>

        <script type="module" src="./js/index.js"></script>
    </body>
</html>
