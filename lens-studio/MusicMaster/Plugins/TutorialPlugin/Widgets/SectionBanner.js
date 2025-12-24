import * as Ui from 'LensStudio:Ui';

import { EventDispatcher } from './Utils/EventDispatcher.js';
import { SoftBlue, Window, HalfAlpha, QuarterAlpha, Success, TreeHighlight, Button, TreeHighlightHover } from './Utils/Color.js';
import { WidgetFactory } from './Utils/WidgetFactory.js';

export class SectionBanner extends EventDispatcher{
    constructor(parent, descriptor) {
        super();
        this.descriptor = descriptor;
        this.id = descriptor.tutorial.id;
        this.connections = [];
        this.tags = [];
        this.enablePendingState();

        this.widget = WidgetFactory.beginCalloutFrame(parent).backgroundColor(this.backgroundColor).foregroundColor(this.foregroundColor).sizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Fixed).end();

        const frameLayout = WidgetFactory.beginStackedLayout().contentsMargings(0, 0, 0, 0).spacing(0).stackingMode(Ui.StackingMode.StackAll).end();

        const touchZone =  WidgetFactory.beginImageView(this.widget).scaledContents(true).end();
        touchZone.responseHover = true;

        touchZone.onHover.connect((hovered) => {
            if (hovered) {
                this.widget.setForegroundColor(this.hoverForegroundColor);
                label.text = this.hoverText;
                arrow.pixmap = this.hoverIcon;
                rightContainer.visible = true;
            } else {
                this.widget.setForegroundColor(this.foregroundColor);
                rightContainer.visible = false;
            }
        });

        
        this.connections.push(touchZone.onClick.connect(() => { this.dispatchEvent({ type: SectionBanner.Clicked, id: this.id }); }));

        frameLayout.addWidget(touchZone);

        const frameContainer = WidgetFactory.beginWidget(this.widget).end();

        const hLayout = WidgetFactory.beginHorizontalLayout().end();

        const vLayout = WidgetFactory.beginVerticalLayout().end();

        const leftContainer = WidgetFactory.beginWidget(frameContainer).end();

        const header = WidgetFactory.beginLabel(leftContainer).text(descriptor.header).fontRole(Ui.FontRole.DefaultBold).foregroundRole(Ui.ColorRole.ToolTipText).wordWrap(true).end();

        const title =  WidgetFactory.beginLabel(leftContainer).text(descriptor.title).fontRole(Ui.FontRole.TitleBold).foregroundRole(Ui.ColorRole.HighlightedText).sizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed).end();

        vLayout.addWidget(header);
        vLayout.addWidget(title);

        this.tagsList = new Ui.Widget(leftContainer);

        const tagsLayout = WidgetFactory.beginHorizontalLayout().contentsMargings(0, Ui.Sizes.Padding, 0, 0).end();

        const completedTag = this.createTag(this.tagsList, "<span style='color: #64C636'>Completed</span>","completed", HalfAlpha(Window));
        this.tags.push(completedTag);
        tagsLayout.addWidget(completedTag.widget);

        if(descriptor.time){
            const timeTag = this.createTag(this.tagsList, descriptor.time +" min", "always", SoftBlue);
            this.tags.push(timeTag);
            tagsLayout.addWidget(timeTag.widget)
        }

        tagsLayout.addStretch(0);

        this.arrangeTags(this.tags);
        this.tagsList.layout = tagsLayout;

        vLayout.addWidget(this.tagsList);

        leftContainer.layout = vLayout;

        const rightContainer = WidgetFactory.beginWidget(frameContainer).end();
        rightContainer.visible = false;
        const rightLayout = WidgetFactory.beginHorizontalLayout().end();

        const label = WidgetFactory.beginLabel(rightContainer).text(this.hoverText).fontRole(Ui.FontRole.Title).foregroundRole(Ui.ColorRole.HighlightedText).end();

        const arrow = WidgetFactory.beginImageView(rightContainer).end();
        arrow.setFixedWidth(Ui.Sizes.IconSide);
        arrow.setFixedHeight(Ui.Sizes.IconSide);

        arrow.pixmap = this.hoverIcon;

        rightLayout.addWidget(label);
        rightLayout.addWidget(arrow);

        rightContainer.layout = rightLayout;

        hLayout.addWidgetWithStretch(leftContainer, 2, Ui.Alignment.AlignLeft);
        hLayout.addStretch(0);
        hLayout.addWidgetWithStretch(rightContainer, 1, Ui.Alignment.AlignRight);

        frameContainer.layout = hLayout;

        frameLayout.addWidget(frameContainer);

        this.widget.layout = frameLayout;
    }

    createTag(parent, text, show, color) {
        const widget = WidgetFactory.beginCalloutFrame(parent).backgroundColor(color).end();

        const layout = WidgetFactory.beginHorizontalLayout().contentsMargings(Ui.Sizes.Padding, Ui.Sizes.HalfPadding, Ui.Sizes.Padding, Ui.Sizes.HalfPadding).end();

        const label = WidgetFactory.beginLabel(widget).text(text).end();

        layout.addWidget(label);

        widget.layout = layout;

        return {
            widget,
            show
        }
    }

    arrangeTags(tags) {
        tags.forEach((tag) => {
            if (tag.show === "completed") {
                if (this.completed) {
                    tag.widget.visible = true;
                } else {
                    tag.widget.visible = false;
                }
            } else if (tag.show === "pending") {
                if (this.completed) {
                    tag.widget.visible = false;
                } else {
                    tag.widget.visible = true;
                }
            } else {
                tag.widget.visible = true;
            }
        });
    }

    markCompleted(completed) {
        this.completed = completed;
        this.update();
    }

    update() {
        if (this.completed) {
            this.enableCompletedState();
        } else {
            this.enablePendingState();
        }

        this.widget.setBackgroundColor(this.backgroundColor);
        this.widget.setForegroundColor(this.foregroundColor);

        this.arrangeTags(this.tags);
    }

    enableCompletedState() {
        this.backgroundColor = QuarterAlpha(Success);
        this.foregroundColor = HalfAlpha(Success)
        this.hoverForegroundColor = TreeHighlightHover;

        this.hoverText = "Restart";
        this.hoverIcon = new Ui.Pixmap(import.meta.resolve("./Resources/refresh.svg"));
    }

    enablePendingState() {
        this.backgroundColor = Button;
        this.foregroundColor = Button;
        this.hoverForegroundColor = TreeHighlightHover;

        this.hoverText = "Start";
        this.hoverIcon = new Ui.Pixmap(import.meta.resolve("./Resources/arrow.svg"));
    }
}

SectionBanner.Clicked = "Clicked";
