const Scene = (function () {
    // static member
    const scenes = {};
    const text = document.querySelector('#text');
    const ename = document.querySelector('#name');
    const image = document.querySelector('#background');
    const selector = document.querySelector('#selector');
    const mask = document.querySelector('#scene-mask');
    const next = document.querySelector('#textarea');
    let text_show_interval = 0;

    const TRANSITION_DURATION = 1000;
    const TEXT_SHOW_DURATION = 3000;

    const Scene = function (data = {
        id: undefined,
        scripts: [{
            name: undefined,
            text: undefined,
            duration: 0,
            characters: [{
                id: undefined,
                x: 50,
                y: 50,
            }]
        }],
        choice: undefined,
        img: undefined,
        show_selector: false,
    }) {
        this.script_index = 0;
        this.scripts = data.scripts;
        this.id = data.id;
        this.choice = data.choice;
        this.img = data.img;
        scenes[this.id] = this;
    };
    Scene.current = undefined;

    // class member
    Scene.prototype.set_script = function (script) {
        ename.textContent = script.name;
        const str_len = script.text.length;
        const ms_per_char = (script.duration || TEXT_SHOW_DURATION) / str_len
        let char_index = 0;
        // 文字を順次表示
        text_show_interval = setInterval((() => {
            const f = () => {
                text.textContent = script.text.slice(0, ++char_index);
                if (char_index == str_len) {
                    clearInterval(text_show_interval);
                }
            };
            return (f(), f);
        })(), ms_per_char);
        // キャラクターの表示
        this.set_characters(script.characters || []);
    };
    Scene.prototype.set_image = function (url) {
        image.src = url;
    };
    Scene.prototype.next_script = function () {
        clearInterval(text_show_interval);
        this.script_index++;
        if (this.script_index < this.scripts.length - 1) {
            this.set_script(this.scripts[this.script_index]);
        } else if (this.script_index == this.scripts.length - 1) {
            this.set_choice(this.choice);
            this.set_script(this.scripts[this.script_index]);
        } else {
            this.script_index--;
            return;
        }
    };
    Scene.prototype.show = function () {
        Scene.current = this;
        next.onclick = this.next_script.bind(this);
        clearInterval(text_show_interval);
        const mask_class = 'fade';
        mask.classList.add(mask_class);
        text.textContent = '';
        setTimeout(() => {
            if (this.scripts.length == 1) {
                selector.classList.remove('hide');
                this.set_choice(this.choice);
            } else {
                selector.classList.add('hide');
            }
            this.set_image(this.img);
        }, TRANSITION_DURATION / 2);
        setTimeout(() => {
            this.set_script(this.scripts[0]);
            mask.classList.remove(mask_class);
        }, 1000);
    };
    Scene.prototype.find_scene = function (id) {
        console.log(id);
        for (const key in scenes) {
            if (scenes.hasOwnProperty(key)) {
                const scene = scenes[key];
                if (scene.id == id) return scene;
            }
        }
        console.log('scene not found: id : ' + id)
        return null;
    };
    // const previous_characters = [];
    Scene.prototype.set_characters = function (characters_data) {
        Character.hide_all();
        characters_data.forEach(e => this.set_character(e));
    };
    Scene.prototype.set_character = function (character_data) {
        const character = Character.find(character_data.id);
        character.set_position(character_data.x, character_data.y);
        if (character_data.move) character.move(character_data.move);
    };
    Scene.prototype.set_choice = function (choice) {
        while (selector.firstChild) selector.removeChild(selector.firstChild);
        if (choice && choice.length) {
            selector.classList.remove('hide');
            choice.forEach(e => {
                const btn = document.createElement('button');
                btn.classList.add('gal-btn');
                btn.textContent = e.label;
                btn.onclick = this.show.bind(this.find_scene(e.scene_id));
                selector.appendChild(btn);
            });
        } else {
            selector.classList.add('hide');
        }
    };
    Scene.prototype.start = function () {

    };
    Scene.prototype.end = function () {

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
        if (this.move_timeout) clearTimeout(this.move_timeout);
        if (this.move_timeout_start) clearTimeout(this.move_timeout_start);
        this.element.classList.add('hide-opacity');
    };
    Character.prototype.move = function (type, max_duration = 1000) {
        if (this.move_timeout) clearTimeout(this.move_timeout);
        if (this.move_timeout_start) clearTimeout(this.move_timeout_start);
        this.move_timeout_start = setTimeout(() => {
            this.element.classList.add(type);
            this.move_timeout = setTimeout(() => {
                this.element.classList.remove(type);
            }, max_duration);
        }, 1000);
    };
    Character.hide_all = function () {
        list.forEach(e => e.hide());
    };
    return Character;
})();

