import { PanelPlugin as Panel } from 'LensStudio:PanelPlugin';
import * as Ui from 'LensStudio:Ui';

import { TutorialsContainerDescriptor } from './Resources/descriptor.js';
import { TutorialContainer } from './Widgets/TutorialContainer.js';
import { Config } from './config.js';

export class TutorialPanel extends Panel {
    static descriptor() {
        return {
            id: 'Com.Snap.TutorialPanel',
            name: 'Tutorial',
            dependencies: [Ui.IGui],
            isUnique: true,
            defaultDockState: Ui.DockState.Attached,
            defaultSize: new Ui.Size(400, 700),
            minimumSize: new Ui.Size(400, 700)
        };
    }

    constructor(pluginSystem) {
        super(pluginSystem);
        this.config = new Config(TutorialsContainerDescriptor.config);
    };

    createWidget(parent) {
        const tutorial = new TutorialContainer(parent, this.pluginSystem, TutorialsContainerDescriptor, this.config);
        return tutorial.widget;
    }

}
