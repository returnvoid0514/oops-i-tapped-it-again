const isVec3Equal = (lhs, rhs) => {
    return (lhs.x == rhs.x) && (lhs.y == rhs.y) && (lhs.z == rhs.z);
}
export const TutorialDescriptor_4 = {
    "id": "text_tweens_and_behavior_script_interactions",
    "title": "Text, Tweens and Behavior Script Interactions",
    "pages": [
        {
            "mediaHeader": {
                "type": "image",
                "path": import.meta.resolve("./icons/three_d_text.svg"),
                "max_width": 80
            },
            "type": "milestone",
            "title": "Text, Tweens and Behavior Script Interactions",
            "subtitle": "Section 5",
            "description": "We have focused on 3D assets and face effects up until this point, but ensuring that text is represented in a cohesive layout is just as important. This section focuses on customizing text to create a unique effect.",
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
            "title": "Add Text Object",
            "subtitle": "Step 1",
            "description": "In the Scene Hierarchy panel, select the <b>Head Binding</b> object so that a newly created object will be created as its child. Then press the <b>+</b> button and search for the <b>Text</b> Object to add text to the scene. Rename the new <b>Text</b> Object for clarity.",
            "completion": {
                "tasks": [
                    {
                        "text": "In the Scene Hierarchy panel, select the <b>Head Binding</b> object so that a newly created object will be created as its child. Then press the <b>+</b> button and search for the <b>Text</b> Object to add text to the scene.",

                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const scene = project.scene;
                            let result = false;
                            const headBindings = scene.findComponents("Head");

                            headBindings.forEach(headBinding => {
                                const so = headBinding.sceneObject;

                                so.children.forEach((child) => {
                                    const texts = child.getComponents("Text")
                                    if (texts.length > 0) {
                                        result = true;
                                    }
                                });
                            });

                            return result;
                        },
                        "strategy": "alwaysTrue"
                    },
                    {
                        "text": "Rename the new <b>Text</b> Object to 'Happy Birthday Text' for clarity",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const scene = project.scene;
                            let result = false;
                            const headBindings = scene.findComponents("Head");

                            headBindings.forEach(headBinding => {
                                const so = headBinding.sceneObject;
                                so.children.forEach((child) => {
                                    const texts = child.getComponents("Text");  
                                    if (texts.some(component => component.sceneObject.name === "Happy Birthday Text")) {
                                        result = true;
                                    }                             
                                });
                            });

                            return result;
                        },
                        "strategy": "alwaysTrue"
                    }
                ]
            },
            "highlight": [
                "Snap.Plugin.Gui.SceneHierarchyEditor"
            ]
        },
        {
            "mediaHeader": {
                "type": "image",
                "path": import.meta.resolve("./steps/step_2.png")
            },
            "type": "step",
            "title": "Customize Text",
            "subtitle": "Step 2",
            "description": "With the new <b>Text</b> Object selected, adjust the text to say 'Happy Birthday!', modify the font size, and explore other available options.",
            "completion": {
                "tasks": [
                    {
                        "text": "With the new <b>Text</b> Object selected, adjust the text to say 'Happy Birthday!' modify the font size, and explore other available options.",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const scene = project.scene;
                            let result = false;
                            const headBindings = scene.findComponents("Head");

                            headBindings.forEach(headBinding => {
                                const so = headBinding.sceneObject;
                                so.children.forEach((child) => {
                                    const texts = child.getComponents("Text");
                                    if (texts.some(component => component.text.includes("Happy Birthday!"))) {
                                        result = true;
                                    }
                                });
                            });

                            return result;
                        },
                        "strategy": "alwaysTrue"
                    },
                    {
                        "text": "If your text looks distorted in the preview, this is because it is being affected by the Face Stretch object. To fix this, simply adjust the render order of the <b>Text</b> Object so that it will be rendered (displayed) after the Face Stretch has been applied. ",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const scene = project.scene;
                            let result = false;
                            const headBindings = scene.findComponents("Head");

                            headBindings.forEach(headBinding => {
                                const so = headBinding.sceneObject;
                                so.children.forEach((child) => {
                                    const texts = child.getComponents("Text");                                  
                                    texts.forEach((component) => {
                                        if(component.renderOrder === 1){
                                            result = true;
                                        }
                                    });

                                });
                            });

                            return result;
                        },
                        "strategy": "alwaysTrue"
                    }
                ]
            },
            "highlight": [
                "Snap.Plugin.Gui.InspectorPanel"
            ]
        },
        {
            "mediaHeader": {
                "type": "movie",
                "path": import.meta.resolve("./steps/step_3.gif")
            },
            "type": "step",
            "title": "Change Font",
            "subtitle": "Step 3",
            "description": "You can swap the default font for your own! Drag and drop your downloaded font into the Asset Browser, then set it in the Custom Font field of the <b>Text</b> component.",
            "completion": {
                "tasks": []
            },
            "highlight": [
                "Snap.Plugin.Gui.AssetBrowser"
            ]
        },
        {
            "mediaHeader": {
                "type": "movie",
                "path": import.meta.resolve("./steps/step_4.gif")
            },
            "type": "step",
            "title": "Duplicate Text Object",
            "subtitle": "Step 4",
            "description": "Now let's add a subtitle.",
            "completion": {
                "tasks": [
                    {
                        "text": "Once satisfied with the look, duplicate the <b>Text</b> Object and position the duplicate below the original to add a subtitle",
                        "tip": "You can duplicate the <b>Text</b> Object by right-clicking on it in the Hierarchy and selecting 'Duplicate', or by using the keyboard shortcut Ctrl+D (Cmd+D on Mac).",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const scene = project.scene;
                            const headBindings = scene.findComponents("Head");
                            let result = false;
                            headBindings.forEach(headBinding => {
                                const so = headBinding.sceneObject;
                                let count = 0;
                                so.children.forEach((child) => {
                                    const texts = child.getComponents("Text");
                                    if (texts.length > 0) {
                                        count++;
                                    }
                                });
                               
                                if(count > 1){
                                    result = true;
                                }                            

                            });
                            return result;
                        },
                        "strategy": "alwaysTrue"
                    },
                    {
                        "text": "Change the text of the duplicate to 'Another Year!' and adjust its position and scale to be slightly lower than the original text.",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const scene = project.scene;
                            let result = false;
                            const headBindings = scene.findComponents("Head");
                            headBindings.forEach(headBinding => {
                                const so = headBinding.sceneObject;
                                so.children.forEach((child) => {
                                    const texts = child.getComponents("Text");
                                    if (texts.some(component => component.text.includes("Another Year!"))) {
                                        result = true;
                                    }
                                });
                            });

                            return result;
                        },
                        "strategy": "alwaysTrue"
                    },
                ]
            },
            "highlight": [
                "Snap.Plugin.Gui.SceneHierarchyEditor"
            ]
        },
        {
            "mediaHeader": {
                "type": "movie",
                "path": import.meta.resolve("./steps/step_5.gif")
            },
            "type": "step",
            "title": "Add Tween Manager for Animations",
            "subtitle": "Step 5",
            "description": "To animate the text, we will use the <b>Tween Manager</b>. This package allows you to create animations for your <b>Text</b> Objects without coding.",
            "completion": {
                "tasks": [                   
                    {
                        "text": "In the Scene Hierarchy, you can find it by clicking the <b>+</b> button and searching for 'Tween'. This will add a <b>Tween Manager</b> object to your scene and <b>Tween Manager</b> Package to your Asset Browser.",
                        "tip": "The setup script in the <b>Tween Manager</b> Package will automatically add the <b>Tween Manager</b> objects along with 2D and 3D examples to your scene. Explore the examples to see how to use the Tween. Delete or disable the examples once you are done exploring.",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const assetManager = project.assetManager;
                            let result = false;
                            for (let i = 0; i < assetManager.assets.length; i++) {
                                if (assetManager.assets[i].type === "NativePackageDescriptor") {
                                    if (assetManager.assets[i].packageName === "TweenManager") {
                                        result = true;
                                    }
                                    
                                }
                            }
                            return result;
                        },
                        "strategy": "alwaysTrue"
                    },
                ]
            },
            "highlight": [
                "Snap.Plugin.Gui.SceneHierarchyEditor",
                "Snap.Plugin.Gui.AssetBrowser"

            ]
        },
        {
            "mediaHeader": {
                "type": "movie",
                "path": import.meta.resolve("./steps/step_6.gif")
            },
            "type": "step",
            "title": "Create Parent Object for <b>Text</b> Objects",
            "subtitle": "Step 6",
            "description": "Create a new parent object for the <b>Text</b> Objects. Add the <b>Text</b> Objects as children to this parent, allowing easy attribute modifications.",
            "completion": {
                "tasks": [
                    {
                        "text": "In the Scene Hierarchy, select <b>Head Binding</b> object and click the <b>+</b> button and searching for 'Scene Object'. Rename the parent object to 'TextParent'.",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const scene = project.scene;

                            let result = false;
                            const headBindings = scene.findComponents("Head");
                            
                            headBindings.forEach(headBinding => {
                                const so = headBinding.sceneObject;

                                so.children.forEach((child) => {
                                    if (child.name == "TextParent") {
                                        result = true;
                                    }
                                });
                            });
                            return result;
                        },
                        "strategy": "alwaysTrue"
                    },
                    {
                        "text": "Drag and drop the <b>Text</b> Objects under this new parent object in the Hierarchy panel.",
                        "tip": "This is a useful step as it gives us the ability to modify attributes on the parent and affect all of the children",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const scene = project.scene;

                            let result = false;
                            const headBindings = scene.findComponents("Head");
                            let textObjects = [];
                            headBindings.forEach(headBinding => {
                                const so = headBinding.sceneObject;
                                so.children.forEach((child) => {
                                    if (child.name == "TextParent"){
                                        textObjects = child.children.filter(component => component.getComponents("Text"));
                                    }
                                });
                                if (textObjects.length > 1) {  
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
                "Snap.Plugin.Gui.SceneHierarchyEditor"
            ]
        },
        {
            "mediaHeader": {
                "type": "movie",
                "path": import.meta.resolve("./steps/step_7.gif")
            },
            "type": "step",
            "title": "Add Tween Transform",
            "subtitle": "Step 7",
            "description": "The <b>TweenTransform</b> type modifies an object's Transform using either Move, Scale or Rotate. It has a number of settings that can be configured in the Inspector panel. Select the <b>TextParent</b> object and configure tween settings.",
            "completion": {
                "tasks": [
                    {
                        "text": "Select the <b>TextParent</b> object in the Hierarchy panel, then in the Inspector Panel, click the <b>+ Add Component<b> button and search for 'Tween Transform'.",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const scene = project.scene;

                            let result = false;
                            const headBindings = scene.findComponents("Head");
                            let tweenTransforms = [];
                            headBindings.forEach(headBinding => {
                                const so = headBinding.sceneObject;
                                so.children.forEach((child) => {
                                    if (child.name == "TextParent") {
                                        tweenTransforms = child.getComponents("ScriptComponent").filter(component => component.name=== "TweenTransform");
                                        if (tweenTransforms.length > 0) {
                                            result = true;
                                        }
                                    }
                                });

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
                "path": import.meta.resolve("./steps/step_8.png")
            },
            "type": "step",
            "title": "Configure Tween Transform",
            "subtitle": "Step 8",
            "description": "Configure the <b>Tween Transform</b> with scale animation",
            "completion": {
                "tasks": [
                    {
                        "text": "Set the Tween Name to 'PlayForward'.",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const scene = project.scene;

                            let result = false;
                            const headBindings = scene.findComponents("Head");
                            let tweenTransforms = [];
                            headBindings.forEach(headBinding => {
                                const so = headBinding.sceneObject;
                                so.children.forEach((child) => {
                                    if (child.name == "TextParent") {
                                        tweenTransforms = child.getComponents("ScriptComponent").filter(component => component.name=== "TweenTransform");
                                        tweenTransforms.forEach((tweenTransform) => {
                                            if (tweenTransform.tweenName === "PlayForward") {
                                                result = true;
                                            }
                                        });
                                    }
                                });

                            });
                            return result;
                        },
                        "strategy": "alwaysTrue"
                    },
                    {
                        "text": "Set the <b>Transform</b> component’s type to 'Scale'",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const scene = project.scene;

                            let result = false;
                            const headBindings = scene.findComponents("Head");
                            let tweenTransforms = [];
                            headBindings.forEach(headBinding => {
                                const so = headBinding.sceneObject;
                                so.children.forEach((child) => {
                                    if (child.name == "TextParent") {
                                        tweenTransforms = child.getComponents("ScriptComponent").filter(component => component.name=== "TweenTransform");
                                        tweenTransforms.forEach((tweenTransform) => {
                                            if (tweenTransform.type === 1) {
                                                result = true;
                                            }
                                        });
                                    }
                                });

                            });
                            return result;
                        },
                        "strategy": "alwaysTrue"
                    },
                    {
                        "text": "Set the Movement Type to 'From/To'",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const scene = project.scene;

                            let result = false;
                            const headBindings = scene.findComponents("Head");
                            let tweenTransforms = [];
                            headBindings.forEach(headBinding => {
                                const so = headBinding.sceneObject;
                                so.children.forEach((child) => {
                                    if (child.name == "TextParent") {
                                        tweenTransforms = child.getComponents("ScriptComponent").filter(component => component.name=== "TweenTransform");
                                        tweenTransforms.forEach((tweenTransform) => {
                                            if (tweenTransform.movementType === 0) {
                                                result = true;
                                            }
                                        });
                                    }
                                });

                            });
                            return result;
                        },
                        
                        "strategy": "alwaysTrue"
                    },
                    {
                        "text": "Set the StartInput to '0,0,0' and the EndInput to '1.1,1.1,1.1'.",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const scene = project.scene;

                            let result = false;
                            const headBindings = scene.findComponents("Head");
                            let tweenTransforms = [];
                            headBindings.forEach(headBinding => {
                                const so = headBinding.sceneObject;
                                so.children.forEach((child) => {
                                    if (child.name == "TextParent") {
                                        tweenTransforms = child.getComponents("ScriptComponent").filter(component => component.name=== "TweenTransform");
                                        tweenTransforms.forEach((tweenTransform) => {
                                            if (isVec3Equal(tweenTransform.startInput, new vec3(0, 0, 0)) &&
                                                isVec3Equal(tweenTransform.endInput, new vec3(1.1, 1.1, 1.1))) {
                                                result = true;
                                            }
                                        });
                                    }
                                });

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
                "type": "movie",
                "path": import.meta.resolve("./steps/step_9.gif")
            },
            "type": "step",
            "title": "Add Behavior Script",
            "subtitle": "Step 9",
            "description": "<b>Behavior</b> Script allows you to create interactive experiences in Lens Studio. They can respond to various events and trigger actions based on user interactions.",
            "completion": {
                "tasks": [
                    {
                        "text": "In the Scene Hierarchy, click the <b>+</b> button and search for 'Behavior' to add it. This will add a <b>Behavior</b> object to your scene and <b>Behavior</b> Custom Component to your Asset Browser.",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const assetManager = project.assetManager;
                            let result = false;
                            for (let i = 0; i < assetManager.assets.length; i++) {
                                
                                if (assetManager.assets[i].type === "JavaScriptAsset" && assetManager.assets[i].name === "Behavior") {
                                    result = true;
                                }
                            }
                            return result;
                        },
                        "strategy": "alwaysTrue"
                    },

                ]
            },
            "highlight": [
                "Snap.Plugin.Gui.SceneHierarchyEditor",
                "Snap.Plugin.Gui.AssetBrowser"
            ]
        },
        {
            "mediaHeader": {
                "type": "image",
                "path": import.meta.resolve("./steps/step_10.png")
            },
            "type": "step",
            "title": "Configure Behavior Script",
            "subtitle": "Step 10",
            "description": "Configure the <b>Behavior</b> Script to trigger the tween animation when the user taps the screen.",
            "completion": {
                "tasks": [
                    {
                        "text": "Set the Response Type to 'Run Tween'.",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const scene = project.scene;

                            let result = false;
                            const scriptComponents = scene.findComponents("ScriptComponent");

                            scriptComponents.forEach(scriptComponent => {
                                if (scriptComponent.name === "Behavior" && scriptComponent.responseType === "runTween") {
                                    result = true;
                                }

                            });
                            return result;
                        },
                        
                        "strategy": "alwaysTrue"
                    },
                    {
                        "text": "Set Target Object to the <b>TextParent</b> object",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const scene = project.scene;

                            let result = false;
                            const scriptComponents = scene.findComponents("ScriptComponent");

                            scriptComponents.forEach(scriptComponent => {
                                if (scriptComponent.name === "Behavior" && scriptComponent.runTweenTargetObject && scriptComponent.runTweenTargetObject.name === "TextParent") {
                                    result = true;
                                }

                            });
                            return result;
                        },
                        "strategy": "alwaysTrue"
                    },
                    {
                        "text": "Set the TweenName to the same name we used in the <b>Tween Transform</b> component - 'PlayForward'.",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const scene = project.scene;

                            let result = false;
                            const scriptComponents = scene.findComponents("ScriptComponent");
                            scriptComponents.forEach(scriptComponent => {
                                if (scriptComponent.name === "Behavior" && scriptComponent.runTweenTweenName === "PlayForward") {
                                    result = true;
                                }

                            });
                            return result;
                        },
                        "strategy": "alwaysTrue"
                    },
                    {
                        "text": "Ensure that the <b>Tween Transform</b> on the <b>TextParent</b> object has Play Automatically unchecked.",
                        "tip": "Check out all of the different events you can listen for with the <b>Behavior</b> Script. Once you have explored the different options in <b>Behavior</b> Script, configure it so that it is listening for the Mouth Opened event which can be found when Trigger is set to Face Event.",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const scene = project.scene;

                            let result = false;
                            const headBindings = scene.findComponents("Head");
                            let tweenTransforms = [];
                            headBindings.forEach(headBinding => {
                                const so = headBinding.sceneObject;
                                so.children.forEach((child) => {
                                    if (child.name == "TextParent") {
                                        tweenTransforms = child.getComponents("ScriptComponent").filter(component => component.name=== "TweenTransform");
                                        tweenTransforms.forEach((tweenTransform) => {
                                            if (tweenTransform.playAutomatically === false) {
                                                result = true;
                                            }
                                        });
                                    }
                                });

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
                "type": "movie",
                "path": import.meta.resolve("./steps/step_11.gif")
            },
            "type": "step",
            "title": "Organize Assets",
            "subtitle": "Step 11",
            "description": "Now that we have several different kinds of content in our Asset Browser, we should organize our project. Right click in the Asset Browser and choose 'Organize Folder Structure - Default'. This will create a folder structure that organizes your assets by type.",
            "completion": {
                "tasks": []
            },
            "highlight": [
                "Snap.Plugin.Gui.AssetBrowser"
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
            "description": "<center>You completed the fifth Tutorial in tutorials series of Building Your First Lens</center>",
            "content": `<div>
                <h3>Summary</h3>
                <p>Tweens are used to interpolate be Tween values and are a great way to add polish and animations to your Lens without needing to create a custom animation.</p>
                <p>The <b>Behavior</b> script is a great resource for adding dynamic interactions to your Lens!</p>
            </div>`,
            "completion": {
                "tasks": []
            },
            "highlight": [
            ]
        }
    ]
}
