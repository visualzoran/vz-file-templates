# VZ File Templates for Visual Studio Code

## Features

VZ File Templates extension adds single and multi-file templates to Visual Studio Code. It allows developer to select a template in a visual way, just like in the big Visual Studio. It can work in 2 modes - new project and new project item creation.

### Creating new project item from template 

To invoke template selection, simply right click on folder or file in vs code file explorer and choose "New File from Template" menu item.

![Template selection](resources/NewFileFromTemplate.gif)

### Creating new project from template

To create new project from template, go to command palette (Ctrl+Shift+P) and select/type "VZ File Templates: New Project From Template" command. If there is a workspace opened in VS Code, new project will be created in the root folder. If workspace is not open, template selection page will show target path field and "Create directory for project" checkbox allowing to create project subfolder in that folder. Default value of destination path can be entered into "vzfiletemplates.defaultProjectsFolder" setting.

### Templates

Templates are loaded from this extension resources and from user defined folders specified in "vzfiletemplates.userTemplatesFolders" setting. Sample setting can look like this one:

```
    "vzfiletemplates.userTemplatesFolders": [
        "d:\\vscode\\templates"
    ]
```

Relative paths will use current workspace root folder as the root.

It will also be possible to run additional wizard, specific to selected template in the next versions of this extension (i.e. show a page to collect asp.net view details and generate code).

New templates can also be added using another Visual Studio Code extension, 2 sample projects explaining how to do it can be found on GitHub. First one shows how to add simple templates and is available here:

https://github.com/visualzoran/vz-templates-sample-ext

Second one shows how to create multifile template that generates code and shows a wizard and is available here:

https://github.com/visualzoran/vs-template-wizardsample-ext


## Template definition

Each template has to be saved in a separate folder as template definition file has to be named "template.json". Basic, single file template requires 4 separate files: definition, template file, dark template icon and light template icon:
* definition - it is json file and it should always be names "template.json"
* template file - this is a file that will be used to create your file from the template. It is possible to use variables inside this file and they will be replaced with their values when files are created from the template.
* dark icon - template icon displayed when vs code uses dark color theme
* light icon - template icon displayed when vs code uses light color theme

New templates can be created manually, but they can also be created using template available under "Other" category:

![Creating new template from template](resources/newTemplate.gif)


### Template file

Here is sample "template.json" file:
```
{
    "name" : "TypeScript class",
    "description" : "New TypeScript class",
    "defaultName" : "NewClass.ts",
    "sortOrder" : "100",
    "category" : "TypeScript",
    "iconLight" : "icon-light.svg",
    "iconDark" : "icon-dark.svg",
    "elements" : [
        {
            "fileName" : "file.txt",
            "targetName" : "$itemname$.ts",
            "replaceParameters" : true,
            "open" : true
        }
    ],
    "isProject" : false,
    "command" : "",
    "commandParameters" : []
}
```

* "name" - contains template name displayed in template selection page
* "description" - contains longer description of the template and is displayed on the right side of template selection page when template is selected
* "defaultName" - default file name that will be used in "Name" text box in template selection page
* "sortOrder" - defines how templates should be ordered in template selection page
* "category" - specifies to which category displayed on the left side of template selection page template should be assigned
* "iconLight" - name of the file with the icon for light vs code theme
* "iconDark" - name of the file with the icon for dark vs code theme
* "elements" - list of template files, each entry can have these fields:
  * "fileName" - name of the source file 
  * "targetName" - name of the target file, you can use variables to make it dynamic
  * "replaceParameters" - if it is "true" then variables will be also replaced inside file content
  * "open" - if it is true or not specified, then file created from the template will be opened in vs code
* "isProject" - false for showing template in "new project item" selection, true for showing it in "new project" selection
* "command" - external command to be run after files are created
* "commandParameters" - array of string parameters passed to command, it can contain template variables 

### Template variables

At this moment only these variables are supported:
* $username$ - Current user name
* $workspacename$ - The name of the workspace you work in
* $workspacepath$ - full path to workspace directory
* $filefullpath$ - Full (absolute) path to the file, which will be created, based on template
* $dirfullpath$ - Full (absolute) path to the directory, where file will be created
* $filerelpath$ - Filepath, relative to the workspace directory
* $dirrelpath$ - destination directory path, relative to workspace directory
* $fileinputname$ - whole text entered into "Name" text box in template selection page
* $itemname$ - $fileinputname$ without file extension
* $safeitemname$ - $itemname$ with all non alphanumeric characters removed. It is usually used to specify class, function or variable name inside source files      
* $capitemname$ - capitalized $safeitemname$ - useful, when by coding style - file must be uncapitalized, but classname must be capitalized, and still - both of them must have the same name.
* $date$ - datestring, according to your default locale
* $year$ - Current year (1992, 2018 etc...)
* $month$ - Current month (as number: 1, 2, 3...)
* $month_name_full$ - Full name of the month (January, February, March...)
* $month_name_short$ - First three characters of the month name (Jan, Feb, Mar...)
* $day$ - Current day of the month
* $time$ - Current time according to your default locale
* $hours$ - Current hour (24h format)
* $minutes$ - Current minute
* $seconds$ - Current seconds
* $workspace$ - The name of the workspace you work in

