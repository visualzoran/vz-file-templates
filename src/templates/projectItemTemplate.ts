'use strict';
import * as vscode from 'vscode';
import * as path from 'path';
import * as vzFileTemplates from 'vz-file-templates';
import { ProjectItemTemplateElement } from "./projectItemTemplateElement";
import { VSCodeHelper } from '../helpers/vscodeHelper';
import {PathHelper} from '../helpers/pathHelper';

export class ProjectItemTemplate implements vzFileTemplates.IProjectItemTemplate {
    id : number;
    templateFilePath : string;
    name : string;
    description : string;
    defaultName : string;
    iconLight : string;
    iconDark : string;
    sortOrder : string;
    category : string;
    wizardName : string;
    selected : boolean;
    elements : ProjectItemTemplateElement[];
    isProject : boolean;
    command : string;
    commandParameters : string[];

    constructor() {
        this.id = 0;
        this.name = "";
        this.description = "";
        this.defaultName = "";
        this.iconLight = "";
        this.iconDark = "";
        this.sortOrder = "10";
        this.category = "";
        this.wizardName = "";
        this.templateFilePath = "";
        this.selected = false;
        this.elements = [];
        this.isProject = false;
        this.command = "";
        this.commandParameters = [];
    }

    loadFromFile(filePath : string) : boolean {
        const fs = require('fs');    
        let content = JSON.parse(fs.readFileSync(filePath));
        this.templateFilePath = filePath;
        let success : boolean =  this.copyFromAny(content);
        
        let fileDir = path.dirname(filePath);
        this.iconLight = this.loadIcon(fileDir, this.iconLight);
        this.iconDark = this.loadIcon(fileDir, this.iconDark);

        return success;
    }

    copyFromAny(content : any) : boolean {        
        //copy data from content json
        this.name = content.name as string;
        this.description = content.description as string;
        this.defaultName = content.defaultName as string;
        this.sortOrder = content.sortOrder as string;
        this.category = content.category as string;
        this.iconLight = content.iconLight as string;
        this.iconDark = content.iconDark as string;
        this.wizardName = content.wizardName as string;        
        this.elements = [];
        this.command = content.command as string;
        this.commandParameters = [];
        if (content.isProject)
            this.isProject = content.isProject as boolean;

        //copy template items
        if (content.elements) {
            for (let i=0; i<content.elements.length; i++) {
                let templateElement : ProjectItemTemplateElement = new ProjectItemTemplateElement();
                if (!templateElement.copyFromAny(content.elements[i]))
                    return false;
                this.elements.push(templateElement);
            }
        }

        //copy command parameters
        if (content.commandParameters) {
            for (let i=0; i<content.commandParameters.length; i++) {
                this.commandParameters.push(content.commandParameters[i] as string);
            }
        }

        return true;
    }

    protected loadIcon(templatePath: string, iconPath: string): string  {
        if ((!iconPath) || (iconPath == ""))
            return "";
        iconPath = path.join(templatePath, iconPath);
        const fs = require("fs");    

        let imageType : string = "data:image";
        if (path.extname(iconPath) == ".svg")
            imageType = "data:image/svg+xml";

        try {
            let buffer = fs.readFileSync(iconPath);
            return imageType + ";base64," + buffer.toString("base64");
        }
        catch (e) {
            return "";
        }
    }

    run(settings : vzFileTemplates.IProjectItemTemplateRunSettings) : boolean {
        const fs = require("fs");
        let sourceRootPath = path.dirname(this.templateFilePath);
    
        //check if files exist
        for (let i = 0; i<this.elements.length; i++) {
            let filePath = path.join(settings.destPath, settings.applyReplacements(this.elements[i].targetName));
            if (fs.existsSync(filePath)) {
                vscode.window.showErrorMessage("A file with the name '" + path.basename(filePath) + "' already exists. " +
                    "Please give a unique name to the item you are adding, or delete the existing item first.");
                return false;
            }
        }            

        //process all files
        let files : string[] = [];
        try
        {
            for (let i = 0; i<this.elements.length; i++) {
                let templateFile : ProjectItemTemplateElement = this.elements[i];
                let filePath = path.join(settings.destPath, settings.applyReplacements(templateFile.targetName));
                let sourcePath = path.join(sourceRootPath, templateFile.fileName);
                // ensure dirpath if it doesn't exists
                const dir = path.dirname(filePath)
                if (!fs.existsSync(dir)) {
                    PathHelper.ensureDirPath(dir);
                }
                if (templateFile.replaceParameters) {
                    let fileEncoding = templateFile.encoding;
                    if ((fileEncoding == null) || (fileEncoding == ""))
                        fileEncoding = "utf8";

                    //read text file
                    let fileContent : string = fs.readFileSync(sourcePath, {encoding : fileEncoding });

                    //replace texts
                    fileContent = settings.applyReplacements(fileContent);

                    //save file back
                    
                    fs.writeFileSync(filePath, fileContent, {encoding : fileEncoding });

                } else {   
                    let buffer = fs.readFileSync(sourcePath);
                    fs.writeFileSync(filePath, buffer);
                    //fs.copyFileSync(sourcePath, filePath);
                }        

                //open file
                if (templateFile.open)
                    files.push(filePath);
            }
        }
        catch (e) {
            vscode.window.showErrorMessage("Operation failed: " + e);
            return false;
        }

        //run command
        if ((settings.command) && (settings.command != "")) {
            this.runCommand(settings, files);
        } else {
            this.runFinished(settings, files);
        }

        return true;
    }

    protected runFinished(settings : vzFileTemplates.IProjectItemTemplateRunSettings, files: string[]) {
        //open workspace
        if ((!vscode.workspace) || (!vscode.workspace.workspaceFolders) || (vscode.workspace.workspaceFolders.length == 0)) {
            vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(settings.destPath));
        }
        //open documents
        for (let i=0; i<files.length; i++) {
            VSCodeHelper.openDocument(vscode.Uri.file(files[i]));
        }
    }

    protected runCommand(settings : vzFileTemplates.IProjectItemTemplateRunSettings, files: string[]) : boolean {        
        let infoText : string = settings.command;
        
        //prepare parameters
        let params : string[] = [];
        for (let i=0; i<settings.commandParameters.length; i++) {
            let paramValue : string = settings.applyReplacements(settings.commandParameters[i]);
            params.push(paramValue);
            infoText = infoText + " " + paramValue;
        }
        
        //run command
        try {
            settings.outputChannel.show();
            settings.outputChannel.writeLine("Running external command");
            settings.outputChannel.writeLine(infoText);
            
            const childProcess = require('child_process');        
            const proc = childProcess.spawn(settings.command, params, {
                cwd: settings.destPath
            });

            settings.outputChannel.show();
            settings.outputChannel.writeLine("running command " + settings.command);

            proc.stdout.on('data', (data : any) => {
                if (data)
                    settings.outputChannel.write(data.toString());
            });

            proc.stderr.on('data', (data : any) => {
                if (data)
                    settings.outputChannel.write(data.toString());
            });

            proc.on('error', function(err : string) {
                vscode.window.showErrorMessage("External command failed with error '" + err + "'.", {modal: false});
            });

            proc.on('exit', (code : number) => {
                if (code == 0) {
                    settings.outputChannel.writeLine("External command completed");
                    this.runFinished(settings, files);
                }
              });
        }
        catch (e) {
            vscode.window.showErrorMessage(e.toString());
            return false;
        }

        return true;
    }

}