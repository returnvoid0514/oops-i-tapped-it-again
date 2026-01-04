import * as Ui from 'LensStudio:Ui';

import { EventDispatcher } from './Utils/EventDispatcher.js';

import { MediaHeader } from './MediaHeader.js';
import { TaskItem } from "./TaskItem.js";
import { WidgetFactory } from './Utils/WidgetFactory.js';
import { Disabled, DividerLight } from './Utils/Color.js';
import { createHintCard } from './CardProxy.js';

const createFilter = (id) => ((descriptor) => descriptor.id === id);

export class PageItem extends EventDispatcher {
    constructor(parent, descriptor, pluginSystem) {
        super();

        this.parent = parent;
        this.pluginSystem = pluginSystem;
        this.descriptor = descriptor;
        this.status = false;

        this.widget = WidgetFactory.beginWidget(this.parent)
            .end();

        this.layout = WidgetFactory.beginVerticalLayout()
            .contentsMargings(Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding)
            .spacing(Ui.Sizes.Padding)
            .end();

        
        this.container = WidgetFactory.beginWidget(this.widget)
            .end();

        this.scrollArea = new Ui.VerticalScrollArea(this.widget);
        this.scrollArea.setWidget(this.container);

        this.containerLayout = WidgetFactory.beginVerticalLayout()
            .contentsMargings(Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding)
            .spacing(Ui.Sizes.Padding)
            .end();

        this.taskBlocks = [];

        // to-do: rework for MilestonePage > PageItem > EventDispatcher | StepPage > PageItem > EventDispatcher
        if (descriptor.type == "milestone") {
            this.containerLayout.addStretch(0);
        }
        
        if(descriptor.type == "milestone") {
            if (descriptor.mediaHeader) {
                this.mediaHeader = new MediaHeader(this.container, descriptor.mediaHeader);
                this.containerLayout.addWidget(this.mediaHeader.view);
                this.containerLayout.setWidgetAlignment(this.mediaHeader.view, Ui.Alignment.AlignCenter);
                this.containerLayout.addWidget(WidgetFactory.beginSpacer(this.container).height(Ui.Sizes.Padding).end());
            }
        }

        if (descriptor.subtitle) {
            const subtitle = WidgetFactory.beginLabel(this.container).text("<span style='color: #C3D2DF'>" + descriptor.subtitle + "</span>").fontRole(Ui.FontRole.DefaultBold).foregroundRole(Ui.ColorRole.HighlightedText).end();
            this.containerLayout.addWidget(subtitle);
            if (descriptor.type == "milestone") {         
                this.containerLayout.setWidgetAlignment(subtitle, Ui.Alignment.AlignCenter);
            }
            this.containerLayout.addWidget(WidgetFactory.beginSpacer(this.container).height(Ui.Sizes.HalfPadding).end());
        }
        if (descriptor.title) {
            const title = WidgetFactory.beginLabel(this.container)
                .text(descriptor.title)
                .foregroundRole(Ui.ColorRole.HighlightedText)
                .fontRole(Ui.FontRole.TitleBold)
                .sizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Maximum)
                .end();
            this.containerLayout.addWidget(title);
            if (descriptor.type == "milestone") {
                this.containerLayout.setWidgetAlignment(title, Ui.Alignment.AlignCenter);
            }

            this.containerLayout.addWidget(WidgetFactory.beginSpacer(this.container).height(Ui.Sizes.Padding).end());

            if (descriptor.type == "milestone") {
                this.containerLayout.addWidget(WidgetFactory.beginSeparator(this.container, Ui.Orientation.Horizontal, Ui.Shadow.Raised).contentsMargings(Ui.Sizes.Padding * 4, 0, Ui.Sizes.Padding * 4, 0).end());
                this.containerLayout.addWidget(WidgetFactory.beginSpacer(this.container).height(Ui.Sizes.Padding).end());
            }
        }

        
        if (descriptor.description) {
            const description = WidgetFactory.beginLabel(this.container)
                .sizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding)
                .text(descriptor.description)
                .wordWrap(true)
                .end();

