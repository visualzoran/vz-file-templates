'use strict';

import { StringReplacement } from "./stringReplacement";

/**
 * Class containing a set of static string processing functions
 */
export class StringHelper {

    static toSafeName(text : string) : string {
        text = text.replace(/[^a-z0-9+]+/gi, '');
        text = text.replace(/^[0-9]*/, '');
        return text;
    }

    static replaceText(text : string, replacements : StringReplacement[]) : string {
        let pos : number = 0;
        while (pos < text.length) {
            //try to find first string replacement
            let repl : StringReplacement | null = null;
            
            let replPos : number = text.length;
            for (let i=0; i<replacements.length; i++) {
                let newReplPos = text.indexOf(replacements[i].oldText, pos);
                if ((newReplPos >= 0) && (newReplPos < replPos)) {
                    repl = replacements[i];
                    replPos = newReplPos;
                }
            }

            //run replacement
            if (repl != null) {
                text = text.substr(0, replPos) + repl.newText + text.substr(replPos + repl.oldText.length);
                pos = replPos + repl.newText.length;
            } else {
                pos = text.length;
            }
        }
        return text;
    }

}