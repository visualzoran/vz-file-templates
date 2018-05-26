'use strict';

import * as vscode from 'vscode';
import { ProjectItemTemplate } from './projectItemTemplate';
import { ProjectItemTemplateRunSettings } from './projectItemTemplateRunSettings';
import { BaseWebViewEditor } from '../webviews/baseWebViewEditor';

export class ProjectItemWizard extends BaseWebViewEditor {
    protected _template : ProjectItemTemplate;
    protected _templateRunSettings : ProjectItemTemplateRunSettings;

    constructor(context : vscode.ExtensionContext, title : string, template : ProjectItemTemplate, settings : ProjectItemTemplateRunSettings) {
        super(context, title);
        this._template = template;
        this._templateRunSettings = settings;
    }

    protected processWebViewMessage(message : any) : boolean {
        if (super.processWebViewMessage(message))
            return true;

        switch (message.command) {
            case 'finishClick':
                this.onFinish(message.data);
                return true;
            case 'cancelClick':
                this.onCancel();
                return true;
        }
        
        return false;
    }

    protected finishWizard(data : any) : boolean {
        return false;
    }

    protected onFinish(data : any) {
        if (this.finishWizard(data))
            this.close();
    }

    protected onCancel() {
        this.close();
    }

}