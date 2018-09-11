'use strict';

import * as path from 'path';
import { ProjectItemTemplate } from "../projectItemTemplate";

export class ProjectItemTemplateDTO {
    id : number;
    name : string;
    description : string;
    defaultName : string;
    iconLight : string;
    iconDark : string;
    sortOrder : string;
    category : string;
    wizardName : string;    
    selected : boolean;    

    constructor(template : ProjectItemTemplate, destPath : string, fs : any) {
        this.id = template.id;
        this.name = template.name;
        this.description = template.description;
        this.defaultName = this.getDefaultTemplateItemName(template.defaultName, destPath, fs),
        this.iconLight = template.iconLight;
        this.iconDark = template.iconDark;
        this.sortOrder = template.sortOrder;
        this.category = template.category;
        this.wizardName = template.wizardName;
        this.selected = template.selected;
    }

    protected getDefaultTemplateItemName(name : string, destPath : string, fs : any) : string {
        if ((!name) || (name == "") || (!destPath) || (destPath == ""))
            return name;
        let fullPath = path.join(destPath, name);
        if (!fs.existsSync(fullPath))
            return name;
        
        let number = 1;
        let nameParts = path.parse(name);
        
        name = nameParts.name + number.toString() + nameParts.ext; 
        fullPath = path.join(destPath, name);
        while ((fs.existsSync(fullPath)) && (number < 1000)) {
            number++;
            name = nameParts.name + number.toString() + nameParts.ext; 
            fullPath = path.join(destPath, name);
        }

        return name;
    }


}