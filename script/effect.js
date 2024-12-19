class CanvasEffect {
    constructor(containerId, imageSrc) {
        this.stage = new Konva.Stage({
            container: containerId,
            width: window.innerHeight,
            height: window.innerHeight
        });

        this.layer = new Konva.Layer();
        this.stage.add(this.layer);

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.stage.width();
        this.canvas.height = this.stage.height();

        this.context = this.canvas.getContext('2d');
        this.context.lineJoin = "round";
        this.context.lineWidth = 150;

        // 擦除進度檢查區間，防止效能拉垮
        this.progressCheckInterval = 500;
        this.lastDoProgressCheck = Date.now();
        this.eraseProgressThreshold = 98;

        // 擦除

        this.image = new Konva.Image({
            image: this.canvas,
            x: 0,
            y: 0
        });
        this.layer.add(this.image);

        this.loadBackgroundImage(imageSrc);
        this.trackButton('runawayButton');
    }

    loadBackgroundImage(src) {
        const imageObj = new Image();
        imageObj.onload = () => {
            this.context.drawImage(imageObj, 0, 0, this.canvas.width, this.canvas.height);
            this.layer.draw();
        };
        imageObj.src = src;
    }

    trackButton(buttonId) {
        const button = document.getElementById(buttonId);
        const main = document.querySelector('main'); // 取得 main 元素
        if (!button || !main) {
            console.error(`Button with id "${buttonId}" or main not found`);
            return;
        }

        let lastPosition = { x: 0, y: 0 };
        let isTransitioning = false;

        const getCorrectedPosition = (element) => {
            const rect = element.getBoundingClientRect();
            const mainRect = main.getBoundingClientRect();
            return {
                x: rect.left - mainRect.left + 75,
                y: rect.top - mainRect.top + 75
            };
        };

        const trackTransition = () => {
            if (!isTransitioning) return;

            const currentPosition = getCorrectedPosition(button);
            if (lastPosition.x === 0 && lastPosition.y === 0) {
                lastPosition = currentPosition;
                return;
            }

            if (lastPosition.x !== currentPosition.x || lastPosition.y !== currentPosition.y) {
                this.context.globalCompositeOperation = 'destination-out';
                this.context.beginPath();
                // 改變 moveTo 與 lineTo 的偏移量製造出位移路徑的啃食感
                this.context.moveTo(lastPosition.x + 40, lastPosition.y + 20);
                this.context.lineTo(currentPosition.x + 7, currentPosition.y + 20);
                this.context.closePath();
                this.context.stroke();
                this.layer.draw();
                lastPosition = currentPosition;
            }
            // 計算並顯示擦除進度
            const progress = this.calculateEraseProgress();
            if (progress > this.eraseProgressThreshold) {
                window.location.reload();
            }
            requestAnimationFrame(trackTransition);
        };

        button.addEventListener('transitionstart', () => {
            isTransitioning = true;
            trackTransition();
        });

        button.addEventListener('transitionend', () => {
            isTransitioning = false;
        });
    }

    calculateEraseProgress() {
        if (Date.now() - this.lastDoProgressCheck <= this.progressCheckInterval) return;
        this.lastDoProgressCheck = Date.now();
        const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const pixels = imageData.data;
        let totalPixels = this.canvas.width * this.canvas.height;
        let erasedPixels = 0;

        for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            const a = pixels[i + 3];

            // 判斷像素是否透明或接近純白
            if (a === 0 || (r > 240 && g > 240 && b > 240)) {
                erasedPixels++;
            }
        }

        // 計算擦除進度
        return (erasedPixels / totalPixels) * 100;
    }
}
