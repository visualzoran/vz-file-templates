'use strict';

import * as vscode from 'vscode';

export class VSCodeHelper {

    static showNewDocument(content : string, lang : string) {
        vscode.workspace.openTextDocument({
            content : content,
            language : lang
        }).then(
            document => { 
                vscode.window.showTextDocument(document, {
                    preview : false
                });
            },
            err => {
                vscode.window.showErrorMessage(err);
            });
    }

    static openDocument(uri : vscode.Uri) {
        vscode.workspace.openTextDocument(uri).then(
            document => { 
                vscode.window.showTextDocument(document, {
                    preview : false
                });
            },
            err => {
                vscode.window.showErrorMessage(err);
            });
    }


}