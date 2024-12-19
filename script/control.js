class RunawayButton {
    constructor(buttonId, containerId) {
        this.button = document.getElementById(buttonId);
        this.container = document.getElementById(containerId);
        this.buttonChanged = false;
        this.distanceThreshold = 300;
        this.lastMoveTime = 0;
        this.lastPosition = { x: 0, y: 0 };
        this.init();
    }

    init() {
        this.setupButton();
        this.setupMouseMoveListener();
    }

    setupButton() {
        this.button.style.setProperty('--tail-rotation', '0deg');
        this.button.addEventListener('click', () => {
            console.log('click!!!');
        });
        // 獲取 main 的偏移量
        const main = document.querySelector('main');
        const mainRect = main.getBoundingClientRect();

        // 計算按鈕初始位置，基於 main 的偏移
        const initialX = mainRect.left + window.innerHeight / 2 + 100; // 加入 0.1px 偏移
        const initialY = mainRect.top + window.innerHeight / 2 + 150;

        this.moveButton(initialX, initialY);
    }

    setupMouseMoveListener() {
        document.querySelector("main").addEventListener('mousemove', (event) => {
            const currentTime = Date.now();
            if (currentTime - this.lastMoveTime < 300) return;

            const rect = this.button.getBoundingClientRect();
            const mouseX = event.clientX;
            const mouseY = event.clientY;

            const buttonCenterX = rect.left + rect.width / 2;
            const buttonCenterY = rect.top + rect.height / 2;
            const distance = Math.sqrt(
                Math.pow(mouseX - buttonCenterX, 2) + Math.pow(mouseY - buttonCenterY, 2)
            );

            if (distance < this.distanceThreshold) {
                this.runAway();
                this.lastMoveTime = currentTime;
            }
        });
    }

    runAway() {
        const maxWidth = window.innerHeight - this.button.clientWidth;
        const maxHeight = window.innerHeight - this.button.clientHeight;
        let randomX, randomY;

        if (!this.buttonChanged) {
            this.buttonChanged = true;
            this.button.setAttribute('class', 'runaway-button-animation');
            this.button.style.backgroundImage = "url('./img/button/after.svg')";
        }

        do {
            randomX = Math.random() * maxWidth;
            randomY = Math.random() * maxHeight;
        } while (this.getDistance(randomX, randomY, this.lastPosition.x, this.lastPosition.y) < 200);

        this.moveButton(randomX, randomY);
    }

    moveButton(x, y) {
        const deltaX = this.lastPosition.x - x; // 反向計算，讓尾巴指向上個位置
        const deltaY = this.lastPosition.y - y;

        // 計算角度（以弧度為單位），注意反向
        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

        // 設置按鈕的位置
        this.button.style.left = `${x}px`;
        this.button.style.top = `${y}px`;

        // 更新尾巴的旋轉角度
        this.button.style.setProperty('--tail-rotation', `${angle}deg`);

        // 更新按鈕的最後位置
        this.lastPosition = { x, y };
    }


    getDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    }
}
