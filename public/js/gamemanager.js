const GameManager = (function () {
    const GameManager = function (data = {
        flags: {
            'id': {
                value: 0,
            }
        }
    }) {
        Object.assign(this, data);
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