import * as Ui from 'LensStudio:Ui';
import { EventDispatcher } from './Utils/EventDispatcher.js';
import { WidgetFactory } from './Utils/WidgetFactory.js';

export class NavigationWidget extends EventDispatcher {
    constructor(parent) {
        super(parent);

        this.widget = WidgetFactory.beginWidget(parent).end();
        this.layout = WidgetFactory.beginHorizontalLayout().end();

        this.nextButton = new Ui.PushButton(this.widget);
        this.nextButton.primary = true;
        this.prevButton = new Ui.PushButton(this.widget);

        this.layout.addWidgetWithStretch(this.prevButton, 1, Ui.Alignment.Default);
        this.layout.addWidgetWithStretch(this.nextButton, 1, Ui.Alignment.Default);

        this.widget.layout = this.layout;
    }

    setPrevButton(text) {
        this.prevButton.text = text;
    }

    setNextButton(text) {
        this.nextButton.text = text;
    }

    enableNextButton(enabled) {
        this.nextButton.enabled = enabled;
    }

    enablePrevButton(enabled) {
        this.prevButton.enabled = enabled;
    }

    init() {
        this.nextButton.text = "Next";
        if (this.onNextClickConnection) {
            this.onNextClickConnection.disconnect();
        }

        this.onNextClickConnection = this.nextButton.onClick.connect(() => {
            this.dispatchEvent({ type: NavigationWidget.NextClicked });
        });

        this.prevButton.text = "Previous";
        if (this.onPrevClickConnection) {
            this.onPrevClickConnection.disconnect();
        }
        this.onPrevClickConnection = this.prevButton.onClick.connect(() => {
            this.dispatchEvent({ type: NavigationWidget.PrevClicked });
        });
    }

    deinit() {
        if (this.onNextClickConnection) {
            this.onNextClickConnection.disconnect();
            this.onNextClickConnection = null;
        }
        if (this.onPrevClickConnection) {
            this.onPrevClickConnection.disconnect();
            this.onPrevClickConnection = null;
        }
        this.removeAllEvents();
    }
}

NavigationWidget.PrevClicked = "PrevClicked";
NavigationWidget.NextClicked = "NextClicked";
