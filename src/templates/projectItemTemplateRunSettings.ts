'use strict';

import { StringReplacement } from "../helpers/stringReplacement";
import { StringHelper } from "../helpers/stringHelper";

export class ProjectItemTemplateRunSettings implements vzFileTemplates.IProjectItemTemplateRunSettings {
    destPath : string;
    protected _textRepl : StringReplacement[];

    constructor(newDestPath : string, newTextRepl : StringReplacement[]) {
        this.destPath = newDestPath;
        this._textRepl = newTextRepl;
    }

    getTextReplacement(key : string) : string {
        for (let i=0; i<this._textRepl.length;i++) {
            if (this._textRepl[i].oldText == key)
                return this._textRepl[i].newText;
        }
        return "";
    }

    setTextReplacement(key : string, value : string) {
        var newTextRepl : StringReplacement | undefined = this.findTextReplacement(key);
        if (newTextRepl === undefined) {
            newTextRepl = new StringReplacement(key, value);
            this._textRepl.push(newTextRepl);
        } else {
            newTextRepl.newText = value;
        }
    }

    getInputNameVariable() : string {
        return this.getTextReplacement("$itemname$");
    }

    getFileInputNameVariable() : string {
        return this.getTextReplacement("$fileinputname$");
    }

    applyReplacements(value : string) : string {
        return StringHelper.replaceText(value, this._textRepl);
    }

    protected findTextReplacement(key : string) : StringReplacement | undefined {
        for (let i=0; i<this._textRepl.length;i++) {
            if (this._textRepl[i].oldText == key)
                return this._textRepl[i];
        }
        return undefined;
    }

}