const characters = [new Character({
    id: 'megumi',
    img: 'https://www.saenai.tv/images/character/chara_megumi_vsl.png',
}), new Character({
    id: 'utaha',
    img: 'https://www.saenai.tv/images/character/chara_utaha_vsl.png',
}), new Character({
    id: 'eriri',
    img: 'https://www.saenai.tv/images/character/chara_eriri_vsl.png',
})];

const scenes = [new Scene({
        id: 'scene1',
        scripts: [{
            name: '太郎',
            text: '入学したよ',
            duration: 1,
            characters: [{
                id: 'megumi',
                x: 0,
                y: 0
            }, {
                id: 'eriri',
                x: -30,
                y: 10,
            }, {
                id: 'utaha',
                x: 30,
                y: -10
            }]
        }, {
            name: '笵 建明',
            text: '同学门好!',
            characters: [{
                id: 'megumi',
                x: 30,
                y: 0,
                move: 'swing'
            }, ]
        }, {
            name: '太郎',
            text: 'ロウシーハオ',
            duration: 1,
            characters: [{
                id: 'eriri',
                x: -30,
                y: 10
            }, {
                id: 'utaha',
                x: 30,
                y: -10
            }]
        }],
        img: '../img/test/DSC_0110.jpg',
        choice: [{
            label: '部活を見に行く',
            scene_id: 'scene2',
        }, {
            label: '家に帰る',
            scene_id: undefined,
        }]
    }),
    new Scene({
        id: 'scene2',
        scripts: [{
            name: '太郎',
            text: '　【ロンドンＡＦＰ時事】ロンドンの競売大手クリスティーズで４日、約３０００年前に制作された古代エジプト王ツタンカーメンの頭像が競売に掛けられ、約６００万ドル（約６億４０００万円）で落札された。落札者は明らかにされていない。エジプト当局は像の売却中止と返還を要求している。'
        }, {
            name: '太郎',
            text: '　頭像は珪岩製で高さ２８．５センチ。エジプト考古省関係者は、１９７０年代にルクソールの古代遺跡カルナック神殿から「盗まれた」とみられると主張した。',
        }, {
            name: '太郎',
            text: '　エジプト外務省は英外務省と国連教育科学文化機関（ユネスコ）に対し、介入して競売を中止するよう求めた。これに対しクリスティーズは、像の存在は長年にわたり「良く知られ、公然と展示されていた」が、エジプトが懸念を表明したことはなかったと反論している。'
        }, {
            name: '太郎',
            text: '　オークション会場前には「密輸された美術品を売買するのはやめろ」などと書かれたカードを掲げた抗議者が集まった。'
        }],
        img: '../img/test/DSC_0116.jpg',
        choice: [{
            label: 'MMAの見学に行く',
            scene_id: 'mma',
        }, {
            label: 'やっぱり家に帰る',
            scene_id: undefined,
        }, {
            label: '生協を見に行く',
            scene_id: 'seikyo',
        }]
    }),
    new Scene({
        id: 'seikyo',
        scripts: [{
            name: '太郎',
            text: '入学したよ',
        }],
        img: '../img/test/DSC_0094.jpg',
        choice: [{
            label: 'やっぱり家に帰る',
            scene_id: undefined,
        }]
    }),
    new Scene({
        id: 'mma',
        scripts: [{
            name: '太郎',
            text: 'MMAに入部しよう',
        }],
        img: '../img/test/DSC_0075.jpg',
        choice: [{
            label: 'やっぱり家に帰る',
            scene_id: undefined,
        }]
    })
][0].show();