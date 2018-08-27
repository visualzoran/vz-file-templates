'use strict';

import * as vscode from 'vscode';
import * as path from 'path';

export class LangServerProxy {
    constructor() {
    }

    async getCompletionForSourceCode(sourceCode : string, tempFileName : string, posLine : number, posColumn : number, 
        lastSourceLine : number, lastSourceColumn : number) : Promise<vscode.CompletionList | undefined> {

        if ((!vscode.workspace.workspaceFolders) || (vscode.workspace.workspaceFolders.length == 0))
            return undefined;
        
        let fs = require('fs');

        let cacheFolder : string | undefined = vscode.workspace.getConfiguration("vzfiletemplates").get("langServerProxyFolder");
        if ((!cacheFolder) || (cacheFolder == ""))
            cacheFolder = ".langserverproxy";
        let symbolCacheUrl : vscode.Uri = vscode.Uri.file(path.join(vscode.workspace.workspaceFolders[0].uri.fsPath,
            cacheFolder, tempFileName));
        let symbolCacheFolder = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, cacheFolder);
        if (!fs.existsSync(symbolCacheFolder))
            fs.mkdirSync(symbolCacheFolder);

        fs.writeFileSync(symbolCacheUrl.fsPath, '');

        //write content to the file
        let edit : vscode.WorkspaceEdit = new vscode.WorkspaceEdit();            
        edit.insert(symbolCacheUrl, new vscode.Position(0, 0), sourceCode); 
        await vscode.workspace.applyEdit(edit);
              
        //download document symbols
        let pos = new vscode.Position(posLine, posColumn);
        let list = await
            vscode.commands.executeCommand<vscode.CompletionList>('vscode.executeCompletionItemProvider', 
            symbolCacheUrl, pos);

        //clear file to remove errors from the workspace
        edit = new vscode.WorkspaceEdit();
        edit.delete(symbolCacheUrl, new vscode.Range(0, 0, lastSourceLine, lastSourceColumn));
        await vscode.workspace.applyEdit(edit);

        return list;
    }

}