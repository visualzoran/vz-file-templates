'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { ProjectItemTemplateCategory } from './projectItemTemplateCategory';
import { ProjectItemTemplate } from './projectItemTemplate';
import { StringReplacement } from '../helpers/stringReplacement';
import { ProjectItemTemplateRunSettings } from './projectItemTemplateRunSettings';
import { StringHelper } from '../helpers/stringHelper';

export class ProjectItemTemplateManager {
    _rootCategory: ProjectItemTemplateCategory;
    protected _templateFolders: string[];
    protected _context: vscode.ExtensionContext;
    protected _wizards: vzFileTemplates.IProjectItemWizard[];
    protected _selectedTemplatePath: string;
    // --- info, used for template resolving
    /**
     * Destinaion path for the file, to be created based on template
     * Value used to resolve template variables only.
     * 
     * @protected
     * @type {string}
     * @memberOf ProjectItemTemplateManager
     */
    protected _destinationPath: string;
    /**
     * 
     * 
     * @protected
     * @type {string}
     * @memberOf ProjectItemTemplateManager
     */
    protected _workspaceDir: string;

    constructor(context: vscode.ExtensionContext) {
        this._selectedTemplatePath = "";
        this._context = context;
        this._rootCategory = new ProjectItemTemplateCategory();
        this._templateFolders = [];
        this._wizards = [];
        this._destinationPath = "";
        this._workspaceDir = "";
        if ((vscode.workspace.workspaceFolders) && (vscode.workspace.workspaceFolders.length > 0)) {
            this._workspaceDir = path.normalize(vscode.workspace.workspaceFolders[0].uri.fsPath);
        }
        //add main project items templates path
        this._templateFolders.push(context.asAbsolutePath('templates'));
        //add user templates folders
        let userFolders: string[] | undefined = vscode.workspace.getConfiguration('vzfiletemplates').get('userTemplatesFolders');
        if ((userFolders) && (userFolders.length > 0)) {
            for (let idx = 0; idx < userFolders.length; idx++) {
                if ((userFolders[idx]) && (userFolders[idx] != ""))
                    this._templateFolders.push(userFolders[idx]);
            }
        }
    }

    setSelectedTemplate(template: ProjectItemTemplate) {
        this._selectedTemplatePath = template.templateFilePath;
    }

    /**
     * Setter for destination path of the file, to be created.
     * [NOTE] - this path used for resolving paths for template substitutions ONLY.
     * 
     * @param {string} destPath - path of the file, to be created
     * 
     * @memberOf ProjectItemTemplateManager
     */
    setDestintationPath(destPath: string) {
        this._destinationPath = path.normalize(destPath);
    }

    registerWizard(wizard: vzFileTemplates.IProjectItemWizard) {
        this._wizards.push(wizard);
    }

    registerTemplatesFolder(folderPath: string) {
        this._templateFolders.push(folderPath);
    }

    loadTemplates() {
        this._rootCategory = new ProjectItemTemplateCategory();
        for (let i = 0; i < this._templateFolders.length; i++) {
            this.loadTemplatesFromFolder(this._templateFolders[i]);
        }
    }

    protected loadTemplatesFromFolder(sourcePath: string) {
        // resolve path of each item, stored in "vzfiletemplates.userTemplatesFolders" if it is relative
        // Now all paths could be absolute or relative to workspace

        if (!path.isAbsolute(sourcePath) && this._workspaceDir !== "") {
            sourcePath = path.resolve(path.join(this._workspaceDir, sourcePath));
        }


        if (!fs.existsSync(sourcePath))
            return;


        let dirContent: string[] = fs.readdirSync(sourcePath);


        //process sub directories
        if (dirContent) {
            for (let i = 0; i < dirContent.length; i++) {
                let itemPath: string = path.join(sourcePath, dirContent[i]);
                let itemStat = fs.statSync(itemPath);
                if (itemStat.isDirectory())
                    this.loadTemplatesFromFolder(itemPath);
            }
        }

        //load template files
        let templateFilePath = path.join(sourcePath, "template.json");
        if (fs.existsSync(templateFilePath)) {
            let template: ProjectItemTemplate = new ProjectItemTemplate();
            try {
                if (template.loadFromFile(templateFilePath)) {
                    template.selected = (this._selectedTemplatePath == template.templateFilePath);
                    this.addTemplate(template);
                }
            }
            catch (e) {
            }
        }

        //assign ids
        this._rootCategory.assignCategoryIds(1);
        this._rootCategory.assignItemsIds(1);
    }

