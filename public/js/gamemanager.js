const GameManager = (function () {
    let gmdata = undefined;
    const GameManager = function () {};
    const R = {};

    GameManager.prototype.init = async function (data_url, start_scene_id) {
        gmdata = await (await fetch(data_url)).json();
        R.progress = document.querySelector(gmdata.constants.selectors.progress);
        R.progress_what = document.querySelector(gmdata.constants.selectors.progress_what);
        this.update_progress(10, 'ゲームデータを読み込んでいます...');
        Scene.init(this, gmdata.constants);
        Scene.clear(true);
        Character.init(gmdata.constants);
        Background.init(gmdata.constants);
        this.flags = gmdata.flags;
        this.update_progress(30, '画像を読み込んでいます...');
        await Scene.load(gmdata.settings.scenes);
        await Background.waitload();
        this.update_progress(60, 'キャラクターを読み込んでいます...');
        await Character.load(gmdata.settings.characters);
        await Character.waitload();
        this.update_progress(90, '音声データを読み込んでいます...');
        await Audio.load(gmdata.settings.audios);
        await Audio.waitload();
        this.update_progress(100, 'データの読み込みが完了しました');
        console.ok('All Contents Loaded');
        this.hide_loading();
        Scene.find(start_scene_id).show();
    };

    GameManager.prototype.hide_loading = function () {
        document.querySelector(gmdata.constants.selectors.loading).classList.add(gmdata.constants.classes.hide);
    };

    GameManager.prototype.update_progress = function (progress, message) {
        R.progress.style.width = progress + '%';
        R.progress_what.textContent = message;
    };

    /**
     * Flags
     */
    GameManager.prototype.set_flag = function (data = {
        id: undefined,
        value: true,
        method: 'and',
    }) {
        const tmp = this.flags[data.id].value;
        switch (data.method) {
            case 'and':
                this.flags[data.id].value &= data.value;
                break;
            case 'or':
                this.flags[data.id].value |= data.value;
                break;
            case 'xor':
                this.flags[data.id].value ^= data.value;
                break;
        }
        console.flag(`Set flag: '${data.id}' : ${tmp} -> ${this.flags[data.id].value}`);
    };
    GameManager.prototype.set_flags = function (flags) {
        flags.forEach(e => this.set_flag(e));
    };
    GameManager.prototype.get_flag = function (id) {
        return this.flags[id].value;
    };
    GameManager.prototype.flags_all = function (ids, value = true) {
        let result = true;
        ids.forEach(e => result &= value ? this.flags[e].value : !this.flags[e].value);
        return result;
    };
    GameManager.prototype.flags_some = function (ids, value = true) {
        let result = false;
        ids.forEach(e => result |= value ? this.flags[e].value : !this.flags[e].value);
        return result;
    };
    GameManager.prototype.check_flags = function (data = {
        ids: [],
        method: undefined,
        value: false
    }) {
        switch (data.method) {
            case 'all':
                return this.flags_all(data.ids, data.value);
            case 'some':
                return this.flags_some(data.ids, data.value);
        }
    };

    return GameManager;
})();