'use strict';

import * as vscode from 'vscode';

export class ProjectItemWizard implements vzFileTemplates.IProjectItemWizard {
    protected _name : string;
    protected _context : vscode.ExtensionContext;    

    constructor(context : vscode.ExtensionContext, wizardName : string) {
        this._name = wizardName;
        this._context = context;
    }

    getName() : string {
        return this._name;
    }

    run(template : vzFileTemplates.IProjectItemTemplate, settings : vzFileTemplates.IProjectItemTemplateRunSettings) {
    }

}