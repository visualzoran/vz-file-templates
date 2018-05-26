'use strict';

import { StringReplacement } from "../helpers/stringReplacement";

export class ProjectItemTemplateRunSettings {
    destPath : string;
    textRepl : StringReplacement[];

    constructor(newDestPath : string, newTextRepl : StringReplacement[]) {
        this.destPath = newDestPath;
        this.textRepl = newTextRepl;
    }

    getTextReplacement(key : string) : string {
        for (let i=0; i<this.textRepl.length;i++) {
            if (this.textRepl[i].oldText == key)
                return this.textRepl[i].newText;
        }
        return "";
    }

    getInputNameVariable() : string {
        return this.getTextReplacement("$inputname$");
    }

    getFileInputNameVariable() : string {
        return this.getTextReplacement("$fileinputname$");
    }

}