"use strict";
import * as vscode from "vscode";
import * as path from "path";
import * as fs from 'fs';
/**
 * Helper class to resolve paths in templates substitutions, basing on user options
 *
 * @export
 * @class PathHelper
 */
export class PathHelper {
  /**
   * Holder for the user option of how to convert paths
   *
   * @protected
   * @static
   * @type {('posix'|'win32'|'leave')}
   * @memberOf PathHelper
   */
  protected static PATH_CONVERSION_TYPE: string =
    vscode.workspace
      .getConfiguration("vzfiletemplates")
      .get("pathConversion") || "leave";
  /**
   * Function to resolve path for template substitution, depending on user settings
   *
   * @static
   * @param {string} pathToResolve - path, which must be resolved
   * @returns {string} - resolved path
   *
   * @memberOf PathHelper
   */
  static resolvePath(pathToResolve: string): string {

    if (PathHelper.PATH_CONVERSION_TYPE === "leave") {
      return pathToResolve;
    }
    return pathToResolve
      .split(path.sep)
      .join((path as any)[PathHelper.PATH_CONVERSION_TYPE].sep);
  }

  /**
   * Function to ensure dir path recursively
   * 
   * @static
   * @param {string} dirPath - directory path to ensure
   * @param {(string|null)} [res] - [INTERNAL] result of previous operation in recursive chain
   * @returns {(string|null)} 
   * 
   * @example PathHelper.ensureDirPath('/this/path/exists/../but/this/one/is/not');
   * 
   * @memberOf PathHelper
   */
  static ensureDirPath(dirPath:string, res?:string|null):string|null {
    var mode = parseInt('0777', 8) & (~process.umask());
    if (!res) res = null;
    dirPath = path.resolve(dirPath);
    try {
      fs.mkdirSync(dirPath, mode);
      res = res || dirPath;
    } catch (e) {
      switch (e.code) {
        case "ENOENT":
          res = PathHelper.ensureDirPath(path.dirname(dirPath), res);
          PathHelper.ensureDirPath(dirPath, res);
          break;
        default:
          var stat;
          try {
            stat = fs.statSync(dirPath);
          } catch (_) {
            throw e;
          }
          if (!stat.isDirectory()) throw e;
          break;
      }
    }
    return res;
  }
}
