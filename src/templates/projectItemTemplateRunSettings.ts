'use strict';

import * as vzFileTemplates from 'vz-file-templates';
import { StringReplacement } from "../helpers/stringReplacement";
import { StringHelper } from "../helpers/stringHelper";

export class ProjectItemTemplateRunSettings implements vzFileTemplates.IProjectItemTemplateRunSettings {
    destPath : string;
    outputChannel : vzFileTemplates.ITemplateOutputChannel;
    command : string;
    commandParameters : string[];

    protected _textRepl : StringReplacement[];

    constructor(newDestPath : string, newOutputChannel : vzFileTemplates.ITemplateOutputChannel,
        newCommand : string, newCommandParameters: string[]) {
        this.destPath = newDestPath;
        this.outputChannel = newOutputChannel;
        this._textRepl = [];
        this.command = newCommand;
        this.commandParameters = newCommandParameters.slice();
    }

    setCommand(newCommand : string, newCommandParameters : string[]) : void {
        this.command = newCommand;
        this.commandParameters = newCommandParameters;
    }

    getTextReplacement(key : string) : string {
        for (let i=0; i<this._textRepl.length;i++) {
            if (this._textRepl[i].oldText == key)
                return this._textRepl[i].newText;
        }
        return "";
    }

    setTextReplacement(key : string, value : string) : void {
        var newTextRepl : StringReplacement | undefined = this.findTextReplacement(key);
        if (newTextRepl === undefined) {
            newTextRepl = new StringReplacement(key, value);
            this._textRepl.push(newTextRepl);
        } else {
            newTextRepl.newText = value;
        }
    }

    setVariable(name : string, value : string) : void {
        this.setTextReplacement(`\\$${name}$`, `$${name}$`);
        this.setTextReplacement(`$${name}$`, `${value}`);
    }

    getVariable(name : string) : string {
        return this.getTextReplacement(`$${name}$`);
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