const Scene = (function () {
    const Scene = function (data = {
        charactor: undefined,
        text: undefined,
        choice: undefined,
        image_ur: undefined,
        show_selector: false,
    }) {
        this.text = data.text;
        this.charactor = data.charactor;
        this.choice = data.choice;
        this.image_url = data.image_url;
    };
    // static member
    Scene.current = undefined;
    Scene.text = document.querySelector('#text');
    Scene.charactor = document.querySelector('#charactor');
    Scene.image = document.querySelector('#background');
    Scene.selector = document.querySelector('#selector');
    Scene.mask = document.querySelector('#scene-mask');


    // class member
    Scene.prototype.set_text = function (text, charactor) {
        Scene.text.textContent = text;
        Scene.charactor.textContent = charactor;
    };
    Scene.prototype.set_image = function (url) {
        image.src = url;
    };
    Scene.prototype.transition = function () {
        const mask_class = 'fade';
        mask.classList.add(mask_class);
        setTimeout(() => {
            this.set_text(this.text);
            this.set_image(this.image_url);
            this.set_choice(this.choice);
        }, 500);
        setTimeout(() => {
            mask.classList.remove(mask_class);
        }, 1000);
    };
    /**
     *  {
     *      label: '',
     *      scene: Scene Object,
     *  }
     */
    Scene.prototype.set_choice = function (choice) {
        while (selector.firstChild) selector.removeChild(selector.firstChild);
        if (choice && choice.length) {
            selector.style.display = 'block';
            choice.forEach(e => {
                const btn = document.createElement('button');
                btn.classList.add('gal-btn');
                btn.textContent = e.label;
                btn.scene = e.scene;
                selector.appendChild(btn);
            });
        } else {
            selector.style.display = 'none';
        }
    };
})();