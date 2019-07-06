// css :root --face-durationと同じにする
const TRANSITION_DURATION = 2000;
const Scene = (function () {
    // static member
    const scenes = {};
    const continuous_audio = [];
    const text = document.querySelector('#text');
    const text_hidden = document.querySelector('#text-hidden');
    const ename = document.querySelector('#name');
    const image = document.querySelector('#background');
    const selector = document.querySelector('#selector');
    const mask = document.querySelector('#scene-mask');
    const next = document.querySelector('#textarea');
    const textarea_wrap = document.querySelector('#textarea-wrap');
    const selectors_wrap = document.querySelector('#selectors-wrap');

    let text_show_interval = 0;

    const TEXT_SHOW_SPEED = 30;

    const Scene = function (data = {
        id: undefined,
        scripts: [{
            name: undefined,
            text: undefined,
            speed: 0,
            characters: [{
                id: undefined,
                x: 50,
                y: 50,
                states: [],
                effects: [],
            }],
            effects: [],
            // state:undefined,
            audios: [{
                id: undefined,
                time: undefined,
                volume: 1.0
            }]
        }],
        choice: undefined,
        img: undefined,
        show_selector: false,
        audios: [{
            id: undefined,
            time: undefined,
            continue_to: 'scene|script id'
        }]
    }) {
        this.script_index = 0;
        this.scripts = data.scripts;
        this.id = data.id;
        this.choice = data.choice;
        this.img = data.img;
        this.audios = data.audios;
        scenes[this.id] = this;
    };
    Scene.current = undefined;

    // class member
    Scene.prototype.set_script = function (script, wait = 0) {
        if (this.last_script && this.last_script.audios) this.unset_audios(this.last_script.audios);
        textarea_wrap.classList.remove('hide');
        selectors_wrap.classList.add('hide-opacity');
        ename.textContent = script.name;
        text_hidden.textContent = script.text;
        const str_len = script.text.length;
        let char_index = 0;
        // 文字を順次表示
        setTimeout(() => {
            text_show_interval = setInterval((() => {
                const f = () => {
                    text.textContent = script.text.slice(0, ++char_index);
                    if (char_index == str_len) {
                        clearInterval(text_show_interval);
                    }
                };
                return (f(), f);
            })(), script.speed || TEXT_SHOW_SPEED);
            if (script.audios) this.set_audios(script.audios);
        }, wait);
        setTimeout(() => {
            // キャラクターの表示
            this.set_characters(script.characters || []);
            this.uneffects();
            if (script.effects) this.effects(script.effects);
        }, 0);
        this.last_script = script;
    };
    Scene.prototype.effects = function (types) {
        types.forEach(e => image.classList.add(e));
    };
    Scene.prototype.uneffects = function () {
        image.className = '';
    };
    Scene.prototype.set_image = function (url) {
        image.src = url;
    };
    Scene.prototype.next_script = function () {
        clearInterval(text_show_interval);
        this.script_index++;
        if (this.script_index < this.scripts.length) {
            this.set_script(this.scripts[this.script_index]);
        } else if (this.script_index == this.scripts.length) {
            this.set_choice(this.choice);
        } else {
            this.script_index--;
            return;
        }
    };
    Scene.prototype.show = function () {
        Scene.current = this;
        next.onclick = this.next_script.bind(this);
        if (!this.scripts.length) {
            this.set_choice(this.choice);
        }
        this.set_image(this.img);
        mask.classList.remove('fade');
        this.set_script(this.scripts[0]);
        if (this.audios) this.set_audios(this.audios);
    };
    Scene.prototype.clear = function () {
        Scene.prototype.last_script = undefined;
        this.script_index = 0;
        this.uneffects();
        if (this.audios) this.unset_audios(this.audios);
    };
    Scene.clear = function (fast = false) {
        // フェードアウト
        // if (fast) {
        //     mask.classList.add('fast');
        //     mask.classList.remove('fast');
        //     setTimeout(() => {}, TRANSITION_DURATION);
        // }
        mask.classList.add('fade');
        Character.hide_all();
        // テキストクリア
        clearInterval(text_show_interval);
        text.textContent = '';
        // 選択肢削除
        while (selector.firstChild) selector.removeChild(selector.firstChild);

    };
    Scene.find = function (id) {
        return scenes[id];
    };

    //-- Audio
    Scene.prototype.set_audios = function (audios_data) {
        audios_data.forEach(e => this.set_audio(e));
    };
    Scene.prototype.unset_audios = function (audios_data, /* scene_or_script_id = undefined */ ) {
        audios_data.forEach(e => {
            clearInterval(e.timeout);
            e.timeout = 0;
            // if (e.continue_to) {
            //     continuous_audio.push(e);
            // } else {
            Audio.find(e.id).stop();
            // }
        });
        // continuous_audio.forEach(e => {
        //     if (e.id == scene_or_script_id) {
        //         Audio.find(e.id).stop();
        //     }
        // });
    };
    // Scene.prototype.check_continuous_audio=function
    Scene.prototype.set_audio = function (audio_data) {
        const audio = Audio.find(audio_data.id);
        const audio_timeout = setTimeout(() => {
            audio.play(audio_data.volume == undefined ? 1.0 : audio_data.volume, audio_data.fadein);
        }, audio_data.time);
        audio_data.timeout = audio_timeout;
    };
    //--/ Audio

    Scene.prototype.set_characters = function (characters_data) {
        Character.hide_all();
        characters_data.forEach(e => this.set_character(e));
    };
    Scene.prototype.set_character = function (character_data) {
        const character = Character.find(character_data.id);
        character.set_position(character_data.x, character_data.y);
        if (character_data.effects) character.effects(character_data.effects);
        if (character_data.states) character.states(character_data.states);
    };
    Scene.prototype.set_choice = function (choice) {
        // while (selector.firstChild) selector.removeChild(selector.firstChild);
        textarea_wrap.classList.add('hide');
        selectors_wrap.classList.remove('hide-opacity');
        const self = this;
        if (choice && choice.length) {
            selector.classList.remove('hide');
            choice.forEach(e => {
                const btn = document.createElement('button');
                btn.classList.add('gal-btn');
                btn.textContent = e.label;
                btn.onclick = () => {
                    Scene.clear();
                    self.clear();
                    setTimeout(() => {
                        self.show.bind(Scene.find(e.scene_id))();
                    }, TRANSITION_DURATION);
                };
                selector.appendChild(btn);
            });
        } else {
            selector.classList.add('hide');
        }
    };
    Scene.compile = function (scenes_data) {
        scenes_data.map(e => new Scene(e));
    };
    return Scene;
})();

