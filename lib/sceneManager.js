/**
 * Scene Manager Module
 * Manages p5.js background scenes and switches between them
 */

const BackgroundSceneManager = {
    sceneManager: null,
    p5Instance: null,
    currentScene: null,

    /**
     * Initialize the scene manager and register all scenes
     */
    init() {
        if (!JOURNAL_SETTINGS.shaderBackgrounds.enabled) {
            console.log("Shader backgrounds disabled in settings");
            return;
        }

        // Create p5 instance sketch
        const managerSketch = (p) => {
            this.p5Instance = p;

            p.setup = () => {
                let canvas = p.createCanvas(p.windowWidth, p.windowHeight);
                canvas.parent('p5-container');

                // Initialize SceneManager (global constructor)
                this.sceneManager = new SceneManager();

                // Register scenes
                this.registerScenes(p);

                // Start with default scene
                this.sceneManager.showScene(DefaultScene);
                this.currentScene = 'DefaultScene';

                console.log("Background Scene Manager initialized");
            };

            p.draw = () => {
                if (this.sceneManager) {
                    this.sceneManager.draw();
                }
            };

            p.windowResized = () => {
                p.resizeCanvas(p.windowWidth, p.windowHeight);
            };
        };

        new p5(managerSketch);
    },

    /**
     * Register all available scenes
     * @param {p5} p - p5 instance
     */
    registerScenes(p) {
        // Register each scene class (pass constructor, not instance)
        if (typeof DefaultScene !== 'undefined') {
            this.sceneManager.addScene(DefaultScene);
        }
        if (typeof PrologueScene !== 'undefined') {
            this.sceneManager.addScene(PrologueScene);
        }
        if (typeof Chapter01Scene !== 'undefined') {
            this.sceneManager.addScene(Chapter01Scene);
        }
        if (typeof Chapter02Scene !== 'undefined') {
            this.sceneManager.addScene(Chapter02Scene);
        }
        if (typeof Chapter03Scene !== 'undefined') {
            this.sceneManager.addScene(Chapter03Scene);
        }
    },

    /**
     * Switch to a scene based on chapter information
     * @param {Object} chapterInfo - Chapter information object
     */
    switchScene(chapterInfo) {
        if (!this.sceneManager || !chapterInfo) return;

        // Extract chapter identifier from filename
        const filename = chapterInfo.filename || 'default';
        const chapterKey = filename.replace('chapters/', '').replace('.txt', '');

        // Map chapter key to scene constructor
        const sceneMap = {
            'prologue': PrologueScene,
            'chapter_01': Chapter01Scene,
            'chapter_02': Chapter02Scene,
            'chapter_03': Chapter03Scene,
            'default': DefaultScene
        };

        const sceneConstructor = sceneMap[chapterKey] || DefaultScene;
        const sceneName = sceneConstructor.name;

        if (sceneName !== this.currentScene) {
            console.log(`Switching to scene: ${sceneName}`);
            this.sceneManager.showScene(sceneConstructor);
            this.currentScene = sceneName;
        }
    }
};
