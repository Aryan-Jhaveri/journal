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
        // Register only the default scene for a consistent background
        if (typeof DefaultScene !== 'undefined') {
            this.sceneManager.addScene(DefaultScene);
        }
    },

    /**
     * Switch to a scene based on chapter information
     * @param {Object} chapterInfo - Chapter information object
     */
    switchScene(chapterInfo) {
        // All chapters use the same default background - no switching needed
    }
};
