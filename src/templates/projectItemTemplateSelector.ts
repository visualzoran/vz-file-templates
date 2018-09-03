'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import { ProjectItemTemplateManager } from "./projectItemTemplateManager";
import { ProjectItemTemplate } from './projectItemTemplate';
import { BaseWebViewEditor } from '../webviews/baseWebViewEditor';
import { ProjectItemTemplateCategoryDTO } from './dto/projectItemTemplateCategoryDTO';
import { PathHelper } from '../helpers/pathHelper';

export class ProjectItemTemplateSelector extends BaseWebViewEditor {
    protected _templatesManager : ProjectItemTemplateManager;
    protected _destPath : string;
    protected _title : string;
    protected _browseDestPath : boolean;
    protected _canCreateSubFolder : boolean;

    constructor(context : vscode.ExtensionContext, newTemplatesManager : ProjectItemTemplateManager, destPath : string, title : string, browseDestPath : boolean) {
        super(context, "New Item");
        this._destPath = destPath;
        this._templatesManager = newTemplatesManager;
        this._title = title;
        this._browseDestPath = browseDestPath;
        this._canCreateSubFolder = browseDestPath;
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
            title : this._title,
            browseDestPath : this._browseDestPath,
            destPath : this._destPath,
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
                    this.onSelect(message.templateId as number, message.name, message.destPath, message.mkDir);
                    return true;
                case 'cancelClick':
                    this.onCancel();
                    return true;
                case 'browseDestPath':
                    this.onBrowseDestPath(message.destPath);
                    return true;
            }
        }
        
        return false;
    }

    protected async onBrowseDestPath(destPath : string) {
        this._destPath = destPath;       
        let defaultUri : vscode.Uri | undefined = undefined;
        if (this._destPath != "")
            defaultUri = vscode.Uri.file(this._destPath);
        
        let selected : vscode.Uri[] | undefined = await vscode.window.showOpenDialog({
            defaultUri: defaultUri,
            canSelectFolders: true
        });

        if ((selected) && (selected.length > 0)) {
            this._destPath = selected[0].fsPath;
            this.sendMessage({
                command : 'setDestPath',
                destPath : this._destPath
            });        
        }
    }

    protected onSelect(id : number, name : string, destPath : string, mkProjectDir : boolean) {
        mkProjectDir = (mkProjectDir && this._canCreateSubFolder);
        this._destPath = destPath;
        let template : ProjectItemTemplate | undefined =  this._templatesManager.findTemplate(id);
        if (!template)
            vscode.window.showInformationMessage("Please select template first.");
        else if ((this._browseDestPath) && (this._destPath == ""))
            vscode.window.showInformationMessage("Please enter location first.");
        else {
            //make dest dir
            if (mkProjectDir) {
                let projFolder = path.parse(name).name;
                let fullPath = path.join(this._destPath, projFolder);
                const fs = require('fs');
                if (fs.existsSync(fullPath)) {
                    vscode.window.showErrorMessage("'" + projFolder + "' already exists in '" + destPath + "'. Please select another name.");
                    return;
                }
                destPath = fullPath;
                this._destPath = destPath;
            }
            
            //create folder
            if (this._browseDestPath)
                PathHelper.ensureDirPath(this._destPath);

            this._templatesManager.setSelectedTemplate(template);
            this.close();
            this._templatesManager.runTemplate(this._destPath, template, name);
        }
    }

    protected onCancel() {
        this.close();
    }
    
}