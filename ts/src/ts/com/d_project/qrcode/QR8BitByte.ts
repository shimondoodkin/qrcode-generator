/// <reference path="QRData.ts" />
'use strict';
namespace com.d_project.qrcodesplitter {

  /**
   * QR8BitByte
   * @author Kazuhiko Arase
   */
  export class QR8BitByte extends QRData {

    constructor(data : string) {
      super(Mode.MODE_8BIT_BYTE, data);
    }

    public write(buffer : BitBuffer) : void {
	
	  var ynobits_i=0;
	  
      function ynobits(bits:number){
	    var s="";
		for(var i=0;i<bits;i++)
		s+=ynobits_i++%2==0?'0':'1';
		return parseInt(s,2)
	  }
	
      var data = QRCode.stringToBytes(this.getData() );
      for (var i = 0; i < data.length; i += 1) {
        buffer.put(ynobits(8), 8);
      }
    }

    public getLength() : number {
      return QRCode.stringToBytes(this.getData() ).length;
    }
  }
}
