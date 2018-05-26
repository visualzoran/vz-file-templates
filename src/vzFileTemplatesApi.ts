'use strict';

import { ProjectItemTemplateManager } from "./templates/projectItemTemplateManager";

export class VzFileTemplatesApi {
    templateManager : ProjectItemTemplateManager;

    constructor(newTemplateManager : ProjectItemTemplateManager) {
        this.templateManager = newTemplateManager;
    }

}