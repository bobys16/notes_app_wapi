class Loader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.progress = 0;
        this.totalSteps = 100;
        this.animationDuration = 0;
        this.interval = 0;

        const container = document.createElement('div');
        container.setAttribute('id', 'spinner-container');

        const progressBar = document.createElement('div');
        progressBar.setAttribute('id', 'progress-bar');

        const title = document.createElement('div');
        title.setAttribute('id', 'progress-title');
        title.textContent = 'Please Wait...';

        const progress = document.createElement('div');
        progress.setAttribute('id', 'progress');

        const style = document.createElement('style');
        style.textContent = `
            #spinner-container {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(255, 255, 255, 0.7);
                z-index: 9999;
            }

            #progress-bar {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 200px;
                height: 20px;
                background-color: #f0f0f0;
                border-radius: 10px;
            }

            #progress-title {
                margin-bottom: 10px;
                text-align: center;
                font-weight: bold;
            }

            #progress {
                height: 100%;
                width: 0;
                background-color: #4CAF50;
                border-radius: 10px;
                transition: width 0.1s linear;
            }
        `;

        progressBar.appendChild(title);
        progressBar.appendChild(progress);

        container.appendChild(progressBar);
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(container);
    }

    show(duration) {
        this.shadowRoot.querySelector('#spinner-container').style.display =
            'block';
        this.animationDuration = duration;
        this.interval = this.animationDuration / this.totalSteps;
        this.animateProgress();
    }

    hide() {
        this.shadowRoot.querySelector('#spinner-container').style.display =
            'none';
    }

    animateProgress() {
        const progressElement = this.shadowRoot.querySelector('#progress');
        const incrementProgress = () => {
            if (this.progress < this.totalSteps) {
                this.progress++;
                progressElement.style.width = `${(this.progress / this.totalSteps) * 100}%`;
                setTimeout(incrementProgress, this.interval);
            } else {
                this.progress = 0;
                progressElement.style.width = '0';
                this.hide();
            }
        };
        incrementProgress();
    }
}

customElements.define('app-spinner', Loader);
