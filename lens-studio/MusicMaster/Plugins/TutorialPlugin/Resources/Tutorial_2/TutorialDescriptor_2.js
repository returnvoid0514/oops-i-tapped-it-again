const isVec3Equal = (lhs, rhs) => {
    return (lhs.x == rhs.x) && (lhs.y == rhs.y) && (lhs.z == rhs.z);
}


export const TutorialDescriptor_2 = {
    "id": "customize_3d_content",
    "title": "Customize 3D Content",
    "pages": [
        {
            "mediaHeader": {
                "type": "image",
                "path": import.meta.resolve("./icons/mesh.svg"),
                "max_width": 80
            },
            "type": "milestone",
            "title": "Customize 3D Content",
            "subtitle": "Section 3",
            "description": "<center>While Lens Studio contains a lot of built in features, it shines most as a way to bring your own content to life in AR!</center>",
            "completion": {
                "tasks": []
            },
            "highlight": [
            ]
        },
        
        {
            "mediaHeader": {
                "type": "movie",
                "path": import.meta.resolve("./steps/step_1.gif")
            },
            "type": "step",
            "title": "Import a 3D Model from Asset Library",
            "subtitle": "Step 1",
            "description": "Learn how to replace the cone with a 3D model of a party hat.",
            "completion": {
                "tasks": [
                {
                    "text": "Click on the Asset Library button on the top left to open Asset Library. Locate the 3D model of the hat in the Asset Library. Search for 'Birthday Hat' and import it.",
                    "tip": "<p>The Asset Library is a collection of assets created by Snap and the community that will help you build your Lenses.</p><p>You can find <b>Birthday hat</b> Package under Packages Asset Browser. The package includes <b>BirthdayHat</b> prefab and automatically instantiated in the Scene Hierarchy based on the '__PLACE_IN_SCENE' tag.</p>",
                    "checker": (pluginSystem) => {
                        const model = pluginSystem.findInterface(Editor.Model.IModel);
                        const project = model.project;
                        const assetManager = project.assetManager;
                        let result = false;
                        for (let i = 0; i < assetManager.assets.length; i++) {
                            if (assetManager.assets[i].type === "NativePackageDescriptor") {                               
                                if(assetManager.assets[i].packageName === "Birthday Hat") {
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
                "Snap.Plugin.Gui.AssetLibraryPanel",
            ]
        },
        {
            "mediaHeader": {
                "type": "movie",
                "path": import.meta.resolve("./steps/step_2.gif")
            },
            "type": "step",
            "title": "Attach Birthday Hat",
            "subtitle": "Step 2",
            "description": "Now let's attach the Birthday Hat to user's head.",
            "completion": {
                "tasks": [
                {
                    "text": "Drag and move the <b>BirthdayHat</b> under <b>Head Binding</b> object to attach the hat to the user's head.",
                    "checker": (pluginSystem) => {
                        const model = pluginSystem.findInterface(Editor.Model.IModel);
                        const project = model.project;
                        const scene = project.scene;

                        let result = false;
                        const headBindings = scene.findComponents("Head");
                        
                        headBindings.forEach(headBinding => {
                            const so = headBinding.sceneObject;

                            so.children.forEach((child) => {
                                if (child.name == "BirthdayHat") {
                                    result = true;
                                }
                            });
                        });
                        return result;
                    },
                    "strategy": "alwaysTrue"
                },
                {
                    "text": "Adjust position of the <b>BirthdayHat</b> to be (0, 15, 0)",
                    "checker": (pluginSystem) => {
                        const model = pluginSystem.findInterface(Editor.Model.IModel);
                        const project = model.project;
                        const scene = project.scene;

                        let result = false;

                        const headBindings = scene.findComponents("Head");

                        headBindings.forEach(headBinding => {
                            const so = headBinding.sceneObject;
                            so.children.forEach((child) => {
                                if (child.name == "BirthdayHat") {
                                    const transform = child.localTransform;
                                    if (isVec3Equal(transform.position, new vec3(0, 15, 0))) {        
                                        result = true;
                                    }
                                }
                            });
                        });
                        
                        return result;
                    },
                    "strategy": "onceTrue"
                },
            ]
            },
            "highlight": []
        },
        {
            "mediaHeader": {
                "type": "movie",
                "path": import.meta.resolve("./steps/step_3.gif")
            },
            "type": "step",
            "title": "Remove Existing Objects",
            "subtitle": "Step 3",
            "description": "Disable or remove the cone.",
            "completion": {
                "tasks": [
                {
                    "text": "Try to disable <b>Cone</b> object and see how Preview has been changing",
                    "checker": (pluginSystem) => {
                        const model = pluginSystem.findInterface(Editor.Model.IModel);
                        const project = model.project;
                        const scene = project.scene;
                        const headBindings = scene.findComponents("Head");
                        let isFound = false;
                        headBindings.forEach(headBinding => {
                            let so = headBinding.sceneObject;
                            let filtered = so.children.filter(so => so.name == "Cone" && so.enabled);
                            if(filtered.length > 0) {
                                isFound = true;
                            }
                        });
                        return !isFound;
                    },
                    "strategy": "onceTrue"
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
                "path": import.meta.resolve("./steps/step_4.gif")
            },
            "type": "step",
            "title": "Customize Materials",
            "subtitle": "Step 4",
            "description": "Unpack the <b>Birthday Hat</b> package. Find hat_main_primary material in <b>Birthday Hat.lspkg/Materials</b> folder. Select and modify the Base Color property for the hat's materials to customize its appearance.",
            "completion": {
                "tasks": [
                {

                    "text": "Select the <b>Birthday Hat</b> package in the Asset Browser, right-click on it, and select Unpack for Editing.",
                    "checker": (pluginSystem) => {
                        const model = pluginSystem.findInterface(Editor.Model.IModel);
                        const project = model.project;
                        const scene = project.scene;
                        const assetManager = project.assetManager;

                        for (let i = 0; i < assetManager.assets.length; i++) {
                            if (assetManager.assets[i].type === "NativePackageDescriptor") {
                                
                                if(!assetManager.assets[i].fileMeta.nativePackageRoot){
                                    return true;
                                }
                                
                            }
                        }
                        return false;
                    },
                    "strategy": "alwaysTrue"
                },
                {
                    "text": "Select <b>hat_main_primary</b> Material and modify the Base Color property for the hat's materials to customize its appearance in the Inspector panel.",
                    "checker": (pluginSystem) => {
                        const model = pluginSystem.findInterface(Editor.Model.IModel);
                        const project = model.project;
                        const scene = project.scene;
                        const assetManager = project.assetManager;
                        const mainColor = new vec4(0.312505, 0.186847, 0.433967, 1);
                        for (let i = 0; i < assetManager.assets.length; i++) {
                            if (assetManager.assets[i].type === "Material"&& assetManager.assets[i].name ==="hat_main_primary") 
                                if(assetManager.assets[i].passInfos){
                                    let newColor = assetManager.assets[i].passInfos[0].baseColor;
                                    if(mainColor.distance(newColor)>0.01)
                                    {
                                        return true;
                                    }
                                }
                            }
                        
                        return false;
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
            "type": "milestone",
            "mediaHeader": {
                "type": "image",
                "path": import.meta.resolve("../Shared/congrats.png")
            },
            "title": "Congratulations",
            "subtitle": "",
            "description": "<center>You completed the third Tutorial in tutorials series of Building Your First Lens</center>",
            "content": `<div>
                <h3>Summary</h3>
                <p>You can find tons of free 3D models and materials directly in Lens Studio, in the Asset Library.</p>
                <p>You can also import your own content created from external tools and easily modify them within Lens Studio to create the perfect look.</p>
            </div>`,
            "completion": {
                "tasks": []
            },
            "highlight": [
            ]
        }
    ]
}
