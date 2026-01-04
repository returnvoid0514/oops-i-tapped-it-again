import * as FileSystem from "LensStudio:FileSystem";      

var codeStringCalculateRemainingDays = `function calculateRemainingDays(targetDate) {
    var currentDate = new Date();
    var target = new Date(targetDate);
    var timeDifference = target - currentDate;
    var daysRemaining = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    return daysRemaining;
}`;

var codeStringCountDown = `//@input Component.Text textComponentToChange
//@input string targetDate = "2025-12-01"

var daysUntilDate = global.calculateRemainingDays(script.targetDate);
script.textComponentToChange.text = daysUntilDate + " Days left!"`;

var codeStringCountDownFinal = `//@input Component.Text textComponentToChange
//@input string targetDate = "2025-03-01"

var daysUntilDate = global.calculateRemainingDays(script.targetDate);

var message = " Days left!";

if (daysUntilDate == 1) {
    message = " Day left!";
}else if (daysUntilDate <= 0) {
    script.textComponentToChange.enabled = false;
}
script.textComponentToChange.text = daysUntilDate + message;`

export const TutorialDescriptor_5 = {
    "id": "scripting",
    "title": "Scripting",
    "pages": [
        {
            "mediaHeader": {
                "type": "image",
                "path": import.meta.resolve("./icons/js_script.svg"),
                "max_width": 80
            },
            "type": "milestone",
            "title": "Scripting",
            "subtitle": "Section 6",
            "description": "Right now our Lens is still relatively static, since every time you open it, it has the same message. Adding dynamic content gives the user a reason to come back to your AR experience and writing custom scripts is a great way to achieve this.",
            "completion": {
                "tasks": []
            },
            "highlight": []
        },
        {
            "mediaHeader": {
                "type": "movie",
                "path": import.meta.resolve("./steps/step_1.gif")
            },
            "type": "step",
            "title": "Add Countdown Script",
            "subtitle": "Step 1",
            "description": "Lenses can use JavaScript or TypeScript to add Code into the Lens. Let's use JavaScript as an example. We will use this script to countdown to a specific date.",
            "completion": {
                "tasks": [
                    {

                        "text": "Let's start by adding a new JavaScript asset to our Lens by selecting the <b>+</b> button in the Asset Browser and selecting JavaScript. We will name it 'Countdown'.",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const assetManager = project.assetManager;
                            let result = false;
                            assetManager.assets.forEach(asset => {                
                                if (asset.type === "JavaScriptAsset" && asset.name === "Countdown") {
                                    result = true;
                                }
                            });
                            return result;
                        },
                        "strategy": "alwaysTrue"
                    },
                    {
                        "text": "Place it in the Scripts folder.",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const assetManager = project.assetManager;
                            let result = false;
                            assetManager.assets.forEach(asset => {
                                 if ( asset.name === "Countdown" && asset.fileMeta.sourcePath.parent.toString() == "Scripts") {
                                    result = true;
                                }
                            });
                            return result;
                        },
                        "strategy": "alwaysTrue"
                    },
                ]
            },
            "highlight": [
                "Snap.Plugin.Gui.AssetBrowser"
            ]
        },
        {
            "mediaHeader": {
                "type": "movie",
                "path": import.meta.resolve("./steps/step_2.gif")
            },
            "type": "step",
            "title": "Add Script to Scene",
            "subtitle": "Step 2",
            "description": "Now we have our script available for use in your Lens, but we still need to add it to the Scene.",
            "completion": {
                "tasks": [
                {
                    "text": "Drag and drop the asset into the Hierarchy to create a Scene Object with this JS file as a component attached to it.",
                    "checker": (pluginSystem) => {
                        const model = pluginSystem.findInterface(Editor.Model.IModel);
                        const project = model.project;
                        const scene = project.scene;

                        let result = false;
                        const scriptComponents = scene.findComponents("ScriptComponent");
                        const countDownjs = scriptComponents.filter(component => component.name=== "Countdown");
                        if(countDownjs.length > 0) {
                            result = true;
                        }
                        return result;
                    },
                    "strategy": "alwaysTrue"
                },
                {
                    "text": "Next, in the Asset Browser, double click the script asset to open up the Script Editor panel where we will write our code.",
                    "tip": "For TypeScript support or larger Lens projects, we recommend using an external code editor such as Visual Studio Code",
                        "checker": (pluginSystem) => {
                            const dockManager = pluginSystem.findInterface(Editor.Dock.IDockManager);
                            const existingPanels = dockManager.panels;
                            if (existingPanels.find((panel) => panel.id === "Snap.Plugin.Gui.ScriptEditor")) {
                                return true;
                            } else {
                                return false;
                            }
                        },
                    "strategy": "alwaysTrue"
                },
            ]
            },
            "highlight": [
                "Snap.Plugin.Gui.SceneHierarchyEditor",
                "Snap.Plugin.Gui.AssetBrowser",
                "Snap.Plugin.Gui.ScriptEditorPanel" 
            ]
        },
        {
            "mediaHeader": {
                "type": "image",
                "path": import.meta.resolve("./steps/step_3.png")
            },
            "type": "step",
            "title": "Set Script Inputs",
            "subtitle": "Step 3",
            "description": "If you recall from previous sections, the ability to adjust parameters in the Inspector view is extremely powerful. Let's start by doing just that:",
            "completion": {
                "tasks": [
                {
                    "text": "Add <i><b>//@input Component.Text textComponentToChange</b></i> in the Script Editor. The code is added to clipboard. Paste the code in the Script Editor with click and paste or on Mac this is Cmd+V or Ctrl+V on Windows. Let's save the script, by selecting the Script Editor and using the save shortcut, on Mac this is Cmd+S or Ctrl+S on Windows.",           
                    "tip": "<p> '//' tells the editor that this is a comment. Anything on the same line as a '//' will not run in your JS code.</p> <p>The '@input' keyword is used by Lens Studio to expose those variables to the Inspector view in the editor. </p> <p>After '//@input', the next value is the type of object we want to allow for assignment in the editor and after that is the name of the variable.</p> ",
                    "clipboard":"//@input Component.Text textComponentToChange",
                    "checker": (pluginSystem) => {
                        const model = pluginSystem.findInterface(Editor.Model.IModel);
                        const project = model.project;
                        const assetManager = project.assetManager;
                        let result = false;
                        assetManager.assets.forEach(asset => {
                            if ( asset.name === "Countdown") {                            
                                const buffer = FileSystem.readFile( assetManager.assetsDirectory +"/"+asset.fileMeta.sourcePath);
                                if(buffer && buffer.includes("//@input Component.Text textComponentToChange")){
                                    result = true;
                                }

                            }
                        });                       
                        return result;
                        
                    },
                    "strategy": "alwaysTrue"
                },
                {
                    "text": "Then paste <i><b>//@input string newText</b></i> in the Script Editor. Save the script again", 
                    "clipboard":"//@input string newText",        
                    "checker": (pluginSystem) => {
                        const model = pluginSystem.findInterface(Editor.Model.IModel);
                        const project = model.project;
                        const assetManager = project.assetManager;
                        let result = false;
                        assetManager.assets.forEach(asset => {
                            if ( asset.name === "Countdown") {                            
                                const buffer = FileSystem.readFile( assetManager.assetsDirectory +"/"+asset.fileMeta.sourcePath);
                                if(buffer && buffer.includes("//@input Component.Text textComponentToChange") && buffer.includes("//@input string newText")){
                                    result = true;
                                }

                            }
                        });
                        return result;
                    },
                    "strategy": "alwaysTrue"
                },                   
            ]
        },
        "highlight": [
            "Snap.Plugin.Gui.ScriptEditorPanel" 
        ]
        },
        {
            "mediaHeader": {
                "type": "movie",
                "path": import.meta.resolve("./steps/step_4.gif")
            },
            "type": "step",
            "title": "Assign Text Reference",
            "subtitle": "Step 4",
            "description": "With <b>Countdown</b> object selected, we can now see that our script has two fields we can fill out, just as we defined in the script. Now let's assign Text Reference and New Text string value in the Inspector Panel",
            "completion": {
                "tasks": [
                    {
                        "text": "Select the <b>Countdown</b> object in the hierarchy. Let`s select the text component field and assign it to subtitle <b>Text</b> component.",           
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const scene = project.scene;
                            let result = false;
                            const textComponents = scene.findComponents("Text");
                            let subtitleTextComponent;
                            textComponents.forEach(textComponent => {
                                const so = textComponent.sceneObject;
                                if(so.name === "Happy Birthday Text 1"){
                                    subtitleTextComponent = textComponent;
                                }
                            });
                            if(!subtitleTextComponent){
                                return result;
                            }

                            const scriptComponents = scene.findComponents("ScriptComponent");
                            const countDownjs = scriptComponents.filter(component => component.name=== "Countdown");
                            countDownjs.forEach(countDown => {
                                if(countDown.textComponentToChange && countDown.textComponentToChange.sceneObject.name === subtitleTextComponent.sceneObject.name ){
                                    result = true;
                                 }
                                
                            });
                            return result;
                        },
                        "strategy": "alwaysTrue"
                    }, 
                    {
                        "text": "Let's also set the string value we want to assign to this text for testing, the text won't update just yet but we will do this next.",           
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const scene = project.scene;
                            let result = false;
                            const scriptComponents = scene.findComponents("ScriptComponent");
                            const countDownjs = scriptComponents.filter(component => component.name=== "Countdown");
                            countDownjs.forEach(countDown => {
                                if(countDown.newText && countDown.newText=== "New Text"){
                                    result = true;
                                 }
                                
                            });
                            return result;
                        },
                        "strategy": "alwaysTrue"
                    },   
                ]
            },
            "highlight": [
                "Snap.Plugin.Gui.InspectorPanel"
            ]
        },
        {
            "mediaHeader": {
                "type": "image",
                "path": import.meta.resolve("./steps/step_5.png")
            },
            "type": "step",
            "title": "Access Script Variables",
            "subtitle": "Step 5",
            "description": "In order to change the value of the <b>Text</b> component., we need to first understand how to access the variables we have just set:",
            "completion": {
                "tasks": [
                    {
                        "text": "Paste <i><b>var variable = 10;</b></i> in the Script Editor. Save the script",
                        "tip": "Defined varible in the script such as the this one, can be accessed directly by its name.", 
                        "clipboard":"var variable = 10;",          
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const assetManager = project.assetManager;
                            let result = false;
                            assetManager.assets.forEach(asset => {
                                if ( asset.name === "Countdown") {                            
                                    const buffer = FileSystem.readFile( assetManager.assetsDirectory +"/"+asset.fileMeta.sourcePath);
                                    if(buffer && buffer.includes("//@input Component.Text textComponentToChange") && buffer.includes("var variable = 10;")){
                                        result = true;
                                    }

                                }
                            });
                            return result;
                        },
                        "strategy": "alwaysTrue",
                    },
                    {
                        "text": "Paste <i><b>print(variable);</b></i>  in the Script Editor. Save the script.",
                        "tip": "'print()' is a function built into Lens Studio which will output information to the Logger panel to help with debugging.",
                        "clipboard":"print(variable);",           
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const assetManager = project.assetManager;
                            let result = false;
                            assetManager.assets.forEach(asset => {
                                if ( asset.name === "Countdown") {                            
                                    const buffer = FileSystem.readFile( assetManager.assetsDirectory +"/"+asset.fileMeta.sourcePath);
                                    if(buffer && buffer.includes("//@input Component.Text textComponentToChange") && buffer.includes("print(variable);")){
                                        result = true;
                                    }

                                }
                            });
                            return result;
                        },
                        "strategy": "alwaysTrue"
                    },
                    {
                        "text": "Paste <i><b>print(script.newText);</b></i> in the Script Editor. Save the script.",
                        "tip": "Any variable that is set from the inspector using the '//@input keyword' can be accessed by using the script keyword.",
                        "clipboard":"print(script.newText);",           
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const assetManager = project.assetManager;
                            let result = false;
                            assetManager.assets.forEach(asset => {
                                if ( asset.name === "Countdown") {                            
                                    const buffer = FileSystem.readFile( assetManager.assetsDirectory +"/"+asset.fileMeta.sourcePath);
                                    if(buffer && buffer.includes("//@input Component.Text textComponentToChange") && buffer.includes("print(script.newText);")){
                                        result = true;
                                    }

                                }
                            });
                            return result;
                        },
                        "strategy": "alwaysTrue",
                    },

                ]
            },
            "highlight": [
                "Snap.Plugin.Gui.ScriptEditorPanel"
            ]
        },
        {
            "mediaHeader": {
                "type": "image",
                "path": import.meta.resolve("./steps/step_6.png")
            },
            "type": "step",
            "title": "Change Text Using Code",
            "subtitle": "Step 6",
            "description": "When we first created the <b>Text</b> component., we needed to use the Inspector view of the <b>Text</b> component. to access and change the Text property to 'Another Year'. Instead, let's do this using code:",
            "completion": {
                "tasks": [
                    {
                        "text": "Paste <i><b>script.textComponentToChange.text = script.newText;</b></i>  in the Script Editor. Save the script, and the text will update in the preview window!",
                        "tip": "<p>We are accessing the <b>Text</b> component. we have assigned in the Inspector with 'script.textComponentToChange'. Then we use '.text' to access the text property of that component.</p><p>With the text field referenced, we can set its value to be equal to the value of the newText variable.</p>",           
                        "clipboard":"script.textComponentToChange.text = script.newText;",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const assetManager = project.assetManager;
                            let result = false;
                            assetManager.assets.forEach(asset => {
                                if ( asset.name === "Countdown") {                            
                                    const buffer = FileSystem.readFile( assetManager.assetsDirectory +"/"+asset.fileMeta.sourcePath);
                                    if(buffer && buffer.includes("//@input Component.Text textComponentToChange") && buffer.includes("script.textComponentToChange.text = script.newText;")){
                                        result = true;
                                    }

                                }
                            });
                            return result;
                        },
                        "strategy": "alwaysTrue",
                    },
                ]
            },
            "highlight": [
                "Snap.Plugin.Gui.ScriptEditorPanel" 
            ]
        },
        {
            "mediaHeader": {
                "type": "movie",
                "path": import.meta.resolve("./steps/step_7.gif")
            },
            "type": "step",
            "title": "Calculate Remaining Days",
            "subtitle": "Step 7",
            "description": "Now, that we can set the text, let's add a function to calculate the remaining days until the event.",
            "completion": {
                "tasks": [
                    {
                        "text": "Let's start by adding a new JavaScript asset to our Lens by selecting the <b>+</b> button in the Asset Browser and selecting JavaScript. We will name it 'CalculateRemainingDays'. ",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const assetManager = project.assetManager;
                            let result = false;
                            assetManager.assets.forEach(asset => {                
                                if (asset.type === "JavaScriptAsset" && asset.name === "CalculateRemainingDays") {
                                    result = true;
                                }
                            });
                            return result;
                        },
                        "strategy": "alwaysTrue"
                    },
                    {
                        "text": "Place it in the Scripts folder.",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const assetManager = project.assetManager;
                            let result = false;
                            assetManager.assets.forEach(asset => {
                                 if ( asset.name === "CalculateRemainingDays" && asset.fileMeta.sourcePath.parent.toString() == "Scripts") {
                                    result = true;
                                }
                            });
                            return result;
                        },
                        "strategy": "alwaysTrue"
                    },
                ]
            },
            "highlight": [
                "Snap.Plugin.Gui.AssetBrowser",                
            ]
        },
        {
            "mediaHeader": {
                "type": "image",
                "path": import.meta.resolve("./steps/step_8.png")
            },
            "type": "step",
            "title": "Calculate Remaining Days Function",
            "subtitle": "Step 8",
            "description": "Understand the generated code and how it calculates the remaining days using the Date API.",
            "completion": {
                "tasks": [
                    {
                        "text": "Double click on the <b>CalculateRemainingDays.js</b> to open the script in the Script Editor, save the script. Let's take a look at the generated code:",
                        "tip": "<p><i><b>calculateRemainingDays<\i><\b> is a function, which means it can be called at any time, and when called, it will execute the code within it. Line 11 demonstrates how to call the function and Line 6 shows the value that will be returned from executing the function.</p><p>It uses the JS Date API to get the time in milliseconds for the current date (line 2) and the target date, (line 5)</p> <p>Lines 4 & 5 are calculating the difference in ms and then converting from ms to days.</p> <p>The numbers on line 5 represent the conversion: There are 1000 miliseconds in a second, 60 seconds in a minute, 60 minutes in an hour, and 24 hours in a day. By multiplying those together, we now have our time in number of days.</p>",           
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const assetManager = project.assetManager;
                            let result = false;
                            
                            assetManager.assets.forEach(asset => {
                                if ( asset.name === "CalculateRemainingDays") {                            
                                    const buffer = FileSystem.readFile( assetManager.assetsDirectory +"/"+asset.fileMeta.sourcePath);
                                    if(buffer.includes(codeStringCalculateRemainingDays)){
                                        result = true;
                                    }else{
                                        FileSystem.writeFile( assetManager.assetsDirectory +"/"+asset.fileMeta.sourcePath, codeStringCalculateRemainingDays);
                                    }
                                    
                                }
                            });
                            return result;
                        },
                        "strategy": "alwaysTrue"
                    },
                ]
            },
            "highlight": [
                "Snap.Plugin.Gui.ScriptEditorPanel"                 
            ]
        },
        {
            "mediaHeader": {
                "type": "image",
                "path": import.meta.resolve("./steps/step_9.png")
            },
            "type": "step",
            "title": "Adjust Code for Global Scope",
            "subtitle": "Step 9",
            "description": "Let's adjust the code for our use case",
            "completion": {
                "tasks": [
                    {
                        "text": "Select Line 1 from <i><b>function calculateRemainingDays(targetDate) {</i></b>. Replace and paste to <i><b>global.calculateRemainingDays = function(targetDate) {</i></b>",
                        "tip": "<p>The only major change we need to make is to allow this function to be called from our <b>CountdownScript.js</b>. </p><p>We have a couple of options to achieve this, the easiest solution in our case is to change the Scope, (where the function is accessible from), to the global level.</p> <p>Line 1 now declares a variable that is globally accessible, and the variable stores our function.</p> <p>Note: Lens Studio provides several global methods that can be used in different scripts, including the print() function!</p>",           
                        "clipboard":"global.calculateRemainingDays = function(targetDate) {",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const assetManager = project.assetManager;
                            let result = false;
                            assetManager.assets.forEach(asset => {
                                if ( asset.name === "CalculateRemainingDays") {                            
                                    const buffer = FileSystem.readFile( assetManager.assetsDirectory +"/"+asset.fileMeta.sourcePath);
                                    if(buffer && buffer.includes("global.calculateRemainingDays = function(targetDate) {")){
                                        result = true;
                                    }

                                }
                            });
                            return result;
                        },
                        "strategy": "alwaysTrue"
                    },
                ]
            },
            "highlight": [
                "Snap.Plugin.Gui.ScriptEditorPanel" 
            ]
        },
        {
            "mediaHeader": {
                "type": "image",
                "path": import.meta.resolve("./steps/step_10.png")
            },
            "type": "step",
            "title": "Use Global Function",
            "subtitle": "Step 10",
            "description": "Modify <b>CountdownScript.js</b> to use the global calculateRemainingDays function correctly.",
            "completion": {
                "tasks": [
                    {
                        "text": "Close <b>CountdownScript.js</b> from Script Editor. Then double click on the <b>CountdownScript.js</b> to open the script in the Script Editor. Save the script. Then take a look at the generated code:",
                        "tip": "<p>Line 2 is now the targetDate variable which holds the date we are counting down to. Since it is a //@input parameter, it can be set in the inspector.</p><p>Line 4 shows how we can use our new global function from this script, we are passing in the target date as the parameter so that the function will know which date to calculate the remaining days for.</p> <p>From here you can save your script and you may notice an error in the logger. Let's fix that in the next step.</p>",           
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const assetManager = project.assetManager;
                            let result = false;
                            
                            assetManager.assets.forEach(asset => {
                                if ( asset.name === "Countdown") {   
                                    const buffer = FileSystem.readFile( assetManager.assetsDirectory +"/"+asset.fileMeta.sourcePath);                         
                                    if(buffer.includes(codeStringCountDown)){
                                        result = true;
                                    }else{
                                        FileSystem.writeFile( assetManager.assetsDirectory +"/"+asset.fileMeta.sourcePath, codeStringCountDown);
                                    }
                                }
                            });
                            return result;
                        },
                        "strategy": "alwaysTrue"
                    },
                ]
            },
            "highlight": [
                "Snap.Plugin.Gui.ScriptEditorPanel" 
            ]
        },
        {
            "mediaHeader": {
                "type": "movie",
                "path": import.meta.resolve("./steps/step_11.gif")
            },
            "type": "step",
            "title": "Fix Script Execution Order",
            "subtitle": "Step 11",
            "description": "Ensure scripts are executed in the correct order by rearranging them in the Hierarchy.",
            "completion": {
                "tasks": [
                    {
                        "text": "Drag and drop the <b>CalculateRemainingDays.js</b> asset into the Hierarchy to create a Scene Object with this JS file as a component attached to it.",
                        "tip": "<p>Line 2 is now the targetDate variable which holds the date we are counting down to. Since it is a //@input parameter, it can be set in the inspector.</p><p>Line 4 shows how we can use our new global function from this script, we are passing in the target date as the parameter so that the function will know which date to calculate the remaining days for.</p> <p>From here you can save your script and you may notice an error in the logger. Let's fix that in the next step.</p>",           
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const scene = project.scene;

                            let result = false;
                            const scriptComponents = scene.findComponents("ScriptComponent");
                            const calculateRemainingDaysjs = scriptComponents.filter(component => component.name=== "CalculateRemainingDays");
                            if(calculateRemainingDaysjs.length > 0) {
                                result = true;
                            }
                            return result;
                        },
                        "strategy": "alwaysTrue"
                    },
                    {
                        "text": "Drag the <b>CalculateRemainingDays</b> Object to the top of the hierarchy to ensure it is executed before our script, reset the Lens in the Preview panel, and you will see it working correctly",
                        "tip": "<p>As with the <b>Tween Manager</b> in a previous section, scripts are executed from top to bottom in the Hierarchy.</p> <p>If we look closer at the error in the logger, it tells us that <b>CountdownScript.js</b> on line 4, is trying to call something as a function that is not a function.</p>",           
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const scene = project.scene;

                            let result = false;
                            const scriptComponents = scene.findComponents("ScriptComponent");
                            const calculateRemainingDaysjs = scriptComponents.filter(component => component.name=== "CalculateRemainingDays");
                            calculateRemainingDaysjs.forEach(js => {
                                if(scene.getRootObjectIndex(js.sceneObject)<1)
                                {
                                    result = true;
                                }
                            });
                            return result;
                        },
                        "strategy": "alwaysTrue"
                    },
                ]
            },
            "highlight": [
                "Snap.Plugin.Gui.SceneHierarchyEditor",
                "Snap.Plugin.Gui.AssetBrowser",
            ]
        },
        {
            "mediaHeader": {
                "type": "image",
                "path": import.meta.resolve("./steps/step_12.png")
            },
            "type": "step",
            "title": "Add Final Script Logic",
            "subtitle": "Conclusion",
            "description": "Now our Lens is working as expected, let's add a couple of lines to add a bit more polish to our Lens",
            "completion": {
                "tasks": [
                {
                        "text": "Close <b>CountdownScript.js</b> from Script Editor. Then double click on the <b>CountdownScript.js</b> to open the script in the Script Editor. Save the script. Then take a look at the generated code:",
                        "tip": "<p>Lines 8 - 10 adjust the text to be singular 'Day' when there is only one day remaining until the target date. Otherwise, it will continue to use the 'Days left' message from line 6.</p>",           
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const assetManager = project.assetManager;
                            let result = false;
                            
                            assetManager.assets.forEach(asset => {
                                if ( asset.name === "Countdown") {   
                                    const buffer = FileSystem.readFile( assetManager.assetsDirectory +"/"+asset.fileMeta.sourcePath);                         
                                    if(buffer.includes(codeStringCountDownFinal)){
                                        result = true;
                                    }else{
                                        FileSystem.writeFile( assetManager.assetsDirectory +"/"+asset.fileMeta.sourcePath, codeStringCountDownFinal);
                                    }
                                }
                            });
                            return result;
                        },
                        "strategy": "alwaysTrue"
                    },
                ]
            },
            "highlight": [
                "Snap.Plugin.Gui.ScriptEditorPanel" 
            ]
        }, 
        {
            "type": "milestone",
            "mediaHeader": {
                "type": "image",
                "path": import.meta.resolve("../Shared/congrats.png")
            },
            "title": "Congratulations",
            "subtitle": "",
            "description": "<center>You completed the sixth Tutorial in tutorials series of Building Your First Lens</center>",
            "content": `<div>
                <h3>Summary</h3>
                <p>Congratulations! Now you have written your first two scripts!</p>
                <p>Scripts can work together to adjust the experience of your Lens and give the user a reason to keep coming back.</p>
                <p>Utilize the AI Chat feature of the GenAI Suite and the Lens Studio API pages to see how to access properties of different components!</p>
            </div>`,
            "completion": {
                "tasks": []
            },
            "highlight": [
            ]
        }
    ]
}
