import * as Ui from 'LensStudio:Ui';

import { EventDispatcher } from './Utils/EventDispatcher.js';
import { WidgetFactory } from './Utils/WidgetFactory.js';
import { MediaHeader } from './MediaHeader.js';
import { SectionBanner } from "./SectionBanner.js";

export class ContainerHomePage extends EventDispatcher {
    constructor(parent, pluginSystem, descriptor) {
        super();

        this.widget = WidgetFactory.beginWidget(parent)
            .backgroundRole(Ui.ColorRole.Window)
            .end();

        this.descriptor = descriptor;
        this.pluginSystem = pluginSystem;


        this.layout = WidgetFactory.beginVerticalLayout()
            .contentsMargings(0, Ui.Sizes.Padding, 0, 0)
            .spacing(0)
            .end();

        // to-do: move to another file / class
        this.sectionsWidget = WidgetFactory.beginWidget(this.widget).end();

        this.scrollArea = new Ui.VerticalScrollArea(this.widget);
        this.scrollArea.setWidget(this.sectionsWidget);

        this.headerWidget = WidgetFactory.beginWidget(this.sectionsWidget).end();

        this.headerLayout = WidgetFactory.beginVerticalLayout()
            .contentsMargings(Ui.Sizes.Padding, 0, Ui.Sizes.Padding, Ui.Sizes.Padding)
            .spacing(Ui.Sizes.DoublePadding)
            .end();

        if (descriptor.mediaHeader) {
            this.mediaHeader = new MediaHeader(this.sectionsWidget, descriptor.mediaHeader);
            this.headerLayout.addWidget(this.mediaHeader.view);
            this.headerLayout.setWidgetAlignment(this.mediaHeader.view, Ui.Alignment.AlignCenter);
            this.headerLayout.addWidget(WidgetFactory.beginSpacer(this.sectionsWidget).height(Ui.Sizes.Padding).end());
        }

        if (descriptor.title) {
            this.headerLayout.addWidget(WidgetFactory.beginLabel(this.sectionsWidget).text(descriptor.title).fontRole(Ui.FontRole.TitleBold).wordWrap(true).end());
        }

        if (descriptor.subtitle) {
            this.headerLayout.addWidget(WidgetFactory.beginLabel(this.sectionsWidget).text(descriptor.subtitle).fontRole(Ui.FontRole.SmallTitle).wordWrap(true).end());
        }

        if (descriptor.description) {
            this.headerLayout.addWidget(WidgetFactory.beginLabel(this.sectionsWidget).text(descriptor.description).fontRole(Ui.FontRole.SmallTitle).wordWrap(true).end());//.margins(0, Ui.Sizes.DoublePadding, 0, Ui.Sizes.DoublePadding).end());
        }

        this.headerWidget.layout = this.headerLayout;

        this.sectionsLayout =  WidgetFactory.beginVerticalLayout()
            .contentsMargings(Ui.Sizes.Padding, 0, Ui.Sizes.Padding, Ui.Sizes.Padding)
            .spacing(Ui.Sizes.Padding)
            .end();
        
        this.sectionsLayout.addWidget(this.headerWidget);
        this.sections = [];
        descriptor.sections.forEach((section) => {
            this.createAndRegisterSection(section);
        });

        this.sectionsLayout.addStretch(0);
        this.sectionsWidget.layout = this.sectionsLayout;

        this.layout.addWidget(this.scrollArea);

        this.widget.layout = this.layout;
    }

    createAndRegisterSection(descritpor) {
        const sectionBanner = new SectionBanner(this.sectionsWidget, descritpor);
        this.sections[descritpor.order] = sectionBanner;

        this.sectionsLayout.addWidget(sectionBanner.widget);

        sectionBanner.addEventListener(SectionBanner.Clicked, (id) => { this.dispatchEvent({ type: ContainerHomePage.TutorialRequested, index: descritpor.order, id: id })});
    }

    updateCompletion(completedList) {
        this.sections.forEach((section) => {
            section.markCompleted(completedList.includes(section.id));
        });
    }
}

ContainerHomePage.TutorialRequested = "TutorialRequested";