## Extension Settings

This extension contributes the following settings:
* `vzfiletemplates.userTemplatesFolders`: array of paths to folders containing user templates. Template manager scans all subfolders in these locations, so the only reason to specify more than one entry here is when templates are stored in completely separate folders (i.e. user templates and team templates)
* `vzfiletemplates.langServerProxyFolder`: folder for temporary files used to discover workspace symbols. When one of file wizards needs to get list of symbols from current workspace (i.e. list of classes or class fields to display them on screen), temporary file with a bit of code will be created in this folder and then code completion request will be send to the language server. After that call, file will be cleared, so no code will be left there.
* `vzfiletemplates.userTemplateVariables`: object to define workspace or user dependent variables. You can define variable as `{"varName>":"varValue"}`, and then - use it in your template just as `$varName$` to substitute your value.
* `vzfiletemplates.pathConversion`: how template must convert paths for substitution. For instance - you are working under Windows OS on a project, which is designed for Linux OS. If you leave the paths 'as is' it will appear in template with Win32 path separator characters `\\` (because all of the paths resolved on Windows). It's not aesthetic. So this option could specify: `posix` - convert all paths to Unix style; `win32` - convert all paths to Windows style; `leave` - leave 'as is' (default)
* `vzfiletemplates.customVariablesConstructor`: path to javascript file, which must return object with the generated variables. It is useful, when you need the combinations of variables by some logic, or if you need to calculate some variable value depending on some conditions, or just use javascript for variable construction. Just... Use your fantasy). Could be absolute path or relative to current workspace root dir (if you need own constructor for each project). Usage examples see below..
* `vzfiletemplates.defaultProjectsFolder`: default path for new projects created by "New Project from Template" command, when there is no open workspace in VS Code.

## Tips and tricks with template variables

### Variables overriding

All built in variables could be overridden with `vzfiletemplates.userTemplateVariables` option in user settings or workspace settings.

For instance - your project has a name: `My Awesome Project`. But for some kind of reason - the name of the workspace, you are using named as `MyAwesomeProject_test_integration` or any... To be sure, that template will resolve the 'right' name of the project you could override this value by your own in settings section of workspace (file ``<projRoot>/.vscode/settings.json``):

```json
{
    ...
    "vzfiletemplates.userTemplateVariables": {
        "workspacename":"My Awesome Project"
    },
    ...
}
```

### Own variables constructor

`vzfiletemplates.customVariablesConstructor` option could provide an ability to create your own custom js file to calculate own template variables.

To do so - just specify this option in your userconfig or in workspace config json file as a path to `*.js` file, which will return it:

For instance: in your ``<projRoot>/.vscode/settings.json``:

```json
{
    ...
    "vzfiletemplates.customVariablesConstructor": {
        "workspacename":"./.vscode/customVars.js" // <-- path here - relative to the workspace (e.g - relative to the root of your repo (mostly:-))
    },
    ...
}
```

Then in file ``<projRoot>/.vscode/customVars.js``:

```javascript
// this how you could retrieve all of the variables, merged from built in list and custom variables, specified in configs
const variables = global.vzfiletemplates.variables;

module.exports={
    myAwesomeVar: `My very awesome variable in project ${variables.workspacename}`,
    // also here could be overriden any variablle (both built in or configurable custom var)
    myVariableAtUserConfig: "newValue",
    workspacepath: "/"
};
```

Then - you could use these variables by it's names in your templates.

> [NOTE] - Be careful with long operations in custom constructor files - it may cause extension not very usable)
> [Other NOTE] - You could use only native JS in custom constructor file, and no dependency)))

## Contributors

- dmitribatulin

## Release Notes

## 0.0.7
 - List of templates split into 2 separate areas - project items and projects
 - New command "New Project" added
 - If "New Project" is run when there is no open workspace in vs code, users can select destination folder where project will be generated.
 - Added support for commands that can be executed by a template

## 0.0.6
 - Another big "thank you" should go to dmitribatulin for these changes:
   - Added support for unexisting paths in templates.json#elements[].targetName option 
     (paths will be automatically ensured)
   - [FIX] - fixed $day$ variable value

## 0.0.5
 - A few changes made by dmitribatulin:
   - New variables added to template engine
   - Ability to define custom JavaScript file to create new variables
   - Ability to define user variables in VS Code settings
   - README update

### 0.0.4
 - Relative path support added by dmitribatulin

### 0.0.3
 - VS Code themes support issue fixed (reported by nealot) 
 - Keyboard navigation added

### 0.0.2
- ENTER key in file name text box selects template
- Template selector remembers last selected template
- getImputNameVariable was returning empy string instead of $itemname$ variable

### 0.0.1
- Initial release
