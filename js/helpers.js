function getDist(point1, point2) {
    return Math.sqrt(Math.pow((point2.x - point1.x), 2) + Math.pow((point2.y - point1.y), 2));
}

function getLine(point1, point2) { // первый параметр - проверяемая точка, второй - позиция наблюдателя
    // brezenheme
    const pointS = {
        x: point1.x,
        y: point1.y,
    };
    const pointF = {
        x: point2.x,
        y: point2.y,
    };

    const result = new Array();

    const dX = Math.abs(pointF.x - pointS.x);
    const dY = Math.abs(pointF.y - pointS.y);
    const signX = pointS.x < pointF.x ? 1 : -1;
    const signY = pointS.y < pointF.y ? 1 : -1;

    let error = dX - dY;

    result.push({ 'x': pointF.x, 'y': pointF.y });

    while (pointS.x !== pointF.x || pointS.y !== pointF.y) {
        result.push({ 'x': pointS.x, 'y': pointS.y });
        const error2 = error * 2;
        if (error2 > -dY) {
            error -= dY;
            pointS.x += signX;
        }
        if (error2 < dX) {
            error += dX;
            pointS.y += signY;
        }
    }
    return result;
}

function getActionDuration(actionName, abilityValue) {
    // actionName нужно на случай нестандартных формул рассчета продолжительности
    return BASE_DURATION - abilityValue;
}

const requestAnimFrame = (() => {
    return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();

function fixMathError(value) {
    const accuracy = 1;
    return Number(value.toFixed(accuracy));
}
