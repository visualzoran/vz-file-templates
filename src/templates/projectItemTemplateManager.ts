'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import { ProjectItemTemplateCategory } from './projectItemTemplateCategory';
import { ProjectItemTemplate } from './projectItemTemplate';
import { StringReplacement } from '../helpers/stringReplacement';
import { ProjectItemWizardFactory } from './projectItemWizardFactory';
import { ProjectItemTemplateRunSettings } from './projectItemTemplateRunSettings';
import { StringHelper } from '../helpers/stringHelper';

export class ProjectItemTemplateManager {
    _rootCategory : ProjectItemTemplateCategory;
    protected _templateFolders : string[];
    protected _context : vscode.ExtensionContext;
    protected _wizardFactories : ProjectItemWizardFactory[];

    constructor(context : vscode.ExtensionContext) {
        this._context = context;
        this._rootCategory = new ProjectItemTemplateCategory();        
        this._templateFolders = [];
        this._wizardFactories = [];

        //add main project items templates path
        this._templateFolders.push(context.asAbsolutePath('templates'));
        //add user templates folders
        let userFolders : string[] | undefined = vscode.workspace.getConfiguration('vzfiletemplates').get('userTemplatesFolders');
        if ((userFolders) && (userFolders.length > 0)) {
            for (let idx = 0; idx < userFolders.length; idx++) {
                if ((userFolders[idx]) && (userFolders[idx] != ""))
                    this._templateFolders.push(userFolders[idx]);
            }
        }
    }

    registerWizardFactory(wizardFactory : ProjectItemWizardFactory) {
        this._wizardFactories.push(wizardFactory);
    }

    loadTemplates() {
        this._rootCategory = new ProjectItemTemplateCategory();
        for (let i=0; i<this._templateFolders.length;i++) {
            this.loadTemplatesFromFolder(this._templateFolders[i]);
        }
    }

    protected loadTemplatesFromFolder(sourcePath : string) {
        const fs = require('fs');        
        let dirContent : string[] = fs.readdirSync(sourcePath);

        //process sub directories
        if (dirContent) {
            for (let i=0; i<dirContent.length;i++) {
                let itemPath : string = path.join(sourcePath, dirContent[i]);
                let itemStat = fs.statSync(itemPath);
                if (itemStat.isDirectory())
                    this.loadTemplatesFromFolder(itemPath);
            }
        }

        //load template files
        let templateFilePath = path.join(sourcePath, "template.json");
        if (fs.existsSync(templateFilePath)) {
            let template : ProjectItemTemplate = new ProjectItemTemplate();
            try{
                if (template.loadFromFile(templateFilePath))
                    this.addTemplate(template);
            }
            catch (e) {                        
            }
        }

        //assign ids
        this._rootCategory.assignCategoryIds(1);
        this._rootCategory.assignItemsIds(1);
    }

    addTemplate(template : ProjectItemTemplate) {
        let templateCategory : ProjectItemTemplateCategory = this.findCategoryByPath(template.category);
        templateCategory.items.push(template);
    }

    protected findCategoryByPath(categoryPath : string) : ProjectItemTemplateCategory {
        if (!categoryPath)
            categoryPath = "Undefined";

        let names : string[] = categoryPath.split("/");
        let retVal = this._rootCategory;
        for (let i=0; i<names.length;i++) {
            retVal = retVal.findOrCreateChildCategory(names[i]);
        }

        return retVal;
    }

    findTemplate(id : number) : ProjectItemTemplate | undefined {
        return this._rootCategory.findTemplate(id);
    }

    runTemplate(destPath : string, template : ProjectItemTemplate, inputName : string) : boolean {       
        //prepare list of variables
        let replList : StringReplacement[] = [];
        let name : string = path.parse(inputName).name;

        replList.push(new StringReplacement("\\$fileinputname$", "$fileinputname$"));
        replList.push(new StringReplacement("\\$itemname$", "$itemname$"));
        replList.push(new StringReplacement("\\$safeitemname$", "$safeitemname$"));       

        replList.push(new StringReplacement("$fileinputname$", inputName));
        replList.push(new StringReplacement("$itemname$", name));
        replList.push(new StringReplacement("$safeitemname$", StringHelper.toSafeName(name)));       
        
        let templateSettings = new ProjectItemTemplateRunSettings(destPath, replList); 

        if ((template.wizardName) && (template.wizardName != "")) {
            let wizardFactory : ProjectItemWizardFactory | undefined = this.getWizardFactory(template.wizardName);
            if (!wizardFactory) {
                vscode.window.showErrorMessage("Wizard '" + template.wizardName + "' not found.");
                return false;
            }
            wizardFactory.run(template, templateSettings);
        } else {
            template.run(templateSettings);
        }
        return true;
    }

    protected getWizardFactory(name : string) : ProjectItemWizardFactory | undefined {
        for (let i=0; i<this._wizardFactories.length; i++) {
            if (this._wizardFactories[i].name == name)
                return this._wizardFactories[i];
        }
        return undefined;
    }

}