            this.containerLayout.addWidget(description);
            this.containerLayout.addWidget(WidgetFactory.beginSpacer(this.container).height(Ui.Sizes.PaddingLarge).end());
        }
        if (descriptor.tip) {
            this.containerLayout.addWidget(createHintCard(this.container, descriptor.tip));
            this.containerLayout.addWidget(WidgetFactory.beginSpacer(this.container).height(Ui.Sizes.PaddingLarge).end());
        }

        if (descriptor.type == "step") {
            if (descriptor.mediaHeader) {
                this.mediaHeader = new MediaHeader(this.container, descriptor.mediaHeader);
                this.containerLayout.addWidget(this.mediaHeader.view);
                this.containerLayout.setWidgetAlignment(this.mediaHeader.view, Ui.Alignment.AlignCenter);
                this.containerLayout.addWidget(WidgetFactory.beginSpacer(this.container).height(Ui.Sizes.Padding).end());
            }
        }

        if (descriptor.completion.tasks.length > 0) {
            this.containerLayout.addWidget(WidgetFactory.beginSpacer(this.container).height(Ui.Sizes.PaddingLarge).end());
            
            this.containerLayout.addWidget(WidgetFactory.beginSpacer(this.container).height(Ui.Sizes.Padding).end());
            this.containerLayout.addWidget(WidgetFactory.beginLabel(this.container)
                .text("<span style='color:rgba(195, 210, 223, 0.6)'>Tasks</span>")
                .wordWrap(true)
                .fontRole(Ui.FontRole.SmallTitle).end());
            this.containerLayout.addWidget(WidgetFactory.beginSpacer(this.container).height(Ui.Sizes.HalfPadding).end());

            this.progressWidget = WidgetFactory.beginLabel(this.container).fontRole(Ui.FontRole.DefaultBold).end();
            this.containerLayout.addWidget(this.progressWidget);
            this.containerLayout.addWidget(WidgetFactory.beginSpacer(this.container).height(Ui.Sizes.PaddingLarge).end());
        }

        // to-do: move tasks to separate widgets, page item already does a lot of things
        descriptor.completion.tasks.forEach((task) => {
            const taskItem = new TaskItem(this.container, task);
            const criteriaChecker = task.checker;

            const taskBlock = {
                "item": taskItem,
                "checker": criteriaChecker
            }

            this.taskBlocks.push(taskBlock);
            this.containerLayout.addWidget(taskItem.widget);
            this.containerLayout.addWidget(WidgetFactory.beginSpacer(this.container).height(Ui.Sizes.DoublePadding).end());
        });

        this.containerLayout.addStretch(0);

        if (descriptor.type == "milestone" && descriptor.content) {
            const content = new Ui.CalloutFrame(this.container);

            content.setBackgroundColor(Disabled);
            content.setForegroundColor(DividerLight);

            const contentLayout = WidgetFactory.beginVerticalLayout()
                .contentsMargings(Ui.Sizes.DoublePadding, Ui.Sizes.DoublePadding, Ui.Sizes.DoublePadding, Ui.Sizes.DoublePadding)
                .end();
            const contentText = WidgetFactory.beginLabel(content)
                .text(descriptor.content)
                .wordWrap(true)
                .end();
            contentLayout.addWidget(contentText);
            content.layout = contentLayout;
            this.containerLayout.addWidget(content);
        }

        if (descriptor.completion.tasks.length > 0) {
            this.progressHintWidget = WidgetFactory.beginLabel(this.container)
                .fontRole(Ui.FontRole.DefaultBold)
                .end();
            this.containerLayout.addWidget(this.progressHintWidget)
            this.containerLayout.setWidgetAlignment(this.progressHintWidget, Ui.Alignment.AlignCenter);
        }

        this.container.layout = this.containerLayout;
     
        this.layout.addWidget(this.scrollArea);
        
        this.widget.layout = this.layout;
    }

    updateProgress(done, total) {
        if (this.progressWidget) {
            this.progressWidget.text = `${done} of ${total} Tasks Completed`;
        }
        if (this.progressHintWidget) {
            if (done == total) {
                this.progressHintWidget.text = "<span style='color: #64C636'>Congratulations! You Completed All Tasks</span>"
            } else {
                this.progressHintWidget.text = "<span style='color: #C3D2DF'>Complete All Tasks to Continue</span>"
            }
        }
    }

    init() {
        this.updateStatus(false);
        this.initChecker();
        this.initHighlight();
    }

    initHighlight() {
        
        if (this.descriptor.highlight) {
            if (this.highlightInterval) {
                clearInterval(this.highlightInterval);
                this.highlightInterval = null;
            }
            let count = 0;
            this.highlightInterval = setInterval(() => {
                if (count > 2){
                    clearInterval(this.highlightInterval);
                    this.highlightInterval = null;
                }
                const dockManager = this.pluginSystem.findInterface(Editor.Dock.IDockManager);
                this.descriptor.highlight.forEach((id) => {
                    const panel = this.findPanel(createFilter(id));
                    if (panel) {
                        dockManager.highlight(panel);
                    }
                });
                count++;
            }, 900);
        }
    }

    deinitHighlight() {
        if (this.highlightInterval) {
            clearInterval(this.highlightInterval);
            this.highlightInterval = null;
        }
    }

    initChecker() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }

        this.interval = setInterval(() => { this.runChecker(); }, 200);
        this.runChecker();
    }

    deinitChecker() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    runChecker() {
        let status = true;
        let done = 0;
        for (let i = 0; i < this.taskBlocks.length; i++) {
            const task = this.taskBlocks[i];

            if (status) {
                const check = task.checker(this.pluginSystem);

                if (check) {
                    task.item.setStatus(1);
                    //done += 1;
                } else {
                    task.item.setStatus(0);
                    //status = false;
                }
            } else {
                task.item.setStatus(-1);
            }

            if (task.item.status == 1) {
                done += 1;
            } else {
                status = false;
            }
        }

        this.updateStatus(status, done, this.taskBlocks.length);
    }

    findPanel(filter) {
        const dockManager = this.pluginSystem.findInterface(Editor.Dock.IDockManager);
        const existingPanels = dockManager.panels;
        return existingPanels.find(filter)
    }

    deinit() {
        this.removeAllEvents();
        this.status = false;

        this.deinitChecker();
        this.deinitHighlight();

        this.taskBlocks.forEach((task) => {
            task.item.reset();
        });
    }

    updateStatus(status, done, total) {
        this.updateProgress(done, total);
        this.status = status;
        this.dispatchEvent({ type: PageItem.StatusChanged, status: status });
    }
}

PageItem.StatusChanged = "StatusChanged";
