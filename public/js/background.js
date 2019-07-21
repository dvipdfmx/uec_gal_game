const Background = (function () {
    const dict = {};
    let constants = undefined;
    const R = {
        backgrounds: undefined
    };
    const load_promises = [];
    const Background = function (url) {
        this.element = Background.create(url);
        this.url = url;
        dict[url] = this;
    };
    Background.init = function (_constants) {
        constants = _constants;
        R.backgrounds = document.querySelector(constants.selectors.backgrounds);
    };
    Background.waitload = function () {
        return Promise.all(load_promises);
    };
    Background.create = function (url) {
        const img = document.createElement('img');
        img.src = url;
        img.classList.add(constants.classes.hide);
        img.classList.add(constants.classes.background);
        R.backgrounds.appendChild(img);
        load_promises.push(new Promise((res, rej) => {
            img.addEventListener('load', res);
            img.addEventListener('error', rej);
        }));
        return img;
    }
    Background.find = function (url) {
        return dict[url];
    };
    Background.prototype.show = function () {
        for (const key in dict) {
            if (dict.hasOwnProperty(key)) {
                if (this.url === key) {
                    dict[key].element.classList.remove(constants.classes.hide);
                } else {
                    dict[key].element.classList.add(constants.classes.hide);
                }
            }
        }
    }
    Background.prototype.effects = function (types) {
        this.types = types;
        types.forEach(e => this.element.classList.add(e));
    }
    Background.prototype.uneffects = function () {
        if (this.types) {
            this.types.forEach(e => this.element.classList.remove(e));
        }
    };
    return Background;
})();