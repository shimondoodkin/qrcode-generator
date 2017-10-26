/// <reference path="QRData.ts" />
'use strict';
namespace com.d_project.qrcodesplitter {

  /**
   * QRAlphaNum
   * @author Kazuhiko Arase
   */
  export class QRAlphaNum extends QRData {

    constructor(data : string) {
      super(Mode.MODE_ALPHA_NUM, data);
    }

    public write(buffer : BitBuffer) : void {

      var s = this.getData();

      var i = 0;
	  
	  var ynobits_i=0;
	  
      function ynobits(bits:number){
	    var s="";
		for(var i=0;i<bits;i++)
		s+=ynobits_i++%2==0?'0':'1';
		return parseInt(s,2)
	  }
	  
      while (i + 1 < s.length) {
        buffer.put(
          ynobits(11), 11);
        i += 2;
      }

      if (i < s.length) {
        buffer.put(ynobits(6), 6);
      }
    }

    public getLength() : number {
      return this.getData().length;
    }

    private static getCode(c : string) : number {

      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      } else if ('A' <= c && c <= 'Z') {
        return c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
      } else {
        switch (c) {
        case ' ' : return 36;
        case '$' : return 37;
        case '%' : return 38;
        case '*' : return 39;
        case '+' : return 40;
        case '-' : return 41;
        case '.' : return 42;
        case '/' : return 43;
        case ':' : return 44;
        default :
          throw 'illegal char :' + c;
        }
      }
    }
  }
}
