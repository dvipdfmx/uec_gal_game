console.ok = function (msg) {
    console.log(`%c${msg}`, 'color:green');
}
console.err = function (msg) {
    console.log(`%c${msg}`, 'color:red');
}
console.war = function (msg) {
    console.log(`%c${msg}`, 'color:yellow');
}
console.flag = function (msg) {
    console.log(`%c${msg}`, 'color:blue');
}
console.select = function (msg) {
    console.log(`%c${msg}`, 'color:violet');
}
console.default = function (msg) {
    console.log(msg);
}