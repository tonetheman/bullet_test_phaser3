function resize(){
    let canvas = document.querySelector("canvas");
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    let windowRatio = windowWidth / windowHeight;
    
    console.log("window width and height and ratio", windowWidth,
        windowHeight, windowRatio);
    let gameRatio = game.config.width / game.config.height;
    console.log("game ratio is", gameRatio);

    if(windowRatio < gameRatio){
        console.log("game ratio is bigger than window ratio");
        canvas.style.width = windowWidth + "px";
        canvas.style.height = (windowWidth / gameRatio) + "px";
        console.log("canvas style is set to",
        canvas.style.width, canvas.style.height);
    }
    else{
        console.log("window ratio was larger than game ratio");
        canvas.style.width = (windowHeight * gameRatio) + "px";
        canvas.style.height = windowHeight + "px";
        console.log("canvas style is set to", canvas.style.width, canvas.style.height );
    }
    
   /*
    canvas.style.width = windowWidth + "px";
    canvas.style.height = windowHeight + "px";
    */
}
