import * as Ui from 'LensStudio:Ui';
import { Component, DisabledBackground, DisabledForeground, HalfAlpha, Highlighted, QuarterAlpha, Success, TreeHighlight, TreeHighlightHover } from './Utils/Color.js';
import { WidgetFactory } from './Utils/WidgetFactory.js';

// move to utils
export class CardProxy {
    constructor(widget) {
        this.widget = widget;
        const layout = WidgetFactory.beginHorizontalLayout()
            .contentsMargings(Ui.Sizes.DoublePadding, Ui.Sizes.DoublePadding, Ui.Sizes.DoublePadding, Ui.Sizes.DoublePadding)
            .spacing(Ui.Sizes.DoublePadding)
            .end();
        this.layout = layout;
    }

    addText(text, colorRole) {
        const label = WidgetFactory.beginLabel(this.widget)
            .text(text)
            .wordWrap(true)
            .end();

        if (colorRole) {
            label.foregroundRole = colorRole;
        }

        this.layout.addWidget(label);

        return this;
    }

    addBackgroundColor(color) {
        this.widget.setBackgroundColor(color);
        return this;
    }

    addForegroundColor(color) {
        this.widget.setForegroundColor(color);
        return this;
    }

    addForegroundRole(role, group) {
        this.widget.setForegroundRole(role, group);
        return this;
    }

    addBackgroundRole(role, group) {
        this.widget.setBackgroundRole(role, group);
        return this;
    }

    addIcon(icon) {
        const imageView = WidgetFactory.beginImageView(this.widget)
            .pixmap(icon)
            .scaledContents(true)
            .end();

        imageView.setFixedWidth(Ui.Sizes.IconSide);
        imageView.setFixedHeight(Ui.Sizes.IconSide);
        this.layout.addWidget(imageView);

        return this;
    }

    end() {
        this.widget.layout = this.layout;
        return this.widget;
    }
}

// to-do: move to utils
export const beginCard = (parent) => {
    const callout = WidgetFactory.beginCalloutFrame(parent).end();
    callout.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Minimum);
    return new CardProxy(callout);
}

// to-do: move to cards file
export const createCompletedTaskCard = (parent, text) => {
    return beginCard(parent)
        .addBackgroundColor(QuarterAlpha(Success))
        .addForegroundColor(HalfAlpha(Success))
        .addIcon(new Ui.Pixmap(import.meta.resolve("./Resources/success.svg")))
        .addText(text)
        .end();
}

// to-do: move to cards file
export const createPendingTaskCard = (parent, text) => {
    return beginCard(parent)
        .addBackgroundColor(TreeHighlight)
        .addForegroundColor(TreeHighlightHover)
        .addIcon(new Ui.Pixmap(import.meta.resolve("./Resources/dot_picker.svg")))
        .addText(text)
        .end();
}

// to-do: move to cards file
export const createDisabledTaskCard = (parent, text) => {
    return beginCard(parent)
        .addBackgroundColor(DisabledBackground)
        .addForegroundColor(DisabledForeground)
        .addIcon(new Ui.Pixmap(import.meta.resolve("./Resources/dot_picker.svg")))
        .addText('<span style"color: #C3D2DF66">' + text + "</span>")
        .end();
}

// to-do: move to cards file
export const createHintCard = (parent, text) => {
    return beginCard(parent)
        .addBackgroundColor(QuarterAlpha(Component))
        .addIcon(new Ui.Pixmap(import.meta.resolve("./Resources/light_source.svg")))
        .addText('<span style"color: #C3D2DF">' + text + "</span>")
        .end();
}