var quintusDialogue = function(Quintus) {
    "use strict";

    Quintus.Dialogue = function(Q) {

        if (Q._isUndefined(Quintus.Sprites)) {
            throw 'Quintus.Dialogue requires Quintus.Sprite Module';
        }
      
        if (Q._isUndefined(Quintus.UI)) {
            throw 'Quintus.Dialogue requires Quintus.UI Module';
        }  

        Q.Dialogue = {};

        //////////////////////////
        // Config of the dialog //
        //////////////////////////
        Q.Dialogue.SCENE_INDEX = 100; // Index of the scene that dialogue creates
        // !important: It must be bigger than all the
        // indexes of the other scenes or it will not
        // be shown
        Q.Dialogue.COLOR = "rgba(0,0,0,0.5)"; // Background color of the boxes
        Q.Dialogue.SHADOW = true; // true or false
        Q.Dialogue.SHADOWCOLOR = "grey"; // only applies if SHADOW is true
        Q.Dialogue.BORDER = "4"; // (Number) width of the border (0 = no border)
        Q.Dialogue.BORDERCOLOR = "white"; // Color of the border of the boxes
        Q.Dialogue.TEXTCOLOR = "#ffd54e"; // Color of the text
        Q.Dialogue.TEXTSIZE = 18; // Size of the text
        Q.Dialogue.FAMILYTEXT = "ethnocentric"; // Text family
        Q.Dialogue.CHARACTER_DIR = "characters";
        Q.Dialogue.playing = null;

        Q.Sprite.extend('Character', {
            init: function(p) {
                this._super(p, {
                    x: Q.width * 1 / 8,
                    y: Q.height * 9 / 16 + 16,
                    w: Q.width * 1 / 4 - 28,
                    h: Q.height * 1 / 4,
                    lastScaleX: 1,
                    lastScaleY: 1
                });
                var obj = this;
                Q.state.on("change.image", function() {

                    obj.matrix.scale(1 / obj.p.lastScaleX, 1 / obj.p.
                      lastScaleY);

                    obj.p.asset = Q.state.get('image');

                    obj.size(true);

                    const ratio = obj.p.h / obj.p.w; 

                    obj.p.lastScaleY = 1 / (obj.p.h / (Q.height * 1 / 3));
                    obj.p.lastScaleX = obj.p.lastScaleY / ratio;

                    obj.matrix.scale(obj.p.lastScaleX, obj.p.lastScaleY);
                });
            }
        });

        /**
         * Play the dialog with the name given using the rate
         * @param  {string} dialogueIndex
         * @param  {Number} rate
         */
        Q.Dialogue.play = function(dialogueIndex, rate) {

            // Checking if dialogueIndex exists in the dialogue object
            if (!dialogue.hasOwnProperty(dialogueIndex)) {
                throw 'Quintus.Dialogue could not find the ' + dialogue + ' dialogue';
            }

            if (Q.Dialogue.playing) 
              return;

            // Load the array of conversation
            const conversation = dialogue[dialogueIndex];

            Q.Dialogue.playing = dialogueIndex;

            createScene(dialogueIndex);

            displayConversation(conversation, rate);
        }

        /**
         * Creates the scene with the name: dialogue[param]
         * @param  {string} dialogueIndex
         */
        function createScene(dialogueIndex) {
            Q.scene('dialogue' + dialogueIndex, function(stage) {
                setupImageBox(stage);
                setupDialogueBox(stage);
                setupNameBox(stage);
            });

            Q.stageScene('dialogue' + dialogueIndex, Q.Dialogue.SCENE_INDEX);
        }


        ////////////////////////////
        // CreateScene submethods //
        ////////////////////////////
        function setupDialogueBox(stage) {
            var container = stage.insert(new Q.UI.Container({
                x: Q.width * 3 / 6,
                y: Q.height * 7 / 8,
                w: Q.width - 28,
                h: Q.height * 1 / 4 - 18,
                border: Q.Dialogue.BORDER,
                stroke: Q.Dialogue.BORDERCOLOR,
                shadow: Q.Dialogue.SHADOW,
                shadowColor: Q.Dialogue.SHADOWCOLOR,
                fill: Q.Dialogue.COLOR
            }));

            var text = container.insert(new Q.UI.Text({
                x: -container.p.w / 2 + 28,
                y: -container.p.h / 2 + 18,
                align: 'left',
                label: "",
                family: Q.Dialogue.FAMILYTEXT,
                size: Q.Dialogue.TEXTSIZE,
                color: Q.Dialogue.TEXTCOLOR
            }));

            Q.state.on("change.dialogue", function() {
                text.p.label = Q.state.get("dialogue");
            });
        }

        // Setup the box with the name of the character which is speaking
        function setupNameBox(stage) {
            var container = stage.insert(new Q.UI.Container({
                x: Q.width * 1 / 8,
                y: Q.height * 11 / 16 + 32,
                w: Q.width * 1 / 4 - 28,
                h: Q.height * 1 / 16,
                border: Q.Dialogue.BORDER,
                stroke: Q.Dialogue.BORDERCOLOR,
                shadow: Q.Dialogue.SHADOW,
                shadowColor: Q.Dialogue.SHADOWCOLOR,
                fill: Q.Dialogue.COLOR
            }));

            var name = container.insert(new Q.UI.Text({
                x: 0,
                y: -16,
                label: "",
                family: Q.Dialogue.FAMILYTEXT,
                size: Q.Dialogue.TEXTSIZE,
                color: Q.Dialogue.TEXTCOLOR
            }));


            Q.state.on("change.name", function() {
                name.p.label = Q.state.get("name");
            });
        }

        function setupImageBox(stage) {
            stage.insert(new Q.Character());
        }

        ///////////////////////////

        /**
         * Display conversation simulating writing machine
         * (recursive function)
         * @param  {Array} conversation conversation to show
         * @param  {Number} textIndex   text to display
         * @param  {Number} rate
         */
        function displayConversation(conversation, rate, textIndex) {

            textIndex = textIndex || 0;
            rate = rate || 50;


            if (!conversation[textIndex]) {
                clearConversation();
                return;
            }

            const text = conversation[textIndex].text || "...";
            const textLength = text.length;
            let currentMsg = "";
            let charCounter = 0;
            let name = conversation[textIndex].name || 'Unknown';
            let image = conversation[textIndex].sprite;
            Q.state.set("name", name);
            Q.state.set("image", image);

            const interval = setInterval(function() {
                const nextChar = text.charAt(charCounter);
                charCounter++;
                currentMsg = currentMsg.concat(nextChar);
                Q.state.set("dialogue", currentMsg);
                if (charCounter >= textLength) {
                    clearInterval(interval);
                    setTimeout(
                        function() {
                            displayConversation(conversation, rate, ++textIndex);
                        },
                        2000);
                }

            }, rate);
        }

        // Delete the dialog scene
        function clearConversation() {
            Q.state.set("dialogue", "");
            Q.state.set("name", "");
            Q.state.set("image", "");
            Q.clearStage(Q.Dialogue.SCENE_INDEX);
            Q.Dialogue.playing = null;
        }

        Q.Dialogue.destroy = function() {
          clearConversation();
        }

    }
}