    addTemplate(template: ProjectItemTemplate) {
        let templateCategory: ProjectItemTemplateCategory = this.findCategoryByPath(template.category);
        templateCategory.items.push(template);
        if (template.selected)
            templateCategory.selected = true;
    }

    protected findCategoryByPath(categoryPath: string): ProjectItemTemplateCategory {
        if (!categoryPath)
            categoryPath = "Undefined";

        let names: string[] = categoryPath.split("/");
        let retVal = this._rootCategory;
        for (let i = 0; i < names.length; i++) {
            retVal = retVal.findOrCreateChildCategory(names[i]);
        }

        return retVal;
    }

    findTemplate(id: number): ProjectItemTemplate | undefined {
        return this._rootCategory.findTemplate(id);
    }

    runTemplate(destPath: string, template: ProjectItemTemplate, inputName: string): boolean {
        //prepare list of variables
        let replList: StringReplacement[] = [];
        let name: string = path.parse(inputName).name;
        let safeName: string = StringHelper.toSafeName(name);
        // date object, used for resolving substitutions
        let now: Date = new Date();
        // the list of built in variables and its values, to be used in substitutions.
        // format: {<variableName>: <variableValue>}
        let vars: any = {
            username: os.userInfo().username || '',
            workspacename: vscode.workspace.name,
            workspacepath: this._workspaceDir,
            filefullpath: path.join(this._destinationPath, inputName),
            filerelpath: path.relative(this._workspaceDir, path.join(this._destinationPath, inputName)),
            dirfullpath: this._destinationPath,
            dirrelpath: path.relative(this._workspaceDir, this._destinationPath),
            dirbasename: path.basename(this._destinationPath),
            fileinputname: inputName,
            itemname: name,
            safeitemname: safeName,
            capitemname: safeName.charAt(0).toUpperCase() + safeName.slice(1),
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString(),
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            month_name_full: now.toLocaleString('en-us', { month: 'long' }),
            month_name_short: now.toLocaleString('en-us', { month: 'short' }),
            day: now.getDate(),
            hours: now.getHours(),
            minutes: now.getMinutes(),
            seconds: now.getSeconds()
        };

        // @TODO - here could be made custom constructor resolving for each template. 
        // If the path to constructor file will be added to the manifest of template.

        // getting user dependent set of variables, get form configuration of workspace.
        let userVars: object = vscode.workspace.getConfiguration('vzfiletemplates').get('userTemplateVariables') || {};
        if (userVars) {
            // assigning only if variables defined
            Object.assign(vars, userVars);
        }

        // resolve variables in user or workspace custom constructor
        let userConstructorFilePath: string = vscode.workspace.getConfiguration('vzfiletemplates').get('customVariablesConstructor') || "";

        // getting user custom constructor
        if (userConstructorFilePath) {        
            if (!path.isAbsolute(userConstructorFilePath) && this._workspaceDir !== "") {
                userConstructorFilePath = path.resolve(path.join(this._workspaceDir, userConstructorFilePath));
            }
            if (fs.existsSync(userConstructorFilePath)){
                // updating variables values in global scope
                (global as any).vzfiletemplates={};
                ((global as any).vzfiletemplates as any).variables = vars;
                let userCustomConstructor = require(userConstructorFilePath);
                if(userCustomConstructor){
                    // update vars list 
                    Object.assign(vars, userCustomConstructor);
                }
            }
        }       

        for (let name in vars) {
            replList.push(new StringReplacement(`\\$${name}$`, `$${name}$`));
            replList.push(new StringReplacement(`$${name}$`, `${vars[name]}`));
        }

        let templateSettings = new ProjectItemTemplateRunSettings(destPath, replList);

        if ((template.wizardName) && (template.wizardName != "")) {
            let wizard: vzFileTemplates.IProjectItemWizard | undefined = this.getWizard(template.wizardName);
            if (!wizard) {
                vscode.window.showErrorMessage("Wizard '" + template.wizardName + "' not found.");
                return false;
            }
            wizard.run(template, templateSettings);
        } else {
            template.run(templateSettings);
        }
        return true;

    }

    protected getWizard(name: string): vzFileTemplates.IProjectItemWizard | undefined {
        for (let i = 0; i < this._wizards.length; i++) {
            if (this._wizards[i].getName() == name)
                return this._wizards[i];
        }
        return undefined;
    }

}
