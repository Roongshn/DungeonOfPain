function getDist(point1, point2) {
    return Math.sqrt( Math.pow((point2.x-point1.x),2) + Math.pow((point2.y-point1.y),2));
}

function getLine(point1, point2) { //первый параметр - проверяемая точка, второй - позиция наблюдателя
    // brezenheme
    let pointS = {
        x: point1.x,
        y: point1.y,
    };
    let pointF = {
        x: point2.x,
        y: point2.y,
    };

    let result = new Array;

    let d_x = Math.abs(pointF.x - pointS.x);
    let d_y = Math.abs(pointF.y - pointS.y);
    let sign_x = pointS.x < pointF.x ? 1 : -1;
    let sign_y = pointS.y < pointF.y ? 1 : -1;
    //
    let error = d_x - d_y;
    //
    result.push({'x':pointF.x, 'y':pointF.y});
    while(pointS.x != pointF.x || pointS.y != pointF.y) {
        result.push({'x':pointS.x, 'y':pointS.y});
        let error2 = error * 2;
        if(error2 > -d_y) {
            error -= d_y;
            pointS.x += sign_x;
        }
        if(error2 < d_x) {
            error += d_x;
            pointS.y += sign_y;
        }
    }
    return result;
}
