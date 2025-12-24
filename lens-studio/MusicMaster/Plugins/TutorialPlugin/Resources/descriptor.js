import { SectionDescriptor_0 } from "./Tutorial_0/SectionDescriptor_0.js";
import { SectionDescriptor_1 } from "./Tutorial_1/SectionDescriptor_1.js";
import { SectionDescriptor_2 } from "./Tutorial_2/SectionDescriptor_2.js";
import { SectionDescriptor_3 } from "./Tutorial_3/SectionDescriptor_3.js";
import { SectionDescriptor_4 } from "./Tutorial_4/SectionDescriptor_4.js";
import { SectionDescriptor_5 } from "./Tutorial_5/SectionDescriptor_5.js";
import { SectionDescriptor_6 } from "./Tutorial_6/SectionDescriptor_6.js";

export const TutorialsContainerDescriptor = {
    "config": new Editor.Path(import.meta.resolve("config.json")),
    "title": "Building Your First Lens",
    "id": "building_your_first_lens", // used for config file
    "mediaHeader": {
        "type": "image",
        "path": import.meta.resolve("./Shared/tutorial_image.png"),
    },
    "description": "This tutorial series walks through all of the steps for creating your first AR project (Lens) in Lens Studio. At the end of this series you will have recreated the Birthday Countdown sample project, learning all of the steps and pieces to create your own AR experiences.",
    "sections": [
        SectionDescriptor_0,
        SectionDescriptor_1,
        SectionDescriptor_2,
        SectionDescriptor_3,
        SectionDescriptor_4,
        SectionDescriptor_5,
        SectionDescriptor_6,
    ]
}
