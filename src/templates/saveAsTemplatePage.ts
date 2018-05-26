'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import { BaseWebViewEditor } from '../webviews/baseWebViewEditor';

export class SaveAsTemplatePage extends BaseWebViewEditor {
    protected _sourceUri : vscode.Uri;

    constructor(context : vscode.ExtensionContext, sourceUri : vscode.Uri) {
        super(context, "Save as Template");
        this._sourceUri = sourceUri;
    }

    protected getHtmlContentPath() : string {
        return path.join('webviews', 'saveastemplatepage', 'saveastemplate.html');
    }

    protected getViewType() : string {
        return "vzfiletemplates.SaveAsTemplatePage";
    }

    protected onDocumentLoaded() {
        this.sendMessage({
            command : 'setData',
            data : ''
        })
    }

    protected processWebViewMessage(message : any) : boolean {
        if (super.processWebViewMessage(message))
            return true;

        if (message) {
            switch (message.command) {
                case 'okClick':
                    this.onOK(message.data);
                    return true;
                case 'cancelClick':
                    this.onCancel();
                    return true;
            }
        }
        
        return false;
    }

    protected onOK(data : any) {
        this.close();
    }

    protected onCancel() {
        this.close();
    }

}