const Character = (function () {
    const list = [];
    const CHARACTER_CLASS = 'character';
    const characters = document.querySelector('#characters');
    const Character = function (data = {
        id: '',
        url: '',
    }) {
        Object.assign(this, data);
        list.push(this);
        this.element = this.create();
    };
    Character.find = function (id) {
        for (const c of list) {
            if (c.id == id) return c;
        }
        return null;
    };
    Character.prototype.create = function () {
        const div = document.createElement('div');
        const image = document.createElement('img');
        image.src = this.img;
        div.classList.add(CHARACTER_CLASS);
        div.classList.add('hide-opacity');
        div.appendChild(image);
        characters.appendChild(div);
        return div;
    };
    Character.prototype.set_position = function (x, y) {
        this.element.classList.remove('hide-opacity');
        this.element.style.left = x + 50 + 'vw';
        this.element.style.top = -y + 50 + 'vh';
    };
    Character.prototype.hide = function () {
        if (this.move_timeout_start) clearTimeout(this.move_timeout_start);
        this.element.classList.add('hide-opacity');
        // this.element.classList.add('character');
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
    return Character;
})();


const Audio = (function () {
    const dict = {};
    const audioel = document.querySelector('#audios');
    const Audio = function (data = {
        id: undefined,
        url: undefined,
    }) {
        Object.assign(this, data);
        this.element = this.create();
        dict[this.id] = this;
    };
    Audio.prototype.create = function () {
        const audio = document.createElement('audio');
        audio.src = this.url;
        audio.preload = 'auto';
        audioel.appendChild(audio);
        return audio;
    };
    Audio.compile = function (audios_data) {
        audios_data.forEach(e => new Audio(e));
    };
    Audio.find = function (id) {
        return dict[id];
    };

    Audio.prototype.play = function (target_volume = 1.0, fadein = false) {
        const self = this;
        if (fadein) {
            this.element.volume = 0.0;
            this.element.play();
            (function volume_up(volume) {
                self.element.volume = volume;
                setTimeout(() => {
                    volume += 0.1;
                    if (volume <= target_volume) {
                        volume_up(volume);
                    }
                }, TRANSITION_DURATION / 10);
            })(self.element.volume);
        } else {
            this.element.volume = target_volume;
            this.element.play();
        }
    };
    Audio.prototype.stop = function () {
        const self = this;
        (function volume_down(volume) {
            self.element.volume = volume;
            setTimeout(() => {
                volume -= 0.1;
                if (volume > 0) {
                    volume_down(volume)
                } else {
                    self.element.pause();
                    self.element.currentTime = 0;
                }
            }, TRANSITION_DURATION / 10);
        })(self.element.volume);
    };
    return Audio;
})();