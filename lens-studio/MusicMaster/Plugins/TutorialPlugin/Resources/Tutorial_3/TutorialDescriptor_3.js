export const TutorialDescriptor_3 = {
    "id": "test_lens_on_device",
    "title": "Test your Lens on Device",
    "pages": [
        {
            "mediaHeader": {
                "type": "image",
                "path": import.meta.resolve("./icons/device_preview.svg"),
                "max_width": 80
            },
            "type": "milestone",
            "title": "Test your Lens on Device",
            "subtitle": "Section 4",
            "description": "If you are following the series, we now have a hat worth wearing, so let's try it on for ourselves! Here we will connect our phone to Lens Studio so we can quickly test the Lens on our device and embrace the speed of iteration that Lens Studio offers!",
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
            "title": "Generate Snapcode",
            "subtitle": "Step 1",
            "description": "In Lens Studio, press the Preview Lens button in the upper right corner to bring up a Snapcode. This is a unique, scannable image similar to a QR Code and is used to create a unique link to your instance of Lens Studio.",
            "tip": "<i>If you have already paired your device with Lens Studio, you can skip this and next steps.</i>",
            "completion": {
                "tasks": []
            },
            "highlight": []
        },
        {
            "mediaHeader": {
                "type": "movie",
                "path": import.meta.resolve("./steps/step_2.gif")
            },
            "type": "step",
            "title": "Scan with Snapchat",
            "subtitle": "Step 2",
            "description": "Open Snapchat on your device and point your camera at the Snapcode. Snapchat will automatically recognize it. Click Open to open the Snapcode link, then Open again to pair with Lens Studio.",
            "completion": {
                "tasks": []
            },
            "highlight": []
        },
        {
            "mediaHeader": {
                "type": "movie",
                "path": import.meta.resolve("./steps/step_3.gif")
            },
            "type": "step",
            "title": "Send to All Devices",
            "subtitle": "Step 3",
            "description": "Once you have paired your device, you can continue making changes in your Lens project and quickly test them on device using the Send To All Devices button.",
            "completion": {
                "tasks": []
            },
            "highlight": []
        },
        {
             "mediaHeader": {
                "type": "image",
                "path": import.meta.resolve("./steps/step_4.png")
            },
            "type": "step",
            "title": "Check Performance Metrics",
            "subtitle": "Conclusion",
            "description": "When your Lens is delivered to Snapchat, you will see a bug icon which you can tap to display helpful debug information like FPS, RAM usage, and SIZE.",
            "completion": {
                "tasks": []
            },
            "highlight": []
        },
        ,
        {
            "type": "milestone",
            "mediaHeader": {
                "type": "image",
                "path": import.meta.resolve("../Shared/congrats.png")
            },
            "title": "Congratulations",
            "subtitle": "",
            "description": "<center>You completed the fourth Tutorial in tutorials series of Building Your First Lens</center>",
            "content": `<div>
                <h3>Summary</h3>
                <p>Testing your Lenses directly on your device is a quick and easy process.</p>
                <p>This allows you to spend your time focusing on the creative elements of your AR experience while ensuring it works as expected.</p>
            </div>`,
            "completion": {
                "tasks": []
            },
            "highlight": [
            ]
        }
    ]
}
