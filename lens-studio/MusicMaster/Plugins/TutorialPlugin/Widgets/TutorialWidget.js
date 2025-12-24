import * as Ui from 'LensStudio:Ui';

import { EventDispatcher } from './Utils/EventDispatcher.js';

import { SectionStack } from "./SectionStack.js";
import { NavigationWidget } from './NavigationWidget.js';
import { WidgetFactory } from './Utils/WidgetFactory.js';

export class TutorialWidget extends EventDispatcher {
    constructor(parent, pluginSystem, descriptor) {
        super();

        this.id = descriptor.id;
        this.pluginSystem = pluginSystem;

        this.widget = WidgetFactory.beginWidget(parent)
            .sizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding)
            .end();

        this.layout = WidgetFactory.beginVerticalLayout()
            .contentsMargings(0, Ui.Sizes.Padding, 0, Ui.Sizes.Padding)
            .spacing(0)
            .end();

        this.sectionStack = new SectionStack(this.widget, this.pluginSystem);

        descriptor.pages.forEach((page) => {
            this.sectionStack.addPage(page);
        });

        this.navigation = new NavigationWidget(this.widget);

        this.header = new HeaderWidget(this.widget, descriptor.title);
        this.header.close.onClick.connect(() => { this.dispatchEvent({ type: TutorialWidget.Termination })});

        this.layout.addWidget(this.header.widget);
        this.layout.addWidget(WidgetFactory.beginSeparator(this.widget).end());
        this.layout.addWidget(this.sectionStack.widget);
        this.layout.addWidget(WidgetFactory.beginSeparator(this.widget).contentsMargings(0,0,0,0).end());
        this.layout.addWidget(this.navigation.widget);

        this.widget.layout = this.layout;
    }

    onNext() {
        if (this.sectionStack.currentIndex + 1 == this.sectionStack.items.length) {
            this.dispatchEvent({ type: TutorialWidget.Completed });
        } else {
            this.sectionStack.openNext();
        }
    }

    onPrev() {
        this.sectionStack.openPrev();
    }

    init() {
        this.sectionStack.init();
        this.sectionStack.addEventListener(SectionStack.StatusChanged, () => { this.updateNavigation(); });

        this.navigation.init();
        this.navigation.addEventListener(NavigationWidget.NextClicked, () => { this.onNext(); });
        this.navigation.addEventListener(NavigationWidget.PrevClicked, () => { this.onPrev(); });
    }

    deinit() {
        this.sectionStack.deinit();
        this.navigation.deinit();
    }

    updateNavigation() {
        this.navigation.enablePrevButton(this.sectionStack.currentIndex != 0);
        this.navigation.enableNextButton(this.sectionStack.items[this.sectionStack.currentIndex].status);
        this.navigation.setNextButton((this.sectionStack.currentIndex + 1 == this.sectionStack.items.length) ? "Finish" : "Next");
    }
}

class HeaderWidget {
    constructor(parent, title) {
        this.widget = WidgetFactory.beginWidget(parent)
            .sizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Fixed)
            .contentsMargings(0, 0, 0, 0)
            .end();

        this.layout = new Ui.BoxLayout();
        this.layout.setContentsMargins(Ui.Sizes.Padding, 0, 0, Ui.Sizes.Padding);
        this.close = new Ui.ToolButton(this.widget);
        this.close.setIcon(Editor.Icon.fromFile(import.meta.resolve("./Resources/close_icon.svg")));

        this.layout.addWidget(this.close);
        this.layout.addStretch(0);
        this.layout.addWidget(WidgetFactory.beginLabel(this.widget).text(title).wordWrap(false).fontRole(Ui.FontRole.TitleBold).contentsMargings(Ui.Sizes.Padding, 0, Ui.Sizes.Padding, 0).end());

        this.layout.addStretch(0);

        this.widget.layout = this.layout;
    }
}

TutorialWidget.Completed = "Completed";
TutorialWidget.Termination = "Termination";
