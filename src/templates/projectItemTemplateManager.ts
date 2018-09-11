'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import * as vzFileTemplates from 'vz-file-templates';
import { ProjectItemTemplateCategory } from './projectItemTemplateCategory';
import { ProjectItemTemplate } from './projectItemTemplate';
import { ProjectItemTemplateRunSettings } from './projectItemTemplateRunSettings';
import { StringHelper } from '../helpers/stringHelper';
import { ProjectItemTemplateSelector } from './projectItemTemplateSelector';
import { TemplateOutputChannel } from './templateOutputChannel';
import { IRunSettingsProcessorDictionary } from './iRunSettingsProcessorDictionary';

export class ProjectItemTemplateManager {
    _rootCategory: ProjectItemTemplateCategory;
    protected _templateFolders: string[];
    protected _context: vscode.ExtensionContext;
    protected _wizards: vzFileTemplates.IProjectItemWizard[];
    protected _settingsProcessors: IRunSettingsProcessorDictionary;
    protected _selectedTemplatePath: string;
    protected _outputChannel: vzFileTemplates.ITemplateOutputChannel;

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
        this._settingsProcessors = {};
        this._outputChannel = new TemplateOutputChannel();
        
        this._workspaceDir = "";
        this.refreshWorkspaceDir();
        
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

    protected isWorkspaceOpen() : boolean {
        if ((vscode.workspace) && (vscode.workspace.workspaceFolders) && (vscode.workspace.workspaceFolders.length > 0))
            return true;
        return false;
    }

    runNewFileWizard(dirUri : vscode.Uri | undefined) {
        if ((!dirUri) && (!this.isWorkspaceOpen)) {
            vscode.window.showErrorMessage("Project items cannot be created if workspace is not open.");
        } else 
            this.runWizard(dirUri, false);
    }

    runNewProjectWizard(dirUri : vscode.Uri | undefined) {
        this.runWizard(dirUri, true);
    }

    protected runWizard(dirUri : vscode.Uri | undefined, projectWizard : boolean) {
        const fs = require('fs');        
        let browseDestPath : boolean = false;
        let destPath : string = "";
        if (dirUri)
            destPath = dirUri.fsPath;
        else if ((vscode.workspace) && (vscode.workspace.workspaceFolders) && (vscode.workspace.workspaceFolders.length > 0))
            destPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
        else {
            destPath = vscode.workspace.getConfiguration('vzfiletemplates').get('defaultProjectsFolder') || "";
            if (destPath === "") {
                destPath = process.env.HOME || process.env.USERPROFILE || process.env.HOMEPATH  || "";
                if (destPath !== "")
                    destPath = path.resolve(destPath);
            }
            browseDestPath = true;
        }

        if (destPath !== "") {
            let fsStat = fs.statSync(destPath);
            if (!fsStat.isDirectory())
                destPath = path.dirname(destPath);       
        }

        // loading templates
        this.loadTemplates(projectWizard);
        
        //create and show new template selector
        let title : string;
        if (projectWizard)
            title = "New Project";
        else
            title = "New Project Item";

        let templateSelector : ProjectItemTemplateSelector = 
            new ProjectItemTemplateSelector(this._context, this, destPath, title, browseDestPath);
        templateSelector.show();
    }

    setSelectedTemplate(template: ProjectItemTemplate) {
        this._selectedTemplatePath = template.templateFilePath;
    }

    registerWizard(wizard: vzFileTemplates.IProjectItemWizard) {
        this._wizards.push(wizard);
    }

    registerTemplatesFolder(folderPath: string) {
        this._templateFolders.push(folderPath);
    }

    registerRunSettingsProcessor(settingsProcessor : vzFileTemplates.ITemplateRunSettingsProcessor) : void {
        this._settingsProcessors[settingsProcessor.getName()] = settingsProcessor;
    }

    loadTemplates(projectWizard : boolean) {
        this.refreshWorkspaceDir();
        this._rootCategory = new ProjectItemTemplateCategory();
        for (let i = 0; i < this._templateFolders.length; i++) {
            this.loadTemplatesFromFolder(this._templateFolders[i], projectWizard);
        }
    }

    protected loadTemplatesFromFolder(sourcePath: string, projectWizard : boolean) {
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
                    this.loadTemplatesFromFolder(itemPath, projectWizard);
            }
        }

        //load template files
        let templateFilePath = path.join(sourcePath, "template.json");
        if (fs.existsSync(templateFilePath)) {
            let template: ProjectItemTemplate = new ProjectItemTemplate();
            try {
                if (template.loadFromFile(templateFilePath)) {
                    if (template.isProject == projectWizard) {
                        template.selected = (this._selectedTemplatePath == template.templateFilePath);
                        this.addTemplate(template);
                    }
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
        this.refreshWorkspaceDir();
        //prepare list of variables
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
            filefullpath: path.join(destPath, inputName),
            filerelpath: path.relative(this._workspaceDir, path.join(destPath, inputName)),
            dirfullpath: destPath,
            dirrelpath: path.relative(this._workspaceDir, destPath),
            dirbasename: path.basename(destPath),
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

        let templateSettings = new ProjectItemTemplateRunSettings(destPath, this._outputChannel,
            template.command, template.commandParameters);

        for (let name in vars) {
            templateSettings.setVariable(name, vars[name]);
        }
    
        //run settings processors
        if (template.settingsProcessors) {
            for (let i=0; i<template.settingsProcessors.length; i++) {
                let settigsProcessor : vzFileTemplates.ITemplateRunSettingsProcessor | undefined =
                    this._settingsProcessors[template.settingsProcessors[i]];
                if (settigsProcessor)
                    settigsProcessor.processSettings(templateSettings);
            }
        }        

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

    protected refreshWorkspaceDir() {
        if ((vscode.workspace.workspaceFolders) && (vscode.workspace.workspaceFolders.length > 0))
            this._workspaceDir = path.normalize(vscode.workspace.workspaceFolders[0].uri.fsPath);
        else
            this._workspaceDir = "";
    }

}
