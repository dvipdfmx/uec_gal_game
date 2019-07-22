const Resource = (function () {
    const Resource = function () {

    };
    const load_promise = [];
    const dict = {};
    Resource.waitload = function () {
        return Promise.all(load_promises);
    };
    Resource.find = function (url) {
        return dict[url];
    };
    return Resource;
})();