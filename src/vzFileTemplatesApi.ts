'use strict';

import { ProjectItemTemplateManager } from "./templates/projectItemTemplateManager";

export class VzFileTemplatesApi {
    protected _templateManager : ProjectItemTemplateManager;

    constructor(newTemplateManager : ProjectItemTemplateManager) {
        this._templateManager = newTemplateManager;
    }

    public registerTemplatesFolder(folderPath : string) {
        this._templateManager.registerTemplatesFolder(folderPath);
    }

}