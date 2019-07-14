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
    Audio.load = async function (url) {
        Audio.compile(await (await fetch(url)).json());
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
    Audio.prototype.stop = function (fadeout = false) {
        const self = this;
        if (fadeout) {
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
        } else {
            self.element.pause();
            self.element.currentTime = 0;
        }
    };
    return Audio;
})();