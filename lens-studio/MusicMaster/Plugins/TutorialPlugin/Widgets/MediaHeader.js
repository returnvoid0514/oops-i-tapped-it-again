import * as Ui from 'LensStudio:Ui';

// to-do: make it resizable?
// to-do: test with different dpi
export class MediaHeader {
    constructor(parent, descriptor) {
        this.type = descriptor.type;
        this.path = descriptor.path;

        switch (this.type) {
            case "movie":
                this.originalContent = new Ui.Movie(descriptor.path);
                this.view = new Ui.MovieView(parent);
                this.view.movie = this.originalContent;
                break;
            case "image":
                this.originalContent = new Ui.Pixmap(descriptor.path);
                this.view = new Ui.ImageView(parent);
                this.view.radius = 4 * this.view.devicePixelRatio;
                break;
            default:
                throw new Error("Invalid type provided to Media Header");
        }
        this.maxWidth = descriptor.max_width ? descriptor.max_width * this.view.devicePixelRatio : 350;
        this.view.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        this.view.setMinimumWidth(this.maxWidth);
        this.originalWidth = this.originalContent.width;
        this.originalHeight = this.originalContent.height;

        this.updateScaledContent();
    }

    updateScaledContent() {
        if (!this.originalContent) return;
        const scale = ((this.type === "image") ? this.view.devicePixelRatio : 1);

        const targetWidth = Math.floor(scale * this.maxWidth);
        const targetHeight = Math.floor((targetWidth * this.originalHeight) / this.originalWidth);

        this.originalContent.transformationMode = Ui.TransformationMode.SmoothTransformation;

        if (this.type == "movie") {
            this.originalContent = new Ui.Movie(this.path);
            this.originalContent.resize(targetWidth, targetHeight);
            this.view.movie = this.originalContent;
            this.view.animated = true;
        } else if (this.type == "image") {
            this.originalContent.resize(targetWidth, targetHeight);
            this.view.pixmap = this.originalContent;
        }
    }
}
