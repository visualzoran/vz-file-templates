'use strict';

import { ProjectItemTemplate } from "./projectItemTemplate";

export class ProjectItemTemplateCategory {
    id : number;
    name : string;
    childCategories : ProjectItemTemplateCategory[];
    items : ProjectItemTemplate[];

    constructor() {
        this.id = 0;
        this.name = "";
        this.childCategories = [];
        this.items = [];
    }

    findOrCreateChildCategory(categoryName : string) {
        for (let i=0; i<this.childCategories.length;i++) {
            if (this.childCategories[i].name == categoryName)
                return this.childCategories[i];
        }
        let childCategory : ProjectItemTemplateCategory = new ProjectItemTemplateCategory();
        childCategory.name = categoryName;
        this.childCategories.push(childCategory);
        return childCategory;
    }

    assignCategoryIds(newid : number) : number {
        this.id = newid;
        newid++;
        if (this.childCategories) {
            for (let i=0; i<this.childCategories.length;i++) {
                newid = this.childCategories[i].assignCategoryIds(newid);
            }
        }
        return newid;
    }

    assignItemsIds(newid : number) : number {
        //assign items ids
        if (this.items) {
            for (let i=0; i<this.items.length; i++) {
                this.items[i].id = newid;
                newid++;
            }
        }
        //assign subcategories items ids
        if (this.childCategories) {
            for (let i=0; i<this.childCategories.length;i++) {
                newid = this.childCategories[i].assignItemsIds(newid);
            }
        }
        return newid;
    }

    findTemplate(id : number) : ProjectItemTemplate | undefined {
        if (this.items) {
            for (let i=0; i<this.items.length; i++) {
                if (this.items[i].id == id)
                    return this.items[i];
            }
        }

        if (this.childCategories) {
            for (let i=0; i<this.childCategories.length; i++) {
                let template = this.childCategories[i].findTemplate(id);
                if (template)
                    return template;
            }
        }

        return undefined;
    }

}