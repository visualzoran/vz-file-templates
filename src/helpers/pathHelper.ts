'use strict';
import * as vscode from 'vscode';
import * as path from 'path';

/**
 * Helper class to resolve paths in templates substitutions, basing on user options
 * 
 * @export
 * @class PathHelper
 */
export class PathHelper{
  /**
   * Holder for the user option of how to convert paths
   * 
   * @protected
   * @static
   * @type {('posix'|'win32'|'leave')}
   * @memberOf PathHelper
   */
  protected static PATH_CONVERSION_TYPE: string = vscode.workspace.getConfiguration('vzfiletemplates').get('pathConversion') || "leave";
  /**
   * Function to resolve path for template substitution, depending on user settings
   * 
   * @static
   * @param {string} pathToResolve - path, which must be resolved
   * @returns {string} - resolved path
   * 
   * @memberOf PathHelper
   */
  static resolvePath(pathToResolve:string): string{
    if(PathHelper.PATH_CONVERSION_TYPE==='leave'){
      return pathToResolve;
    }
    return pathToResolve.split(path.sep).join((path as any)[PathHelper.PATH_CONVERSION_TYPE].sep);
  }
}