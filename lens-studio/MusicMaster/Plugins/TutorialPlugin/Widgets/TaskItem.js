import * as Ui from 'LensStudio:Ui';
import { createPendingTaskCard, createDisabledTaskCard, createCompletedTaskCard, createHintCard } from './CardProxy.js';
import { clipboard } from "LensStudio:Clipboard";  
import { WidgetFactory } from './Utils/WidgetFactory.js';

export class TaskItem {
    constructor(parent, descriptor) {
        this.widget = WidgetFactory.beginWidget(parent)
            .end();

        this.layout = WidgetFactory.beginVerticalLayout()
            .contentsMargings(0, 0, 0, 0)
            .end();

        this.strategy = descriptor.strategy;

        this.taskLayout =  WidgetFactory.beginVerticalLayout()
            .end();    

        this.taskWidget = WidgetFactory.beginWidget(this.widget)
            .end();

        this.pendingTask = createPendingTaskCard(this.taskWidget, descriptor.text);
        this.pendingTask.visible = false;

        this.disabledTask = createDisabledTaskCard(this.taskWidget, descriptor.text);
        this.disabledTask.visible = false;

        this.completedTask = createCompletedTaskCard(this.taskWidget, descriptor.text);
        this.completedTask.visible = false;

        this.taskLayout.setContentsMargins(0, 0, 0, 0);
        this.taskLayout.addWidget(this.disabledTask);
        this.taskLayout.addWidget(this.pendingTask);
        this.taskLayout.addWidget(this.completedTask);

        this.reset();

        this.taskWidget.layout = this.taskLayout;

        this.layout.addWidget(this.taskWidget);
        
        if(descriptor.clipboard){
            this.copyButton = WidgetFactory.beginPushButton(this.widget)
                .text("Copy Code")
                .end();

            this.taskLayout.addWidget(this.copyButton);
            this.copyButton.onClick.connect(() => {
                clipboard.text = descriptor.clipboard;
            });
        }

        if (descriptor.tip) {
            this.layout.addWidget(createHintCard(this.widget, descriptor.tip));
        }

        this.widget.layout = this.layout;
    }

    reset() {
        this.status = false;
        this.setStatus(false);
    }

    setStatus(finished) {
        // to-do: code is messed, make clear
        switch(this.strategy) {
            case "onceTrue":
                if (this.status != 1 || finished == -1) {
                    this.status = finished;
                }
                break;
            default:
            case "alwaysTrue":
                this.status = finished;
                break;
        }

        if (this.status == -1) {
            this.pendingTask.visible = false;
            this.completedTask.visible = false;
            this.disabledTask.visible = true;
        } else if (this.status == 0) {
            this.completedTask.visible = false;
            this.disabledTask.visible = false;
            this.pendingTask.visible = true;
        } else if (this.status == 1) {
            this.pendingTask.visible = false;
            this.disabledTask.visible = false;
            this.completedTask.visible = true;
        }
    }
}
