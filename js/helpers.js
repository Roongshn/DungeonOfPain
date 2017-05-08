function getDist(point1, point2) {
    return Math.floor(Math.sqrt( Math.pow((point2.x-point1.x),2) + Math.pow((point2.y-point1.y),2)));
}
function getLine(point1, point2) { //первый параметр - проверяемая точка, второй - позиция наблюдателя
    // TODO: разобраться, почему всё упарывается, если передать параметры не в том порядке
    // brezenheme
    let result = new Array;

    let d_x = Math.abs(point2.x - point1.x);
    let d_y = Math.abs(point2.y - point1.y);
    let sign_x = point1.x < point2.x ? 1 : -1;
    let sign_y = point1.y < point2.y ? 1 : -1;
    //
    let error = d_x - d_y;
    //
    result.push({'x':point2.x, 'y':point2.y});
    while(point1.x != point2.x || point1.y != point2.y) {
        result.push({'x':point1.x, 'y':point1.y});
        let error2 = error * 2;
        if(error2 > -d_y) {
            error -= d_y;
            point1.x += sign_x;
        }
        if(error2 < d_x) {
            error += d_x;
            point1.y += sign_y;
        }
    }
    return result;
}
