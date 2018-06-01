var http = require('http');
var url = require("url");

var fs = require("fs");
var gm = require('gm').subClass({ imageMagick: true })

var formidable = require("formidable");

http.createServer(function (request, response) {

    var n = 0;
    var pathname = url.parse(request.url).pathname;
    if (pathname == "/")    //访问表单页面

    {
        // 发送 HTTP 头部 
        // HTTP 状态值: 200 : OK
        // 内容类型: text/plain
        //response.writeHead(200, {'Content-Type': 'text/plain'});
        response.writeHead(200, { "Content-Type": "text/html" })
        fs.readFile("./form.html", { encoding: "utf-8" }, function (e, data) {      //读取表单文件
            if (e) {
                throw e;
            }
            response.write(data);//向客户端发送表单数据
            response.end();
        });
    }
    else if (pathname == "/upload") {
        console.log('Server start');
        var form = new formidable.IncomingForm();
        form.keepExtensions = true;     //保存扩展名
        form.maxFieldsSize = 20 * 1024 * 1024;      //上传文件的最大大小
        form.parse(request, function (err, fields, files) {
            if (err) {
                throw err;
            }
            console.log('fields', fields);      //表单传递的input数据
            n = parseInt(Math.random() * 899999 + 100000, 10);      //随机数范围100000~899999

            //调用ImageMagick绘图操作
            gm('./AllUnderstanding.jpg')
                .fontSize(20)
                .font('./W4Light.TTF')      //引入预先下载的字库
                .drawText(0, 105, fields.name + '收到', 'Center')
                .autoOrient()
                .write('./uploads/' + n + '.jpg', function (err) {      //编辑好的图片文件写入文件系统
                    if (err) {
                        console.log(err);
                        response.end();
                    }
                });
        });
        fs.close
        //延时以给图片足够的时间写入文件系统
        var timeout_ms = 2000; // 2 seconds
        var timeout = setTimeout(function () {
            //下载图片
            fs.readFile('./uploads/' + n + '.jpg', 'binary', function (err, file) {
                if (err) {
                    console.log(err);
                    return;
                } else {
                    console.log("输出文件");
                    response.writeHead(200, { 'Content-Type': 'image/jpeg' });
                    response.write(file, 'binary');
                    response.end();
                }
            });

        }, timeout_ms);

    }
}).listen(8887);

// 终端打印如下信息
console.log('Server running at http://127.0.0.1:8887/');