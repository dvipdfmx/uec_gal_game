const Class = (function () {
    const $ = new WeakMap();
    const private = Symbol('private');
    const Class = function () {
        this.hoge = 'hoge';
        $[this] = {
            class_private_member3: function () {
                console.log('class private 3', this);
            }.bind(this),
        };
    };
    Class.prototype[private] = Object.create(null);
    Class.prototype[private].class_private_member2 = function () {
        console.log('class private 2', this);
    };

    function class_private_member() {
        console.log('class private', this);
    };

    Class.prototype.class_public_member = function () {
        class_private_member.call(eval('this'));
        this[private].class_private_member2.call(this);
        $[this].class_private_member3();
    };

    return Class;
})();

// const p = new Proxy(, {
//     apply: function (target, thisArg, args) {
//         return 33;
//     }
// })
// console.log(p())


const a = new Class();
a.class_public_member();