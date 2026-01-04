export const TutorialDescriptor_0 = {
    "id": "built_in_ar_effect",
    "title": "Add Built-in AR Effects",
    "pages": [
        {
            "type": "milestone",
            "mediaHeader": {
                "type": "image",
                "path": import.meta.resolve("./icons/face_liqufy.svg"),
                "max_width": 80
            },
            "title": "Add Built-in AR Effects",
            "subtitle": "Section 1",
            "description": "<center>Lens Studio allows you to build AR experiences quickly with no-code by providing a variety of commonly used components. Let’s take a look at some of these components to see how we can augment the user's face!</center>",
            "content": "",
            "completion": {
                "tasks": []
            },
            "highlight": [
            ]
        },
        {
            "type": "step",
            "mediaHeader": {
                "type": "movie",
                "path": import.meta.resolve("./steps/step_0.gif")
            },
            "title": "Meet Scene Hierarchy panel",
            "subtitle": "Step 1",
            "description": "In the top left of Lens Studio, you will find the Scene Hierarchy panel. The Scene Hierarchy panel contains everything that is in your Lens.",
            "completion": {
                "tasks": [
                    {
                        "text": "Click on the <b>+</b> button to add something to the scene. In this case add <b>Face Stretch</b>.",
                        "tip": "<i>Tip: You can type “Face” in the search bar to find a wide variety of effects you can add to the face!</i>",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const scene = project.scene;

                            return scene.findComponents("FaceStretchVisual").length > 0;
                        },
                        "strategy": "alwaysTrue"
                    },
                    {
                        "text": "Double click the <b>Face Stretch</b> in the Scene Hierarchy panel if you don’t see the Editor.",
                        "checker": (pluginSystem) => {
                            const dockManager = pluginSystem.findInterface(Editor.Dock.IDockManager);
                            const existingPanels = dockManager.panels;
                            if (existingPanels.find((panel) => panel.id === "Com.Snap.LensBasedEditors")) {
                                return true;
                            } else {
                                return false;
                            }
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
            "type": "step",
            "mediaHeader": {
                "type": "movie",
                "path": import.meta.resolve("./steps/step_1.gif")
            },
            "title": "Face Stretch Editor",
            "subtitle": "Step 2",
            "description": "You should now see a Face Stretch Editor which allows you to quickly stretch a face by simply moving the dots around.",
            "completion": {
                "tasks": [
                    {
                        //"header": "In the far right of Lens Studio you will see a Preview panel, that will preview this Lens on a video to help you test how your Lens look.",
                        "text": "Try moving the dots in stretch editor to see how face in preview is changing",
                        "tip": "<i>Tip: If you have a web camera, try clicking on the web camera icon in the Preview window to see the effect on yourself!</i>",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const scene = project.scene;

                            const comps = scene.findComponents("FaceStretchVisual");
                            if (comps.length == 0) return false;

                            const comp = comps[0];
                            const featureNames = comp.getFeatureNames();
                            if (featureNames.length == 0) return false;
                            const featureName = featureNames[0];

                            const points = comp.getFeaturePoints(featureName);

                            const arraysAlmostDifferent = (a, b, EPS = 0.1) => {
                                return a.length === b.length && a.some((v, i) => Math.abs(v - b[i]) > EPS);
                            }

                            for (const point of points) {
                                if (arraysAlmostDifferent([point.delta.x, point.delta.y, point.delta.z], [0, 0, 0], 0.001)) return true;
                            }

                            return false;
                        },
                        "strategy": "onceTrue"
                    }
                ]
            },
            "highlight": [
                "Com.Snap.LensBasedEditors",
                "Snap.Plugin.Gui.PreviewPanel"
            ]
        },
        {
            "type": "step",
            "mediaHeader": {
                "type": "movie",
                "path": import.meta.resolve("./steps/step_2.gif")
            },
            "title": "More Face Effects",
            "subtitle": "Step 3",
            "description": "Let's add another face effect to the Lens.",
            "completion": {
                "tasks": [
                    {
                        "text" :"Go to the Scene Hierarchy panel, press the <b>+</b> button, and add <b>Face Liquify</b>.",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const scene = project.scene;

                            return scene.findComponents("LiquifyVisual").length > 0;
                        },
                        "strategy": "alwaysTrue"
                    },
                    {
                        // "header": "As we did before, you can modify the effect in its respective editor. For example, we can position the effect's center and see how the face has changed in the Preview panel.",
                        "text": "Try moving the circle in liquify editor to see how it affects face in the preview.",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const scene = project.scene;

                            const components = scene.findComponents("LiquifyVisual");
                            const arraysAlmostDifferent = (a, b, EPS = 0.1) => {
                                return a.length === b.length && a.some((v, i) => Math.abs(v - b[i]) > EPS);
                            }

                            return components.some((component) => {
                                const vertex = component.sceneObject.getComponent("Head").attachedBarycentricVertex;
                                if (arraysAlmostDifferent([0, 0, 0], vertex.indices, 0.0001)) return true;
                                if (arraysAlmostDifferent([0, 0, 0], vertex.weights, 0.0001)) return true;
                                return false;
                            });
                        },
                        "strategy": "onceTrue"
                    }

                ]
            },
            "highlight": [
                "Snap.Plugin.Gui.SceneHierarchyEditor"
            ]
        },
        {
            "type": "step",
            "mediaHeader": {
                "type": "image",
                "path": import.meta.resolve("./steps/step_3.png")
            },
            "title": "Scene Hierarchy Overview",
            "subtitle": "Step 4",
            "description": "Let’s review the Scene Hierarchy panel to see what’s in our Lens so far.<br><br>Notice how there is a hierarchy in our panel: objects are nested inside other objects. For example: the <b>Face Stretch</b> we’ve added is a child of Effects, which is a child of <b>Camera</b> Object<br><br>Each of these items in the Scene Hierachy is called a Scene Object. Every Lens contains Scene Objects, each of which has a unique purpose.",
            "completion": {
                "tasks": [
                ]
            },
            "highlight": [
                "Snap.Plugin.Gui.SceneHierarchyEditor"
            ]
        },
        {
            "type": "step",
            "mediaHeader": null,
            "title": "Object Visibility",
            "subtitle": "Step 5",
            "description": "You can select Scene Objects by clicking on them in the Hierarchy panel. You can also toggle the checkmark next to the object to enable or disable the object.",
            "completion": {
                "tasks": [
                    {
                        "text": "Select <b>Face Stretch</b> Object in Scene Hierarchy Panel by clicking on it",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const selection = project.selection;

                            if (selection.sceneObjects.length != 1) {
                                return false;
                            }

                            return selection.sceneObjects[0].getComponents("FaceStretchVisual").length > 0;
                        },
                        "strategy": "onceTrue"
                    },
                    {
                        "type": "arbitrary", // to-do: unused, add support + add more types
                        "text": "Try to disable <b>Face Stretch</b> Object and how the Preview panel changes",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const selection = project.selection;

                            if (selection.sceneObjects.length != 1) {
                                return false;
                            }

                            if (selection.sceneObjects[0].getComponents("FaceStretchVisual").length == 0) {
                                return false;
                            }

                            return !selection.sceneObjects[0].enabled;
                        },
                        "strategy": "onceTrue"
                    },
                ]
            },
            "highlight": [
                "Com.Snap.LensBasedEditors",
                "Snap.Plugin.Gui.PreviewPanel"
            ]
        },
        {
            "type": "step",
            "mediaHeader": null,
            "title": "Introducing Inspector",
            "subtitle": "Step 6",
            "description": "As you select objects, you will notice the Inspector panel changes to show values specific to the selected object.<br><br>Each scene object can have <b>Components</b> inside it, which gives it some special behavior.<br><br>For example, when you select the <b>Liquify Visual</b> object, you can see that the object contains a <b>Head Binding</b> component, as well as a <b>Liquify Visual</b> component.",
            "completion": {
                "tasks": []
            },
            "highlight": [
                "Snap.Plugin.Gui.InspectorPanel"
            ]
        },
        {
            "type": "step",
            "mediaHeader": null,
            "title": "Introducing Inspector",
            "subtitle": "Step 7",
            "description": "Scene Objects can contain one or more components. You can modify the values in the component to alter the behavior of the component.",
            "completion": {
                "tasks": [
                    {
                        "text": "Select <b>Liquify</b> Object in Scene Hierarchy Panel by clicking on it",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const selection = project.selection;

                            if (selection.sceneObjects.length != 1) {
                                return false;
                            }

                            return selection.sceneObjects[0].getComponents("LiquifyVisual").length > 0;
                        },
                        "strategy": "alwaysTrue"
                    },
                    {
                        "tip": "You’ll also notice that each object has a <b>Transform</b> component. The <b>Transform</b> component controls the position, rotation, and scale of our object in the scene.",
                        "text": "Change the radius of <b>Liquify Visual</b> component",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const selection = project.selection;

                            if (selection.sceneObjects.length != 1) {
                                return false;
                            }

                            const comps = selection.sceneObjects[0].getComponents("LiquifyVisual");

                            if (comps.length > 0) {
                                return comps[0].radius != 2;
                            } else {
                                return false;
                            }
                        },
                        "startegy": "alwaysTrue"
                    }
                ]
            },
            "highlight": [
                "Snap.Plugin.Gui.InspectorPanel"
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
            "description": "<center>You completed the first Tutorial in tutorials series of Building Your First Lens</center>",
            "content": `<div>
                <h3>Summary</h3>
                <p>Lens Studio is composed of many panels:</p>
                <p>- Scene Hierarchy displays the names of objects in the Lens.<br>
                - Preview Panel shows what the Lens looks like.<br>
                - Inspector shows the components and values of the selected object.</p>
                <p>Scene Objects contain the foundational pieces of a Lens. Each Scene Object can contain one more Components, each adding a specific behavior</p>
            </div>`,
            "completion": {
                "tasks": []
            },
            "highlight": [
            ]
        }
    ]
}
