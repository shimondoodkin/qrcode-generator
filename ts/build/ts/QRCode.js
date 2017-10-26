'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var com;
(function (com) {
    var d_project;
    (function (d_project) {
        var io;
        (function (io) {
            var OutputStream = (function () {
                function OutputStream() {
                }
                OutputStream.prototype.writeBytes = function (bytes) {
                    for (var i = 0; i < bytes.length; i += 1) {
                        this.writeByte(bytes[i]);
                    }
                };
                OutputStream.prototype.flush = function () {
                };
                OutputStream.prototype.close = function () {
                    this.flush();
                };
                return OutputStream;
            }());
            io.OutputStream = OutputStream;
        })(io = d_project.io || (d_project.io = {}));
    })(d_project = com.d_project || (com.d_project = {}));
})(com || (com = {}));
var com;
(function (com) {
    var d_project;
    (function (d_project) {
        var io;
        (function (io) {
            var ByteArrayOutputStream = (function (_super) {
                __extends(ByteArrayOutputStream, _super);
                function ByteArrayOutputStream() {
                    var _this = _super.call(this) || this;
                    _this.bytes = [];
                    return _this;
                }
                ByteArrayOutputStream.prototype.writeByte = function (b) {
                    this.bytes.push(b);
                };
                ByteArrayOutputStream.prototype.toByteArray = function () {
                    return this.bytes;
                };
                return ByteArrayOutputStream;
            }(io.OutputStream));
            io.ByteArrayOutputStream = ByteArrayOutputStream;
        })(io = d_project.io || (d_project.io = {}));
    })(d_project = com.d_project || (com.d_project = {}));
})(com || (com = {}));
var com;
(function (com) {
    var d_project;
    (function (d_project) {
        var io;
        (function (io) {
            var Base64 = (function () {
                function Base64() {
                    throw 'error';
                }
                Base64.encode = function (data) {
                    var bout = new io.ByteArrayOutputStream();
                    try {
                        var ostream = new io.Base64EncodeOutputStream(bout);
                        try {
                            ostream.writeBytes(data);
                        }
                        finally {
                            ostream.close();
                        }
                    }
                    finally {
                        bout.close();
                    }
                    return bout.toByteArray();
                };
                Base64.decode = function (data) {
                    var bout = new io.ByteArrayOutputStream();
                    try {
                        var istream = new io.Base64DecodeInputStream(new io.ByteArrayInputStream(data));
                        try {
                            var b;
                            while ((b = istream.readByte()) != -1) {
                                bout.writeByte(b);
                            }
                        }
                        finally {
                            istream.close();
                        }
                    }
                    finally {
                        bout.close();
                    }
                    return bout.toByteArray();
                };
                return Base64;
            }());
            io.Base64 = Base64;
        })(io = d_project.io || (d_project.io = {}));
    })(d_project = com.d_project || (com.d_project = {}));
})(com || (com = {}));
var com;
(function (com) {
    var d_project;
    (function (d_project) {
        var image;
        (function (image) {
            var ByteArrayOutputStream = com.d_project.io.ByteArrayOutputStream;
            var Base64 = com.d_project.io.Base64;
            var GIFImage = (function () {
                function GIFImage(width, height) {
                    this.width = width;
                    this.height = height;
                    var size = width * height;
                    this.data = [];
                    for (var i = 0; i < size; i += 1) {
                        this.data.push(0);
                    }
                }
                GIFImage.prototype.setPixel = function (x, y, pixel) {
                    if (x < 0 || this.width <= x)
                        throw '!' + x;
                    if (y < 0 || this.height <= y)
                        throw '!' + y;
                    this.data[y * this.width + x] = pixel;
                };
                GIFImage.prototype.getPixel = function (x, y) {
                    if (x < 0 || this.width <= x)
                        throw '!' + x;
                    if (y < 0 || this.height <= y)
                        throw '!' + y;
                    return this.data[y * this.width + x];
                };
                GIFImage.prototype.write = function (out) {
                    out.writeByte('G'.charCodeAt(0));
                    out.writeByte('I'.charCodeAt(0));
                    out.writeByte('F'.charCodeAt(0));
                    out.writeByte('8'.charCodeAt(0));
                    out.writeByte('7'.charCodeAt(0));
                    out.writeByte('a'.charCodeAt(0));
                    this.writeWord(out, this.width);
                    this.writeWord(out, this.height);
                    out.writeByte(0x80);
                    out.writeByte(0);
                    out.writeByte(0);
                    out.writeByte(0x00);
                    out.writeByte(0x00);
                    out.writeByte(0x00);
                    out.writeByte(0xff);
                    out.writeByte(0xff);
                    out.writeByte(0xff);
                    out.writeByte(','.charCodeAt(0));
                    this.writeWord(out, 0);
                    this.writeWord(out, 0);
                    this.writeWord(out, this.width);
                    this.writeWord(out, this.height);
                    out.writeByte(0);
                    var lzwMinCodeSize = 2;
                    var raster = this.getLZWRaster(lzwMinCodeSize);
                    out.writeByte(lzwMinCodeSize);
                    var offset = 0;
                    while (raster.length - offset > 255) {
                        out.writeByte(255);
                        this.writeBytes(out, raster, offset, 255);
                        offset += 255;
                    }
                    out.writeByte(raster.length - offset);
                    this.writeBytes(out, raster, offset, raster.length - offset);
                    out.writeByte(0x00);
                    out.writeByte(';'.charCodeAt(0));
                };
                GIFImage.prototype.getLZWRaster = function (lzwMinCodeSize) {
                    var clearCode = 1 << lzwMinCodeSize;
                    var endCode = (1 << lzwMinCodeSize) + 1;
                    var bitLength = lzwMinCodeSize + 1;
                    var table = new LZWTable();
                    for (var i = 0; i < clearCode; i += 1) {
                        table.add(String.fromCharCode(i));
                    }
                    table.add(String.fromCharCode(clearCode));
                    table.add(String.fromCharCode(endCode));
                    var byteOut = new ByteArrayOutputStream();
                    var bitOut = new BitOutputStream(byteOut);
                    try {
                        bitOut.write(clearCode, bitLength);
                        var dataIndex = 0;
                        var s = String.fromCharCode(this.data[dataIndex]);
                        dataIndex += 1;
                        while (dataIndex < this.data.length) {
                            var c = String.fromCharCode(this.data[dataIndex]);
                            dataIndex += 1;
                            if (table.contains(s + c)) {
                                s = s + c;
                            }
                            else {
                                bitOut.write(table.indexOf(s), bitLength);
                                if (table.getSize() < 0xfff) {
                                    if (table.getSize() == (1 << bitLength)) {
                                        bitLength += 1;
                                    }
                                    table.add(s + c);
                                }
                                s = c;
                            }
                        }
                        bitOut.write(table.indexOf(s), bitLength);
                        bitOut.write(endCode, bitLength);
                    }
                    finally {
                        bitOut.close();
                    }
                    return byteOut.toByteArray();
                };
                GIFImage.prototype.writeWord = function (out, i) {
                    out.writeByte(i & 0xff);
                    out.writeByte((i >>> 8) & 0xff);
                };
                GIFImage.prototype.writeBytes = function (out, bytes, off, len) {
                    for (var i = 0; i < len; i += 1) {
                        out.writeByte(bytes[i + off]);
                    }
                };
                GIFImage.prototype.toDataURL = function () {
                    var bout = new ByteArrayOutputStream();
                    this.write(bout);
                    bout.close();
                    var s = '';
                    var bytes = Base64.encode(bout.toByteArray());
                    for (var i = 0; i < bytes.length; i += 1) {
                        s += String.fromCharCode(bytes[i]);
                    }
                    return 'data:image/gif;base64,' + s;
                };
                return GIFImage;
            }());
            image.GIFImage = GIFImage;
            var LZWTable = (function () {
                function LZWTable() {
                    this.map = {};
                    this.size = 0;
                }
                LZWTable.prototype.add = function (key) {
                    if (this.contains(key)) {
                        throw 'dup key:' + key;
                    }
                    this.map[key] = this.size;
                    this.size += 1;
                };
                LZWTable.prototype.getSize = function () {
                    return this.size;
                };
                LZWTable.prototype.indexOf = function (key) {
                    return this.map[key];
                };
                LZWTable.prototype.contains = function (key) {
                    return typeof this.map[key] != 'undefined';
                };
                return LZWTable;
            }());
            var BitOutputStream = (function () {
                function BitOutputStream(out) {
                    this.out = out;
                    this.bitLength = 0;
                }
                BitOutputStream.prototype.write = function (data, length) {
                    if ((data >>> length) != 0) {
                        throw 'length over';
                    }
                    while (this.bitLength + length >= 8) {
                        this.out.writeByte(0xff &
                            ((data << this.bitLength) | this.bitBuffer));
                        length -= (8 - this.bitLength);
                        data >>>= (8 - this.bitLength);
                        this.bitBuffer = 0;
                        this.bitLength = 0;
                    }
                    this.bitBuffer = (data << this.bitLength) | this.bitBuffer;
                    this.bitLength = this.bitLength + length;
                };
                BitOutputStream.prototype.flush = function () {
                    if (this.bitLength > 0) {
                        this.out.writeByte(this.bitBuffer);
                    }
                    this.out.flush();
                };
                BitOutputStream.prototype.close = function () {
                    this.flush();
                    this.out.close();
                };
                return BitOutputStream;
            }());
        })(image = d_project.image || (d_project.image = {}));
    })(d_project = com.d_project || (com.d_project = {}));
})(com || (com = {}));
var com;
(function (com) {
    var d_project;
    (function (d_project) {
        var io;
        (function (io) {
            var InputStream = (function () {
                function InputStream() {
                }
                InputStream.prototype.close = function () {
                };
                return InputStream;
            }());
            io.InputStream = InputStream;
        })(io = d_project.io || (d_project.io = {}));
    })(d_project = com.d_project || (com.d_project = {}));
})(com || (com = {}));
var com;
(function (com) {
    var d_project;
    (function (d_project) {
        var io;
        (function (io) {
            var Base64DecodeInputStream = (function (_super) {
                __extends(Base64DecodeInputStream, _super);
                function Base64DecodeInputStream(istream) {
                    var _this = _super.call(this) || this;
                    _this.istream = istream;
                    _this.buffer = 0;
                    _this.buflen = 0;
                    return _this;
                }
                Base64DecodeInputStream.prototype.readByte = function () {
                    while (this.buflen < 8) {
                        var c = this.istream.readByte();
                        if (c == -1) {
                            if (this.buflen == 0) {
                                return -1;
                            }
                            throw 'unexpected end of file./' + this.buflen;
                        }
                        else if (c == '='.charCodeAt(0)) {
                            this.buflen = 0;
                            return -1;
                        }
                        else if (Base64DecodeInputStream.isWhitespace(c)) {
                            continue;
                        }
                        this.buffer = (this.buffer << 6) |
                            Base64DecodeInputStream.decode(c);
                        this.buflen += 6;
                    }
                    var n = (this.buffer >>> (this.buflen - 8)) & 0xff;
                    this.buflen -= 8;
                    return n;
                };
                Base64DecodeInputStream.isWhitespace = function (c) {
                    return c == '\v'.charCodeAt(0) ||
                        c == '\t'.charCodeAt(0) ||
                        c == '\r'.charCodeAt(0) ||
                        c == '\n'.charCodeAt(0);
                };
                Base64DecodeInputStream.decode = function (c) {
                    if ('A'.charCodeAt(0) <= c && c <= 'Z'.charCodeAt(0)) {
                        return c - 'A'.charCodeAt(0);
                    }
                    else if ('a'.charCodeAt(0) <= c && c <= 'z'.charCodeAt(0)) {
                        return c - 'a'.charCodeAt(0) + 26;
                    }
                    else if ('0'.charCodeAt(0) <= c && c <= '9'.charCodeAt(0)) {
                        return c - '0'.charCodeAt(0) + 52;
                    }
                    else if (c == '+'.charCodeAt(0)) {
                        return 62;
                    }
                    else if (c == '/'.charCodeAt(0)) {
                        return 63;
                    }
                    else {
                        throw 'c:' + c;
                    }
                };
                return Base64DecodeInputStream;
            }(io.InputStream));
            io.Base64DecodeInputStream = Base64DecodeInputStream;
        })(io = d_project.io || (d_project.io = {}));
    })(d_project = com.d_project || (com.d_project = {}));
})(com || (com = {}));
var com;
(function (com) {
    var d_project;
    (function (d_project) {
        var io;
        (function (io) {
            var Base64EncodeOutputStream = (function (_super) {
                __extends(Base64EncodeOutputStream, _super);
                function Base64EncodeOutputStream(ostream) {
                    var _this = _super.call(this) || this;
                    _this.ostream = ostream;
                    _this.buffer = 0;
                    _this.buflen = 0;
                    _this.length = 0;
                    return _this;
                }
                Base64EncodeOutputStream.prototype.writeByte = function (n) {
                    this.buffer = (this.buffer << 8) | (n & 0xff);
                    this.buflen += 8;
                    this.length += 1;
                    while (this.buflen >= 6) {
                        this.writeEncoded(this.buffer >>> (this.buflen - 6));
                        this.buflen -= 6;
                    }
                };
                Base64EncodeOutputStream.prototype.flush = function () {
                    if (this.buflen > 0) {
                        this.writeEncoded(this.buffer << (6 - this.buflen));
                        this.buffer = 0;
                        this.buflen = 0;
                    }
                    if (this.length % 3 != 0) {
                        var padlen = 3 - this.length % 3;
                        for (var i = 0; i < padlen; i += 1) {
                            this.ostream.writeByte('='.charCodeAt(0));
                        }
                    }
                };
                Base64EncodeOutputStream.prototype.writeEncoded = function (b) {
                    this.ostream.writeByte(Base64EncodeOutputStream.encode(b & 0x3f));
                };
                Base64EncodeOutputStream.encode = function (n) {
                    if (n < 0) {
                    }
                    else if (n < 26) {
                        return 'A'.charCodeAt(0) + n;
                    }
                    else if (n < 52) {
                        return 'a'.charCodeAt(0) + (n - 26);
                    }
                    else if (n < 62) {
                        return '0'.charCodeAt(0) + (n - 52);
                    }
                    else if (n == 62) {
                        return '+'.charCodeAt(0);
                    }
                    else if (n == 63) {
                        return '/'.charCodeAt(0);
                    }
                    throw 'n:' + n;
                };
                return Base64EncodeOutputStream;
            }(io.OutputStream));
            io.Base64EncodeOutputStream = Base64EncodeOutputStream;
        })(io = d_project.io || (d_project.io = {}));
    })(d_project = com.d_project || (com.d_project = {}));
})(com || (com = {}));
var com;
(function (com) {
    var d_project;
    (function (d_project) {
        var io;
        (function (io) {
            var ByteArrayInputStream = (function (_super) {
                __extends(ByteArrayInputStream, _super);
                function ByteArrayInputStream(bytes) {
                    var _this = _super.call(this) || this;
                    _this.bytes = bytes;
                    _this.pos = 0;
                    return _this;
                }
                ByteArrayInputStream.prototype.readByte = function () {
                    if (this.pos < this.bytes.length) {
                        var b = this.bytes[this.pos];
                        this.pos += 1;
                        return b;
                    }
                    return -1;
                };
                return ByteArrayInputStream;
            }(io.InputStream));
            io.ByteArrayInputStream = ByteArrayInputStream;
        })(io = d_project.io || (d_project.io = {}));
    })(d_project = com.d_project || (com.d_project = {}));
})(com || (com = {}));
var com;
(function (com) {
    var d_project;
    (function (d_project) {
        var qrcodesplitter;
        (function (qrcodesplitter) {
            var BitBuffer = (function () {
                function BitBuffer() {
                    this.buffer = [];
                    this.length = 0;
                    this.ynobits_i = 0;
                }
                BitBuffer.prototype.getBuffer = function () {
                    return this.buffer;
                };
                BitBuffer.prototype.getLengthInBits = function () {
                    return this.length;
                };
                BitBuffer.prototype.toString = function () {
                    var buffer = '';
                    for (var i = 0; i < this.getLengthInBits(); i += 1) {
                        buffer += this.getBit(i) ? '1' : '0';
                    }
                    return buffer;
                };
                BitBuffer.prototype.getBit = function (index) {
                    return ((this.buffer[~~(index / 8)] >>> (7 - index % 8)) & 1) == 1;
                };
                BitBuffer.prototype.put = function (num, length) {
                    for (var i = 0; i < length; i += 1) {
                        this.putBit(((num >>> (length - i - 1)) & 1) == 1);
                    }
                };
                BitBuffer.prototype.putBit = function (bit) {
                    if (this.length == this.buffer.length * 8) {
                        this.buffer.push(0);
                    }
                    if (bit) {
                        this.buffer[~~(this.length / 8)] |= (0x80 >>> (this.length % 8));
                    }
                    this.length += 1;
                };
                BitBuffer.prototype.putBit2 = function (bit) {
                    if (this.length == this.buffer.length * 8) {
                        this.buffer.push(bit ? 1 : 0);
                    }
                    this.length += 1;
                };
                return BitBuffer;
            }());
            qrcodesplitter.BitBuffer = BitBuffer;
        })(qrcodesplitter = d_project.qrcodesplitter || (d_project.qrcodesplitter = {}));
    })(d_project = com.d_project || (com.d_project = {}));
})(com || (com = {}));
var com;
(function (com) {
    var d_project;
    (function (d_project) {
        var qrcodesplitter;
        (function (qrcodesplitter) {
            var ErrorCorrectLevel;
            (function (ErrorCorrectLevel) {
                ErrorCorrectLevel[ErrorCorrectLevel["L"] = 1] = "L";
                ErrorCorrectLevel[ErrorCorrectLevel["M"] = 0] = "M";
                ErrorCorrectLevel[ErrorCorrectLevel["Q"] = 3] = "Q";
                ErrorCorrectLevel[ErrorCorrectLevel["H"] = 2] = "H";
            })(ErrorCorrectLevel = qrcodesplitter.ErrorCorrectLevel || (qrcodesplitter.ErrorCorrectLevel = {}));
        })(qrcodesplitter = d_project.qrcodesplitter || (d_project.qrcodesplitter = {}));
    })(d_project = com.d_project || (com.d_project = {}));
})(com || (com = {}));
var com;
(function (com) {
    var d_project;
    (function (d_project) {
        var qrcodesplitter;
        (function (qrcodesplitter) {
            var MaskPattern;
            (function (MaskPattern) {
                MaskPattern[MaskPattern["PATTERN000"] = 0] = "PATTERN000";
                MaskPattern[MaskPattern["PATTERN001"] = 1] = "PATTERN001";
                MaskPattern[MaskPattern["PATTERN010"] = 2] = "PATTERN010";
                MaskPattern[MaskPattern["PATTERN011"] = 3] = "PATTERN011";
                MaskPattern[MaskPattern["PATTERN100"] = 4] = "PATTERN100";
                MaskPattern[MaskPattern["PATTERN101"] = 5] = "PATTERN101";
                MaskPattern[MaskPattern["PATTERN110"] = 6] = "PATTERN110";
                MaskPattern[MaskPattern["PATTERN111"] = 7] = "PATTERN111";
            })(MaskPattern = qrcodesplitter.MaskPattern || (qrcodesplitter.MaskPattern = {}));
        })(qrcodesplitter = d_project.qrcodesplitter || (d_project.qrcodesplitter = {}));
    })(d_project = com.d_project || (com.d_project = {}));
})(com || (com = {}));
var com;
(function (com) {
    var d_project;
    (function (d_project) {
        var qrcodesplitter;
        (function (qrcodesplitter) {
            var Mode;
            (function (Mode) {
                Mode[Mode["MODE_NUMBER"] = 1] = "MODE_NUMBER";
                Mode[Mode["MODE_ALPHA_NUM"] = 2] = "MODE_ALPHA_NUM";
                Mode[Mode["MODE_8BIT_BYTE"] = 4] = "MODE_8BIT_BYTE";
                Mode[Mode["MODE_KANJI"] = 8] = "MODE_KANJI";
            })(Mode = qrcodesplitter.Mode || (qrcodesplitter.Mode = {}));
        })(qrcodesplitter = d_project.qrcodesplitter || (d_project.qrcodesplitter = {}));
    })(d_project = com.d_project || (com.d_project = {}));
})(com || (com = {}));
var com;
(function (com) {
    var d_project;
    (function (d_project) {
        var qrcodesplitter;
        (function (qrcodesplitter) {
            var Polynomial = (function () {
                function Polynomial(num, shift) {
                    if (shift === void 0) { shift = 0; }
                    var offset = 0;
                    while (offset < num.length && num[offset] == 0) {
                        offset += 1;
                    }
                    this.num = [];
                    var len = num.length - offset;
                    for (var i = 0; i < len; i += 1) {
                        this.num.push(num[offset + i]);
                    }
                    for (var i = 0; i < shift; i += 1) {
                        this.num.push(0);
                    }
                }
                Polynomial.prototype.getAt = function (index) {
                    return this.num[index];
                };
                Polynomial.prototype.getLength = function () {
                    return this.num.length;
                };
                Polynomial.prototype.toString = function () {
                    var buffer = '';
                    for (var i = 0; i < this.getLength(); i += 1) {
                        if (i > 0) {
                            buffer += ',';
                        }
                        buffer += this.getAt(i);
                    }
                    return buffer.toString();
                };
                Polynomial.prototype.toLogString = function () {
                    var buffer = '';
                    for (var i = 0; i < this.getLength(); i += 1) {
                        if (i > 0) {
                            buffer += ',';
                        }
                        buffer += qrcodesplitter.QRMath.glog(this.getAt(i));
                    }
                    return buffer.toString();
                };
                Polynomial.prototype.multiply = function (e) {
                    var num = [];
                    var len = this.getLength() + e.getLength() - 1;
                    for (var i = 0; i < len; i += 1) {
                        num.push(0);
                    }
                    for (var i = 0; i < this.getLength(); i += 1) {
                        for (var j = 0; j < e.getLength(); j += 1) {
                            num[i + j] ^= qrcodesplitter.QRMath.gexp(qrcodesplitter.QRMath.glog(this.getAt(i)) +
                                qrcodesplitter.QRMath.glog(e.getAt(j)));
                        }
                    }
                    return new Polynomial(num);
                };
                Polynomial.prototype.mod = function (e) {
                    if (this.getLength() - e.getLength() < 0) {
                        return this;
                    }
                    var ratio = qrcodesplitter.QRMath.glog(this.getAt(0)) - qrcodesplitter.QRMath.glog(e.getAt(0));
                    var num = [];
                    for (var i = 0; i < this.getLength(); i += 1) {
                        num.push(this.getAt(i));
                    }
                    for (var i = 0; i < e.getLength(); i += 1) {
                        num[i] ^= qrcodesplitter.QRMath.gexp(qrcodesplitter.QRMath.glog(e.getAt(i)) + ratio);
                    }
                    return new Polynomial(num).mod(e);
                };
                return Polynomial;
            }());
            qrcodesplitter.Polynomial = Polynomial;
        })(qrcodesplitter = d_project.qrcodesplitter || (d_project.qrcodesplitter = {}));
    })(d_project = com.d_project || (com.d_project = {}));
})(com || (com = {}));
var com;
(function (com) {
    var d_project;
    (function (d_project) {
        var qrcodesplitter;
        (function (qrcodesplitter) {
            var QRData = (function () {
                function QRData(mode, data) {
                    this.mode = mode;
                    this.data = data;
                }
                QRData.prototype.getMode = function () {
                    return this.mode;
                };
                QRData.prototype.getData = function () {
                    return this.data;
                };
                QRData.prototype.getLengthInBits = function (typeNumber) {
                    if (1 <= typeNumber && typeNumber < 10) {
                        switch (this.mode) {
                            case qrcodesplitter.Mode.MODE_NUMBER: return 10;
                            case qrcodesplitter.Mode.MODE_ALPHA_NUM: return 9;
                            case qrcodesplitter.Mode.MODE_8BIT_BYTE: return 8;
                            case qrcodesplitter.Mode.MODE_KANJI: return 8;
                            default:
                                throw 'mode:' + this.mode;
                        }
                    }
                    else if (typeNumber < 27) {
                        switch (this.mode) {
                            case qrcodesplitter.Mode.MODE_NUMBER: return 12;
                            case qrcodesplitter.Mode.MODE_ALPHA_NUM: return 11;
                            case qrcodesplitter.Mode.MODE_8BIT_BYTE: return 16;
                            case qrcodesplitter.Mode.MODE_KANJI: return 10;
                            default:
                                throw 'mode:' + this.mode;
                        }
                    }
                    else if (typeNumber < 41) {
                        switch (this.mode) {
                            case qrcodesplitter.Mode.MODE_NUMBER: return 14;
                            case qrcodesplitter.Mode.MODE_ALPHA_NUM: return 13;
                            case qrcodesplitter.Mode.MODE_8BIT_BYTE: return 16;
                            case qrcodesplitter.Mode.MODE_KANJI: return 12;
                            default:
                                throw 'mode:' + this.mode;
                        }
                    }
                    else {
                        throw 'typeNumber:' + typeNumber;
                    }
                };
                return QRData;
            }());
            qrcodesplitter.QRData = QRData;
        })(qrcodesplitter = d_project.qrcodesplitter || (d_project.qrcodesplitter = {}));
    })(d_project = com.d_project || (com.d_project = {}));
})(com || (com = {}));
var com;
(function (com) {
    var d_project;
    (function (d_project) {
        var qrcodesplitter;
        (function (qrcodesplitter) {
            var QR8BitByte = (function (_super) {
                __extends(QR8BitByte, _super);
                function QR8BitByte(data) {
                    return _super.call(this, qrcodesplitter.Mode.MODE_8BIT_BYTE, data) || this;
                }
                QR8BitByte.prototype.write = function (buffer) {
                    var ynobits_i = 0;
                    function ynobits(bits) {
                        var s = "";
                        for (var i = 0; i < bits; i++)
                            s += ynobits_i++ % 2 == 0 ? '0' : '1';
                        return parseInt(s, 2);
                    }
                    var data = qrcodesplitter.QRCode.stringToBytes(this.getData());
                    for (var i = 0; i < data.length; i += 1) {
                        buffer.put(ynobits(8), 8);
                    }
                };
                QR8BitByte.prototype.getLength = function () {
                    return qrcodesplitter.QRCode.stringToBytes(this.getData()).length;
                };
                return QR8BitByte;
            }(qrcodesplitter.QRData));
            qrcodesplitter.QR8BitByte = QR8BitByte;
        })(qrcodesplitter = d_project.qrcodesplitter || (d_project.qrcodesplitter = {}));
    })(d_project = com.d_project || (com.d_project = {}));
})(com || (com = {}));
var com;
(function (com) {
    var d_project;
    (function (d_project) {
        var qrcodesplitter;
        (function (qrcodesplitter) {
            var QRAlphaNum = (function (_super) {
                __extends(QRAlphaNum, _super);
                function QRAlphaNum(data) {
                    return _super.call(this, qrcodesplitter.Mode.MODE_ALPHA_NUM, data) || this;
                }
                QRAlphaNum.prototype.write = function (buffer) {
                    var s = this.getData();
                    var i = 0;
                    var ynobits_i = 0;
                    function ynobits(bits) {
                        var s = "";
                        for (var i = 0; i < bits; i++)
                            s += ynobits_i++ % 2 == 0 ? '0' : '1';
                        return parseInt(s, 2);
                    }
                    while (i + 1 < s.length) {
                        buffer.put(ynobits(11), 11);
                        i += 2;
                    }
                    if (i < s.length) {
                        buffer.put(ynobits(6), 6);
                    }
                };
                QRAlphaNum.prototype.getLength = function () {
                    return this.getData().length;
                };
                QRAlphaNum.getCode = function (c) {
                    if ('0' <= c && c <= '9') {
                        return c.charCodeAt(0) - '0'.charCodeAt(0);
                    }
                    else if ('A' <= c && c <= 'Z') {
                        return c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
                    }
                    else {
                        switch (c) {
                            case ' ': return 36;
                            case '$': return 37;
                            case '%': return 38;
                            case '*': return 39;
                            case '+': return 40;
                            case '-': return 41;
                            case '.': return 42;
                            case '/': return 43;
                            case ':': return 44;
                            default:
                                throw 'illegal char :' + c;
                        }
                    }
                };
                return QRAlphaNum;
            }(qrcodesplitter.QRData));
            qrcodesplitter.QRAlphaNum = QRAlphaNum;
        })(qrcodesplitter = d_project.qrcodesplitter || (d_project.qrcodesplitter = {}));
    })(d_project = com.d_project || (com.d_project = {}));
})(com || (com = {}));
var com;
(function (com) {
    var d_project;
    (function (d_project) {
        var text;
        (function (text) {
            var ByteArrayInputStream = com.d_project.io.ByteArrayInputStream;
            var Base64DecodeInputStream = com.d_project.io.Base64DecodeInputStream;
            function createStringToBytes(unicodeData, numChars) {
                function toBytes(s) {
                    var bytes = [];
                    for (var i = 0; i < s.length; i += 1) {
                        bytes.push(s.charCodeAt(i));
                    }
                    return bytes;
                }
                var unicodeMap = function () {
                    var bin = new Base64DecodeInputStream(new ByteArrayInputStream(toBytes(unicodeData)));
                    var read = function () {
                        var b = bin.readByte();
                        if (b == -1)
                            throw 'eof';
                        return b;
                    };
                    var count = 0;
                    var unicodeMap = {};
                    while (true) {
                        var b0 = bin.readByte();
                        if (b0 == -1)
                            break;
                        var b1 = read();
                        var b2 = read();
                        var b3 = read();
                        var k = String.fromCharCode((b0 << 8) | b1);
                        var v = (b2 << 8) | b3;
                        unicodeMap[k] = v;
                        count += 1;
                    }
                    if (count != numChars) {
                        throw count + '!=' + numChars;
                    }
                    return unicodeMap;
                }();
                var unknownChar = '?'.charCodeAt(0);
                return function (s) {
                    var bytes = [];
                    for (var i = 0; i < s.length; i += 1) {
                        var c = s.charCodeAt(i);
                        if (c < 128) {
                            bytes.push(c);
                        }
                        else {
                            var b = unicodeMap[s.charAt(i)];
                            if (typeof b == 'number') {
                                if ((b & 0xff) == b) {
                                    bytes.push(b);
                                }
                                else {
                                    bytes.push(b >>> 8);
                                    bytes.push(b & 0xff);
                                }
                            }
                            else {
                                bytes.push(unknownChar);
                            }
                        }
                    }
                    return bytes;
                };
            }
            text.createStringToBytes = createStringToBytes;
            ;
        })(text = d_project.text || (d_project.text = {}));
    })(d_project = com.d_project || (com.d_project = {}));
})(com || (com = {}));
var com;
(function (com) {
    var d_project;
    (function (d_project) {
        var text;
        (function (text) {
            text.stringToBytes_SJIS = text.createStringToBytes('AAAAAAABAAEAAgACAAMAAwAEAAQABQAFAAYABgAHAAcACAAIAAkACQAKAAoACwALAAwADAANAA0ADgAOAA8ADwAQABAAEQARABIAEgATABMAFAAUABUAFQAWABYAFwAXABgAGAAZABkAGgAaABsAGwAcABwAHQAdAB4AHgAfAB8AIAAgACEAIQAiACIAIwAjACQAJAAlACUAJgAmACcAJwAoACgAKQApACoAKgArACsALAAsAC0ALQAuAC4ALwAvADAAMAAxADEAMgAyADMAMwA0ADQANQA1ADYANgA3ADcAOAA4ADkAOQA6ADoAOwA7ADwAPAA9AD0APgA+AD8APwBAAEAAQQBBAEIAQgBDAEMARABEAEUARQBGAEYARwBHAEgASABJAEkASgBKAEsASwBMAEwATQBNAE4ATgBPAE8AUABQAFEAUQBSAFIAUwBTAFQAVABVAFUAVgBWAFcAVwBYAFgAWQBZAFoAWgBbAFsAXABcAF0AXQBeAF4AXwBfAGAAYABhAGEAYgBiAGMAYwBkAGQAZQBlAGYAZgBnAGcAaABoAGkAaQBqAGoAawBrAGwAbABtAG0AbgBuAG8AbwBwAHAAcQBxAHIAcgBzAHMAdAB0AHUAdQB2AHYAdwB3AHgAeAB5AHkAegB6AHsAewB8AHwAfQB9AH4AfgB\/AH8AooGRAKOBkgCngZgAqIFOAKyBygCwgYsAsYF9ALSBTAC2gfcA14F+APeBgAORg58DkoOgA5ODoQOUg6IDlYOjA5aDpAOXg6UDmIOmA5mDpwOag6gDm4OpA5yDqgOdg6sDnoOsA5+DrQOgg64DoYOvA6ODsAOkg7EDpYOyA6aDswOng7QDqIO1A6mDtgOxg78DsoPAA7ODwQO0g8IDtYPDA7aDxAO3g8UDuIPGA7mDxwO6g8gDu4PJA7yDygO9g8sDvoPMA7+DzQPAg84DwYPPA8OD0APEg9EDxYPSA8aD0wPHg9QDyIPVA8mD1gQBhEYEEIRABBGEQQQShEIEE4RDBBSERAQVhEUEFoRHBBeESAQYhEkEGYRKBBqESwQbhEwEHIRNBB2ETgQehE8EH4RQBCCEUQQhhFIEIoRTBCOEVAQkhFUEJYRWBCaEVwQnhFgEKIRZBCmEWgQqhFsEK4RcBCyEXQQthF4ELoRfBC+EYAQwhHAEMYRxBDKEcgQzhHMENIR0BDWEdQQ2hHcEN4R4BDiEeQQ5hHoEOoR7BDuEfAQ8hH0EPYR+BD6EgAQ\/hIEEQISCBEGEgwRChIQEQ4SFBESEhgRFhIcERoSIBEeEiQRIhIoESYSLBEqEjARLhI0ETISOBE2EjwROhJAET4SRBFGEdiAQgV0gFIFcIBaBYSAYgWUgGYFmIByBZyAdgWggIIH1ICGB9iAlgWQgJoFjIDCB8SAygYwgM4GNIDuBpiEDgY4hK4HwIZCBqSGRgaohkoGoIZOBqyHSgcsh1IHMIgCBzSICgd0iA4HOIgeB3iIIgbgiC4G5IhKBfCIageMiHYHlIh6BhyIggdoiJ4HIIiiBySIpgb8iKoG+IiuB5yIsgegiNIGIIjWB5iI9geQiUoHgImCBgiJhgd8iZoGFImeBhiJqgeEia4HiIoKBvCKDgb0ihoG6IoeBuyKlgdsjEoHcJQCEnyUBhKolAoSgJQOEqyUMhKElD4SsJRCEoiUThK0lFISkJReEryUYhKMlG4SuJRyEpSUdhLolIIS1JSOEsCUkhKclJYS8JSiEtyUrhLIlLISmJS+EtiUwhLslM4SxJTSEqCU3hLglOIS9JTuEsyU8hKklP4S5JUKEviVLhLQloIGhJaGBoCWygaMls4GiJbyBpSW9gaQlxoGfJceBniXLgZslzoGdJc+BnCXvgfwmBYGaJgaBmSZAgYomQoGJJmqB9CZtgfMmb4HyMACBQDABgUEwAoFCMAOBVjAFgVgwBoFZMAeBWjAIgXEwCYFyMAqBczALgXQwDIF1MA2BdjAOgXcwD4F4MBCBeTARgXowEoGnMBOBrDAUgWswFYFsMByBYDBBgp8wQoKgMEOCoTBEgqIwRYKjMEaCpDBHgqUwSIKmMEmCpzBKgqgwS4KpMEyCqjBNgqswToKsME+CrTBQgq4wUYKvMFKCsDBTgrEwVIKyMFWCszBWgrQwV4K1MFiCtjBZgrcwWoK4MFuCuTBcgrowXYK7MF6CvDBfgr0wYIK+MGGCvzBigsAwY4LBMGSCwjBlgsMwZoLEMGeCxTBogsYwaYLHMGqCyDBrgskwbILKMG2CyzBugswwb4LNMHCCzjBxgs8wcoLQMHOC0TB0gtIwdYLTMHaC1DB3gtUweILWMHmC1zB6gtgwe4LZMHyC2jB9gtswfoLcMH+C3TCAgt4wgYLfMIKC4DCDguEwhILiMIWC4zCGguQwh4LlMIiC5jCJgucwioLoMIuC6TCMguowjYLrMI6C7DCPgu0wkILuMJGC7zCSgvAwk4LxMJuBSjCcgUswnYFUMJ6BVTChg0AwooNBMKODQjCkg0MwpYNEMKaDRTCng0YwqINHMKmDSDCqg0kwq4NKMKyDSzCtg0wwroNNMK+DTjCwg08wsYNQMLKDUTCzg1IwtINTMLWDVDC2g1Uwt4NWMLiDVzC5g1gwuoNZMLuDWjC8g1swvYNcML6DXTC\/g14wwINfMMGDYDDCg2Eww4NiMMSDYzDFg2QwxoNlMMeDZjDIg2cwyYNoMMqDaTDLg2owzINrMM2DbDDOg20wz4NuMNCDbzDRg3Aw0oNxMNODcjDUg3Mw1YN0MNaDdTDXg3Yw2IN3MNmDeDDag3kw24N6MNyDezDdg3ww3oN9MN+DfjDgg4Aw4YOBMOKDgjDjg4Mw5IOEMOWDhTDmg4Yw54OHMOiDiDDpg4kw6oOKMOuDizDsg4ww7YONMO6DjjDvg48w8IOQMPGDkTDyg5Iw84OTMPSDlDD1g5Uw9oOWMPuBRTD8gVsw\/YFSMP6BU04AiOpOAZKaTgOOtU4HlpxOCI\/kTgmOT04Kj+NOC4m6Tg2Vc04Ol15OEJigThGJTk4Uio5OFZihThaQok4XmcBOGIt1ThmVuE4ej+VOIZe8TiaVwE4qmKJOLZKGTjGYo04yi\/hONpikTjiK2045kk9OO47lTjyYpU4\/mKZOQpinTkOUVE5Fi3ZOS5RWTk2T4U5OjMFOT5ZSTlXlaE5WmKhOV4\/mTliYqU5ZibNOXYvjTl6M7k5fludOYpukTnGXkE5zk\/tOfoqjToCLVE6CmKpOhZirToaXuU6Il1xOiZGIToqYrU6LjpZOjJPxTo6YsE6RiV1OkozdTpSM3E6ViOROmJhqTpmYaU6bjbFOnIifTp6YsU6fmLJOoJizTqGWU06imLROpIzwTqWI5U6mlpJOqIucTquLnU6si55OrZLgTq6Xuk6wmLVOs5i2TraYt066kGxOwI9ZTsGQbU7CmLxOxJi6TsaYu07Hi3dOyo2hTsuJ7k7NmLlOzpi4Ts+Vp07UjmVO1Y5kTtaRvE7XmL1O2JV0TtmQ5U7dgVdO3pi+Tt+YwE7jkeNO5JffTuWIyE7tmL9O7om8TvCLwk7ykodO9oyPTveYwU77lENPAYrpTwmYwk8KiMlPDYzeTw6K6k8PlZpPEJSwTxGLeE8aie9PHJjlTx2TYE8vlIxPMJjETzSUuk82l+BPOJBMTzqOZk88jpdPPYm+T0OSz09GkkFPR5jIT02Iyk9OkuFPT49aT1CNsk9Rl0NPU5HMT1WJvU9XmMdPWZddT1qYw09bmMVPXI3sT12Yxk9em0NPaZjOT2+Y0U9wmM9Pc4nAT3WVuU92mMlPe5jNT3yM8U9\/jmdPg4qkT4aY0k+ImMpPi5fhT42OmE+PmMtPkZjQT5aY00+YmMxPm4ufT52Iy0+gi6BPoYm\/T6ubRE+tlplPrpWOT6+M8k+1kE5Ptpe1T7+V1k\/CjFdPw5GjT8SJ4k\/Kj3JPzpjXT9CY3E\/RmNpP1JjVT9eRrU\/YmNhP2pjbT9uY2U\/dldtP35jWT+GQTU\/jlpNP5JjdT+WY3k\/uj0NP75jrT\/OUb0\/1lVVP9pjmT\/iV7k\/6ibRP\/pjqUAWY5FAGmO1QCZFxUAuMwlANlHtQD+DFUBGY7FASk3xQFJjhUBaM9FAZjPNQGpjfUB+O2FAhmOdQI5XtUCSSbFAlmONQJoyRUCiY4FApmOhQKpjiUCuXz1AsmOlQLZhgUDaL5FA5jJBQQ5juUEeY71BImPNQSYjMUE+VzlBQmPJQVZjxUFaY9VBamPRQXJLiUGWMklBsmPZQco7DUHSRpFB1kuNQdov0UHiY91B9i1VQgJj4UIWY+lCNllRQkYyGUJiOUFCZlPVQmpj5UKyNw1Ctl2JQspj8ULOZQlC0mPtQtY3CULePnVC+jFhQwplDUMWLzVDJmUBQyplBUM2TrVDPkZxQ0YuhUNWWbFDWmURQ2pe7UN6ZRVDjmUhQ5ZlGUOeRbVDtmUdQ7plJUPWZS1D5mUpQ+5XGUQCLVlEBmU1RAplOUQSJrVEJmUxREo7yURSZUVEVmVBRFplPURiY1FEamVJRH4+eUSGZU1Eql0RRMpbXUTeZVVE6mVRRO5lXUTyZVlE\/mVhRQJlZUUGI8lFDjLNRRIxaUUWPW1FGkptRR4uiUUiQ5lFJjPVRS42OUUyZW1FNlsZRTpNlUVCOmVFSmVpRVJlcUVqTfVFcipVRYpldUWWT\/FFokVNRaZlfUWqZYFFrlKpRbIz2UW2YWlFumWFRcYukUXWVulF2kbRRd4vvUXiTVFF8jJNRgJliUYKZY1GFk+BRhol+UYmZZlGKjftRjJllUY2NxFGPmWdRkOPsUZGZaFGSlmBRk5lpUZWZalGWmWtRl4\/nUZmOylGgiqVRopluUaSZbFGllrtRppltUaiVeVGpmW9RqplwUauZcVGsk35RsJl1UbGZc1GymXRRs5lyUbSN4VG1mXZRtpboUbeX4lG9mXdRxJCmUcWZeFHGj3lRyZl5UcuSnFHMl71RzZOAUdaZw1HbmXpR3OqjUd2Lw1HgmXtR4ZZ9UeaPiFHnkfpR6Zl9UeqT4lHtmX5R8JmAUfGKTVH1mYFR9oulUfiTylH5iZpR+o9vUf2Un1H+mYJSAJOBUgOQblIEmYNSBpWqUgeQ2FIIiqBSCoqnUguZhFIOmYZSEYxZUhSZhVIXl\/FSHY+JUiSUu1IllcpSJ5mHUimXmFIqmYhSLpmJUjCTnlIzmYpSNpCnUjeN\/FI4jJRSOZmLUjqOaFI7jY9SQ5LkUkSZjVJHkaVSSo3tUkuZjlJMmY9STZFPUk+ZjFJUmZFSVpZVUluNhFJemZBSY4yVUmSN3FJllI1SaZmUUmqZklJvlZtScI\/oUnGZm1JyioRSc5mVUnSZk1J1kW5SfZmXUn+ZllKDimNSh4yAUoiZnFKJl6tSjZmYUpGZnVKSmZpSlJmZUpuXzVKfjPdSoInBUqOX8lKpj5VSqpN3UquNhVKsmaBSrZmhUrGX41K0mEpStZmjUrmM+FK8maJSvopOUsGZpFLDlnVSxZK6UseXRVLJlddSzZmlUtLo01LVk65S15mmUtiKqFLZlrFS3Y+fUt6Zp1LfleVS4JmrUuKQqFLjmahS5IvOUuaZqVLniqlS8oxNUvOZrFL1ma1S+JmuUvmZr1L6jtlS\/oz5Uv+W3FMBluZTApP1UwWV71MGmbBTCJmxUw2Zs1MPmbVTEJm0UxWZtlMWibtTF5ZrUxmN+lMambdTHZF4UyCPoFMhi6dTI5m4UyqU2VMvmblTMZm6UzOZu1M4mbxTOZVDUzqL5lM7iONTP5O9U0CZvVNBj1xTQ5DnU0WZv1NGmb5TR4+hU0iM31NJmcFTSpS8U02ZwlNRlNpTUpGyU1OR7FNUi6ZTV5PsU1iSUFNalI5TXJZtU16ZxFNgkOhTZoxUU2mZxVNumcZTb4lLU3CI81NxiutTc5GmU3SLcFN1l5FTd5nJU3iJtVN7mchTf4uoU4KZylOElu9TlpnLU5iX0FOajPpTn4y0U6CZzFOlmc5TppnNU6iQflOpiVhTrYl9U66Zz1OwmdBTs4y1U7aZ0VO7i45Two5RU8OZ0lPIlpRTyY2zU8qLeVPLl0ZTzJFvU82UvVPOjvtT1I9mU9aO5lPXjvNT2Y+WU9uUvlPfmdVT4YliU+KRcFPjjPtT5IzDU+WL5VPomdlT6ZJAU+qR\/FPri6lT7I+iU+2Z2lPumdhT74nCU\/CR5FPxjrZT8o5qU\/OJRVP2ipBT942GU\/iOaVP6mdtUAZncVAOLaFQEimVUCI2HVAmLZ1QKkt1UC4lEVAyTr1QNlrxUDo1AVA+XmVQQk2ZUEYz8VBuMTlQdmeVUH4vhVCCWaVQmlNtUKZnkVCuK3FQsmd9ULZngVC6Z4lQ2meNUOIt6VDmQgVQ7latUPJnhVD2Z3VQ+jOFUQJneVEKYQ1RGlfBUSJLmVEmM4FRKjZBUTpnmVFGT21RfmepUaI78VGqO9FRwme1UcZnrVHOWoVR1mehUdpnxVHeZ7FR7me9UfIzEVH2WvVSAmfBUhJnyVIaZ9FSLje5UjJhhVI6Z6VSPmedUkJnzVJKZ7lSimfZUpJpCVKWZ+FSomfxUq5pAVKyZ+VSvml1Uso3nVLOKUFS4mfdUvJpEVL2I9FS+mkNUwIijVMGVaVTCmkFUxJn6VMeZ9VTImftUyY3GVNiaRVThiPVU4ppOVOWaRlTmmkdU6I+jVOmWiVTtmkxU7ppLVPKTTlT6mk1U\/ZpKVQSJU1UGjbRVB5BPVQ+aSFUQk4JVFJpJVRaIoFUumlNVL5dCVTGPpVUzmllVOJpYVTmaT1U+kcFVQJpQVUSR7VVFmlVVRo+kVUyaUlVPluJVU4xbVVaaVlVXmldVXJpUVV2aWlVjmlFVe5pgVXyaZVV+mmFVgJpcVYOaZlWEkVBVh5poVYmNQVWKml5Vi5KdVZiaYlWZmltVmoqrVZyK7FWdioVVnppjVZ+aX1WnjJZVqJppVamaZ1WqkXJVq4tpVayLqlWummRVsIvyVbaJY1XEmm1VxZprVceapVXUmnBV2ppqVdyablXfmmxV445rVeSab1X3mnJV+Zp3Vf2adVX+mnRWBpJRVgmJw1YUmnFWFppzVhePplYYiVJWG5p2VimJ3FYvmoJWMY\/6VjKafVY0mntWNpp8VjiaflZCiVxWTJFYVk6aeFZQmnlWW4qaVmSagVZoiu1WapqEVmuagFZsmoNWdJWsVniT01Z6lLZWgJqGVoaahVaHimRWipqHVo+ailaUmolWoJqIVqKUWFalmotWrpqMVrSajla2mo1WvJqQVsCak1bBmpFWwpqPVsOaklbImpRWzpqVVtGallbTmpdW15qYVtiZZFbajvpW245sVt6J8VbgiPZW45JjVu6amVbwjaJW8ojNVvOQfVb5mppW+ozFVv2NkVb\/mpxXAJqbVwOV3lcEmp1XCJqfVwmanlcLmqBXDZqhVw+Ml1cSiYBXE5qiVxaapFcYmqNXHJqmVx+TeVcmmqdXJ4izVyiN3VctjFxXMJJuVzeaqFc4mqlXO5qrV0CarFdCjeJXR4vPV0qWVldOmqpXT5qtV1CNv1dRjUJXYZqxV2SNo1dmklJXaZquV2qS2Fd\/mrJXgpCCV4iasFeJmrNXi4xeV5OatFegmrVXoo1DV6OKX1ekmrdXqpq4V7CauVezmrZXwJqvV8OaulfGmrtXy5aEV86P6VfSmr1X05q+V9SavFfWmsBX3JRXV9+I5lfglXVX45rBV\/SP+1f3jrdX+ZR8V\/qK7lf8jelYAJZ4WAKTsFgFjJhYBpHNWAqav1gLmsJYFZHCWBmaw1gdmsRYIZrGWCSS51gqiqxYL+qfWDCJgVgxlfFYNI\/qWDWTZ1g6jeRYPZrMWECVu1hBl9tYSonyWEuayFhRkVlYUprLWFSTg1hXk2hYWJOEWFmUt1hakstYXo3HWGKax1hpiZZYa5NVWHCayVhymsVYdZBvWHmazVh+j21Yg4urWIWazliTleZYl5GdWJySxFifmtBYqJZuWKua0ViumtZYs5WtWLia1Vi5ms9YuprSWLua1Fi+jaRYwZXHWMWa11jHkmRYyonzWMyP61jRmtlY05rYWNWNiFjXmtpY2JrcWNma21jcmt5Y3prTWN+a4Fjkmt9Y5ZrdWOuObVjskHBY7pFzWO+a4VjwkLpY8YjrWPKUhFj3ktlY+ZrjWPqa4lj7muRY\/JrlWP2a5lkCmudZCZXPWQqa6FkPicRZEJrpWRWXW1kWik9ZGJnHWRmPZ1kakb1ZG5rqWRyW6VkilrJZJZrsWSeR5Vkpk1ZZKpG+WSuVdlksmu1ZLZruWS6Jm1kxjrhZMprvWTeIzlk4mvBZPprxWUSJgllHiu9ZSJPeWUmV8llOmvVZT5F0WVCa9FlRjF9ZVJZ6WVWa81lXk4VZWJr3WVqa9llgmvlZYpr4WWWJnFlnmvpZaI+nWWma\/FlqkkRZbJr7WW6VsVlzj5dZdJN6WXibQFl9jURZgZtBWYKUQFmDlNxZhJbPWYqURFmNm0pZk4tXWZaXZFmZlq1Zm5uqWZ2bQlmjm0VZpZHDWaiWV1msk2lZsptGWbmWhVm7jchZvo+oWcabR1nJjm9Zy45uWdCIt1nRjMZZ05CpWdSIz1nZm0tZ2ptMWdybSVnliVdZ5oqtWeibSFnqlsNZ65VQWfaIpln7iPdZ\/45wWgGI0FoDiKFaCZtRWhGbT1oYlrpaGptSWhybUFofm05aIJBQWiWbTVopldhaL4ziWjWbVlo2m1daPI+pWkCbU1pBmEtaRpRrWkmbVVpajaVaYptYWmaVd1pqm1labJtUWn+WuVqSlH1amptaWpuVUVq8m1tavZtfWr6bXFrBicVawpteWsmOuVrLm11azIyZWtCba1rWm2Ra15thWuGShFrjm2Ba5ptiWumbY1r6m2Va+5tmWwmK8FsLm2hbDJtnWxabaVsij+xbKptsWyyS2lswiWRbMptqWzabbVs+m25bQJtxW0Obb1tFm3BbUI5xW1GbcltUjUVbVZtzW1eOmltYkbZbWpt0W1ubdVtcjnlbXY1GW1+W0Ftji0dbZIzHW2WbdltmindbaZt3W2uRt1twm3hbcZuhW3ObeVt1m3pbeJt7W3qbfVuAm35bg5uAW4WR7luHiUZbiI7nW4mIwFuLkXZbjIquW42Os1uPjUdblZOGW5ePQFuYiq9bmZKIW5qS6FubiLZbnItYW52V81ufjsBbootxW6OQ6VukjrpbpZdHW6abgVuui3tbsI3JW7OKUVu0iYNbtY+qW7aJxlu4m4JbuZdlW7+PaFvCjuJbw5uDW8SK8VvFk9BbxpanW8ebhFvJm4VbzJV4W9Cbh1vSiqZb04v1W9SbhlvbirBb3ZBRW96bi1vfjkBb4YnHW+Kbilvkm4hb5ZuMW+abiVvnlEpb6J7LW+mQUlvrm41b7pe+W\/Cbjlvzm5Bb9ZKeW\/abj1v4kKFb+o6bW\/6Rzlv\/jvVcAZWVXAKQ6lwEjstcBZuRXAaPq1wHm5JcCJuTXAmI0VwKkbhcC5BxXA2blFwOk7FcD4+sXBGPrVwTm5VcFpDrXBqPrlwgm5ZcIpuXXCSW3lwom5hcLYvEXDGPQVw4m5lcOZuaXDqO2lw7kEtcPJPyXD2Qc1w+lPZcP5RBXECLx1xBm5tcRYuPXEabnFxIi\/xcSpPNXEuJrlxNjnJcTpudXE+boFxQm59cUYv7XFObnlxVk1dcXpGuXGCTalxhjsZcZJF3XGWXmlxsm6JcbpujXG+T1FxxjlJcdpulXHmbplyMm6dckIryXJGbqFyUm6lcoYmqXKiRWlypiuJcq5urXKyWplyxkdBcs4p4XLabrVy3m69cuIrdXLubrFy8m65cvpuxXMWbsFzHm7Jc2ZuzXOCTu1zhi6xc6InjXOmbtFzqm7lc7Zu3XO+V9VzwlfRc9pOHXPqbtlz7j3Nc\/Zu1XQeQkl0Lm7pdDo3oXRGbwF0Um8FdFZu7XRaKUl0Xm7xdGJvFXRmbxF0am8NdG5u\/XR+bvl0im8JdKZX2XUubyV1Mm8ZdTpvIXVCXkl1Sm8ddXJu9XWmQk11sm8pdb421XXOby112m8xdgpvPXYSbzl2Hm81di5OIXYybuF2Qm9VdnZvRXaKb0F2sm9JdrpvTXbeb1l26l+RdvJvXXb2b1F3Jm9hdzIreXc2b2V3Sm9td05vaXdab3F3bm91d3ZDsXd6PQl3hj4Rd45GDXeWNSF3mjbZd541JXeiLkF3rm95d7o23XfGMyF3ym99d85akXfSUYl31m+Bd941KXfuKql39kkZd\/ovQXgKOc14DlXpeBpS\/Xgub4V4MivNeEZvkXhaSn14Zm+NeGpviXhub5V4dkuleJZCDXiuOdF4tkMheL5HRXjCLQV4zkqBeNpvmXjeb5144j+1ePZZYXkCb6l5Dm+leRJvoXkWVnV5Hm\/FeTJZ5Xk6b615Um+1eVZaLXleb7F5fm+5eYZSmXmKb715jlbxeZJvwXnKKsV5zlb1edJROXnWb8l52m\/NeeI1LXnmKsl56m\/Ree4y2XnyXY159l0hefor0Xn+b9l6BkqFeg41MXoSPr16HlN1eio+wXo+PmF6VkupelpX3XpeTWF6ajU1enJV7XqCb916mk3hep43AXquMyV6tkutetYjBXraPjl63jU5euJdmXsGb+F7Cm\/lew5RwXsib+l7Jl\/VeyphMXs+b\/F7Qm\/te04pmXtacQF7anENe25xEXt2cQl7flV9e4I+xXuGcRl7inEVe45xBXuicR17pnEhe7JxJXvCcTF7xnEpe85xLXvScTV72iYRe95LsXvicTl76jJpe+4n0XvyUVV7+nE9e\/5P5XwGV2V8DnFBfBJhNXwmcUV8Klb5fC5xUXwyYn18NmK9fD46uXxCT818RnFVfE4t8XxSSol8ViPhfFpxWXxeVpF8YjU9fG5JvXx+S7V8llu1fJoy3XyeMyl8pnFdfLZxYXy+cXl8xjuNfNZKjXzeLrV84nFlfPJVKXz6SZV9BnFpfSJxbX0qLrl9MnFxfTpxdX1GcX19Tk5ZfVpxgX1ecYV9ZnGJfXJxTX12cUl9hnGNfYoxgX2aVRl9pjcpfapVWX2uSpF9slWpfbZxkX3CPsl9xiWVfc5xlX3ecZl95lvBffJTeX3+caV+AiZ1fgZCqX4KcaF+DnGdfhIxhX4WR0l+HnG1fiJxrX4qcal+Ll6VfjIzjX5CPmV+RnGxfkpNrX5OPXV+Xk75fmJxwX5mcb1+enG5foJxxX6GM5F+onHJfqZWcX6qPel+tnHNfrpT3X7OTv1+0kqVfuZNPX7ycdF+9i0pfw5BTX8WVS1\/MivVfzZRFX9acdV\/XjnVf2JZZX9mWWl\/ciZ5f3Zx6X+CSiV\/knHdf64n1X\/Ccq1\/xnHlf9ZRPX\/iceF\/7nHZf\/Y2aX\/+cfGAOnINgD5yJYBCcgWASk3tgFZyGYBaVfGAZnIBgG5yFYByX5WAdjnZgIJHTYCGcfWAli31gJpyIYCeQq2AoiYVgKZyCYCqJ9mArnIdgL4uvYDGchGA6nIpgQZyMYEKclmBDnJRgRpyRYEqckGBLl\/ZgTZySYFCLsGBSjVBgVY+aYFmcmWBanItgX5yPYGCcfmBiifhgY5yTYGSclWBlknBgaI2mYGmJtmBqnI1ga5yYYGycl2Bti7Fgb5GnYHCKhmB1jGJgd5yOYIGcmmCDnJ1ghJyfYImOu2CLnKVgjJLuYI2cm2CSnKNglIn3YJacoWCXnKJgmpyeYJucoGCfjOVgoJdJYKOKs2CmiXhgp5ykYKmUWWCqiKtgspTfYLOce2C0nKpgtZyuYLaW42C4nKdgvJOJYL2crGDFj+5gxpytYMeT1WDRmGZg05ypYNicr2DajZtg3JDJYN+I0mDgnKhg4ZymYOOReWDnnJxg6I5TYPCRxGDxnLtg85F6YPSctmD2nLNg95y0YPmO5GD6nLdg+5y6YQCctWEBj0RhA5y4YQacsmEIlvphCZb5YQ2cvGEOnL1hD4jTYRWcsWEai\/BhG4ikYR+KtGEhnLlhJ5zBYSicwGEsnMVhNJzGYTycxGE9nMdhPpy\/YT+cw2FCnMhhRJzJYUecvmFIjpxhSpzCYUuR1GFMjVFhTZywYU6QVGFTnNZhVZXnYViczGFZnM1hWpzOYV2c1WFfnNRhYpadYWOKtWFlnNJhZ4xkYWiKU2FrnM9hbpe2YW+c0WFwiNRhcZzTYXOcymF0nNBhdZzXYXaMY2F3nMthfpd8YYKXSmGHnNphipzeYY6RnmGQl\/dhkZzfYZSc3GGWnNlhmZzYYZqc3WGkla5hp5OyYamMZWGrnOBhrJzbYa6c4WGyjJthtomvYbqc6WG+irZhw5znYcac6GHHjadhyJzmYcmc5GHKnONhy5zqYcyc4mHNnOxh0In5YeOc7mHmnO1h8pKmYfSc8WH2nO9h95zlYfiMnGH6nPBh\/Jz0Yf2c82H+nPVh\/5zyYgCc9mIInPdiCZz4YgqV6GIMnPpiDZz5Yg6PXmIQkKxiEYnkYhKJ+mIUnPtiFoi9YhqQymIbnPxiHebBYh6dQGIfjIFiIZ1BYiaQ7WIqnUJiLp1DYi+LWWIwnURiMp1FYjOdRmI0kdViOIzLYjuW32I\/lltiQI+KYkGdR2JHkO5iSOe7YkmU4GJLjuhiTY3LYk6dSGJTkcViVZWlYliR72JbnUtiXp1JYmCdTGJjnUpiaJ1NYm6Vr2JxiLVidpV9YnmU4WJ8nU5ifp1RYn+Ps2KAi1pigp1PYoOdVmKEj7RiiZ1QYoqUY2KRl31ikp1SYpOdU2KUnVdilZOKYpadVGKXjVJimJDcYpudZWKclLJinpHwYquU4mKsnatisZX4YrWS72K5lpViu51aYryJn2K9kopiwp1jYsWSU2LGnV1ix51kYsidX2LJnWZiyp1iYsydYWLNlI9iz51bYtCJ+2LRnVli0ouRYtOR8WLUnVVi151YYtiNU2LZkNli24+1YtydYGLdlHFi4IuSYuGKZ2Lsiodi7ZBAYu6daGLvnW1i8Z1pYvOMnWL1nW5i9o5BYveNiWL+j0Vi\/51cYwGOnWMCnWtjB453YwidbGMJiMJjDJ1nYxGSp2MZi5NjH4uyYyedamMoiKVjK43BYy+QVWM6kvBjPZTSYz6dcGM\/kX1jSZGoY0yOSmNNnXFjT51zY1Cdb2NVld9jV5K7Y1yRe2NnlfljaI7MY2mdgGNrnX5jbpCYY3KMnmN2nXhjd4+3Y3qT5mN7lFBjgJ12Y4ORfGOIjvZjiZ17Y4yPtmOOnXVjj516Y5KUcmOWnXRjmIxAY5uKfGOfnXxjoJepY6GNzGOiklRjo515Y6WQ2mOnjVRjqJCEY6mJhmOqkVtjq513Y6yLZGOyjGZjtJLNY7WdfWO7kX5jvp2BY8Cdg2PDkbVjxJ2JY8adhGPJnYZjz5VgY9CS8WPSnYdj1pdLY9qXZ2Pbirdj4YisY+OdhWPpnYJj7or2Y\/SJh2P2nYhj+pdoZAadjGQNkblkD52TZBOdjWQWnYpkF52RZBydcmQmnY5kKJ2SZCyUwGQtk4tkNJ2LZDadj2Q6jGdkPo3vZEKQ22ROnZdkWJNFZGedlGRploBkb52VZHadlmR4lsxkepCgZIOMgmSInZ1kko5UZJOdmmSVnZlkmpRRZJ6Ts2Skk1BkpZ2bZKmdnGSrlY9krZRkZK6OQmSwkO9kspZvZLmKaGS7naNkvJ2eZMGXaWTCnaVkxZ2hZMedomTNkYBk0p2gZNSdXmTYnaRk2p2fZOCdqWThnapk4pNGZOOdrGTmjkNk552nZOyLW2Tvna1k8Z2mZPKdsWT0nbBk9p2vZPqdsmT9nbRk\/o\/vZQCds2UFnbdlGJ21ZRydtmUdnZBlI525ZSSduGUqnZhlK526ZSydrmUvjnhlNJ27ZTWdvGU2nb5lN529ZTidv2U5ifxlO41VZT6V+mU\/kK1lRYzMZUidwWVNncRlT5VxZVGLfmVVncNlVp3CZVeUc2VYncVlWYuzZV2dx2VencZlYoq4ZWOOVWVmk9ZlbIxoZXCQlGVynchldJCuZXWTR2V3lX5leJ3JZYKdymWDnctlh5W2ZYibfGWJkMRljJVrZY6N1mWQlONlkZTBZZeTbGWZl79lm53NZZyOzmWfnc5loYi0ZaSL0mWlkMtlp5WAZaudz2WsjmFlrZJmZa+OemWwkFZlt53QZbmV+2W8iZdlvY57ZcGd02XDndFlxJ3UZcWXt2XGndJly5D5Zcyd1WXPkbBl0p3WZdeK+GXZndhl253XZeCd2WXhndpl4or5ZeWT+mXmklVl54uMZeiOfGXpkYFl7I97Ze2IrmXxndtl+omgZfud32YCjVZmA53eZgaNqWYHj7hmCp3dZgyPuWYOlr5mD42oZhOI1WYUkMxmHJ3kZh+Qr2YgiWZmJY90ZieWhmYojfBmLY+6Zi+QpWY0neNmNZ3hZjad4mY8kotmP55FZkGd6GZCjp5mQ41XZkSd5mZJnedmS5BXZk+d5WZSjk5mXZ3qZl6d6WZfne5mYp3vZmSd62ZmikFmZ53sZmid7WZplNNmbpWBZm+MaWZwnfBmdJCwZnaPu2Z6knFmgYvFZoOd8WaEnfVmh4nJZoid8maJnfRmjp3zZpGPi2aWkmdml4jDZpid9madnfdmopKoZqaX72arjmJmrpXpZrSWXGa4nkFmuZ35Zryd\/Ga+nftmwZ34ZsSeQGbHk9xmyZ36ZtaeQmbZj4xm2p5DZtyXambdlJhm4J5EZuaeRmbpnkdm8J5IZvKLyGbziWdm9I1YZvWeSWb3nkpm+I+RZvmRgmb8mdZm\/ZFdZv6RXGb\/kdZnAI3FZwOY8GcIjI5nCZdMZwuV\/GcNlZ5nD55LZxSN8WcVkr1nFp5MZxeYTmcbll1nHZKpZx6eTWcfivpnJp5OZyeeT2colthnKpaiZyuWlmcslntnLY5EZy6eUWcxjulnNJZwZzaeU2c3nlZnOJ5VZzqK92c9i4BnP55SZ0GeVGdGnldnSZCZZ06Xm2dPiMdnUI3eZ1GRumdTjttnVo\/xZ1meWmdck21nXp5YZ1+RqWdgnllnYY\/wZ2KW22djnltnZJ5cZ2WXiGdqnmFnbY1ZZ2+UdGdwnl5ncZOMZ3Kd3GdzneBndYtuZ3eUZmd8nmBnfo+8Z3+UwmeFnmZnh5T4Z4meXWeLnmNnjJ5iZ5CQzWeVlo1nl5fRZ5qWh2ecicpnnY59Z6CYZ2ehnmVnopCVZ6aeZGepnl9nr4zNZ7Oea2e0nmlntonLZ7eeZ2e4nm1nuZ5zZ8GRxmfElb9nxp51Z8qVQWfOnnRnz5SQZ9CWXmfRirln05D1Z9SPX2fYktFn2pdNZ92ecGfenm9n4p5xZ+SebmfnnnZn6Z5sZ+yeamfunnJn755oZ\/GSjGfzlvZn9I7EZ\/WN8mf7jbhn\/paPZ\/+KYGgCksxoA5PIaASJaGgTkPBoFpCyaBeMSWgennhoIY1aaCKKnGgpnnpoKoqUaCuegWgynn1oNJDxaDiKamg5japoPIppaD2NzWhAnntoQYyFaEKMamhDk41oRp55aEiIxGhNnnxoTp5+aFCLy2hRjEtoU4q6aFSLamhZnoJoXI33aF2WkWhfjlZoY56DaGeVT2h0no9odomxaHeehGh+npVof56FaIGXwGiDnoxohZR+aI2elGiPnodok4iyaJSeiWiXjVtom56LaJ2eimifnoZooJ6RaKKPvWimmutop4zmaKiXnGitnohor5LyaLCKQmixjatos56AaLWekGi2ioFouZ6OaLqekmi8k45oxIr8aMaesGjJlsdoyp6XaMuK+2jNnp5o0pZfaNSen2jVnqFo156laNiemWjakklo35OPaOCeqWjhnpxo456maOeeoGjukFho756qaPKQsWj5nqho+oq7aQCYb2kBnpZpBJ6kaQWI1mkInphpC5a4aQyenWkNkEFpDpLFaQ+ek2kSnqNpGZCaaRqerWkbipFpHIyfaSGer2kinpppI56uaSWep2kmnptpKJ6raSqerGkwnr1pNJPMaTaeomk5nrlpPZ67aT+S1mlKl2tpU5WWaVSetmlVkchpWZ68aVqRXmlcnrNpXZ7AaV6ev2lgk+1pYZ6+aWKT6GlqnsJpa561aW2Lxmlunrhpb498aXOUgGl0nrppdYvJaXeesml4nrRpeZ6xaXyYT2l9inlpfp63aYGewWmCilRpio3laY6JfGmRntJplJhQaZWe1WmbkFlpnJ7UaaCe02mnntBprp7EabGe4WmynsNptJ7Wabuezmm+nslpv57GacGex2nDns9px+qgacqezGnLjVxpzJLGac2RhGnOnspp0J7FadOeyGnYl2xp2ZaKad2ezWnentdp557faeie2GnrnuVp7Z7jafKe3mn5nt1p+5LOaf2RhWn\/nttqAp7ZagWe4GoKnuZqC5Tzagye7GoSnudqE57qahSe5GoXkpRqGZVXahue2moenuJqH4++aiGWzWoinvZqI57paimMoGoqiaFqK4p+ai6e0Wo1j79qNp7uajie9Wo5jvdqOoqSaj2STWpEnutqR57wakie9GpLi7RqWItralme8mpfi0BqYZPJamKe8WpmnvNqcp7tanie72p\/ioBqgJJoaoSe+mqNnvhqjoznapCe92qXn0BqnJ53aqCe+Wqinvtqo578aqqfS2qsn0dqrp6NarOfRmq4n0Vqu59CasGe6GrCn0Rqw59DatGfSWrTmEVq2p9MatuL+Wren0hq359KauiUpWrqn01q+p9RavufTmsEl5NrBZ9Pawqe3GsSn1JrFp9Tax2JVGsfn1VrIIyHayGOn2sji9NrJ4miazKXfms3n1drOJ9WazmfWWs6i1xrPYvUaz6KvGtDn1xrR59ba0mfXWtMicxrTpJWa1CfXmtTir1rVJ9ga1mfX2tbn2FrX59ia2GfY2tijn5rY5Cza2SNn2tmlZBraZXga2qYY2tvjpVrc43Oa3SX8Gt4n2RreZ9la3uOgGt\/n2ZrgJ9na4OfaWuEn2hrhpZ3a4mPfWuKjupri45ja42famuVn2xrlpBCa5ifa2uen21rpJ9ua6qfb2urn3Brr59xa7Gfc2uyn3Jrs590a7SJo2u1kmlrt591a7qORWu7imtrvJ92a7+TYWvAmsprxYtCa8afd2vLn3hrzZXqa86WiGvSk8Vr0595a9SU5GvYlPlr25bRa9+femvrn3xr7J97a++ffmvzn31sCJ+BbA+OgWwRlq9sE5+CbBSfg2wXi0NsG5+EbCOfhmwkn4VsNJCFbDeVWGw4iWlsPpTDbECS82xBj2BsQouBbE6UxGxQjqxsVZ+IbFeKvmxaiZhsXZPwbF6fh2xfjV1sYJJybGKfiWxon5Fsap+KbHCRv2xyi4Jsc5+SbHqMiGx9i0Rsfp+QbIGfjmyCn4tsg5eAbIiSvmyMk9dsjZ+MbJCflGySn5Nsk4xCbJaJq2yZjblsmp+NbJufj2yhlnZsopHybKuWl2yun5xssZ+dbLOJzWy4laZsuZb7bLqfn2y7jqFsvI\/AbL2fmGy+n55sv4mIbMGLtWzEn5VsxZ+abMmQ8mzKlJFszJTlbNOfl2zVlkBs15+ZbNmfomzbn6Bs3Z+bbOGWQWzilGds44uDbOWTRGzoko1s6p+jbO+foWzwkdds8Z+WbPOJam0Ll21tDJ+ubRKfrW0XkPRtGZ+qbRuXjG0ek7RtH5+kbSWSw20piWttKo1ebSufp20yj0ZtM5+sbTWfq202n6ZtOJ+pbTuKiG09n6htPpRobUGXrG1Ej\/JtRZDzbVmftG1an7JtXJVsbWOfr21kn7FtZolZbWmNX21qmFFtbIpcbW6Vgm10l4Ftd4pDbXiQWm15n7NthZ+4bYiPwW2Ml09tjp+1bZOfsG2Vn7ZtmZfcbZuTk22ck8Btr4pVbbKJdG21n7xtuJ+\/bbyXwW3Al4RtxZ\/GbcafwG3Hn71ty5fSbcyfw23Rj2lt0p\/FbdWfym3Yk5Ft2Z\/Ibd6fwm3hkldt5J\/Jbeafvm3on8Rt6p\/LbeuI+m3sn8Ft7p\/MbfGQW23zj35t9ZWjbfeNrG35n7lt+p\/HbfuTWW4FkLRuB4qJbgiNz24Jj8JuCp+7bguPYW4TjGtuFZ+6bhmf0G4aj41uG4y4bh2f324fn9luIIuUbiGTbm4jn9RuJJ\/dbiWIrW4miVFuKYm3biuf1m4skapuLZ\/Nbi6fz24vjWBuOJ\/gbjqf224+n9NuQ5\/abkqWqW5Nn9huTp\/cblaMzm5Yj8NuW5JYbl+f0m5nl05ua5\/Vbm6fzm5vk5Jucp\/Rbnaf125+mHBuf468boCWnm6Cn+FujJSsbo+f7W6QjLlulo+Abpif426cl61unY1hbp+f8G6iiOxupZ\/ubqqf4m6vn+husp\/qbraXbm63n+VuupNNbr2f527Cn+9uxJ\/pbsWWxW7Jn+Ruy46gbsyf\/G7Riopu05\/mbtSf627Vn+xu3ZHqbt6R2G7sn\/Ru75\/6bvKf+G70k0hu9+BCbvif9W7+n\/Zu\/5\/ebwGLmW8ClVlvBo69bwmNl28PmFJvEZ\/ybxPgQW8UiYlvFZGGbyCUmW8iir9vI5f4byuWn28sktBvMZ\/5bzKf+284kVFvPuBAbz+f929Bn\/FvRYrBb1SMiW9Y4E5vW+BJb1yQ9m9fioNvZI+Bb2bgUm9t4EtvbpKqb2\/gSG9wktdvdOBrb3jgRW964ERvfOBNb4DgR2+B4EZvguBMb4SQn2+G4ENvjuBPb5HgUG+XisBvoeBVb6PgVG+k4FZvquBZb7GTYm+z4FNvueBXb8CMg2\/BkfdvwuBRb8OUWm\/G4Fhv1OBdb9XgW2\/Y4F5v2+Bhb9\/gWm\/gjYpv4ZRHb+Sft2\/rl5Rv7OBcb+7gYG\/vkfNv8eBfb\/PgSm\/26Ilv+uBkb\/7gaHAB4GZwCeBicAvgY3AP4GdwEeBlcBWVbXAY4G1wGuBqcBvgaXAd4GxwHpPScB\/gbnAmkpVwJ5HrcCyQo3Aw4G9wMuBxcD7gcHBMn\/NwUeBycFiT5XBj4HNwa4nOcG+TlHBwikRweIuEcHyO3HB9jdBwiZhGcIqQhnCOiYpwkuB1cJngdHCs4HhwrZJZcK7ge3Cv4HZws+B6cLjgeXC5k19wuojXcMiX83DL4H1wz4lHcNnggHDd4H5w3+B8cPHgd3D5lkJw\/eCCcQnggXEUiYtxGeCEcRqVsHEc4INxIZazcSaPxXE2kVJxPI\/EcUmX+XFM4IpxTpD3cVXghnFW4ItxWYmMcWLgiXFklIFxZeCFcWbgiHFnj8ZxaZTPcWzgjHFujs9xfZD4cYTgj3GI4IdxioxGcY\/gjXGUl29xleCQcZnqpHGfj25xqOCRcazgknGxlE1xueCUcb7glXHDlFJxyJOVccngl3HO4Jlx0JfTcdLglnHU4Jhx1YmNcdfgk3Hfmnpx4OCaceWRh3Hmjldx5+Cccezgm3HtkENx7pnXcfXgnXH54J9x++COcfzgnnH\/4KByBpSacg3goXIQ4KJyG+CjcijgpHIqktxyLOCmci3gpXIw4KdyMuCocjWO3XI2lYNyOpbqcjvgqXI84KpyPZF1cj6OonI\/4KtyQOCsckbgrXJHldBySJTFckvgrnJMlHZyUpKrcljgr3JZieVyW4uNcl2WxHJflrRyYYmycmKYU3JnlnFyaZWocnKQtXJ04LByeZPBcn2MoXJ+4LFygI3ScoHgs3KC4LJyh+C0cpLgtXKW4LZyoItdcqLgt3Kn4LhyrIyicq+UxnKy4Lpyto\/zcrnguXLCi7Zyw+C7csTgvXLG4LxyzuC+ctCMz3LS4L9y14vnctmRX3LbjZ1y4ODBcuHgwnLi4MBy6Y7rcuyTxnLti7dy9+DEcviSS3L54MNy\/JhUcv2UgnMK4MdzFuDJcxfgxnMbltJzHODIcx3gynMfl8JzJeDOcyngzXMqkpZzK5RMcy6Mo3Mv4MxzNODLczaXUHM3l1FzPuDPcz+JjnNEjZZzRY6Cc07g0HNP4NFzV+DTc2OPYnNo4NVzauDUc3Dg1nNyimxzdeDYc3jg13N64Npze+DZc4SMunOHl6ZziYvKc4uJpHOWi+hzqYrfc7KX5nOz4Nxzu+Dec8Dg33PCic9zyODbc8qOWHPNkr9zzuDdc97g4nPgjuxz5eDgc+qMXXPtlMdz7uDhc\/Hg\/HP44Odz\/oy7dAOLhXQF4OR0BpeddAmXrnQikfR0JeDmdDLg6HQzl9R0NIvVdDWU+nQ2lGl0OuDpdD\/g63RB4O50VeDqdFng7XRajOh0W4lsdFzg73RekJB0X+DsdGCX2nRj4PJ0ZOqidGng8HRq4PN0b+DldHDg8XRzjbp0duD0dH7g9XSDl550i+D2dJ7g93Si4ON0p+D4dLCKwnS9jqN0yuD5dM\/g+nTU4Pt03IladODhQHTilVp04+FBdOaKonTn4UJ06eFDdO7hRHTw4UZ08eFHdPLhRXT2lXJ09+FJdPjhSHUD4Ut1BOFKdQXhTHUM4U11DeFPdQ7hTnURjZl1E+FRdRXhUHUYisN1GpBydRyTW3Ue4VJ1H5C2dSOOWXUliZl1JuFTdSiXcHUrleF1LOFUdTCTY3Uxl1J1Mo1idTOQXHU3kmp1OJmydTqSrHU7ieZ1POFVdUThVnVG4Vt1SeFZdUrhWHVLncB1TIpFdU3hV3VPiNh1UZSodVSUyHVZl691WuFcdVvhWnVcknt1XZCkdWCUqXVilUx1ZOFedWWXqnVmjGx1Z+FfdWnhXXVqlNR1a+FgdW3hYXVwiNl1c4\/0dXThZnV24WN1d5PrdXjhYnV\/i0V1guFpdYbhZHWH4WV1ieFodYrhZ3WLlUR1jpFhdY+RYHWRi151lOFqdZrha3Wd4Wx1o+FudaXhbXWriXV1seF2dbKU5nWz4XB1teFydbjhdHW5kF11vOF1db3hc3W+jr51wuFvdcPhcXXFlWF1x4\/HdcrheHXN4Xd10uF5ddSOpHXVja112JOXddnhenXbksl13uF8deKXn3Xj4Xt16ZGJdfDhgnXy4YR18+GFdfSSc3X64YN1\/OGAdf7hfXX\/4X52AeGBdgnhiHYL4YZ2DeGHdh\/hiXYg4Yt2IeGMdiLhjXYk4Y52J+GKdjDhkHY04Y92O+GRdkKXw3ZG4ZR2R+GSdkjhk3ZMiuB2Upb8dlaVyHZY4ZZ2XOGVdmHhl3Zi4Zh2Z+GcdmjhmXZp4Zp2auGbdmzhnXZw4Z52cuGfdnbhoHZ44aF2epStdnuTb3Z84aJ2fZSSdn6VU3aA4aN2g+GkdoSTSXaGikZ2h41jdojhpXaL4aZ2juGndpCOSHaT4al2luGodpnhqnaa4at2rpTndrDhrHa04a12t+qJdrjhrna54a92uuGwdr+OTXbC4bF2w5R1dsaWfnbIiW12yol2ds3hsnbS4bR21uGzdteTkHbbkLd23J9Ydt7htXbflr924eG2duOKxHbklNV25eG3dufhuHbq4bl27pbadvKW03b0krx2+JGKdvvhu3b+j4J3AY\/IdwThvncH4b13COG8dwmU+3cLisV3DIyndxvhxHce4cF3H5BedyCWsHck4cB3JeHCdybhw3cp4b93N+HFdzjhxnc6kq13PIrhd0CShXdH4cd3WuHId1vhy3dhkId3Y5PCd2XhzHdmlnJ3aOHJd2vhynd54c93fuHOd3\/hzXeL4dF3juHQd5Hh0nee4dR3oOHTd6WVy3esj3V3rZfEd7Dh1Xezk7V3tuHWd7nh13e74dt3vOHZd73h2ne\/4dh3x+Hcd83h3XfX4d532uHfd9uWtXfc4eB34pbud+Ph4Xflkm1355SKd+mL6Xftklp37uHid++LuHfzkM53\/OHjeAKNu3gM4eR4EuHleBSMpHgVjdN4IOHneCWTdXgmjdR4J4tteDKWQ3g0lGp4OpN2eD+Ne3hF4el4XY\/JeGuXsHhsjWR4b4yleHKUoXh04et4fOHteIGM6XiG4ex4h5L0eIzh73iNilZ4juHqeJGU6HiTiU94lY3qeJeYcXia4e54o+HweKeVyXipkNd4quHyeK\/h83i14fF4uopteLzh+Xi+4fh4wY6leMXh+njG4fV4yuH7eMvh9njQlNZ40eH0eNTh93ja4kF45+JAeOiWgXjs4fx474jpePTiQ3j94kJ5AY\/KeQfiRHkOkWJ5EeJGeRLiRXkZ4kd5JuHmeSrh6Hkr4kl5LOJIeTqOpnk8l+d5Po7QeUDiSnlBjFZ5R4tfeUiLRnlJjoN5UJdTeVPiUHlV4k95VpFjeVfiTHla4k55XY9qeV6QX3lf4k15YOJLeWKUSXllj8t5aJVbeW2N1Xl3k5h5euJReX\/iUnmA4mh5gYvWeYSYXHmFkVR5iuJTeY2J0HmOkvV5j5WfeZ3iVHmmi5p5p+JVeariV3mu4lh5sJRIebPiWXm54lp5uuJbeb2L13m+idF5v5PDecCPR3nBjoR5yeJcecuPSHnRich50pViedXiXXnYlOl535FkeeHiYHnj4mF55JSJeeaQYHnn4l556ZKBeeziX3nwj8x5+4jaegCLSHoI4mJ6C5L2eg3iY3oOkMV6FJareheVQnoY4mR6GeJlehqSdHocl8V6H+JneiDiZnouju16MeJpejKI7no34mx6O+JqejyJ0no9jG16PuJrej+NZXpAjZJ6QpXkekPibXpGlnN6SeJvek2Qz3pOiW56T4m4elCIqnpX4m56YeJwemLicXpjj\/V6aeJyemuKbnpw4nR6dIyKenaLhnp54nV6eovzen3idnp\/kPp6gZPLeoOQ3nqEjfN6iOJ3epKSgnqTkYt6leJ5epbie3qX4nh6mOJ6ep+MQXqp4nx6qoxFeq6Lh3qvl3F6sOJ+erbigHq6iU16v+KDesOKlnrE4oJ6xeKBesfihXrI4n16yuKGesuXp3rN4od6z+KIetKa8nrT4op61eKJetnii3ra4ox63Jezet3ijXrf6O164I\/NeuHijnri4o964492euWTtnrm4pB66pJHeu3ikXrvklt68OKSevaLo3r4mV56+ZJ8evqOsXr\/isZ7AuKTewTioHsG4pZ7CIuIewrilXsL4qJ7D+KUexGPznsY4ph7GeKZexuTSnse4pp7IIp9eyWQeXsmlYR7KOKceyyR5nsz4pd7NeKbezbinXs5jfl7ReKke0aVTXtIlKR7SZOZe0uL2HtM4qN7TeKhe0+Us3tQ4p57UZJ9e1KTm3tUk5p7Vo30e13itntl4qZ7Z+Koe2ziq3tu4qx7cOKpe3Hiqnt04qd7deKle3rin3uGlc17h4nTe4vis3uN4rB7j+K1e5LitHuUlJN7lZale5eOWnuY4q57meK3e5risnuc4rF7neKte5\/ir3uhisd7qpJce62Q+3uxlKB7tOK8e7iUonvAkN97weK5e8SUzXvG4r17x5XRe8mSenvL4rh7zOK6e8\/iu3vd4r574I7Ce+STxHvl4sN75uLCe+niv3vtmFV78+LIe\/bizHv34sl8AOLFfAfixnwN4st8EeLAfBKZ03wT4sd8FOLBfBfiynwf4tB8IYrIfCPizXwn4s58KuLPfCvi0nw34tF8OJT0fD3i03w+l\/p8P5XrfEDi2HxD4tV8TOLUfE2Q0HxP4td8UOLZfFTi1nxW4t18WOLafF\/i23xg4sR8ZOLcfGXi3nxs4t98c5XEfHXi4Hx+luB8gYvMfIKMSHyD4uF8iZWyfIuQiHyNlq58kOLifJKXsXyVlJR8l5FlfJiUU3ybj2x8n4i+fKHi53yi4uV8pOLjfKWKn3ynj898qOLofKvi5nyt4uR8ruLsfLHi63yy4up8s+LpfLni7Xy94u58vpC4fMDi73zC4vF8xeLwfMqM0HzOkVd80uLzfNaTnHzY4vJ83OL0fN6Vs3zfkYx84I1mfOLi9Xznl8Z87+L3fPLi+Hz04vl89uL6fPiOhXz64vt8+4xufP6Lin0Ai0l9AuNAfQSW8X0FjWd9BuL8fQrjQ30LluR9DZRbfRCVUn0Uj4N9FeNCfReO0X0YjWh9GY6GfRqLiX0blbR9HONBfSCRZn0hlmF9Io31fSuOh30sktt9LuNGfS+X3X0wjdd9MuNHfTOQYX0140l9OY\/QfTqNrn0\/40h9Qo9JfUOMvH1EkWd9ReNEfUbjSn1L40V9TIxvfU7jTX1P41F9UIyLfVbjTH1b41V9Xo1pfWGXjX1iiLp9Y+NSfWaLi31o4099buNQfXGTnX1y4059c+NLfXWKR312kOJ9eYymfX3jV32J41R9j+NWfZPjU32ZjHB9mpGxfZvjWH2ckY59n+NlfaLjYX2j41t9q+NffayO+H2tiNt9ruNafa\/jYn2w42Z9sY1qfbKW1H20ktR9teNcfbjjZH2641l9u5Jdfb3jXn2+iLt9v5bIfcfjXX3Ki9l9y5Tqfc+RjX3Rl8590o+PfdXjjn3Y42d92pD8fdzjY33d42h93uNqfeCS933h42195ONpfeiV0n3pisl97JbJfe+I3H3y42x99Jf7ffvja34BiY9+BJPqfgXjbn4J43V+CuNvfgvjdn4S43J+G5Sbfh6OyH4f43R+IeNxfiLjd34j43B+Jo9jfiuWRH4uj2t+MeNzfjLjgH4143t+N+N+fjnjfH4644F+O+N6fj3jYH4+kNF+QZTJfkPjfX5G43h+SpFAfkuMcX5Nj0p+VJBEflWRVX5W44R+WeOGflrjh35d44N+XuOFfmbjeX5n44J+aeOKfmrjiX5tlpp+cIxKfnnjiH5744x+fOOLfn3jj35\/45F+go5bfoPjjX6I45J+ieOTfozjlH6O45p+j5NafpDjln6S45V+k+OXfpTjmH6W45l+m+ObfpzjnH82isp\/OOOdfzrjnn9F459\/TOOgf03joX9O46J\/UOOjf1HjpH9U46Z\/VeOlf1jjp39f46h\/YOOpf2fjrH9o46p\/aeOrf2qN339rjHJ\/bpJ1f3CUsX9yj5B\/dZRsf3eU6394461\/eZzrf4Ljrn+D47B\/hZeFf4bjr3+H47J\/iOOxf4qXcn+M47N\/jpT8f5TjtH+a47d\/neO2f57jtX+j47h\/pIxRf6iRQX+pi2B\/ruO8f6\/juX+y47p\/tuO9f7jjvn+547t\/vYlIf8GJpX\/F48B\/xuPBf8rjwn\/Ml4J\/0o9Lf9TjxH\/V48N\/4JCJf+HjxX\/m48Z\/6ePHf+uK43\/wist\/8+PIf\/njyX\/7lnx\/\/JeDgACXc4ABmFaAA41sgATjzIAFjtKABuPLgAvjzYAMjqeAEJHPgBLjzoAVjWuAF5bVgBjjz4AZ49CAHOPRgCHj0oAo49OAM46ogDaW64A749WAPZJegD\/j1IBG49eASuPWgFLj2IBWkLmAWOPZgFrj2oBelbeAX+PbgGGRj4Bi49yAaOPdgG+X\/IBw4+CAcuPfgHPj3oB0kq6AduPhgHeQRYB54+KAfePjgH6YV4B\/4+SAhOPlgIXj54CG4+aAh5SjgImT94CLmF2AjJSngJPj6YCWj9GAmJVJgJrj6oCb4+iAnYrMgKGM0oCijoiApZTsgKmMqICqlmKArOPtgK3j64CvjW2AsY1ugLKI54C0jeaAupR4gMOI3YDE4\/KAxpJfgMyUd4DOkdmA1uP0gNnj8IDa4\/OA2+PugN3j8YDelkWA4YzTgOSI+4Dl4++A7+P2gPHj94D0k7eA+Iu5gPzkRYD9lFyBAo6JgQWLuoEGkMaBB5hlgQiWrIEJ4\/WBCpDSgRqLcoEb4\/iBI+P6gSnj+YEv4\/uBMZJFgTOUXYE5kq+BPuRCgUbkQYFL4\/yBTpB0gVCVhYFR5ESBU+RDgVSNb4FVmHKBX+RUgWXkSIFm5EmBa47ugW7kR4FwjZiBceRGgXTkSoF4krCBeZWggXqRQoF\/kdqBgOROgYLkT4GD5EuBiORMgYrkTYGPjXCBk+RVgZXkUYGalYaBnJaMgZ2VR4Gg5FCBo+RTgaTkUoGolmOBqeRWgbDkV4GzkVaBteRYgbjkWoG65F6BveRbgb7kWYG\/lF6BwORcgcLkXYHGibCByORkgcnkX4HN5GCB0eRhgdORn4HY5GOB2eRigdrkZYHf5GaB4ORngeOQYoHlieeB5+RogeiX1YHqjqmB7Y9MgfOOioH0knaB+uRpgfvkaoH8iVCB\/uRrggHkbIIC5G2CBeRuggfkb4IIi7uCCZ2oggrkcIIMkOOCDeRxgg6OyYIQ5HKCEpiughbkc4IXldyCGIraghuRQ4Icj3eCHpWRgh+PTYIp5HSCKo1xgivkdYIslMqCLuSEgjPkd4I1kceCNpSVgjeMvYI45HaCOZFEgkDkeIJHkviCWOR6glnkeYJa5HyCXeR7gl\/kfYJi5ICCZOR+gmaKzYJo5IGCauSCgmvkg4Juja+Cb5fHgnHkhYJykEaCdomQgnfkhoJ45IeCfuSIgouI8IKN5ImCkuSKgpmVh4KdjsWCn+SMgqWKSIKmiLCCq+SLgqzkjoKtlG2Cr5BjgrGJ1IKzlkaCuIx8grmL2oK75I2CvYnogsWKoYLRiZGC0uSSgtOX6ILUkduC15VjgtnknoLbidWC3OScgt7kmoLf5JGC4eSPguPkkILljuGC5ovqgueSl4Lrk8+C8YlwgvPklIL05JOC+eSZgvrklYL75JiDApbOgwPkl4MEidaDBYqdgwbkm4MJ5J2DDoxzgxbkoYMX5KqDGOSrgxyIqYMj5LKDKIjvgyvkqYMv5KiDMeSjgzLkooM05KCDNeSfgzaSg4M4kfmDOeSlg0DkpINF5KeDSZGQg0qMdINPiWCDUOSmg1KNcoNYkZGDc+S4g3XkuYN3ideDe4msg3zktoOF5KyDh+S0g4nku4OK5LWDjuSzg5PkloOW5LGDmuStg56KzoOf5K+DoOS6g6LksIOo5LyDquSug6uUnIOxl4mDteS3g73kzYPB5MWDxZCbg8qLZYPMi9uDzuTAg9OJ2YPWj9KD2OTDg9yN2IPfk3CD4OTIg+mV7IPr5L+D74nYg\/CM1IPxlUiD8uTJg\/TkvYP35MaD++TQg\/3kwYQD5MKEBJO4hAfkx4QL5MSEDJZHhA3kyoQOiN6EE+S+hCDkzIQi5MuEKZSLhCrk0oQs5N2EMYqehDXk4IQ45M6EPOTThD2XjoRG5NyESZd0hE6XqIRXkpiEW4qLhGGVkoRi5OKEY5OfhGaIr4Rp5NuEa+TXhGyRkoRt5NGEbuTZhG\/k3oRxlEuEdYiohHfk1oR55N+EepWYhILk2oSE5NWEi4\/ThJCPToSUjqqEmZbWhJyVZoSf5OWEoeTuhK3k2ISyipeEuI\/2hLnk44S75OiEvJGThL\/k5ITB5OuExJJ+hMbk7ITJl3WEyuThhMuKV4TN5OeE0OTqhNGWqoTW5O2E2eTmhNrk6YTslkiE7phAhPTk8YT85PiE\/+TwhQCOwYUG5M+FEZXMhROWoIUU5PeFFeT2hRfk8oUY5POFGolVhR\/k9YUh5O+FJpLThSzk9IUtiPyFNZGghT2VwYVA5PmFQeVAhUOU14VI5PyFSY\/UhUqOx4VL5UKFTou8hVXlQ4VXlZmFWOT7hVrk1IVj5PqFaJhuhWmToIVqlZOFbeVKhXflUIV+5VGFgOVEhYSUloWH5U6FiOVGhYrlSIWQ5VKFkeVHhZTlS4WXiZKFmZPjhZvlTIWc5U+FpOVFhaaRRYWo5UmFqY5GhaqQZIWrjE+FrJbyha6W94Wvj5KFueVWhbrlVIXBmG2FyeVThc2XlYXP5VWF0OVXhdXlWIXc5VuF3eVZheSToYXl5VqF6ZTLherlTYX3j5OF+eVchfrlYYX7kZSF\/uVghgLlQYYG5WKGB5FohgrlXYYL5V+GE+VehhafUIYXn0GGGuVkhiLlY4Ytl5aGL+G6hjDlZYY\/5WaGTeVnhk6M1YZQi3OGVOVphlWZfIZai5WGXJe4hl6L8YZf5WqGZ+VrhmuSjoZx5WyGeZP4hnuIuIaKieGGi+VxhozlcoaT5W2GlY5chqPlboaklGGGqeVvhqrlcIar5XqGr+V0hrDld4a25XOGxOV1hsbldobHjtaGyeV4hsuSYIbNjHWGzophhtTle4bZil6G2+WBht7lfIbf5YCG5JS4hunlfYbs5X6G7ZVnhu6U2Ibv5YKG+JH7hvnljIb75YiG\/onphwDlhocClkmHA+WHhwblhIcI5YWHCeWKhwrljYcN5YuHEeWJhxLlg4cYkneHGuWUhxyWqIcl5ZKHKeWThzTljoc35ZCHO+WRhz\/lj4dJkOSHS5hYh0zlmIdO5ZmHU+Wfh1WQSYdX5ZuHWeWeh1\/llodg5ZWHY+Wgh2aJ2odo5ZyHauWhh27lnYd05ZqHdpKxh3jll4d\/lIiHguWlh42XWoef5aSHouWjh6vlrIev5aaHs+Wuh7qXhoe75bGHveWoh8DlqYfE5a2HxuWwh8flr4fL5aeH0OWqh9Llu4fg5bSH7+Wyh\/Lls4f25biH9+W5h\/mKSYf7i2GH\/uW3iAXloogN5baIDuW6iA\/ltYgR5byIFeW+iBblvYgh5cCIIuW\/iCPleYgn5cSIMeXBiDblwog55cOIO+XFiECMjIhC5ceIROXGiEaPT4hMjXOITZ+liFLlyIhTj3CIV4pYiFnlyYhbiXGIXY\/ViF7lyohhjXSIYuXLiGOI34holVyIa+XMiHCQiohy5dOIdeXQiHeSj4h95dGIfuXOiH+L3IiB5c2IguXUiIiMVYiLkdyIjeXaiJLl1oiWkbOIl+XViJnl2Iie5c+IouXZiKTl24irlO2IruXXiLDl3Iix5d6ItIzRiLXl0oi3iL+Iv+XdiMGN2YjCl\/SIw+XfiMTl4IjFkZWIz5egiNTl4YjVl1SI2OXiiNnl44jcleKI3eXkiN+Nvojhl6GI6OXpiPLl6ojzj9aI9OXoiPiXh4j55eWI\/OXniP2Qu4j+kJ6JAuXmiQTl64kHlaGJCuXtiQzl7IkQioyJEpZKiRPl7okd5fqJHuXwiSXl8Ykq5fKJK+XziTbl94k45fiJO+X2iUHl9IlD5e+JROX1iUzl+YlN6LWJVommiV7l\/Ilfi92JYOX7iWTmQYlm5kCJauZDiW3mQolv5kSJco9QiXTmRYl35kaJfuZHiX+QvImBl3aJg+ZIiYaVoomHlGWJiOZJiYrmSomLjKmJj4tLiZPmS4mWjouJl5RgiZjmTImaim+JoeZNiabmT4mnl5eJqeZOiaqQZYms5lCJr+ZRibLmUomzis+JuuZTib3mVIm\/5lWJwOZWidKKcIna5leJ3OZYid3mWYnjifCJ5pBHiefmWon05luJ+OZcigCMvooCkvmKA+ZdigiMdooKkHWKDOZgig6ToooQ5l+KE4xQihbmXooXkfWKGItMihvmYYod5mKKH4\/XiiOMjYol5mOKKpZLii2Q3Yoxi5aKM5bzijSRaYo25mSKOpBmijuSkIo8j9iKQeZlikbmaIpI5mmKUI28ilGRwIpS5meKVI\/ZilWVXYpb5maKXo6MimCJcopi5m2KY4x3imaOjoppjo2Ka5hsimzmbIpt5muKbpFGinCLbIpxmGKKcopZinOP2op85mqKguZvioTmcIqF5m6Kh4zWiomXX4qMjo+KjZRGipHmc4qTkL6KlZJhipiXVYqa5naKnozqiqCQvYqh5nKKo+Z3iqSM64ql5nSKpuZ1iqjmcYqskOCKrZPHirCSToqyiduKuZTuiryLYoq\/krKKwuZ6isTmeIrHkmuKy5C\/isyK0IrN5nmKz5B6itKXyIrWmF+K2uZ7itvmh4rckrOK3uaGiuDmg4rh5ouK4uaEiuTmgIrmkvqK5+Z+iuvmfIrtl0CK7o6QivHmgYrz5n2K9+aFiviPlIr6jL+K\/pH4iwCWZIsBiXmLAojgiwSTo4sH5omLDOaIiw6T5IsQ5o2LFOaCixbmjIsX5o6LGYyqixrmiosbjXWLHY7TiyDmj4shl3eLJuaSiyjmlYsr5pOLLJVUizPmkIs5i96LPuaUi0HmlotJ5pqLTOaXi07mmYtP5piLVuabi1iOr4ta5p2LW+aci1yViItf5p+LZox4i2vmnots5qCLb+ahi3CLY4tx47+Lco\/3i3Tmoot3jOyLfeaji4DmpIuDjl2Lip3Mi4zmpYuO5qaLkI9Ri5Lmp4uT5qiLluapi5nmqoua5quMN5JKjDrmrIw\/5q6MQeatjEaTpIxI5q+MSpZMjEzmsIxO5rGMUOayjFXms4xak9iMYY\/bjGLmtIxqjYuMa5isjGzmtYx45raMeZVejHrmt4x85r+Mgua4jIXmuoyJ5rmMiua7jIyWZYyN5ryMjua9jJTmvoyY5sCMnYpMjJ6S5YyglYmMoY3gjKKNdoynlW6MqIndjKmUzIyq5sOMq4rRjKyQ04yt5sKMrubHjK+SmYywluGMsubFjLPmxoy0i02MtubIjLeUg4y4kd2Mu5TvjLyTXIy95sSMv5ZmjMCJ6ozB5sqMwphHjMOSwIzEmGSMx46RjMjmyYzKka+MzebajM6RR4zRk\/aM05VvjNrmzYzbjl6M3I6SjN6P3IzglIWM4oyrjOPmzIzk5suM5pWKjOqOv4ztk3GM+ubPjPvm0Iz8jXeM\/ebOjQTm0Y0F5tKNB+bUjQiRoY0K5tONC4rkjQ3m1o0P5tWNEObXjRPm2Y0U5tuNFubcjWSQ1I1mjs2NZ+bdjWuKcY1t5t6NcJGWjXHm341z5uCNdJWLjXeLTo2B5uGNhZK0jYqJeo2Z5uKNo47vjaiQlo2zkauNuubljb7m5I3C5uONy+brjczm6Y3P5uaN1ubojdrm543b5uqN3YuXjd\/m7o3hkNWN4+bvjeiM143q5uyN6+btje+YSI3zkrWN9ZFIjfzm8I3\/5vOOCObxjgnm8o4Kl3iOD5OljhDm9o4d5vSOHub1jh\/m944q50iOMOb6jjTm+4415vmOQub4jkSS+45H50COSOdEjknnQY5K5vyOTOdCjlDnQ45V50qOWedFjl+Q1o5g50eOY+dJjmTnRo5y50yOdI9SjnbnS458502OgedOjoTnUY6F51COh+dPjornU46L51KOjZb0jpHnVY6T51SOlOdWjpnnV46h51mOqudYjquQZ46s51qOr4vrjrDnW46x512OvudejsXnX47G51yOyOdgjsqO1I7L52GOzItPjs2MUo7SjKyO2+dijt+T7o7ik12O4+djjuvnZo74jrKO++dljvznZI79jHmO\/udnjwOKco8F52mPCY3ajwrnaI8M53GPEudrjxPnbY8UleOPFedqjxnnbI8b53CPHOdujx2LUI8f52+PJudyjymUeY8ql9aPL49TjzPnc484l0GPOed1jzvndI8+53iPP5dgj0Lnd49Eio2PRed2j0bne49J53qPTOd5j02TUY9O53yPV+d9j1znfo9fjYyPYYxEj2LngI9j54GPZOeCj5uQaI+c54OPno6rj5\/nhI+j54WPp5mfj6iZno+t54aPruOQj6\/nh4+wkkOPsZBKj7KUX4+354iPupXTj7uS0o+8jZ6Pv5JIj8KJSY\/ElpiPxZB2j86MfY\/Ri9+P1JXUj9rniY\/i54uP5eeKj+aJ3o\/pk\/SP6ueMj+uUl4\/tk1KP7+eNj\/CPcY\/054+P95bAj\/jnno\/555GP+ueSj\/2Sx5AAkd6QAZGXkAOTppAF55CQBot0kAvnmZAN55aQDuejkA+Tp5AQkoCQEeeTkBOS\/JAUk3KQFeeUkBbnmJAXkICQGZSHkBqSypAdkMCQHueXkB+RrJAgkaKQIeeVkCKIp5AjmEGQJ+eakC6R35Axj1SQMpBpkDXnnJA255uQOIjtkDnnnZA8lU6QPuelkEGT2ZBCkIuQRZJ4kEeL9pBJ56SQSpdWkEuJXpBNldWQTonfkE\/nn5BQ56CQUeehkFLnopBTk7mQVJJCkFWI4ZBW56aQWOenkFnqoZBckbuQXueokGCJk5BhkWuQY4ytkGWXeZBo56mQaZNLkG2RmJBujtWQb+eqkHLnrZB1j4WQduerkHeRSpB4kUmQeojikHyXyZB956+Qf5TwkIDnsZCB57CQgueukIPihJCEitKQh+eOkInns5CK57KQj+e0kJGXV5Cjk9+QppZNkKjntZCqjteQr+e2kLHnt5C157iQuJNAkMGI6JDKjXiQzphZkNvnvJDhjFOQ4ue5kOTnupDolZSQ7YpzkPWXWJD3i72Q\/ZNzkQLnvZES576RGee\/kS2TQZEw58GRMufAkUmT0ZFK58KRS49VkUyO3pFNlHqRTpKRkVKO8JFUkIyRVufDkVjnxJFikHyRY+fFkWXnxpFp58eRapePkWyPVpFy58mRc+fIkXWNeZF3jZOReI5fkYLnzJGHj4aRiefLkYvnypGNkeeRkIztkZKQwZGXlK6RnI9YkaLnzZGkj92RqufQkavnzpGv58+RtOfSkbXn0ZG4j\/iRuufTkcDn1JHB59WRxpTOkceN0ZHIjt+RyefWkcvn15HMl6KRzY9kkc6W7JHPl8qR0OfYkdGL4JHW59mR2JNCkdvn3JHcipiR3ZBqkd\/n2pHh59uR45LekeaWdJHni\/qR9efekfbn35H8592R\/+fhkg2T3ZIOimKSEeflkhTn4pIV5+SSHufgkinobpIs5+OSNJfpkjeM2JI\/5+2SRJNTkkXn6JJI5+uSSefpkkvn7pJQ5++SV+fnklrn9JJbiZSSXufmkmKUq5Jk5+qSZo\/eknGNepJ+lmeSgIvikoOPZZKFk7qSkZFMkpPn8pKV5+ySlufxkpiWwZKakraSm+fzkpzn8JKtkUuSt+f3krnn9pLP5\/WS0pZOkuSPm5Lp5\/iS6pXdku2Jc5LylWWS85KSkviLmJL65\/qS\/I18kwaOS5MP5\/mTEJCNkxiQjpMZ6ECTGuhCkyCP+ZMi6EGTI+hDkyaL0ZMolWSTK47gkyyYQpMu5\/yTL432kzKYXpM16EWTOuhEkzvoRpNE5\/uTS5Pnk02TdJNUktWTVuhLk1uSYpNc6EeTYOhIk2yMTJNu6EqTdYyuk3zoSZN+j9+TjIqZk5ToT5OWjb2Tl5GZk5qSyJOnilqTrOhNk63oTpOuksGTsOhMk7noUJPD6FaTyOhZk9DoWJPRk0yT1uhRk9foUpPY6FWT3ehXk+GLvpPk6FqT5ehUk+joU5QD6F6UB+hflBDoYJQT6F2UFOhclBiP4JQZk6iUGuhblCHoZJQr6GKUNehjlDboYZQ4kfaUOuhllEHoZpRE6GiUUYrTlFLoZ5RTlviUWuhzlFvoaZRe6GyUYOhqlGLoa5Rq6G2UcOhvlHXocJR36HGUfOh0lH3ocpR+6HWUf+h3lIHodpV3kreVgJbllYLoeJWDkU2Vh+h5lYmVwpWK6HqVi4pKlY+JW5WRitWVk4rUlZToe5WW6HyVmOh9lZnofpWg6ICVoorWlaOKdJWkjX2VpZS0lafogpWo6IGVreiDlbKJe5W56IaVu+iFlbzohJW+6IeVw+iKlceIxZXK6IiVzOiMlc3oi5XU6I6V1eiNldboj5XYk6yV3OiQleHokZXi6JOV5eiSlhyVjJYh6JSWKOiVliqN45Yu6JaWL+iXljKWaJY7kWqWP4iilkCRyZZC6JiWRJWNlkvom5ZM6JmWTY1+lk\/ompZQjMCWW5XDllzonZZd6J+WXuiell\/ooJZiiUCWY5B3lmSPnJZliteWZuihlmqUhpZs6KOWcIlBlnLoopZzksKWdZfLlnaTqZZ36JyWeJeklnqMr5Z9l3qWhYv3loaXspaIjEeWipHglovkQJaN6KSWjopLlo+Qj5aUinWWleimlpfop5aY6KWWmYyElpuN25acj+GWoIlClqOX15an6KmWqOeslqroqJaw6KyWseiqlrLoq5a06K2WtuiulreX6pa46K+WueiwlruQx5a8lLmWwJCdlsGK5ZbEl1mWxYnrlsaPV5bHjNmWyeizlsvospbMjpOWzei0ls7osZbRjkeW1ei4ltblq5bZmdSW25CXltzotpbil6OW45PvluiJSpbqkOGW6460lvCVtZbyiV+W9pfrlveXi5b56LmW+5NklwCO+ZcE6LqXBui7lweQa5cI6LyXCpfslw3ot5cO6L6XD+jAlxHov5cT6L2XFujBlxnowpcckZqXHonglyTow5cnlraXKujElzDoxZcymEmXOJ5Qlznoxpc96MeXPujIl0LozJdE6MmXRujKl0joy5dJ6M2XUpDCl1aW9ZdZkMOXXOjOl16U8Zdg6M+XYepyl2KWypdk6NCXZujRl2jo0pdpinaXa+jUl22QeJdx6NWXdIxDl3no1pd66NqXfOjYl4Ho2ZeEipOXhejXl4bo25eL6NyXjYjGl4\/o3ZeQ6N6XmI\/il5zo35egi2aXo+jil6bo4Zeo6OCXq+aRl62V2pez6OOXtOjkl8Po5ZfG6OaXyOjnl8vo6JfTitiX3Ojpl+3o6pfulEKX8ujsl\/OJuZf16O+X9ujul\/uJQ5f\/i7+YAZXFmAKSuJgDjaCYBY2AmAaPh5gIkHuYDOjxmA\/o8JgQl2GYEYrmmBKU0JgTk9qYF5CcmBiXzJgajHqYIej0mCTo85gslmqYLZOqmDSJb5g36PWYOOjymDuVcJg8l4qYPej2mEbo95hL6PmYTJHomE2KephOinuYT+j4mFSK55hVjLCYWIromFuTXphel96YZ4zamGvo+phv6PuYcOj8mHHpQJhz6UKYdOlBmKiVl5iq6UOYr+lEmLHpRZi26UaYw+lImMTpR5jG6UmY25TymNzjypjfkEiY4otRmOnpSpjr6UuY7ZmqmO6fWpjvlNGY8oj5mPSIuZj8jpSY\/ZZPmP6P\/JkD6UyZBZbdmQnpTZkKl3uZDIlhmRCOYJkS6U6ZE4nsmRTpT5kY6VCZHelSmR7pU5kg6VWZIelRmSTpVJkoitmZLOlWmS7pV5k96ViZPulZmULpWplF6VyZSelbmUvpXplM6WGZUOldmVHpX5lS6WCZVelimVeLwJmWjvGZl+ljmZjpZJmZjYGZpellmaiKXZmslG6Zrelmma7pZ5mzknmZtJPpmbzpaJnBlJ2ZxJHKmcWJd5nGi+yZyIvtmdCSk5nR6W2Z0ovumdWJ7ZnY6WyZ2+lqmd3pa5nf6WmZ4ul3me3pbpnu6W+Z8elwmfLpcZn46XOZ++lymf+PeJoB6XSaBel2mg6LUpoP6XWaEpGbmhOMsZoZ6XiaKJHLmivpeZowk6uaN+l6mj7pgJpA6X2aQul8mkPpfppF6XuaTemCmlXpgZpX6YSaWovBmlvpg5pf6YWaYumGmmTpiJpl6YeaaemJmmrpi5pr6YqaqI2cmq3pjJqw6Y2auIpbmrzpjprA6Y+axJCRms\/pkJrR6ZGa0+mSmtTpk5rYjYKa3umUmt\/plZri6Zaa4+mXmubpmJrqlK+a6+mamu2VRZru6Zua7+mZmvHpnZr06Zya9+memvvpn5sG6aCbGOmhmxrpopsf6aObIumkmyPppZsl6aabJ+mnmyjpqJsp6ambKumqmy7pq5sv6aybMZ9UmzLprZs74vabPItTm0GKQJtCjbCbQ+mvm0TprptFlqObTemxm07psptP6bCbUemzm1SWgptY6bSbWoubm2+YRJt06bWbg+m3m46IvJuR6bibkpWpm5PptpuW6bmbl+m6m5\/pu5ug6bybqOm9m6qWjpurjkybrY34m66RTpu06b6buenBm8Dpv5vG6cKbyYzvm8rpwJvP6cOb0enEm9LpxZvU6cmb1o5Jm9uR4pvh6cqb4unHm+Ppxpvk6cib6Ix+m\/Dpzpvx6c2b8unMm\/WIsZwE6dicBunUnAjp1ZwJ6dGcCunXnAzp05wNioKcEJhrnBLp1pwT6dKcFOnQnBXpz5wb6dqcIendnCTp3Jwl6ducLZVonC7p2ZwviPGcMOnenDLp4Jw5io+cOunLnDuJVpw+6eKcRunhnEfp35xIkkycUpaQnFeX2Jxa6eOcYOnknGfp5Zx26eaceOnnnOWSuZzn6eic6ZS1nOvp7Zzs6emc8OnqnPOWUJz0lsKc9pPOnQPp7p0G6e+dB5O8nQjp7J0J6eudDomonRLp950V6fadG4mVnR\/p9J0j6fOdJunxnSiKm50q6fCdK46wnSyJp507jYOdPun6nT\/p+Z1B6fidROn1nUbp+51I6fydUOpEnVHqQ51Z6kWdXIlMnV3qQJ1e6kGdYI2UnWGWt51k6kKdbJZRnW\/qSp1y6kadeupLnYfqSJ2J6kedj4x7nZrqTJ2k6k2dqepOnavqSZ2v6fKdsupPnbSS35246lOduupUnbvqUp3B6lGdwupXncTqUJ3G6lWdz+pWndPqWZ3Z6lid5upbne3qXJ3v6l2d8phonfjqWp35kemd+o3rnf3qXp4a6l+eG+pgnh7qYZ516mKeeIyynnnqY5596mSef46tnoHqZZ6I6maei+pnnozqaJ6R6muekuppnpOYW56V6mqel5ftnp3qbJ6fl9mepeptnqaUnp6p6m6equpwnq3qcZ646m+euY2NnrqWy567loOevJv1nr6fgJ6\/lpuexImpnszqc57Ni2+ezup0ns\/qdZ7Q6nae0o2VntTqd57Y4NKe2ZbZntuR4Z7c6nie3ep6nt7qeZ7g6nue5ep8nujqfZ7v6n6e9OqAnvbqgZ736oKe+eqDnvvqhJ786oWe\/eqGnwfqh58I6oifDpNDnxOM258V6oqfIJFsnyHqi58s6oyfO5VAnz7qjZ9K6o6fS+JWn07m2J9P6OufUuqPn1TqkJ9f6pKfYOqTn2HqlJ9il+6fY+qRn2bqlZ9n6pafauqYn2zql59y6pqfduqbn3fqmZ+Nl7Sfleqcn5zqnZ+d4nOfoOqe\/wGBSf8DgZT\/BIGQ\/wWBk\/8GgZX\/CIFp\/wmBav8KgZb\/C4F7\/wyBQ\/8OgUT\/D4Fe\/xCCT\/8RglD\/EoJR\/xOCUv8UglP\/FYJU\/xaCVf8Xglb\/GIJX\/xmCWP8agUb\/G4FH\/xyBg\/8dgYH\/HoGE\/x+BSP8ggZf\/IYJg\/yKCYf8jgmL\/JIJj\/yWCZP8mgmX\/J4Jm\/yiCZ\/8pgmj\/KoJp\/yuCav8sgmv\/LYJs\/y6Cbf8vgm7\/MIJv\/zGCcP8ygnH\/M4Jy\/zSCc\/81gnT\/NoJ1\/zeCdv84gnf\/OYJ4\/zqCef87gW3\/PIFf\/z2Bbv8+gU\/\/P4FR\/0CBTf9BgoH\/QoKC\/0OCg\/9EgoT\/RYKF\/0aChv9Hgof\/SIKI\/0mCif9Kgor\/S4KL\/0yCjP9Ngo3\/ToKO\/0+Cj\/9QgpD\/UYKR\/1KCkv9TgpP\/VIKU\/1WClf9Wgpb\/V4KX\/1iCmP9Zgpn\/WoKa\/1uBb\/9cgWL\/XYFw\/2EAof9iAKL\/YwCj\/2QApP9lAKX\/ZgCm\/2cAp\/9oAKj\/aQCp\/2oAqv9rAKv\/bACs\/20Arf9uAK7\/bwCv\/3AAsP9xALH\/cgCy\/3MAs\/90ALT\/dQC1\/3YAtv93ALf\/eAC4\/3kAuf96ALr\/ewC7\/3wAvP99AL3\/fgC+\/38Av\/+AAMD\/gQDB\/4IAwv+DAMP\/hADE\/4UAxf+GAMb\/hwDH\/4gAyP+JAMn\/igDK\/4sAy\/+MAMz\/jQDN\/44Azv+PAM\/\/kADQ\/5EA0f+SANL\/kwDT\/5QA1P+VANX\/lgDW\/5cA1\/+YANj\/mQDZ\/5oA2v+bANv\/nADc\/50A3f+eAN7\/nwDf\/+OBUP\/lgY8=', 7070);
        })(text = d_project.text || (d_project.text = {}));
    })(d_project = com.d_project || (com.d_project = {}));
})(com || (com = {}));
var com;
(function (com) {
    var d_project;
    (function (d_project) {
        var qrcodesplitter;
        (function (qrcodesplitter) {
            var stringToBytes_SJIS = com.d_project.text.stringToBytes_SJIS;
            var QRCode = (function () {
                function QRCode() {
                    this.typeNumber = 1;
                    this.errorCorrectLevel = qrcodesplitter.ErrorCorrectLevel.L;
                    this.qrDataList = [];
                }
                QRCode.prototype.getTypeNumber = function () {
                    return this.typeNumber;
                };
                QRCode.prototype.setTypeNumber = function (typeNumber) {
                    this.typeNumber = typeNumber;
                };
                QRCode.prototype.getErrorCorrectLevel = function () {
                    return this.errorCorrectLevel;
                };
                QRCode.prototype.setErrorCorrectLevel = function (errorCorrectLevel) {
                    this.errorCorrectLevel = errorCorrectLevel;
                };
                QRCode.prototype.clearData = function () {
                    this.qrDataList = [];
                };
                QRCode.prototype.addData = function (qrData) {
                    if (qrData instanceof qrcodesplitter.QRData) {
                        this.qrDataList.push(qrData);
                    }
                    else if (typeof qrData === 'string') {
                        this.qrDataList.push(new qrcodesplitter.QR8BitByte(qrData));
                    }
                    else {
                        throw typeof qrData;
                    }
                };
                QRCode.prototype.getDataCount = function () {
                    return this.qrDataList.length;
                };
                QRCode.prototype.getData = function (index) {
                    return this.qrDataList[index];
                };
                QRCode.prototype.isDark = function (row, col) {
                    if (this.modules[row][col] != null) {
                        return this.modules[row][col];
                    }
                    else {
                        return false;
                    }
                };
                QRCode.prototype.getModuleCount = function () {
                    return this.moduleCount;
                };
                QRCode.prototype.make = function (onlyrects) {
                    this.makeImpl(false, this.getBestMaskPattern(onlyrects), onlyrects);
                };
                QRCode.prototype.getBestMaskPattern = function (onlyrects) {
                    var minLostPoint = 0;
                    var pattern = 0;
                    for (var i = 0; i < 8; i += 1) {
                        this.makeImpl(true, i, onlyrects);
                        var lostPoint = qrcodesplitter.QRUtil.getLostPoint(this);
                        if (i == 0 || minLostPoint > lostPoint) {
                            minLostPoint = lostPoint;
                            pattern = i;
                        }
                    }
                    return pattern;
                };
                QRCode.prototype.makeImpl = function (test, maskPattern, onlyrects) {
                    this.moduleCount = this.typeNumber * 4 + 17;
                    this.modules = [];
                    for (var i = 0; i < this.moduleCount; i += 1) {
                        this.modules.push([]);
                        for (var j = 0; j < this.moduleCount; j += 1) {
                            this.modules[i].push(null);
                        }
                    }
                    this.setupPositionProbePattern(0, 0);
                    this.setupPositionProbePattern(this.moduleCount - 7, 0);
                    this.setupPositionProbePattern(0, this.moduleCount - 7);
                    this.setupPositionAdjustPattern();
                    if (onlyrects)
                        return;
                    this.setupTypeInfo(test, maskPattern);
                    if (this.typeNumber >= 7) {
                        this.setupTypeNumber(test);
                    }
                    var data = QRCode.createData(this.typeNumber, this.errorCorrectLevel, this.qrDataList);
                    this.mapData(data, maskPattern);
                };
                QRCode.prototype.mapData = function (data, maskPattern) {
                    var inc = -1;
                    var row = this.moduleCount - 1;
                    var bitIndex = 7;
                    var byteIndex = 0;
                    var n = 0;
                    var maskFunc = qrcodesplitter.QRUtil.getMaskFunc(maskPattern);
                    data.push(parseInt("10101010", 2));
                    data.push(parseInt("10101010", 2));
                    data.push(parseInt("10101010", 2));
                    data.push(parseInt("10101010", 2));
                    for (var col = this.moduleCount - 1; col > 0; col -= 2) {
                        if (col == 6) {
                            col -= 1;
                        }
                        while (true) {
                            for (var c = 0; c < 2; c += 1) {
                                if (this.modules[row][col - c] == null) {
                                    var dark = false;
                                    if (byteIndex < data.length) {
                                        dark = (((data[byteIndex] >>> bitIndex) & 1) == 1);
                                    }
                                    this.modules[row][col - c] = dark;
                                    bitIndex -= 1;
                                    if (bitIndex == -1) {
                                        byteIndex += 1;
                                        bitIndex = 7;
                                    }
                                }
                            }
                            row += inc;
                            if (row < 0 || this.moduleCount <= row) {
                                row -= inc;
                                inc = -inc;
                                break;
                            }
                        }
                    }
                };
                QRCode.prototype.setupPositionAdjustPattern = function () {
                    var pos = qrcodesplitter.QRUtil.getPatternPosition(this.typeNumber);
                    for (var i = 0; i < pos.length; i += 1) {
                        for (var j = 0; j < pos.length; j += 1) {
                            var row = pos[i];
                            var col = pos[j];
                            if (this.modules[row][col] != null) {
                                continue;
                            }
                            for (var r = -2; r <= 2; r += 1) {
                                for (var c = -2; c <= 2; c += 1) {
                                    if (r == -2 || r == 2 || c == -2 || c == 2
                                        || (r == 0 && c == 0)) {
                                        this.modules[row + r][col + c] = true;
                                    }
                                    else {
                                        this.modules[row + r][col + c] = false;
                                    }
                                }
                            }
                        }
                    }
                };
                QRCode.prototype.setupPositionProbePattern = function (row, col) {
                    for (var r = -1; r <= 7; r += 1) {
                        for (var c = -1; c <= 7; c += 1) {
                            if (row + r <= -1 || this.moduleCount <= row + r
                                || col + c <= -1 || this.moduleCount <= col + c) {
                                continue;
                            }
                            if ((0 <= r && r <= 6 && (c == 0 || c == 6))
                                || (0 <= c && c <= 6 && (r == 0 || r == 6))
                                || (2 <= r && r <= 4 && 2 <= c && c <= 4)) {
                                this.modules[row + r][col + c] = true;
                            }
                            else {
                                this.modules[row + r][col + c] = false;
                            }
                        }
                    }
                };
                QRCode.prototype.setupTimingPattern = function () {
                    for (var r = 8; r < this.moduleCount - 8; r += 1) {
                        if (this.modules[r][6] != null) {
                            continue;
                        }
                        this.modules[r][6] = r % 2 == 0;
                    }
                    for (var c = 8; c < this.moduleCount - 8; c += 1) {
                        if (this.modules[6][c] != null) {
                            continue;
                        }
                        this.modules[6][c] = c % 2 == 0;
                    }
                };
                QRCode.prototype.setupTypeNumber = function (test) {
                    var bits = qrcodesplitter.QRUtil.getBCHTypeNumber(this.typeNumber);
                    for (var i = 0; i < 18; i += 1) {
                        this.modules[~~(i / 3)][i % 3 + this.moduleCount - 8 - 3] = i % 2 == 0;
                    }
                    for (var i = 0; i < 18; i += 1) {
                        this.modules[i % 3 + this.moduleCount - 8 - 3][~~(i / 3)] = i % 2 == 0;
                    }
                };
                QRCode.prototype.setupTypeInfo = function (test, maskPattern) {
                    var data = (this.errorCorrectLevel << 3) | maskPattern;
                    var bits = qrcodesplitter.QRUtil.getBCHTypeInfo(data);
                    for (var i = 0; i < 15; i += 1) {
                        var mod = i % 2 == 0;
                        if (i < 6) {
                            this.modules[i][8] = mod;
                        }
                        else if (i < 8) {
                            this.modules[i + 1][8] = mod;
                        }
                        else {
                            this.modules[this.moduleCount - 15 + i][8] = mod;
                        }
                    }
                    for (var i = 0; i < 15; i += 1) {
                        var mod = i % 2 == 0;
                        if (i < 8) {
                            this.modules[8][this.moduleCount - i - 1] = mod;
                        }
                        else if (i < 9) {
                            this.modules[8][15 - i - 1 + 1] = mod;
                        }
                        else {
                            this.modules[8][15 - i - 1] = mod;
                        }
                    }
                    this.modules[this.moduleCount - 8][8] = i % 2 == 0;
                };
                QRCode.createData = function (typeNumber, errorCorrectLevel, dataArray) {
                    var rsBlocks = qrcodesplitter.RSBlock.getRSBlocks(typeNumber, errorCorrectLevel);
                    var buffer = new qrcodesplitter.BitBuffer();
                    for (var i = 0; i < dataArray.length; i += 1) {
                        var data = dataArray[i];
                        buffer.put(parseInt("0101", 2), 4);
                        buffer.put(parseInt("0101010101010101".substring(data.getLengthInBits(typeNumber)), 2), data.getLengthInBits(typeNumber));
                        data.write(buffer);
                    }
                    var totalDataCount = 0;
                    for (var i = 0; i < rsBlocks.length; i += 1) {
                        totalDataCount += rsBlocks[i].getDataCount();
                    }
                    if (buffer.getLengthInBits() > totalDataCount * 8) {
                        throw 'code length overflow. ('
                            + buffer.getLengthInBits()
                            + '>'
                            + totalDataCount * 8
                            + ')';
                    }
                    if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
                        buffer.put(parseInt("0101", 2), 4);
                    }
                    var ynobits_i = 0;
                    function ynobits(bits) {
                        var s = "";
                        for (var i = 0; i < bits; i++)
                            s += ynobits_i++ % 2 == 0 ? '0' : '1';
                        return parseInt(s, 2);
                    }
                    while (buffer.getLengthInBits() % 8 != 0) {
                        buffer.putBit2(ynobits_i++ % 2 == 0);
                    }
                    while (true) {
                        if (buffer.getLengthInBits() >= totalDataCount * 8) {
                            break;
                        }
                        buffer.put(ynobits(8), 8);
                        if (buffer.getLengthInBits() >= totalDataCount * 8) {
                            break;
                        }
                        buffer.put(ynobits(8), 8);
                    }
                    return QRCode.createBytes(buffer, rsBlocks);
                };
                QRCode.createBytes = function (buffer, rsBlocks) {
                    var offset = 0;
                    var maxDcCount = 0;
                    var maxEcCount = 0;
                    var dcdata = [];
                    var ecdata = [];
                    for (var r = 0; r < rsBlocks.length; r += 1) {
                        dcdata.push([]);
                        ecdata.push([]);
                    }
                    function createNumArray(len) {
                        var a = [];
                        for (var i = 0; i < len; i += 1) {
                            a.push(0);
                        }
                        return a;
                    }
                    for (var r = 0; r < rsBlocks.length; r += 1) {
                        var dcCount = rsBlocks[r].getDataCount();
                        var ecCount = rsBlocks[r].getTotalCount() - dcCount;
                        maxDcCount = Math.max(maxDcCount, dcCount);
                        maxEcCount = Math.max(maxEcCount, ecCount);
                        dcdata[r] = createNumArray(dcCount);
                        for (var i = 0; i < dcdata[r].length; i += 1) {
                            dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
                        }
                        offset += dcCount;
                        var rsPoly = qrcodesplitter.QRUtil.getErrorCorrectPolynomial(ecCount);
                        var rawPoly = new qrcodesplitter.Polynomial(dcdata[r], rsPoly.getLength() - 1);
                        var modPoly = rawPoly.mod(rsPoly);
                        ecdata[r] = createNumArray(rsPoly.getLength() - 1);
                        for (var i = 0; i < ecdata[r].length; i += 1) {
                            var modIndex = i + modPoly.getLength() - ecdata[r].length;
                            ecdata[r][i] = (modIndex >= 0) ? modPoly.getAt(modIndex) : 0;
                        }
                    }
                    var totalCodeCount = 0;
                    for (var i = 0; i < rsBlocks.length; i += 1) {
                        totalCodeCount += rsBlocks[i].getTotalCount();
                    }
                    var data = createNumArray(totalCodeCount);
                    var index = 0;
                    for (var i = 0; i < maxDcCount; i += 1) {
                        for (var r = 0; r < rsBlocks.length; r += 1) {
                            if (i < dcdata[r].length) {
                                data[index] = dcdata[r][i];
                                index += 1;
                            }
                        }
                    }
                    var ynobits_i = 1;
                    function ynobits(bits) {
                        var s = "";
                        for (var i = 0; i < bits; i++)
                            s += ynobits_i++ % 2 == 0 ? '0' : '1';
                        return parseInt(s, 2);
                    }
                    for (var i = 0; i < maxEcCount; i += 1) {
                        for (var r = 0; r < rsBlocks.length; r += 1) {
                            if (i < ecdata[r].length) {
                                data[index] = ynobits(8);
                                index += 1;
                            }
                        }
                    }
                    return data;
                };
                QRCode.prototype.toDataURL = function (cellSize, margin) {
                    if (cellSize === void 0) { cellSize = 2; }
                    if (margin === void 0) { margin = cellSize * 4; }
                    var mods = this.getModuleCount();
                    var size = cellSize * mods + margin * 2;
                    var gif = new com.d_project.image.GIFImage(size, size);
                    for (var y = 0; y < size; y += 1) {
                        for (var x = 0; x < size; x += 1) {
                            if (margin <= x && x < size - margin &&
                                margin <= y && y < size - margin &&
                                this.isDark(~~((y - margin) / cellSize), ~~((x - margin) / cellSize))) {
                                gif.setPixel(x, y, 0);
                            }
                            else {
                                gif.setPixel(x, y, 1);
                            }
                        }
                    }
                    return gif.toDataURL();
                };
                QRCode.PAD0 = 0xEC;
                QRCode.PAD1 = 0x11;
                QRCode.stringToBytes = stringToBytes_SJIS;
                return QRCode;
            }());
            qrcodesplitter.QRCode = QRCode;
        })(qrcodesplitter = d_project.qrcodesplitter || (d_project.qrcodesplitter = {}));
    })(d_project = com.d_project || (com.d_project = {}));
})(com || (com = {}));
var com;
(function (com) {
    var d_project;
    (function (d_project) {
        var qrcodesplitter;
        (function (qrcodesplitter) {
            var QRKanji = (function (_super) {
                __extends(QRKanji, _super);
                function QRKanji(data) {
                    return _super.call(this, qrcodesplitter.Mode.MODE_KANJI, data) || this;
                }
                QRKanji.prototype.write = function (buffer) {
                    var data = qrcodesplitter.QRCode.stringToBytes(this.getData());
                    var i = 0;
                    var ynobits_i = 0;
                    function ynobits(bits) {
                        var s = "";
                        for (var i = 0; i < bits; i++)
                            s += ynobits_i++ % 2 == 0 ? '0' : '1';
                        return parseInt(s, 2);
                    }
                    while (i + 1 < data.length) {
                        var c = ((0xff & data[i]) << 8) | (0xff & data[i + 1]);
                        if (0x8140 <= c && c <= 0x9FFC) {
                            c -= 0x8140;
                        }
                        else if (0xE040 <= c && c <= 0xEBBF) {
                            c -= 0xC140;
                        }
                        else {
                            throw 'illegal char at ' + (i + 1) + '/' + c;
                        }
                        c = ((c >>> 8) & 0xff) * 0xC0 + (c & 0xff);
                        buffer.put(ynobits(13), 13);
                        i += 2;
                    }
                    if (i < data.length) {
                        throw 'illegal char at ' + (i + 1);
                    }
                };
                QRKanji.prototype.getLength = function () {
                    return qrcodesplitter.QRCode.stringToBytes(this.getData()).length / 2;
                };
                return QRKanji;
            }(qrcodesplitter.QRData));
            qrcodesplitter.QRKanji = QRKanji;
        })(qrcodesplitter = d_project.qrcodesplitter || (d_project.qrcodesplitter = {}));
    })(d_project = com.d_project || (com.d_project = {}));
})(com || (com = {}));
var com;
(function (com) {
    var d_project;
    (function (d_project) {
        var qrcodesplitter;
        (function (qrcodesplitter) {
            var QRMath = (function () {
                function QRMath() {
                    throw 'error';
                }
                QRMath.glog = function (n) {
                    if (n < 1) {
                        throw 'log(' + n + ')';
                    }
                    return QRMath.LOG_TABLE[n];
                };
                QRMath.gexp = function (n) {
                    while (n < 0) {
                        n += 255;
                    }
                    while (n >= 256) {
                        n -= 255;
                    }
                    return QRMath.EXP_TABLE[n];
                };
                QRMath.initialize = function () {
                    QRMath.EXP_TABLE = [];
                    QRMath.LOG_TABLE = [];
                    for (var i = 0; i < 256; i += 1) {
                        QRMath.EXP_TABLE.push(i < 8 ? 1 << i :
                            QRMath.EXP_TABLE[i - 4] ^
                                QRMath.EXP_TABLE[i - 5] ^
                                QRMath.EXP_TABLE[i - 6] ^
                                QRMath.EXP_TABLE[i - 8]);
                        QRMath.LOG_TABLE.push(0);
                    }
                    for (var i = 0; i < 255; i += 1) {
                        QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]] = i;
                    }
                }();
                return QRMath;
            }());
            qrcodesplitter.QRMath = QRMath;
        })(qrcodesplitter = d_project.qrcodesplitter || (d_project.qrcodesplitter = {}));
    })(d_project = com.d_project || (com.d_project = {}));
})(com || (com = {}));
var com;
(function (com) {
    var d_project;
    (function (d_project) {
        var qrcodesplitter;
        (function (qrcodesplitter) {
            var QRNumber = (function (_super) {
                __extends(QRNumber, _super);
                function QRNumber(data) {
                    return _super.call(this, qrcodesplitter.Mode.MODE_NUMBER, data) || this;
                }
                QRNumber.prototype.write = function (buffer) {
                    var data = this.getData();
                    var i = 0;
                    var ynobits_i = 1;
                    function ynobits(bits) {
                        var s = "";
                        for (var i = 0; i < bits; i++)
                            s += ynobits_i++ % 2 == 0 ? '0' : '1';
                        return parseInt(s, 2);
                    }
                    while (i + 2 < data.length) {
                        buffer.put(ynobits(10), 10);
                        i += 3;
                    }
                    if (i < data.length) {
                        if (data.length - i == 1) {
                            buffer.put(ynobits(4), 4);
                        }
                        else if (data.length - i == 2) {
                            buffer.put(ynobits(7), 7);
                        }
                    }
                };
                QRNumber.prototype.getLength = function () {
                    return this.getData().length;
                };
                QRNumber.strToNum = function (s) {
                    var num = 0;
                    for (var i = 0; i < s.length; i += 1) {
                        num = num * 10 + QRNumber.chatToNum(s.charAt(i));
                    }
                    return num;
                };
                QRNumber.chatToNum = function (c) {
                    if ('0' <= c && c <= '9') {
                        return c.charCodeAt(0) - '0'.charCodeAt(0);
                    }
                    throw 'illegal char :' + c;
                };
                return QRNumber;
            }(qrcodesplitter.QRData));
            qrcodesplitter.QRNumber = QRNumber;
        })(qrcodesplitter = d_project.qrcodesplitter || (d_project.qrcodesplitter = {}));
    })(d_project = com.d_project || (com.d_project = {}));
})(com || (com = {}));
var com;
(function (com) {
    var d_project;
    (function (d_project) {
        var qrcodesplitter;
        (function (qrcodesplitter) {
            var QRUtil = (function () {
                function QRUtil() {
                    throw 'error';
                }
                QRUtil.getPatternPosition = function (typeNumber) {
                    return QRUtil.PATTERN_POSITION_TABLE[typeNumber - 1];
                };
                QRUtil.getMaxLength = function (typeNumber, mode, errorCorrectLevel) {
                    var t = typeNumber - 1;
                    var e = 0;
                    var m = 0;
                    switch (errorCorrectLevel) {
                        case qrcodesplitter.ErrorCorrectLevel.L:
                            e = 0;
                            break;
                        case qrcodesplitter.ErrorCorrectLevel.M:
                            e = 1;
                            break;
                        case qrcodesplitter.ErrorCorrectLevel.Q:
                            e = 2;
                            break;
                        case qrcodesplitter.ErrorCorrectLevel.H:
                            e = 3;
                            break;
                        default:
                            throw 'e:' + errorCorrectLevel;
                    }
                    switch (mode) {
                        case qrcodesplitter.Mode.MODE_NUMBER:
                            m = 0;
                            break;
                        case qrcodesplitter.Mode.MODE_ALPHA_NUM:
                            m = 1;
                            break;
                        case qrcodesplitter.Mode.MODE_8BIT_BYTE:
                            m = 2;
                            break;
                        case qrcodesplitter.Mode.MODE_KANJI:
                            m = 3;
                            break;
                        default:
                            throw 'm:' + mode;
                    }
                    return QRUtil.MAX_LENGTH[t][e][m];
                };
                QRUtil.getErrorCorrectPolynomial = function (errorCorrectLength) {
                    var a = new qrcodesplitter.Polynomial([1]);
                    for (var i = 0; i < errorCorrectLength; i += 1) {
                        a = a.multiply(new qrcodesplitter.Polynomial([1, qrcodesplitter.QRMath.gexp(i)]));
                    }
                    return a;
                };
                QRUtil.getMaskFunc = function (maskPattern) {
                    switch (maskPattern) {
                        case qrcodesplitter.MaskPattern.PATTERN000:
                            return function (i, j) { return (i + j) % 2 == 0; };
                        case qrcodesplitter.MaskPattern.PATTERN001:
                            return function (i, j) { return i % 2 == 0; };
                        case qrcodesplitter.MaskPattern.PATTERN010:
                            return function (i, j) { return j % 3 == 0; };
                        case qrcodesplitter.MaskPattern.PATTERN011:
                            return function (i, j) { return (i + j) % 3 == 0; };
                        case qrcodesplitter.MaskPattern.PATTERN100:
                            return function (i, j) { return (~~(i / 2) + ~~(j / 3)) % 2 == 0; };
                        case qrcodesplitter.MaskPattern.PATTERN101:
                            return function (i, j) { return (i * j) % 2 + (i * j) % 3 == 0; };
                        case qrcodesplitter.MaskPattern.PATTERN110:
                            return function (i, j) { return ((i * j) % 2 + (i * j) % 3) % 2 == 0; };
                        case qrcodesplitter.MaskPattern.PATTERN111:
                            return function (i, j) { return ((i * j) % 3 + (i + j) % 2) % 2 == 0; };
                        default:
                            throw 'mask:' + maskPattern;
                    }
                };
                QRUtil.getLostPoint = function (qrCode) {
                    var moduleCount = qrCode.getModuleCount();
                    var lostPoint = 0;
                    for (var row = 0; row < moduleCount; row += 1) {
                        for (var col = 0; col < moduleCount; col += 1) {
                            var sameCount = 0;
                            var dark = qrCode.isDark(row, col);
                            for (var r = -1; r <= 1; r += 1) {
                                if (row + r < 0 || moduleCount <= row + r) {
                                    continue;
                                }
                                for (var c = -1; c <= 1; c += 1) {
                                    if (col + c < 0 || moduleCount <= col + c) {
                                        continue;
                                    }
                                    if (r == 0 && c == 0) {
                                        continue;
                                    }
                                    if (dark == qrCode.isDark(row + r, col + c)) {
                                        sameCount += 1;
                                    }
                                }
                            }
                            if (sameCount > 5) {
                                lostPoint += (3 + sameCount - 5);
                            }
                        }
                    }
                    for (var row = 0; row < moduleCount - 1; row += 1) {
                        for (var col = 0; col < moduleCount - 1; col += 1) {
                            var count = 0;
                            if (qrCode.isDark(row, col))
                                count += 1;
                            if (qrCode.isDark(row + 1, col))
                                count += 1;
                            if (qrCode.isDark(row, col + 1))
                                count += 1;
                            if (qrCode.isDark(row + 1, col + 1))
                                count += 1;
                            if (count == 0 || count == 4) {
                                lostPoint += 3;
                            }
                        }
                    }
                    for (var row = 0; row < moduleCount; row += 1) {
                        for (var col = 0; col < moduleCount - 6; col += 1) {
                            if (qrCode.isDark(row, col)
                                && !qrCode.isDark(row, col + 1)
                                && qrCode.isDark(row, col + 2)
                                && qrCode.isDark(row, col + 3)
                                && qrCode.isDark(row, col + 4)
                                && !qrCode.isDark(row, col + 5)
                                && qrCode.isDark(row, col + 6)) {
                                lostPoint += 40;
                            }
                        }
                    }
                    for (var col = 0; col < moduleCount; col += 1) {
                        for (var row = 0; row < moduleCount - 6; row += 1) {
                            if (qrCode.isDark(row, col)
                                && !qrCode.isDark(row + 1, col)
                                && qrCode.isDark(row + 2, col)
                                && qrCode.isDark(row + 3, col)
                                && qrCode.isDark(row + 4, col)
                                && !qrCode.isDark(row + 5, col)
                                && qrCode.isDark(row + 6, col)) {
                                lostPoint += 40;
                            }
                        }
                    }
                    var darkCount = 0;
                    for (var col = 0; col < moduleCount; col += 1) {
                        for (var row = 0; row < moduleCount; row += 1) {
                            if (qrCode.isDark(row, col)) {
                                darkCount += 1;
                            }
                        }
                    }
                    var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
                    lostPoint += ratio * 10;
                    return lostPoint;
                };
                QRUtil.getBCHTypeInfo = function (data) {
                    var d = data << 10;
                    while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) >= 0) {
                        d ^= (QRUtil.G15 << (QRUtil.getBCHDigit(d) -
                            QRUtil.getBCHDigit(QRUtil.G15)));
                    }
                    return ((data << 10) | d) ^ QRUtil.G15_MASK;
                };
                QRUtil.getBCHTypeNumber = function (data) {
                    var d = data << 12;
                    while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) >= 0) {
                        d ^= (QRUtil.G18 << (QRUtil.getBCHDigit(d) -
                            QRUtil.getBCHDigit(QRUtil.G18)));
                    }
                    return (data << 12) | d;
                };
                QRUtil.getBCHDigit = function (data) {
                    var digit = 0;
                    while (data != 0) {
                        digit += 1;
                        data >>>= 1;
                    }
                    return digit;
                };
                QRUtil.PATTERN_POSITION_TABLE = [
                    [],
                    [6, 18],
                    [6, 22],
                    [6, 26],
                    [6, 30],
                    [6, 34],
                    [6, 22, 38],
                    [6, 24, 42],
                    [6, 26, 46],
                    [6, 28, 50],
                    [6, 30, 54],
                    [6, 32, 58],
                    [6, 34, 62],
                    [6, 26, 46, 66],
                    [6, 26, 48, 70],
                    [6, 26, 50, 74],
                    [6, 30, 54, 78],
                    [6, 30, 56, 82],
                    [6, 30, 58, 86],
                    [6, 34, 62, 90],
                    [6, 28, 50, 72, 94],
                    [6, 26, 50, 74, 98],
                    [6, 30, 54, 78, 102],
                    [6, 28, 54, 80, 106],
                    [6, 32, 58, 84, 110],
                    [6, 30, 58, 86, 114],
                    [6, 34, 62, 90, 118],
                    [6, 26, 50, 74, 98, 122],
                    [6, 30, 54, 78, 102, 126],
                    [6, 26, 52, 78, 104, 130],
                    [6, 30, 56, 82, 108, 134],
                    [6, 34, 60, 86, 112, 138],
                    [6, 30, 58, 86, 114, 142],
                    [6, 34, 62, 90, 118, 146],
                    [6, 30, 54, 78, 102, 126, 150],
                    [6, 24, 50, 76, 102, 128, 154],
                    [6, 28, 54, 80, 106, 132, 158],
                    [6, 32, 58, 84, 110, 136, 162],
                    [6, 26, 54, 82, 110, 138, 166],
                    [6, 30, 58, 86, 114, 142, 170]
                ];
                QRUtil.MAX_LENGTH = [
                    [[41, 25, 17, 10], [34, 20, 14, 8], [27, 16, 11, 7], [17, 10, 7, 4]],
                    [[77, 47, 32, 20], [63, 38, 26, 16], [48, 29, 20, 12], [34, 20, 14, 8]],
                    [[127, 77, 53, 32], [101, 61, 42, 26], [77, 47, 32, 20], [58, 35, 24, 15]],
                    [[187, 114, 78, 48], [149, 90, 62, 38], [111, 67, 46, 28], [82, 50, 34, 21]],
                    [[255, 154, 106, 65], [202, 122, 84, 52], [144, 87, 60, 37], [106, 64, 44, 27]],
                    [[322, 195, 134, 82], [255, 154, 106, 65], [178, 108, 74, 45], [139, 84, 58, 36]],
                    [[370, 224, 154, 95], [293, 178, 122, 75], [207, 125, 86, 53], [154, 93, 64, 39]],
                    [[461, 279, 192, 118], [365, 221, 152, 93], [259, 157, 108, 66], [202, 122, 84, 52]],
                    [[552, 335, 230, 141], [432, 262, 180, 111], [312, 189, 130, 80], [235, 143, 98, 60]],
                    [[652, 395, 271, 167], [513, 311, 213, 131], [364, 221, 151, 93], [288, 174, 119, 74]]
                ];
                QRUtil.G15 = (1 << 10) | (1 << 8) | (1 << 5)
                    | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
                QRUtil.G18 = (1 << 12) | (1 << 11) | (1 << 10)
                    | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
                QRUtil.G15_MASK = (1 << 14) | (1 << 12) | (1 << 10)
                    | (1 << 4) | (1 << 1);
                return QRUtil;
            }());
            qrcodesplitter.QRUtil = QRUtil;
        })(qrcodesplitter = d_project.qrcodesplitter || (d_project.qrcodesplitter = {}));
    })(d_project = com.d_project || (com.d_project = {}));
})(com || (com = {}));
var com;
(function (com) {
    var d_project;
    (function (d_project) {
        var qrcodesplitter;
        (function (qrcodesplitter) {
            var RSBlock = (function () {
                function RSBlock(totalCount, dataCount) {
                    this.totalCount = totalCount;
                    this.dataCount = dataCount;
                }
                RSBlock.prototype.getDataCount = function () {
                    return this.dataCount;
                };
                RSBlock.prototype.getTotalCount = function () {
                    return this.totalCount;
                };
                RSBlock.getRSBlocks = function (typeNumber, errorCorrectLevel) {
                    var rsBlock = RSBlock.getRsBlockTable(typeNumber, errorCorrectLevel);
                    var length = rsBlock.length / 3;
                    var list = [];
                    for (var i = 0; i < length; i += 1) {
                        var count = rsBlock[i * 3 + 0];
                        var totalCount = rsBlock[i * 3 + 1];
                        var dataCount = rsBlock[i * 3 + 2];
                        for (var j = 0; j < count; j += 1) {
                            list.push(new RSBlock(totalCount, dataCount));
                        }
                    }
                    return list;
                };
                RSBlock.getRsBlockTable = function (typeNumber, errorCorrectLevel) {
                    switch (errorCorrectLevel) {
                        case qrcodesplitter.ErrorCorrectLevel.L:
                            return RSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
                        case qrcodesplitter.ErrorCorrectLevel.M:
                            return RSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
                        case qrcodesplitter.ErrorCorrectLevel.Q:
                            return RSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
                        case qrcodesplitter.ErrorCorrectLevel.H:
                            return RSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
                        default:
                            break;
                    }
                    throw 'tn:' + typeNumber + '/ecl:' + errorCorrectLevel;
                };
                RSBlock.RS_BLOCK_TABLE = [
                    [1, 26, 19],
                    [1, 26, 16],
                    [1, 26, 13],
                    [1, 26, 9],
                    [1, 44, 34],
                    [1, 44, 28],
                    [1, 44, 22],
                    [1, 44, 16],
                    [1, 70, 55],
                    [1, 70, 44],
                    [2, 35, 17],
                    [2, 35, 13],
                    [1, 100, 80],
                    [2, 50, 32],
                    [2, 50, 24],
                    [4, 25, 9],
                    [1, 134, 108],
                    [2, 67, 43],
                    [2, 33, 15, 2, 34, 16],
                    [2, 33, 11, 2, 34, 12],
                    [2, 86, 68],
                    [4, 43, 27],
                    [4, 43, 19],
                    [4, 43, 15],
                    [2, 98, 78],
                    [4, 49, 31],
                    [2, 32, 14, 4, 33, 15],
                    [4, 39, 13, 1, 40, 14],
                    [2, 121, 97],
                    [2, 60, 38, 2, 61, 39],
                    [4, 40, 18, 2, 41, 19],
                    [4, 40, 14, 2, 41, 15],
                    [2, 146, 116],
                    [3, 58, 36, 2, 59, 37],
                    [4, 36, 16, 4, 37, 17],
                    [4, 36, 12, 4, 37, 13],
                    [2, 86, 68, 2, 87, 69],
                    [4, 69, 43, 1, 70, 44],
                    [6, 43, 19, 2, 44, 20],
                    [6, 43, 15, 2, 44, 16],
                    [4, 101, 81],
                    [1, 80, 50, 4, 81, 51],
                    [4, 50, 22, 4, 51, 23],
                    [3, 36, 12, 8, 37, 13],
                    [2, 116, 92, 2, 117, 93],
                    [6, 58, 36, 2, 59, 37],
                    [4, 46, 20, 6, 47, 21],
                    [7, 42, 14, 4, 43, 15],
                    [4, 133, 107],
                    [8, 59, 37, 1, 60, 38],
                    [8, 44, 20, 4, 45, 21],
                    [12, 33, 11, 4, 34, 12],
                    [3, 145, 115, 1, 146, 116],
                    [4, 64, 40, 5, 65, 41],
                    [11, 36, 16, 5, 37, 17],
                    [11, 36, 12, 5, 37, 13],
                    [5, 109, 87, 1, 110, 88],
                    [5, 65, 41, 5, 66, 42],
                    [5, 54, 24, 7, 55, 25],
                    [11, 36, 12, 7, 37, 13],
                    [5, 122, 98, 1, 123, 99],
                    [7, 73, 45, 3, 74, 46],
                    [15, 43, 19, 2, 44, 20],
                    [3, 45, 15, 13, 46, 16],
                    [1, 135, 107, 5, 136, 108],
                    [10, 74, 46, 1, 75, 47],
                    [1, 50, 22, 15, 51, 23],
                    [2, 42, 14, 17, 43, 15],
                    [5, 150, 120, 1, 151, 121],
                    [9, 69, 43, 4, 70, 44],
                    [17, 50, 22, 1, 51, 23],
                    [2, 42, 14, 19, 43, 15],
                    [3, 141, 113, 4, 142, 114],
                    [3, 70, 44, 11, 71, 45],
                    [17, 47, 21, 4, 48, 22],
                    [9, 39, 13, 16, 40, 14],
                    [3, 135, 107, 5, 136, 108],
                    [3, 67, 41, 13, 68, 42],
                    [15, 54, 24, 5, 55, 25],
                    [15, 43, 15, 10, 44, 16],
                    [4, 144, 116, 4, 145, 117],
                    [17, 68, 42],
                    [17, 50, 22, 6, 51, 23],
                    [19, 46, 16, 6, 47, 17],
                    [2, 139, 111, 7, 140, 112],
                    [17, 74, 46],
                    [7, 54, 24, 16, 55, 25],
                    [34, 37, 13],
                    [4, 151, 121, 5, 152, 122],
                    [4, 75, 47, 14, 76, 48],
                    [11, 54, 24, 14, 55, 25],
                    [16, 45, 15, 14, 46, 16],
                    [6, 147, 117, 4, 148, 118],
                    [6, 73, 45, 14, 74, 46],
                    [11, 54, 24, 16, 55, 25],
                    [30, 46, 16, 2, 47, 17],
                    [8, 132, 106, 4, 133, 107],
                    [8, 75, 47, 13, 76, 48],
                    [7, 54, 24, 22, 55, 25],
                    [22, 45, 15, 13, 46, 16],
                    [10, 142, 114, 2, 143, 115],
                    [19, 74, 46, 4, 75, 47],
                    [28, 50, 22, 6, 51, 23],
                    [33, 46, 16, 4, 47, 17],
                    [8, 152, 122, 4, 153, 123],
                    [22, 73, 45, 3, 74, 46],
                    [8, 53, 23, 26, 54, 24],
                    [12, 45, 15, 28, 46, 16],
                    [3, 147, 117, 10, 148, 118],
                    [3, 73, 45, 23, 74, 46],
                    [4, 54, 24, 31, 55, 25],
                    [11, 45, 15, 31, 46, 16],
                    [7, 146, 116, 7, 147, 117],
                    [21, 73, 45, 7, 74, 46],
                    [1, 53, 23, 37, 54, 24],
                    [19, 45, 15, 26, 46, 16],
                    [5, 145, 115, 10, 146, 116],
                    [19, 75, 47, 10, 76, 48],
                    [15, 54, 24, 25, 55, 25],
                    [23, 45, 15, 25, 46, 16],
                    [13, 145, 115, 3, 146, 116],
                    [2, 74, 46, 29, 75, 47],
                    [42, 54, 24, 1, 55, 25],
                    [23, 45, 15, 28, 46, 16],
                    [17, 145, 115],
                    [10, 74, 46, 23, 75, 47],
                    [10, 54, 24, 35, 55, 25],
                    [19, 45, 15, 35, 46, 16],
                    [17, 145, 115, 1, 146, 116],
                    [14, 74, 46, 21, 75, 47],
                    [29, 54, 24, 19, 55, 25],
                    [11, 45, 15, 46, 46, 16],
                    [13, 145, 115, 6, 146, 116],
                    [14, 74, 46, 23, 75, 47],
                    [44, 54, 24, 7, 55, 25],
                    [59, 46, 16, 1, 47, 17],
                    [12, 151, 121, 7, 152, 122],
                    [12, 75, 47, 26, 76, 48],
                    [39, 54, 24, 14, 55, 25],
                    [22, 45, 15, 41, 46, 16],
                    [6, 151, 121, 14, 152, 122],
                    [6, 75, 47, 34, 76, 48],
                    [46, 54, 24, 10, 55, 25],
                    [2, 45, 15, 64, 46, 16],
                    [17, 152, 122, 4, 153, 123],
                    [29, 74, 46, 14, 75, 47],
                    [49, 54, 24, 10, 55, 25],
                    [24, 45, 15, 46, 46, 16],
                    [4, 152, 122, 18, 153, 123],
                    [13, 74, 46, 32, 75, 47],
                    [48, 54, 24, 14, 55, 25],
                    [42, 45, 15, 32, 46, 16],
                    [20, 147, 117, 4, 148, 118],
                    [40, 75, 47, 7, 76, 48],
                    [43, 54, 24, 22, 55, 25],
                    [10, 45, 15, 67, 46, 16],
                    [19, 148, 118, 6, 149, 119],
                    [18, 75, 47, 31, 76, 48],
                    [34, 54, 24, 34, 55, 25],
                    [20, 45, 15, 61, 46, 16]
                ];
                return RSBlock;
            }());
            qrcodesplitter.RSBlock = RSBlock;
        })(qrcodesplitter = d_project.qrcodesplitter || (d_project.qrcodesplitter = {}));
    })(d_project = com.d_project || (com.d_project = {}));
})(com || (com = {}));
var com;
(function (com) {
    var d_project;
    (function (d_project) {
        var text;
        (function (text) {
            function stringToBytes_UTF8(s) {
                function toUTF8Array(str) {
                    var utf8 = [];
                    for (var i = 0; i < str.length; i++) {
                        var charcode = str.charCodeAt(i);
                        if (charcode < 0x80)
                            utf8.push(charcode);
                        else if (charcode < 0x800) {
                            utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
                        }
                        else if (charcode < 0xd800 || charcode >= 0xe000) {
                            utf8.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
                        }
                        else {
                            i++;
                            charcode = 0x10000 + (((charcode & 0x3ff) << 10)
                                | (str.charCodeAt(i) & 0x3ff));
                            utf8.push(0xf0 | (charcode >> 18), 0x80 | ((charcode >> 12) & 0x3f), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
                        }
                    }
                    return utf8;
                }
                return toUTF8Array(s);
            }
            text.stringToBytes_UTF8 = stringToBytes_UTF8;
            ;
        })(text = d_project.text || (d_project.text = {}));
    })(d_project = com.d_project || (com.d_project = {}));
})(com || (com = {}));
//# sourceMappingURL=QRCode.js.map