const Util = (function () {
    const Util = {};

    Util.parseParams = function (params_str) {
        const r = {};
        params_str.split('&').forEach(e => {
            const s = e.split('=');
            r[s[0]] = s[1];
        });
        return r;
    };

    return Util;
})();