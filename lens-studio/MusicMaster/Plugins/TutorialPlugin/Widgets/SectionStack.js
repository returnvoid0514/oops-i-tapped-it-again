import * as Ui from 'LensStudio:Ui';
import { EventDispatcher } from './Utils/EventDispatcher.js';

import { PageItem } from "./PageItem.js";
import { WidgetFactory } from './Utils/WidgetFactory.js';

export class SectionStack extends EventDispatcher {
    constructor(parent, pluginSystem) {
        super();
        this.parent = parent;
        this.widget = WidgetFactory.beginWidget(parent)
            .backgroundRole(Ui.ColorRole.Window)
            .contentsMargings(0, 0, 0, 0)
            .end();

        // to-do: use widget utils builder
        this.stack = new Ui.StackedWidget(this.widget);
        this.stack.setContentsMargins(0, 0, 0, 0);

        this.layout = WidgetFactory.beginVerticalLayout()
            .contentsMargings(0, 0, 0, 0)
            .addWidget(this.stack)
            .end();

        this.widget.layout = this.layout;

        this.pluginSystem = pluginSystem;
        this.items = [];
    }

    init() {
        this.currentIndex = 0;
        this.items[this.currentIndex].addEventListener(PageItem.StatusChanged, () => { this.onStatusChanged(); });
        this.items[this.currentIndex].init();

        this.stack.currentIndex = this.currentIndex;
    }

    deinit() {
        this.items[this.currentIndex].deinit();
        this.currentIndex = 0;
        this.stack.currentIndex = 0;
        this.removeAllEvents();
    }

    addPage(page) {
        const item = new PageItem(this.parent, page, this.pluginSystem);
        this.stack.addWidget(item.widget);
        this.items.push(item);
    }

    openNext() {
        if (this.currentIndex + 1 < this.items.length) {
            this.items[this.currentIndex].deinit();

            this.currentIndex += 1;

            this.items[this.currentIndex].addEventListener(PageItem.StatusChanged, () => { this.onStatusChanged(); });
            this.items[this.currentIndex].init();

            this.stack.currentIndex = this.currentIndex;
            this.dispatchEvent({ type: SectionStack.IndexChanged });
        }
    }

    openPrev() {
        if (this.currentIndex > 0) {
            this.items[this.currentIndex].deinit();

            this.currentIndex -= 1;

            this.items[this.currentIndex].addEventListener(PageItem.StatusChanged, () => { this.onStatusChanged(); });
            this.items[this.currentIndex].init();

            this.stack.currentIndex = this.currentIndex;
            this.dispatchEvent({ type: SectionStack.IndexChanged });
        }
    }

    onStatusChanged() {
        this.dispatchEvent({ type: SectionStack.StatusChanged });
    }
}

SectionStack.StatusChanged = "StatusChanged";
SectionStack.IndexChanged = "IndexChanged";
