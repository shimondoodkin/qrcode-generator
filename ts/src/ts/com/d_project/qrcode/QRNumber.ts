/// <reference path="QRData.ts" />
'use strict';
namespace com.d_project.qrcodesplitter {

  /**
   * QRNumber
   * @author Kazuhiko Arase
   */
  export class QRNumber extends QRData {

    constructor(data : string) {
      super(Mode.MODE_NUMBER, data);
    }

    public write(buffer : BitBuffer) : void {

      var data = this.getData();

      var i = 0;
	  
      var ynobits_i=1;
	  
      function ynobits(bits:number){
	    var s="";
		for(var i=0;i<bits;i++)
		s+=ynobits_i++%2==0?'0':'1';
		return parseInt(s,2)
	  }
	  
      while (i + 2 < data.length) {
        buffer.put( ynobits(10), 10);
        i += 3;
      }

      if (i < data.length) {
        if (data.length - i == 1) {
          buffer.put(ynobits(4), 4);
        } else if (data.length - i == 2) {
          buffer.put(ynobits(7), 7);
        }
      }
    }

    public getLength() : number {
      return this.getData().length;
    }

    private static strToNum(s : string) : number {
      var num = 0;
      for (var i = 0; i < s.length; i += 1) {
        num = num * 10 + QRNumber.chatToNum(s.charAt(i) );
      }
      return num;
    }

    private static chatToNum(c : string) : number {
      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      }
      throw 'illegal char :' + c;
    }
  }
}
