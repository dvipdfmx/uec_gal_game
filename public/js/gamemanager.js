const GameManager = (function () {
    const GameManager = function () {};
    GameManager.prototype.init = async function (data_url, start_scene_id) {
        const gmdata = await (await fetch(data_url)).json();
        Scene.init(this, gmdata.constants);
        Character.init(gmdata.constants);
        await Promise.all([
            Character.load(gmdata.settings.characters),
            Audio.load(gmdata.settings.audios),
            Scene.load(gmdata.settings.scenes),
        ]);
        this.flags = gmdata.flags;
        Scene.clear(true);
        Scene.find(start_scene_id).show();
    };

    /**
     * Flags
     */
    GameManager.prototype.set_flag = function (data = {
        id: undefined,
        value: true,
        method: 'and',
    }) {
        console.log('FLAG', data);
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