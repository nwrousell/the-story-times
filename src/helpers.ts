import { myPrompt as myPrompt } from "./prompts";
import { allPrompts as allPrompts } from "./prompts";
import { Mode as Mode } from "./prompts";
import { PROMPTS_PER_USER } from "./constants";
import { MAX_IMAGE_PATH } from "./constants";
import { IMAGES_PER_USER } from "./constants";

export function generatePrompts(numOfPlayers:Number){
    return generateAllPrompts(numOfPlayers) as string[]
}

function generateAllPrompts(n: Number){
    let finalPrompts = [];
    let promptsLeft = filterPrompts(allPrompts);
    for (let i = 0; i < n; i++) {
        for (let promptNum = 0; promptNum < PROMPTS_PER_USER; promptNum++) {
            if (promptsLeft.length < 1) promptsLeft = filterPrompts(allPrompts);
            let a = Math.floor(Math.random() * promptsLeft.length);
            finalPrompts.push(promptsLeft[a].text);
            promptsLeft.splice(a, 1);
        }
    }
    return finalPrompts;
}

function filterPrompts(prompts:myPrompt[]){
    return [...prompts];
}

export function generateImagePaths(numOfPlayers){
    let finalPaths = [];
    let pathsLeft = range(0, MAX_IMAGE_PATH);
    for (let i = 0; i < numOfPlayers; i++) {
        for (let pathNum = 0; pathNum < IMAGES_PER_USER; pathNum++) {
            if (pathsLeft.length < 1) pathsLeft = range(0, MAX_IMAGE_PATH);
            let a = Math.floor(Math.random() * pathsLeft.length);
            finalPaths.push("/images/" + pathsLeft[a] + ".png");
            pathsLeft.splice(a, 1);
        }
    }
    return finalPaths;
}

generateImagePaths(3);

function range(start, end) {
    var l = [];
    for (let i = start; i <= end; i++) {
        l.push(i);
    }
    return l;
}