'use strict';

export class ProjectItemTemplateElement {
    fileName : string;
    targetName : string;
    replaceParameters : boolean;
    encoding : string;
    open : boolean;

    constructor() {
        this.fileName = "";
        this.targetName = "";
        this.replaceParameters = false;
        this.encoding = "";
        this.open = true;
    }

    copyFromAny(content : any) : boolean {
        this.fileName = content.fileName;
        this.targetName = content.targetName;
        this.replaceParameters = content.replaceParameters;
        this.encoding = content.encoding;
        if (content.open !== undefined)
            this.open = content.open;
        else
            this.open = true;
        return true;
    }

}