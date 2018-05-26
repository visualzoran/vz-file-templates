'use strict';

import * as vscode from 'vscode';
import { ProjectItemTemplate } from "./projectItemTemplate";
import { ProjectItemTemplateRunSettings } from './projectItemTemplateRunSettings';

export class ProjectItemWizardFactory {
    name : string;
    protected _context : vscode.ExtensionContext;    

    constructor(context : vscode.ExtensionContext, wizardName : string) {
        this.name = wizardName;
        this._context = context;
    }

    run(template : ProjectItemTemplate, settings : ProjectItemTemplateRunSettings) {
    }

}