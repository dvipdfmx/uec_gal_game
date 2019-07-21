const Character = (function () {
    const list = [];
    const characters = document.querySelector('#characters');
    const load_promises = [];
    const Character = function (data = {
        id: '',
        url: '',
        diffs: [{
            id: '',
            url: '',
        }]
    }) {
        Object.assign(this, data);
        list.push(this);
        this.element = this.create();
    };
    Character.init = function (constants) {
        Character.constants = constants;
    };
    Character.find = function (id) {
        for (const c of list) {
            if (c.id == id) return c;
        }
        return null;
    };
    Character.waitload = function () {
        return Promise.all(load_promises);
    };
    Character.prototype.create = function () {
        const div = document.createElement('div');
        const div_in = document.createElement('div');
        div_in.classList.add(Character.constants.classes.character_in);

        // main
        const image = document.createElement('img');
        image.src = this.url;
        div_in.appendChild(image);
        // diffs
        this.diffs && this.diffs.forEach(e => {
            const image = document.createElement('img');
            image.src = e.url;
            image.classList.add(Character.constants.classes.hide);
            image.classList.add(Character.constants.classes.character_diff);
            load_promises.push(new Promise((res, rej) => {
                image.addEventListener('load', res);
                image.addEventListener('error', res);
            }));
            e.element = image;
            div_in.appendChild(image);
        });

        div.classList.add(Character.constants.classes.character);
        div.classList.add(Character.constants.classes.hide_opacity);
        div.appendChild(div_in);
        characters.appendChild(div);
        return div;
    };
    Character.prototype.set_diff = function (diff_id = undefined) {
        if (!this.diffs) return;
        for (const e of this.diffs) {
            if (diff_id && e.id == diff_id) {
                e.element.classList.remove(Character.constants.classes.hide);
            } else {
                e.element.classList.add(Character.constants.classes.hide);
            }
        }
    };
    Character.prototype.set_position = function (x, y) {
        this.element.classList.remove(Character.constants.classes.hide_opacity);
        this.element.style.left = x + 50 + 'vw';
        this.element.style.top = -y + 50 + 'vh';
    };
    Character.prototype.hide = function () {
        if (this.move_timeout_start) clearTimeout(this.move_timeout_start);
        this.element.classList.add(Character.constants.classes.hide_opacity);
        this.uneffects();
        this.unstates();
    };
    Character.prototype.uneffects = function () {
        if (this.effects_type) {
            this.effects_type.forEach(e => this.element.classList.remove(e));
        }
    };
    Character.prototype.effects = function (types, max_duration = 1000) {
        this.effects_type = types;
        if (this.move_timeout) clearTimeout(this.move_timeout);
        if (this.move_timeout_start) clearTimeout(this.move_timeout_start);
        this.move_timeout_start = setTimeout(() => {
            types.forEach(type => this.element.classList.add(type));
            this.move_timeout = setTimeout(() => {
                types.forEach(type => this.element.classList.remove(type));
            }, max_duration);
        }, 1000);
    };
    Character.prototype.unstates = function () {
        if (this.states_type) {
            this.states_type.forEach(e => this.element.classList.remove(e));
        }
    };
    Character.prototype.states = function (types) {
        this.states_type = types;
        types.forEach(type => this.element.classList.add(type));
    };
    Character.hide_all = function () {
        list.forEach(e => e.hide());
    };
    Character.compile = function (characters_data) {
        characters_data.map(e => new Character(e));
    };
    Character.load = async function (url) {
        Character.compile(await (await fetch(url)).json());
    };
    return Character;
})();