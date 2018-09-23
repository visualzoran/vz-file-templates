# Change Log

## 1.0.2
  - Updated node packages references
  - Extension requires Visual Studio Code 1.26.0 now
  - template.json file schema added, so VSCode shows descriptions of template file properties
  - New $guid$ template variable added

## 1.0.1
  - Template allows to specify list of names of files that should be opened at the end of processing. It can be used if files are created by external command.
  - ITemplateRunSettingsProcessor interface added. It allows to  implement additional logic populating template variables in dependent extensions. 

## 1.0.0
  - It seems that extension has enough basic functionality, so it can finally be called "version 1.0.0"
  - Empty "vzfiletemplates.defaultProjectsFolder" setting was breaking new project wizard

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
   - New variables added to the template engine
   - Ability to define custom JavaScript file to create new variables
   - Ability to define user variables in VS Code settings
   - README update

## 0.0.4
 - Relative path support added by dmitribatulin

## 0.0.3
 - VS Code themes support issue fixed (reported by nealot) 
 - Keyboard navigation added

## 0.0.2
- ENTER key in file name text box selects template
- Template selector remembers last selected template
- getImputNameVariable was returning empy string instead of $itemname$ variable

## 0.0.1
- Initial release
