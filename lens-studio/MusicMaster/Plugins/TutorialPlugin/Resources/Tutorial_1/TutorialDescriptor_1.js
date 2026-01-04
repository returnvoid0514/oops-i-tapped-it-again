const isVec3Equal = (lhs, rhs) => {
    return (lhs.x == rhs.x) && (lhs.y == rhs.y) && (lhs.z == rhs.z);
}

export const TutorialDescriptor_1 = {
    "id": "adding_content_to_your_lens",
    "title": "Add 3D Content",
    "pages": [
        {
            "mediaHeader": {
                "type": "image",
                "path": import.meta.resolve("./icons/face_mesh.svg"),
                "max_width": 80
            },
            "type": "milestone",
            "title": "Add 3D Content",
            "subtitle": "Section 2",
            "description": "<center>So far we’ve only modified what’s in the Camera. Let’s take a look at how we might add digital content to the camera! Attaching the digital experience to the real world begins with “tracking”. That is: making the digital content track to the camera feed. Lens Studio comes with many built-in trackers to make this simple.</center>",
            "content": "",
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
            "title": "Head Bindings",
            "subtitle": "Step 1",
            "description": "Let us start by adding a <b>Head Binding</b> which is a component that automatically tracks the user's head. It is useful for attaching content that moves with the user.",
            "completion": {
                "tasks": [
                    {
                        "text": "In the Scene Hierarchy panel, click the <b>+</b> button and search for <b>Head Binding</b>.",
                        "tip": "<i>Notice that a <b>Face Occlusion</b> object is added along with the <b>Head Binding</b>. This is used to hide digital objects as they go behind the user`s head to create a more realistic effect.</i>",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const scene = project.scene;
                            const filtered = scene.findComponents("Head").filter((component) => { return component.sceneObject.name === "Head Binding"; });
                            return filtered.length > 0;
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
                "type": "movie",
                "path": import.meta.resolve("./steps/step_2.gif")
            },
            "type": "step",
            "title": "Attaching the mesh",
            "subtitle": "Step 2",
            "description": "Next, let's add a mesh to our Scene.",
            "completion": {
                "tasks": [
                    {
                        "text": "Select the <b>Head Binding</b> object in the Hierarchy, then click the <b>+</b> button, go to the 3D Section, and select one.",
                        "tip": "<i>In this example, we are building a Birthday Countdown Lens, so we will add a Cone which we can use as the birthday hat.</i>",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const scene = project.scene;

                            let result = false;

                            const headBindings = scene.findComponents("Head");

                            headBindings.forEach(headBinding => {
                                const so = headBinding.sceneObject;

                                so.children.forEach((child) => {
                                    const meshes = child.getComponents("RenderMeshVisual");
                                    const filtered = meshes.filter((component) => { return component.mesh.name != "Head"; });

                                    if (filtered.length > 0) {
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
            "type": "step",
            "title": "Transforms",
            "subtitle": "Step 3",
            "description": "The cone is now a child object of the <b>Head Binding</b> object and will begin to move with the user. <br><br> Child objects inherit the values of their parent's <b>Transform</b> component. That is, as the parent moves positions, the child will move by the same amount.",
            "tip": "<i>Note: The Head Binding component, is essentially changing the position and scale values of its <b>Transform</b> component to match the user's head, causing any child objects to do the same.</i>",
            "completion": {
                "tasks": [
                ]
            },
            "highlight": []
        },
        {
            "mediaHeader": {
                "type": "movie",
                "path": import.meta.resolve("./steps/step_4.gif")
            },
            "type": "step",
            "title": "Inspecting Transform",
            "subtitle": "Step 4",
            "description": "Our cone moves with the user moves, but it isn't a very convincing hat just yet. Let's reposition it, so it is placed on the user's head.<br><br>An object can be repositioned by modifying the properties of its <b>Transform</b> component in the Inspector Panel.",
            "completion": {
                "tasks": [
                    {
                        "text": "Adjust position of the cone to be (0, 25, -10)",
                        "tip": "<i>Note: Since the Cone is a child of the <b>Head Binding</b> object, the values in its <b>Transform</b> Component are offsets from the position of the Head Binding.</i>",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const scene = project.scene;

                            let result = false;

                            const headBindings = scene.findComponents("Head");

                            headBindings.forEach(headBinding => {
                                const so = headBinding.sceneObject;

                                so.children.forEach((child) => {
                                    const meshes = child.getComponents("RenderMeshVisual");
                                    const filtered = meshes.filter((component) => { return component.mesh.name != "Head"; });

                                    filtered.forEach((component) => {
                                        const so = component.sceneObject;
                                        const transform = so.localTransform;
                                        if (isVec3Equal(transform.position, new vec3(0, 25, -10))) {
                                            result = true;
                                        }
                                    });
                                });
                            });

                            return result;
                        },
                        "strategy": "alwaysTrue"
                    },
                    {
                        "text": "Adjust scale of the cone to be (15, 15, 15)",
                        "tip": "",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const scene = project.scene;

                            let result = false;

                            const headBindings = scene.findComponents("Head");

                            headBindings.forEach(headBinding => {
                                const so = headBinding.sceneObject;

                                so.children.forEach((child) => {
                                    const meshes = child.getComponents("RenderMeshVisual");
                                    const filtered = meshes.filter((component) => { return component.mesh.name != "Head"; });

                                    filtered.forEach((component) => {
                                        const so = component.sceneObject;
                                        const transform = so.localTransform;

                                        if (isVec3Equal(transform.scale, new vec3(15, 15, 15))) {
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
                "path": import.meta.resolve("./steps/step_5.gif")
            },
            "type": "step",
            "title": "Editing Transform",
            "subtitle": "Step 5",
            "description": "However, it can be tedious to position things with just numbers, so in this step, you will learn how to modify these values using the Scene panel.",
            "completion": {
                "tasks": [
                    {
                        "text": "Ensure the Scene Panel is open by going to Window > Default Layout.",
                        "checker": (pluginSystem) => {
                            const dockManager = pluginSystem.findInterface(Editor.Dock.IDockManager);
                            const existingPanels = dockManager.panels;
                            if (existingPanels.find((panel) => panel.id === "Snap.Plugin.Gui.SceneEditor")) {
                                return true;
                            } else {
                                return false;
                            }
                        },
                        "strategy": "alwaysTrue"
                    },
                    {
                        "text": "Adjust position of the cone to be (0, 25, -10)",
                        "tip": "<i>Note: Since the Cone is a child of the <b>Head Binding</b> object, the values in its <b>Transform</b> Component are offsets from the position of the Head Binding.</i>",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const scene = project.scene;

                            let result = false;

                            const headBindings = scene.findComponents("Head");

                            headBindings.forEach(headBinding => {
                                const so = headBinding.sceneObject;

                                so.children.forEach((child) => {
                                    const meshes = child.getComponents("RenderMeshVisual");
                                    const filtered = meshes.filter((component) => { return component.mesh.name != "Head"; });

                                    filtered.forEach((component) => {
                                        const so = component.sceneObject;
                                        const transform = so.localTransform;
                                        if (isVec3Equal(transform.position, new vec3(0, 25, -10))) {
                                            result = true;
                                        }
                                    });
                                });
                            });

                            return result;
                        },
                        "strategy": "alwaysTrue"
                    },
                    {
                        "text": "Adjust scale of the cone to be (15, 15, 15)",
                        "tip": "",
                        "checker": (pluginSystem) => {
                            const model = pluginSystem.findInterface(Editor.Model.IModel);
                            const project = model.project;
                            const scene = project.scene;

                            let result = false;

                            const headBindings = scene.findComponents("Head");

                            headBindings.forEach(headBinding => {
                                const so = headBinding.sceneObject;

                                so.children.forEach((child) => {
                                    const meshes = child.getComponents("RenderMeshVisual");
                                    const filtered = meshes.filter((component) => { return component.mesh.name != "Head"; });

                                    filtered.forEach((component) => {
                                        const so = component.sceneObject;
                                        const transform = so.localTransform;

                                        if (isVec3Equal(transform.scale, new vec3(15, 15, 15))) {
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
                "Snap.Plugin.Gui.SceneEditor"
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
            "description": "<center>You completed the second Tutorial in tutorials series of Building Your First Lens</center>",
            "content": `<div>
                <h3>Summary</h3>
                <p>Lens Studio provides several tracking components which can be used to attach digital content to a real-world object.</p>
                <p>Combining these trackers with assets created with the GenAI Suite can be a great, no-code workflow for creating your Lenses..</p>
                <p>Tip: Check out the other options available in the GenAI Suite! We are always adding more!</p>
            </div>`,
            "completion": {
                "tasks": []
            },
            "highlight": [
            ]
        }
    ]
}
