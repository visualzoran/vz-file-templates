'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import { ProjectItemTemplateManager } from "./projectItemTemplateManager";
import { ProjectItemTemplate } from './projectItemTemplate';
import { BaseWebViewEditor } from '../webviews/baseWebViewEditor';
import { ProjectItemTemplateCategoryDTO } from './dto/projectItemTemplateCategoryDTO';

export class ProjectItemTemplateSelector extends BaseWebViewEditor {
    protected _templatesManager : ProjectItemTemplateManager;
    protected _destPath : string;

    constructor(context : vscode.ExtensionContext, newTemplatesManager : ProjectItemTemplateManager, destPath : string) {
        super(context, "New Item");
        this._destPath = destPath;
        this._templatesManager = newTemplatesManager;
    }

    protected getHtmlContentPath() : string {
        return path.join('webviews', 'templateselector', 'templateselector.html');
    }

    protected getViewType() : string {
        return "vzfiletemplates.TemplateSelector";
    }

    //initialize wizard
    protected onDocumentLoaded() {
        this.sendMessage({
            command : 'setData',
            data : this.getTemplatesData()
        })
    }

    protected getTemplatesData() : ProjectItemTemplateCategoryDTO {
        const fs = require('fs');        
        return new ProjectItemTemplateCategoryDTO(this._templatesManager._rootCategory, this._destPath, fs);
    }

    protected processWebViewMessage(message : any) : boolean {
        if (super.processWebViewMessage(message))
            return true;

        if (message) {
            switch (message.command) {
                case 'okClick':
                    this.onSelect(message.templateId as number, message.name);
                    return true;
                case 'cancelClick':
                    this.onCancel();
                    return true;
            }
        }
        
        return false;
    }

    protected onSelect(id : number, name : string) {
        let template : ProjectItemTemplate | undefined =  this._templatesManager.findTemplate(id);
        if (!template)
            vscode.window.showInformationMessage("Please select template first.");
        else {
            this.close();
            this._templatesManager.runTemplate(this._destPath, template, name);
        }
    }

    protected onCancel() {
        this.close();
    }
    
}