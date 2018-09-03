'use strict';

import * as vscode from 'vscode';
import * as vzFileTemplates from 'vz-file-templates';

export class TemplateOutputChannel implements vzFileTemplates.ITemplateOutputChannel {
    protected _outputChannel: vscode.OutputChannel;

    constructor() {
        this._outputChannel = vscode.window.createOutputChannel("VZ File Templates");
    }

    write(value : string) : void {
        this._outputChannel.append(value);
    }

    writeLine(value : string) : void {
        this._outputChannel.appendLine(value);
    }

    show() : void {
        this._outputChannel.show(true);
    }

    hide() : void {
        this._outputChannel.hide();
    }

}