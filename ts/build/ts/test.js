///<reference path="com/d_project/image/GIFImage" />
///<reference path="com/d_project/io/Base64" />
///<reference path="com/d_project/io/Base64DecodeInputStream" />
///<reference path="com/d_project/io/Base64EncodeOutputStream" />
///<reference path="com/d_project/io/ByteArrayInputStream" />
///<reference path="com/d_project/io/ByteArrayOutputStream" />
///<reference path="com/d_project/io/InputStream" />
///<reference path="com/d_project/io/OutputStream" />
///<reference path="com/d_project/qrcodesplitter/BitBuffer" />
///<reference path="com/d_project/qrcodesplitter/ErrorCorrectLevel" />
///<reference path="com/d_project/qrcodesplitter/MaskPattern" />
///<reference path="com/d_project/qrcodesplitter/Mode" />
///<reference path="com/d_project/qrcodesplitter/Polynomial" />
///<reference path="com/d_project/qrcodesplitter/QR8BitByte" />
///<reference path="com/d_project/qrcodesplitter/QRAlphaNum" />
///<reference path="com/d_project/qrcodesplitter/QRCode" />
///<reference path="com/d_project/qrcodesplitter/QRData" />
///<reference path="com/d_project/qrcodesplitter/QRKanji" />
///<reference path="com/d_project/qrcodesplitter/QRMath" />
///<reference path="com/d_project/qrcodesplitter/QRNumber" />
///<reference path="com/d_project/qrcodesplitter/QRUtil" />
///<reference path="com/d_project/qrcodesplitter/RSBlock" />
///<reference path="com/d_project/text/createStringToBytes" />
///<reference path="com/d_project/text/stringToBytes_SJIS" />
///<reference path="com/d_project/text/stringToBytes_UTF8" />
'use strict';
var test;
(function (test) {
    var QRCode = com.d_project.qrcodesplitter.QRCode;
    var ErrorCorrectLevel = com.d_project.qrcodesplitter.ErrorCorrectLevel;
    var QRNumber = com.d_project.qrcodesplitter.QRNumber;
    var QRAlphaNum = com.d_project.qrcodesplitter.QRAlphaNum;
    var QR8BitByte = com.d_project.qrcodesplitter.QR8BitByte;
    var QRKanji = com.d_project.qrcodesplitter.QRKanji;
    function run() {
        // uncomment if UTF-8 support is required.
        //QRCode.stringToBytes = com.d_project.text.stringToBytes_UTF8;
        var qr = new QRCode();
        qr.setTypeNumber(5);
        qr.setErrorCorrectLevel(ErrorCorrectLevel.L);
        qr.addData(new QRNumber('0123')); // Number only
        qr.addData(new QRAlphaNum('AB5678CD')); // Alphabet and Number
        qr.addData(new QR8BitByte('[8BitByte :)]')); // most useful for usual purpose.
        qr.addData('[here is 8BitByte too]');
        qr.addData(new QRKanji('漢字')); // Kanji(SJIS) only
        qr.make();
        // img
        var img = document.createElement('img');
        img.setAttribute('src', qr.toDataURL());
        document.body.appendChild(img);
        // canvas
        document.body.appendChild(createCanvas(qr, 2));
    }
    test.run = run;
    function createCanvas(qr, cellSize, margin) {
        if (cellSize === void 0) { cellSize = 2; }
        if (margin === void 0) { margin = cellSize * 4; }
        var canvas = document.createElement('canvas');
        var size = qr.getModuleCount() * cellSize + margin * 2;
        canvas.width = size;
        canvas.height = size;
        var ctx = canvas.getContext('2d');
        // fill background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        // draw cells
        ctx.fillStyle = '#000000';
        for (var row = 0; row < qr.getModuleCount(); row += 1) {
            for (var col = 0; col < qr.getModuleCount(); col += 1) {
                if (qr.isDark(row, col)) {
                    ctx.fillRect(col * cellSize + margin, row * cellSize + margin, cellSize, cellSize);
                }
            }
        }
        return canvas;
    }
})(test || (test = {}));
window.onload = function () {
    test.run();
};
