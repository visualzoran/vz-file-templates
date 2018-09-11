'use strict';

import * as vscode from 'vscode';
import * as vzFileTemplates from 'vz-file-templates';
import { ProjectItemTemplateManager } from './templates/projectItemTemplateManager';
import { VzFileTemplatesApi } from './vzFileTemplatesApi';

export function activate(context: vscode.ExtensionContext) {
    //item templates manager
    const itemTemplateManager : ProjectItemTemplateManager = new ProjectItemTemplateManager(context);    
    
    let disposable = vscode.commands.registerCommand('vzfiletemplates.newFile', (dirUri) => {
        itemTemplateManager.runNewFileWizard(dirUri);
    });

    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('vzfiletemplates.newProject', (dirUri) => {
        itemTemplateManager.runNewProjectWizard(dirUri);
    });

    context.subscriptions.push(disposable);

    //build api
    let api : vzFileTemplates.IVZFileTemplatesApi = new VzFileTemplatesApi(itemTemplateManager);

    return api;
}

// this method is called when your extension is deactivated
export function deactivate() {
}