'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import { ProjectItemTemplateElement } from "./projectItemTemplateElement";
import { StringHelper } from '../helpers/stringHelper';
import { ProjectItemTemplateRunSettings } from './projectItemTemplateRunSettings';
import { VSCodeHelper } from '../helpers/vscodeHelper';

export class ProjectItemTemplate {
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
    elements : ProjectItemTemplateElement[];

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
        this.elements = [];
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

        if (content.elements) {
            for (let i=0; i<content.elements.length;i++) {
                let templateElement : ProjectItemTemplateElement = new ProjectItemTemplateElement();
                if (!templateElement.copyFromAny(content.elements[i]))
                    return false;
                this.elements.push(templateElement);
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

    run(settings : ProjectItemTemplateRunSettings) : boolean {
        const fs = require("fs");
        let sourceRootPath = path.dirname(this.templateFilePath);
    
        //check if files exist
        for (let i = 0; i<this.elements.length; i++) {
            let filePath = path.join(settings.destPath, StringHelper.replaceText(this.elements[i].targetName, settings.textRepl));
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
                let filePath = path.join(settings.destPath, StringHelper.replaceText(templateFile.targetName, settings.textRepl));
                let sourcePath = path.join(sourceRootPath, templateFile.fileName);

                if (templateFile.replaceParameters) {
                    let fileEncoding = templateFile.encoding;
                    if ((fileEncoding == null) || (fileEncoding == ""))
                        fileEncoding = "utf8";

                    //read text file
                    let fileContent : string = fs.readFileSync(sourcePath, {encoding : fileEncoding });

                    //replace texts
                    fileContent = StringHelper.replaceText(fileContent, settings.textRepl);

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

        for (let i=0; i<files.length; i++) {
            VSCodeHelper.openDocument(vscode.Uri.file(files[i]));
        }

        return true;
    }

}