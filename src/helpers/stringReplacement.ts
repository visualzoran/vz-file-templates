'use strict';

/**
 * Information about single string replacement
 */
export class StringReplacement {
    oldText : string;
    newText : string;

    constructor(oldTextValue : string, newTextValue : string) {
        this.oldText = oldTextValue;
        this.newText = newTextValue;
    }

}