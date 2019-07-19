// css :root --face-durationと同じにする
const TRANSITION_DURATION = 2000;
const Scene = (function () {
    const scenes = {};
    const R = {
        background: document.querySelector('#background'),
        mask: document.querySelector('#scene-mask'),

        textarea: document.querySelector('#textarea'),
        textarea_wrap: document.querySelector('#textarea-wrap'),
        // script
        text: document.querySelector('#text'),
        text_hidden: document.querySelector('#text-hidden'),
        name: document.querySelector('#name'),
        // choice
        choice: document.querySelector('#choice'),
        choice_wrap: document.querySelector('#choice-wrap'),
    };
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
                diff: undefined,
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
        choice: [{
            label: undefined,
            scene_id: undefined,
            onflags: {
                ids: [],
                value: true,
                method: 'some|all'
            },
            flags: [{
                id: undefined,
                value: undefined,
                method: undefined,
            }]
        }],
        img: undefined,
        show_selector: false,
        audios: [{
            id: undefined,
            time: undefined,
            // continue_to: 'scene|script id'
        }],
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
    Scene.initialized = false;
    Scene.init = function (gm, constants) {
        Scene.gm = gm;
        Scene.constants = constants;
        document.querySelector(constants.selectors.textarea).addEventListener('click', () => {
            Audio.find(constants.audios.textarea_click).play();
        });

        Scene.initialized = true;
    };
    Scene.prototype.show = function () {
        Scene.current = this;
        R.textarea.onclick = this.next_script.bind(this);
        if (!this.scripts.length) {
            this.set_choice(this.choice);
        }
        this.set_image(this.img);
        R.mask.classList.remove(Scene.constants.classes.fade);
        this.set_script(this.scripts[0]);
        if (this.audios) this.set_audios(this.audios);
    };
    Scene.prototype.clear = function () {
        this.last_script = undefined;
        this.last_script_is_choice = false;
        this.script_index = 0;
        this.uneffects();
        if (this.audios) this.unset_audios(this.audios);
    };
    Scene.clear = function (fast = false) {
        R.mask.classList.add(Scene.constants.classes.fade);
        Character.hide_all();
        // テキストクリア
        clearInterval(text_show_interval);
        R.text.textContent = '';
        // 選択肢削除
        Scene.clear_choice();
    };
    Scene.find = function (id) {
        return scenes[id];
    };

    /****************************************
     * Background
     ****************************************/
    Scene.prototype.set_image = function (url) {
        R.background.src = url;
    };
    Scene.prototype.effects = function (types) {
        types.forEach(e => R.background.classList.add(e));
    };
    Scene.prototype.uneffects = function () {
        R.background.className = '';
    };

    /****************************************
     * Scripts
     ****************************************/
    Scene.prototype.set_script = function (script, wait = 0) {
        if (this.last_script && this.last_script.audios)
            this.unset_audios(this.last_script.audios);
        R.textarea_wrap.classList.remove(Scene.constants.classes.hide);
        R.choice_wrap.classList.add(Scene.constants.classes.hide_opacity);
        // speaker's name
        R.name.textContent = script.name;
        // set hiddentext
        R.text_hidden.textContent = script.text;
        const str_len = script.text.length;
        let char_index = 0;
        // 文字を順次表示
        setTimeout(() => {
            text_show_interval = setInterval((() => {
                const f = () => {
                    R.text.textContent = script.text.slice(0, ++char_index);
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
            this.uneffects();
            this.set_characters(script.characters || []);
            if (script.effects) this.effects(script.effects);
        }, 0);
        this.last_script = script;
    };
    Scene.prototype.next_script = function () {
        Audio.find(Scene.constants.audios.textarea_click).stop();
        clearInterval(text_show_interval);
        if (this.script_index < this.scripts.length - 1) {
            if (!this.last_script_is_choice && this.scripts[this.script_index].choice) {
                this.set_choice(this.scripts[this.script_index].choice);
                this.last_script_is_choice = true;
            } else {
                this.set_script(this.scripts[++this.script_index]);
                this.last_script_is_choice = false;
            }
        } else if (this.script_index == this.scripts.length - 1) {
            this.set_choice(this.choice);
        } else {
            return;
        }
        Audio.find(Scene.constants.audios.textarea_click).play();
    };

    /****************************************
     * Audio
     * 
     * audios_data = {
            "id": string,
            "time": number,
            "volume": float,
            "fadein": boolean,
            "loop": boolean,
        }
     ****************************************/
    Scene.prototype.set_audios = function (audios_data) {
        audios_data.forEach(e => this.set_audio(e));
    };
    Scene.prototype.unset_audios = function (audios_data) {
        audios_data.forEach(e => {
            clearInterval(e.timeout);
            e.timeout = 0;
            Audio.find(e.id).stop();
        });
    };
    Scene.prototype.set_audio = function (audio_data) {
        const audio = Audio.find(audio_data.id);
        const audio_timeout = setTimeout(() => {
            audio.play(audio_data.volume == undefined ? 1.0 : audio_data.volume, audio_data.fadein);
        }, audio_data.time);
        audio_data.timeout = audio_timeout;
    };

    /****************************************
     * Character
     ****************************************/
    Scene.prototype.set_characters = function (characters_data) {
        Character.hide_all();
        characters_data.forEach(e => this.set_character(e));
    };
    Scene.prototype.set_character = function (character_data) {
        const character = Character.find(character_data.id);
        character.set_position(character_data.x, character_data.y);
        character.set_diff(character_data.diff);
        if (character_data.effects) character.effects(character_data.effects);
        if (character_data.states) character.states(character_data.states);
    };

    /****************************************
     * Choice
     ****************************************/

    Scene.prototype.set_choice = function (choice, skip_select = false) {
        R.textarea_wrap.classList.add(Scene.constants.classes.hide);
        R.choice_wrap.classList.remove(Scene.constants.classes.hide_opacity);
        if (choice && choice.length) {
            R.choice.classList.remove(Scene.constants.classes.hide);
            const avail_choice = choice.filter(e => e.onflags && !Scene.gm.check_flags(e.onflags));
            if (skip_select && avail_choice.length == 1) {

            } else {
                avail_choice.forEach(e => R.choice.appendChild(this.create_one_choice(e)));
            }
        } else {
            R.choice.classList.add(Scene.constants.classes.hide);
        }
    };
    Scene.prototype.create_one_choice = function (e) {
        const self = this;
        const btn = document.createElement('button');
        btn.classList.add(Scene.constants.classes.choice_button);
        btn.textContent = e.label;
        btn.addEventListener('click', () => {
            if (e.scene_id) {
                // change scene
                Scene.clear();
                self.clear();
                setTimeout(() => {
                    self.show.bind(Scene.find(e.scene_id))();
                }, TRANSITION_DURATION);
            } else {
                // goto next script
                Scene.clear_choice();
                self.next_script();
            }
            // flags
            if (e.flags) Scene.gm.set_flags(e.flags);
        });
        btn.addEventListener('click', () => {
            Audio.find(Scene.constants.audios.choice_click).play();
        });
        const btnaudio = Audio.find(Scene.constants.audios.choice_hover);
        btn.onmouseover = btnaudio.play.bind(btnaudio, 1.0, false);
        btn.onmouseleave = btnaudio.stop.bind(btnaudio, false);
        R.choice.appendChild(btn);
        return btn;
    };
    Scene.clear_choice = function () {
        while (R.choice.firstChild) R.choice.removeChild(R.choice.firstChild);
    };
    Scene.compile = function (scenes_data) {
        scenes_data.map(e => new Scene(e));
    };
    Scene.load = async function (url) {
        Scene.compile(await (await fetch(url)).json());
    };
    return Scene;
})();