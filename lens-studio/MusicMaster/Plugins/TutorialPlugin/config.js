import * as FileSystem from "LensStudio:FileSystem";

export class Config {
    constructor(path) {
        this.path = path;
    }

    getCompleted() {
        return this.read()["completed"];
    }

    markCompleted(id) {
        let config = this.read();
        if (!config["completed"].includes(id)) {
            config["completed"].push(id);
        }
        this.write(config);
    }

    read() {
        return JSON.parse(FileSystem.readFile(this.path));
    }

    write(config) {
        FileSystem.writeFile(this.path, JSON.stringify(config));
    }
}
