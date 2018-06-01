var http = require('http');
var url = require("url");
var session = require('express-session');
var FileStore = require('session-file-store')(session);
//const cookieParser = require('cookie-parser');
var express = require('express');
var app = express();

var fs = require("fs");
var gm = require('gm').subClass({ imageMagick: true })

var formidable = require("formidable");

app.use(session({
    name: 'index', //secret的值建议使用随机字符串
    secret: 'hceax',  // 用来对session id相关的cookie进行签名
    store: new FileStore(),  // 本地存储session（文本文件，也可以选择其他store，比如redis的）
    saveUninitialized: false,  // 是否自动保存未初始化的会话，建议false
    resave: false,
    cookie: { maxAge: 1000 * 30 } // 过期时间（毫秒）
}))

var n = 0;
app.get('/', function (req, res) {      //访问表单页面

    // 发送 HTTP 头部 
    // HTTP 状态值: 200 : OK
    // 内容类型: text/plain
    res.writeHead(200, { "Content-Type": "text/html" })
    fs.readFile("./form.html", { encoding: "utf-8" }, function (e, data) {      //读取表单文件
        if (e) {
            throw e;
        }
        res.write(data);        //向客户端发送表单数据
        res.end();
    });
    fs.close
    //}
});
app.post('/upload', function (req, res) {
    flag = true;
    console.log('Server start');
    n = parseInt(Math.random() * 899999 + 100000, 10);      //随机数范围100000~899999
    var form = new formidable.IncomingForm();
    form.keepExtensions = true;     //保存扩展名
    form.maxFieldsSize = 20 * 1024 * 1024;      //上传文件的最大大小
    form.parse(req, function (err, fields, files) {
        if (err) {
            throw err;
        }
        console.log('fields', fields);      //表单传递的input数据

        //调用ImageMagick绘图操作
        gm('./AllUnderstanding.jpg')
            .fontSize(20)
            .font('./DQLight.ttf')      //引入预先下载的字库
            .drawText(0, 105, fields.name + '收到', 'Center')
            .autoOrient()
            .write('./uploads/' + n + '.jpg', function (err) {      //编辑好的图片文件写入文件系统
                if (err) {
                    console.log(err);
                    res.end();
                }
            });
    });
    req.session['index'] = n;
    //延时以给图片足够的时间写入文件系统
    var timeout_ms = 2000; // 2 seconds
    var timeout = setTimeout(function () {
        //显示图片
        fs.readFile('./uploads/' + n + '.jpg', 'binary', function (err, file) {
            if (err) {
                console.log(err);
                return;
            } else {
                console.log("post output file");
                res.writeHead(200, { 'Content-Type': 'image/jpeg' });
                res.write(file, 'binary');
                res.end();
            }
        });
        console.log('./uploads/' + n + '.jpg');
    }, timeout_ms);
});
app.get('/upload', function (req, res) {
    if (req.session['index'] == null) {
        res.writeHead(200, { "Content-Type": "text/html" })
        res.write("overtime!");//向客户端发送表单数据
        res.end();
        return;
    }
    //下载图片
    fs.readFile('./uploads/' + req.session['index'] + '.jpg', 'binary', function (err, file) {
        if (err) {
            console.log(err);
            return;
        } else {
            console.log("get output file");
            res.writeHead(200, { 'Content-Type': 'image/jpeg' });
            res.write(file, 'binary');
            res.end();
        }
    });
    console.log('./uploads/' + n + '.jpg');
});

app.listen(8887);

// 终端打印如下信息
console.log('Server running at http://127.0.0.1:8887/');