const n = 9;
const cursors = [];
for (let k = 0; k < n; k++) {
    const cursor = document.createElement('img');
    cursor.classList.add('cursor');
    document.body.appendChild(cursor);
    const url = `/public/img/star/${k+1}.png`;
    console.log(url);
    // cursor.style.backgroundImage = `url("${url}");`;
    cursor.src = url;
    cursor.style.marginTop = Math.random() * 20 + 'px';
    cursor.style.marginLeft = Math.random() * 20 + 'px';
    cursors[k] = cursor;
}
const offset = 10;
const moves = [{
    x: 0,
    y: 0
}];
let i = 0;

let p = {};
setInterval(() => {
    if (moves.length) {
        if (moves.length > n) {
            moves.splice(0, moves.length - n);
        }
        for (let j = 0; j < n; j++) {
            const move = moves[j] || moves[moves.length-1];
            cursors[j].classList.remove('hide');
            cursors[j].style.left = move.x + offset + 'px';
            cursors[j].style.top = move.y + offset + 'px';
            cursors[j].style.opacity = j / n;
        }
        moves.shift();
    } else {
        cursors.forEach(e => e.classList.add('hide'));
    }
}, 40);
const skip = 2;
let skipi = 0;
document.addEventListener('mousemove', e => {
    if (skipi++ != skip) {
        return;
    } else {
        skipi = 0;
    }
    moves.push({
        x: e.clientX,
        y: e.clientY
    });
});

const Cursor = (function () {
    const Cursor = function () {

    };

    return Cursor;
})();