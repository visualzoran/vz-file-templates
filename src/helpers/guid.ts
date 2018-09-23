'use strict';

export class Guid {
    protected _value : string;

    constructor() {
        this._value = this.newGuid();
    }

    format(formatType : string) : string {
        switch (formatType) {
            case "N":
                return this._value.substr(0, 8) +
                    this._value.substr(9,4) + 
                    this._value.substr(14,4) + 
                    this._value.substr(19,4) + 
                    this._value.substr(24,12); 
            case "B":
                return "{" + this._value + "}";
            case "P":
                return "(" + this._value + ")";
            case "X":
                return "{0x" + this._value.substr(0, 8) +
                    ", 0x" + this._value.substr(9, 4) +
                    ", 0x" + this._value.substr(14, 4) + 
                    "{0x" + this._value.substr(19, 2) +
                    ", 0x" + this._value.substr(21,2) + 
                    ", 0x" + this._value.substr(24,2) + 
                    ", 0x" + this._value.substr(26,2) + 
                    ", 0x" + this._value.substr(28,2) + 
                    ", 0x" + this._value.substr(30,2) + 
                    ", 0x" + this._value.substr(32,2) + 
                    ", 0x" + this._value.substr(34,2) + 
                    "}}";
            case "D":
                return this._value;
        }
        return this._value;
    }

    protected newGuid() : string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }

} 
