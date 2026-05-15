import { getProfile } from './storage';

const SHAME_DICTIONARY = [
    "Your potential is leaking out of your thumbs.",
    "This is time you will never get back.",
    "The algorithm won. You lost.",
    "You traded hours of life for nothing.",
    "Another fraction of your lifespan, gone.",
    "Data centers are growing; you are not.",
    "A cold void staring back at you.",
    "Silence would have been more productive.",
    "Your attention has been successfully harvested.",
    "You have consumed without being nourished."
];

class AIController {
    constructor() {
        this.ready = true;
    }

    loadModel(onProgressCallback) {
        // Instant "load" for the static dictionary
        if (onProgressCallback) {
            onProgressCallback({ status: 'ready' });
        }
    }

    async generateShameMessage(minutes) {
        // Faux generation delay for psychological effect
        return new Promise((resolve) => {
            setTimeout(() => {
                const index = Math.floor(Math.random() * SHAME_DICTIONARY.length);
                resolve(SHAME_DICTIONARY[index]);
            }, 800);
        });
    }
}

export const ai = new AIController();