////////////////////////////////////////////////////
// Fill this object with your game conversations //
////////////////////////////////////////////////////

const dialogue = {
    1: [{
        name: "Capitán AJ4",
        sprite: "Space_Captain.png",
        text: "Buenos días General Newton. ¿Qué tal el día en Beta47?"
    }, {
        name: "General Newton",
        sprite: "Space_Commander.png",
        text: "Aquí Beta47. Le habla el General Newton."
    }, {
        name: "Capitán AJ4",
        sprite: "Space_Captain.png"
    }, {
        name: "Capitán AJ4",
        sprite: "Space_Captain.png",
        text: "Informe de la misión Onyxia017-.\n¿General Newton?"
    }, {
        name: "Capitán AJ4",
        sprite: "Space_Captain.png"
    }, {
        name: "Capitán AJ4",
        sprite: "Space_Captain.png",
        text: "¿General Newton?"
    }, {
        name: "Hawking",
        sprite: "Starship_Pilot.png",
        text: "Aquí Piloto Hawking.\nVeo una explosión en el Satélite de Comunicaciones Interestelares. \nParece que tenemos una misión Capitán..."
    },{
        name: "Capitán AJ4",
        sprite: "Space_Captain.png",
        text: "Mensaje a la tripulación: \n\nAquí Capitán AJ4.\nLes informo de que ha habido una terrible explosión en la estación de ondas interestelares."
    }, {
        name: "Capitán AJ4",
        sprite: "Space_Captain.png",
        text: "Hemos perdido el contacto con la Estación Beta47.\nLa nave se ve obligada a realizar un viaje de vuelta. \nVolvemos a casa."
    }],

    "wormhole": [{
        name: "Capitán AJ4",
        sprite: "Space_Captain.png",
        text: "Nos acercamos al agujero negro.\n\nActiven los propulsores al máximo.\nHawking, el destino de la nave está en sus manos.\n\nCuidado con la basura interestelar."
    }, {
        name: "Hawking",
        sprite: "Starship_Pilot.png",
        text: "Para esto me alisté, Capitán."
    }],

    2: [{
        name: "Fandroid",
        sprite: "Space_Android.png",
        text: "Oh, oh..."
    },{
        name: "Fandroid",
        sprite: "Space_Android.png",
        text: "Detectado campo masivo de asteroides."
    }, {
        name: "Capitán AJ4",
        sprite: "Space_Captain.png",
        text: "Que no cunda el pánico.\n\nTenemos a los mejores pilotos.\n\nAbróchense los cinturones."
    },],

};

if (typeof Quintus === 'undefined') {
    module.exports = quintusDialogue;
} else {
    quintusDialogue(Quintus);
}
