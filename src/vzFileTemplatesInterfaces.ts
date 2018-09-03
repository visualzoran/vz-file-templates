'use strict';

declare module 'vz-file-templates' {

    export interface IProjectItemTemplateRunSettings {
        destPath : string;
        getTextReplacement(key : string) : string;
        setTextReplacement(key : string, value : string) : void;
        getInputNameVariable() : string;
        getFileInputNameVariable() : string;
        applyReplacements(value : string) : string;
        outputChannel : ITemplateOutputChannel;
        command : string;
        commandParameters : string[];
        setCommand(newCommand : string, newCommandParameters : string[]) : void;
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

    export interface ITemplateOutputChannel {
        write(value : string) : void;
        writeLine(value : string) : void;
        show() : void;
        hide() : void;
    }

}