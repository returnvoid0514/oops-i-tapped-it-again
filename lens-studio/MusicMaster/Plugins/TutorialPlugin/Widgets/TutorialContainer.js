import * as Ui from 'LensStudio:Ui';

import { TutorialWidget } from './TutorialWidget.js';
import { ContainerHomePage } from './HomePage.js';
import { logEventOpen,logEventTutorialStatus } from '../analytics.js';
import { WidgetFactory } from './Utils/WidgetFactory.js';

export class TutorialContainer {
    constructor(parent, pluginSystem, descriptor, config) {
        this.pluginSystem = pluginSystem;
        this.descriptor = descriptor;
        this.config = config;

        this.widget = new Ui.StackedWidget(parent);
        this.widget.setContentsMargins(0, 0, 0, 0);

        this.homePage = new ContainerHomePage(this.widget, pluginSystem, descriptor);

        this.homePage.addEventListener(ContainerHomePage.TutorialRequested, (event) => {
            this.requestTutorial(event.index);
        });

        this.widget.addWidget(this.homePage.widget);

        this.tutorials = [];
        descriptor.sections.forEach((section) => {
            // to-do: try to not create all tutorial widgets on start
            this.tutorials[section.order] = new TutorialWidget(this.widget, pluginSystem, section.tutorial);

            this.tutorials[section.order].addEventListener(TutorialWidget.Completed, () => {
                this.markComplete(section.order);
                this.requestHomePage();
            });

            this.tutorials[section.order].addEventListener(TutorialWidget.Termination, () => {
                this.requestHomePage();
            });

            this.widget.addWidget(this.tutorials[section.order].widget);
        });

        this.homePage.updateCompletion(this.config.getCompleted());
        this.requestHomePage();
        logEventOpen();
    }

    markComplete(index) {
        this.config.markCompleted(this.tutorials[index].id);
        this.homePage.updateCompletion(this.config.getCompleted());
        logEventTutorialStatus(this.tutorials[index].id);
    }

    requestHomePage() {
        if (this.widget.currentIndex != 0) this.tutorials[this.widget.currentIndex].deinit();
        this.widget.currentIndex = 0;
        
    }

    requestTutorial(order) {
        this.widget.currentIndex = order;
        this.tutorials[this.widget.currentIndex].init();
    }
}
