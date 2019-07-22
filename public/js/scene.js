// css :root --face-durationと同じにする
const TRANSITION_DURATION = 2000;
/**
 * シーンに関する処理を行うクラス
 * @class
 */
const Scene = (function () {
    /**
     * シーン登録用map
     * ここからfindする
     */
    const scenes = {};
    /**
     * UI
     */
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
    /**
     * テキストの表示スピード (ms/char)
     * @type {number}
     */
    const TEXT_SHOW_SPEED = 10;

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
        Object.assign(this, data);
        this.script_index = 0;
        scenes[this.id] = this;
        // register images
        if (data.img) new Background(data.img);
        if (data.scripts) {
            for (const script of data.scripts) {
                if (script.img) new Background(script.img);
            }
        }
    };
    /**
     * 現在表示中のシーンの参照
     * @type {Scene}
     */
    Scene.current = undefined;
    /**
     * 初期化されているかどうか
     * @type {boolean}
     */
    Scene.initialized = false;
    /**
     * 初期化
     * @param {GameManager} gm ゲームマネージャインスタンスの参照
     * @param {Object} constants 定数パラメータ
     */
    Scene.init = function (gm, constants) {
        Scene.gm = gm;
        Scene.constants = constants;
        document.querySelector(constants.selectors.textarea).addEventListener('click', () => {
            const audio = Audio.find(constants.audios.textarea_click);
            audio.stop();
            audio.play();
        });
        Scene.initialized = true;
    };
    /**
     * シーンを表示する
     */
    Scene.prototype.show = function () {
        Scene.current = this;
        R.textarea.onclick = this.next_script.bind(this);
        if (!this.scripts.length) {
            this.set_choice(this.choice, this.skip_select);
        }
        this.set_image(this.img);
        R.mask.classList.remove(Scene.constants.classes.fade);
        this.set_script(this.scripts[0]);
        if (this.audios) this.set_audios(this.audios);
        console.ok(`Entered Scene '${this.id}'`);
    };
    /**
     * シーンの終了処理（シーンごと）
     */
    Scene.prototype.clear = function () {
        this.last_script = undefined;
        this.last_script_is_choice = false;
        this.script_index = 0;
        this.uneffects();
        this.unstates();
        if (this.audios) this.unset_audios(this.audios);
    };
    /**
     * シーンの終了処理（static）
     */
    Scene.clear = function (fast = false) {
        R.mask.classList.add(Scene.constants.classes.fade);
        Character.hide_all();
        // テキストクリア
        clearInterval(text_show_interval);
        R.text.textContent = '';
        // 選択肢削除
        Scene.clear_choice();
    };
    /**
     * シーンを検索する
     * @param {string} id シーンID
     */
    Scene.find = function (id) {
        return scenes[id];
    };

    /****************************************
     * Background
     ****************************************/
    /**
     * 背景画像を設定する
     * @param {string} url 画像のURL
     */
    Scene.prototype.set_image = function (url) {
        this.current_background = Background.find(url);
        this.current_background && this.current_background.show();
    };
    /**
     * 背景画像の効果を適用する（複数）
     */
    Scene.prototype.effects = function (types) {
        this.current_background && this.current_background.effects(types);
    };
    Scene.prototype.uneffects = function () {
        this.current_background && this.current_background.uneffects();
    };
    Scene.prototype.states = function (types) {
        this.current_background && this.current_background.states(types);
    };
    Scene.prototype.unstates = function () {
        this.current_background && this.current_background.unstates();
    };

    /****************************************
     * Scripts
     ****************************************/
    Scene.prototype.set_script = function (script, wait = 0) {
        if (this.last_script && this.last_script.audios)
            this.unset_audios(this.last_script.audios);
        R.textarea_wrap.classList.remove(Scene.constants.classes.hide);
        R.choice_wrap.classList.add(Scene.constants.classes.hide_opacity);
        R.name.textContent = script.name;
        R.text.textContent = '';
        R.text_hidden.textContent = script.text;
        const str_len = script.text.length;
        let char_index = 0;
        setTimeout(() => {
            text_show_interval = setInterval((() => {
                const f = () => {
                    R.text.textContent = script.text.slice(0, ++char_index);
                    if (char_index == str_len) {
                        clearInterval(text_show_interval);
                        R.text_hidden.appendChild(this.create_text_end());
                    }
                };
                return (f(), f);
            })(), script.speed || TEXT_SHOW_SPEED);
            if (script.audios) this.set_audios(script.audios);
        }, wait);
        setTimeout(() => {
            this.uneffects();
            this.unstates();
            this.set_characters(script.characters || []);
            if (script.img) this.set_image(script.img);
            if (script.effects) this.effects(script.effects);
            if (script.states) this.states(script.states);
        }, 0);
        this.last_script = script;
    };
    Scene.prototype.create_text_end = function () {
        const e = document.createElement('span');
        e.classList.add(Scene.constants.classes.text_end);
        return e;
    };
    Scene.prototype.next_script = function () {
        Audio.find(Scene.constants.audios.textarea_click).stop();
        clearInterval(text_show_interval);
        if (this.script_index < this.scripts.length - 1) {
            const current_script = this.scripts[this.script_index];
            if (!this.last_script_is_choice && current_script.choice) {
                this.set_choice(current_script.choice, current_script.skip_select);
                this.last_script_is_choice = true;
            } else {
                this.set_script(this.scripts[++this.script_index]);
                this.last_script_is_choice = false;
            }
        } else if (this.script_index == this.scripts.length - 1) {
            this.set_choice(this.choice, this.skip_select);
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
        audios_data && audios_data.forEach(e => {
            clearInterval(e.timeout);
            e.timeout = 0;
            Audio.find(e.id).stop(true);
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

    // 複数のキャラクターを配置する
    Scene.prototype.set_characters = function (characters_data) {
        Character.hide_all();
        characters_data.forEach(e => this.set_character(e));
    };
    Scene.prototype.set_character = function (character_data) {
        const character = Character.find(character_data.id);
        character.set_position(character_data);
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
            const avail_choice = choice.filter(e => !e.onflags || Scene.gm.check_flags(e.onflags));
            // console.log(avail_choice);
            if (skip_select && avail_choice.length === 1) {
                console.ok('Skip selection');
                this.advance_scene(avail_choice[0]);
            } else {
                avail_choice.forEach(e => R.choice.appendChild(this.create_one_choice(e)));
            }
        } else {
            R.choice.classList.add(Scene.constants.classes.hide);
        }
    };
    Scene.prototype.create_one_choice = function (e) {
        const btn = document.createElement('button');
        btn.classList.add(Scene.constants.classes.choice_button);
        btn.textContent = e.label;
        btn.addEventListener('click', this.advance_scene.bind(this, e));
        btn.addEventListener('click', this.on_button_click_audio);
        const btnaudio = Audio.find(Scene.constants.audios.choice_hover);
        btn.onmouseover = btnaudio.play.bind(btnaudio, 1.0, false);
        btn.onmouseleave = btnaudio.stop.bind(btnaudio, false);
        return btn;
    };
    Scene.prototype.advance_scene = function (e) {
        if (e.scene_id || e.link)
            this.choice_change_scene(e);
        else
            this.choice_next_script();
        if (e.flags) Scene.gm.set_flags(e.flags);
    };
    Scene.prototype.choice_change_scene = function (e) {
        Scene.clear();
        this.clear();
        console.select(e.link ? `Redirect to '${e.link}'` : `Selected scene '${e.scene_id}'`);
        setTimeout(() => {
            if (e.link) {
                location.href = e.link;
            } else {
                this.show.bind(Scene.find(e.scene_id))();
            }
        }, TRANSITION_DURATION);
    };
    Scene.prototype.choice_next_script = function () {
        console.ok('Go to next script');
        Scene.clear_choice();
        this.next_script();
    };
    Scene.prototype.on_button_click_audio = function () {
        Audio.find(Scene.constants.audios.choice_click).play();
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