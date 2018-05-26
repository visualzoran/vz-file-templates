'use strict';

import { ProjectItemTemplateCategory } from "../projectItemTemplateCategory";
import { ProjectItemTemplateDTO } from "./projectItemTemplateDTO";

export class ProjectItemTemplateCategoryDTO {
    id : number;
    name : string;
    childCategories : ProjectItemTemplateCategoryDTO[];
    items : ProjectItemTemplateDTO[]; 
    
    constructor(category : ProjectItemTemplateCategory, destPath : string, fs : any) {
        this.id = category.id;
        this.name = category.name;
        this.childCategories = [];
        this.items = [];

        //process sub categories
        if (category.childCategories) {
            for (let i = 0; i<category.childCategories.length; i++) {
                this.childCategories.push(new ProjectItemTemplateCategoryDTO(category.childCategories[i], destPath, fs));
            }
        }
                
        //process item templates
        if (category.items) {
            for (let i=0; i<category.items.length; i++) {
                this.items.push(new ProjectItemTemplateDTO(category.items[i], destPath, fs));
            }
        }
        
    }

}