'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as iconv from 'iconv-lite';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

var jschardet = require('jschardet');//检测字符编码
var tmpdir = path.join(__dirname,'temp');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    //创建 缓存目录
    if(!fs.existsSync(tmpdir)){
        fs.mkdirSync(tmpdir);
    }
    
    let disposable = vscode.workspace.onDidOpenTextDocument((doc)=>{
        let filecache = new FileCache(doc);
        filecache.showEncoding();
    })

    // vscode.workspace.onDidSaveTextDocument((doc)=>{

    // })

    // vscode.workspace.onDidCloseTextDocument((doc)=>{

    // })
    
    context.subscriptions.push(disposable);

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
        let encoding = jschardet.detect(this.buffer).encoding
        this.charset = encoding ? encoding: 'gbk';
        this.filename = path.basename(this.srcfilename); 
        this.extname = path.extname(this.srcfilename);
        this.md5filename = crypto.createHash('md5').update(this.srcfilename).digest('hex'); 
    }

    // changeToCacheFile() {
    //     //if(!this.md5filename || !this.extname) return ;
    //     //if(fs.existsSync(path.join(tmpdir,this.md5filename+this.extname))) return ;
    //     //fs.writeFileSync(path.join(tmpdir,this.md5filename+this.extname),this.buffer,{ encoding: this.charset})
    //     if(this.charset.toLocaleUpperCase() !== 'utf-8'){
    //         vscode.window.activeTextEditor.edit((editor)=>{
    //             let start = new vscode.Position(0,0);
    //             let end   = new vscode.Position(this.doc.lineCount,0);
                
    //             let range = new vscode.Range(start,end);
    //             //editor.replace(new vscode.Range(start,end),iconv.decode(this.buffer,this.charset))
    //             console.log(this.doc.getText());
    //             editor.delete(range);
    //             console.log(this.doc.getText());
    //         })
    //     }
    // }
    showEncoding(){
        if(this.charset.toLowerCase() !== 'utf-8'){
            vscode.window.showInformationMessage(this.charset);
        }
        
    }
    // changeEncoding(){
    //     let curdoc = vscode.window.activeTextEditor
    // }

}




