'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import { ProjectItemTemplateManager } from './templates/projectItemTemplateManager';
import { ProjectItemTemplateSelector } from './templates/projectItemTemplateSelector';
import { VzFileTemplatesApi } from './vzFileTemplatesApi';

export function activate(context: vscode.ExtensionContext) {
    //item templates manager
    const itemTemplateManager : ProjectItemTemplateManager = new ProjectItemTemplateManager(context);    
    
    let disposable = vscode.commands.registerCommand('vzfiletemplates.newFile', (dirUri) => {
        const fs = require('fs');        
        let destPath = dirUri.fsPath;
        let fsStat = fs.statSync(destPath);
        if (!fsStat.isDirectory())
            destPath = path.dirname(destPath);       
        
        itemTemplateManager.loadTemplates();
        
        //create and show new template selector
        let templateSelector : ProjectItemTemplateSelector = 
            new ProjectItemTemplateSelector(context, itemTemplateManager, destPath);
        templateSelector.show();
    });

    context.subscriptions.push(disposable);

    //build api
    let api : vzFileTemplates.IVZFileTemplatesApi = new VzFileTemplatesApi(itemTemplateManager);

    return api;
}

// this method is called when your extension is deactivated
export function deactivate() {
}