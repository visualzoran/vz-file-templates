'use strict';

namespace vzFileTemplates {

    export interface IProjectItemTemplateRunSettings {
        destPath : string;
        getTextReplacement(key : string) : string;
        setTextReplacement(key : string, value : string) : void;
        getInputNameVariable() : string;
        getFileInputNameVariable() : string;
        applyReplacements(value : string) : string;
    }

    export interface IProjectItemTemplate {
        run(settings : IProjectItemTemplateRunSettings) : boolean;
    }

    export interface IProjectItemWizard {
        getName() : string;
        run(template : IProjectItemTemplate, settings : IProjectItemTemplateRunSettings) : void;
    }

    export interface IVZFileTemplatesApi {
        registerTemplatesFolder(folderPath : string) : void;
        registerWizard(wizard : IProjectItemWizard) : void;
    }

}