export class myPrompt{
    public text: string;
    public specificity: number;
    public mode: Mode;

    public constructor(text:string, specificity:number){
        this.text = text;
        this.specificity = specificity;
        this.mode = Mode.none;
    }
}

export enum Mode {
    none,
    goofy,
    deep,
    catchup
}

function setPreferredMode(newMode:Mode){
    function setMode(prompt:myPrompt, index:number, array:myPrompt[]){
        prompt.mode = newMode;
        return prompt;
    }
    return setMode;
}

export var allPrompts = []
var lightPrompts = 
    [new myPrompt("What was your least favorite vacation?", 2),
    new myPrompt("What’s your favorite place you’ve visited?", 1),
    new myPrompt("What’s your craziest experience on a roof?", 3),
    new myPrompt("What’s your most memorable experience with an animal?", 1),
    new myPrompt("Do you think aliens are real? Why or why not?", 2),
    new myPrompt("What’s the weirdest food you’ve tried?", 2),
    new myPrompt("If budget was no problem, where would you go on vacation and what would you do?", 1),
    new myPrompt("Have you ever had a recurring dream? What was it? If not, what's the scariest dream you remember?", 3),
    new myPrompt("What's the most memorable dream you've ever had?", 2),
    new myPrompt("Have you ever had an imaginary friend?", 3),
    new myPrompt("What's a favorite memory you have of a childhood or adulthood pet?", 1),
    new myPrompt("When was the time you were farthest away from civilization? What were you doing there?", 3),
    new myPrompt("What was your favorite tv show as a child? What was the plot and why was it your favorite?", 1),
    new myPrompt("What was your first concert experience? What was your best concert experience?", 1),
    new myPrompt("What's your best fishing story?", 2),
    new myPrompt("What's your best celebrity story?", 2),
    new myPrompt("What was your first trip outside your hometown or home country?", 1),
    new myPrompt("What's your best road trip story?", 3),
    new myPrompt("What's the most fun you've had at work (or school)?", 3),
    new myPrompt("What's the most memorable sporting event you've been to? What made it so meaningful?", 3)]
    
lightPrompts.map(setPreferredMode(Mode.goofy))
allPrompts = allPrompts.concat(lightPrompts);

var deepPrompts = 
    [new myPrompt("What’s your favorite comfort food and what/who is it connected to?", 1),
    new myPrompt("When was the time you were farthest away from home? What were you doing there?", 3),
    new myPrompt("What’s a scent that brings back memories from your childhood? Who, what or where does it remind you of?", 1),
    new myPrompt("What’s a song that reminds you of a certain time in your life? When does it remind you of and why?", 1),
    new myPrompt("What’s something you always wanted to do but haven’t?", 1),
    new myPrompt("What trait do you think you inherited from your parents?", 2),
    new myPrompt("Who are the friends that have remained most constant in your life?", 1),
    new myPrompt("When have you felt most alive?", 2),
    new myPrompt("Who's a teacher or mentor in your life that you'll never forget?", 2),
    new myPrompt("What's a memorable experience you've had in the woods?", 2),
    new myPrompt("What silly thing were you most scared of as a child", 1),
    new myPrompt("What's a story you have from your childhood?", 1),
    new myPrompt("What's the strangest thing that has happened to you on a plane?", 2),
    new myPrompt("What's the most rewarding time you've done something totally outside your comfort zone?", 3),
    new myPrompt("What's another culture that you admire and why?", 3),
    new myPrompt("What skill are you most proud of learning? How did you learn it, and why does it make you proud?", 3)]
    
deepPrompts.map(setPreferredMode(Mode.deep))
allPrompts = allPrompts.concat(deepPrompts);

var catchupPrompts = 
    [new myPrompt("What’s one thing that surprised you this week?", 1),
    new myPrompt("What's something or someone that made you smile recently?", 1),
    new myPrompt("When was the last time you did something outside of your comfort zone? How did it go? Would you do it again?", 1),
    new myPrompt("When was the last time you couldn't stop laughing? What was so funny?", 2),
    new myPrompt("What's a fun, recent story you have from school or work?", 2)]
catchupPrompts.map(setPreferredMode(Mode.catchup))
allPrompts = allPrompts.concat(catchupPrompts);

console.log(allPrompts);