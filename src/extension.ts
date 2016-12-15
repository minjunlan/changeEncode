'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as iconv from 'iconv-lite';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as childprocess from 'child_process';

var jschardet = require('jschardet');//检测字符编码
var detect = require('charset-detector');//检测字符编码
var tmpdir = path.join(__dirname,'temp');
var binpath = path.join(__dirname,'..','..','bin');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    //创建 缓存目录
    if(!fs.existsSync(tmpdir)){
        fs.mkdirSync(tmpdir);
    }
    
    let disposable1 = vscode.workspace.onDidOpenTextDocument((doc)=>{
        if(!!doc){
            let filecache = new FileCache(doc);
            filecache.showEncoding();
        }
    })

    let disposable2 = vscode.workspace.onDidSaveTextDocument((doc)=>{
        if(!!doc){
            let filecache = new FileCache(doc);
            filecache.saveFiles();
        }  
    })

    let disposable3 = vscode.workspace.onDidCloseTextDocument((doc)=>{
         if(!!doc){
            let filecache = new FileCache(doc);
            filecache.deleteFiles();
        }        
    })
    
    // let disposable4 = vscode.commands.registerCommand('extension.changeencode',(e)=>{
    //     console.log('我是动作：'+e);
    // });

    context.subscriptions.push(disposable1);
    context.subscriptions.push(disposable2);
    // context.subscriptions.push(disposable4);
}

// this method is called when your extension is deactivated
export function deactivate() {
}



/**
 * FileCatch
 */
class FileCache {
    buffer:Buffer;
    charset:string;
    filename:string;
    srcfilename:string;
    extname:string;
    md5filename:string;
    doc:vscode.TextDocument;
    isCancellationRequested: boolean;
    onCancellationRequested: vscode.Event<any>;
    constructor(doc:vscode.TextDocument) {
        this.doc = doc;
        this.buffer = new Buffer(this.doc.getText());
        this.srcfilename = this.doc.fileName;
        this.filename = path.basename(this.srcfilename); 
        this.extname = path.extname(this.srcfilename);
        this.md5filename = crypto.createHash('md5').update(this.srcfilename).digest('hex'); 
    }


    showEncoding(){
        let runbin = path.join(binpath,'icu');
        let buf = this.buffer;
        let chart:string;
        let filepath = path.join(tmpdir,this.md5filename+this.extname);
        this.charset = chart;
        let doc = this.doc;
        
        childprocess.exec(runbin + ' -t "' + this.srcfilename + '"',(err,stdout,stderr)=>{
            chart = stdout
            
            if(chart.toLowerCase().startsWith('gb')){
                //vscode.window.showInformationMessage(this.charset);
                let absolutePath = doc.uri.fsPath;
                let chunks = [];
                let content:any;
                let reader = fs.createReadStream(absolutePath).pipe(iconv.decodeStream('gbk'));
                reader.on('data', function (b) {
                    chunks.push(b);
                });
                reader.on('err', function (b) {
                    
                });                
                reader.on('end', function () {
                    content = chunks.join('');

                    setTimeout(function() {
                        let textEditor = vscode.window.activeTextEditor;
                        fs.writeFileSync(filepath,iconv.encode(content,'gbk'));

                        textEditor.edit((editor)=>{
                            let start = new vscode.Position(0,0);
                            let end   = new vscode.Position(textEditor.document.lineCount,0);
                            let range = new vscode.Range(start,end);
                            editor.replace(range,content);

                        })
                        
                    }, 100);
                });


            }
        })
        
    }

    saveFiles(){
        let runbin = path.join(binpath,'icu');
        let buf = this.buffer;
        let chart:string;
        let filepath = path.join(tmpdir,this.md5filename+this.extname);
        this.charset = chart;
        let doc = this.doc;
        if(fs.existsSync(filepath)){
            childprocess.exec(runbin + ' -t "' + filepath + '"',(err,stdout,stderr)=>{
                chart = stdout;
                    let absolutePath = doc.uri.fsPath;
                    let chunks = [];
                    let content:any;
                    let reader = doc.getText();
                    fs.writeFileSync(absolutePath,iconv.encode(reader,'gbk'));
                    
            });
            
        }
    }

    deleteFiles(){
        let filepath = path.join(tmpdir,this.md5filename+this.extname);
        if(fs.existsSync(filepath)){
            fs.unlinkSync(filepath);
        }
    }

}




