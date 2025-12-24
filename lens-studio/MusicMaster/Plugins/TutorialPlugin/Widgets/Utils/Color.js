import * as Ui from "LensStudio:Ui";

const fromRgb = (r, g, b) => {
    const result = new Ui.Color();
    result.red = r;
    result.green = g;
    result.blue = b;

    result.alpha = 255;
    return result;
}

const fromRgba = (r, g, b, a) => {
    const result = new Ui.Color();
    result.red = r;
    result.green = g;
    result.blue = b;
    result.alpha = a;
    return result;
}

export const withAlpha = (color, alpha) => {
    const result = new Ui.Color();
    result.red = color.red;
    result.green = color.green;
    result.blue = color.blue;
    result.alpha = alpha;
    return result;
}

export const HalfAlpha = (color) => {
    return withAlpha(color, 128);
}

export const QuarterAlpha = (color) => {
    return withAlpha(color, 64);
}

const fromHexString = (hex) => {
    hex = hex.replace(/^#/, '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return fromRgb(r, g, b);
}

const fromHexNum = (hexNum) => {
    const r = (hexNum >> 16) & 0xFF;
    const g = (hexNum >> 8) & 0xFF;
    const b = hexNum & 0xFF;
    return fromRgb(r, g, b);
}

export const SoftBlue = fromHexNum(0x6987FF);
export const Success = fromHexNum(0x64C636);
export const TreeHighlight = fromHexString("#054476");
export const TreeHighlightHover = fromHexString("#0871C4");
export const Component = fromHexNum(0x3D434D);
export const Window = fromHexNum(0x1A1D21);
export const Button = fromHexNum(0x4F5963);
export const Highlighted = fromHexNum(0x336D99);
export const Disabled = fromRgba(0, 0, 0, 0);
export const White = fromRgb(255, 255, 255);
export const Black = fromRgb(0, 0, 0);
export const DisabledBackground = withAlpha(fromHexString("#525866"), Math.floor(255 * 0.15));
export const DisabledForeground = withAlpha(White, Math.floor(255 * 0.05));
export const DividerLight = fromHexString("#525866");
