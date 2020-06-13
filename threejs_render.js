'use strict';

const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');
const { SSL_OP_EPHEMERAL_RSA } = require('constants');


var CATEGORIES = ['02691156'];
var shapenetRoot = 'ShapeNetCore.v2'
// var shapenetMeta = 'ShapeNetDemo.json';
var shapenetMeta = 'ShapeNetCore.v2.json';
// var shapenetMeta = 'omit.json';
var outRoot = 'output';


var file_meta = fs.readFileSync(shapenetMeta);
file_meta = JSON.parse(file_meta);

async function work_fn(){
    const browser = await puppeteer.launch({ headless: false });
    for (let i=0; i<CATEGORIES.length; i++) {
        let cate = CATEGORIES[i]
        for (let j=0; j<file_meta[cate].length; j++) {
            let modelName = file_meta[cate][j];
            let token = `${shapenetRoot}/${cate}/${modelName}/models/model_normalized`;
            // let token = 'tmp/models/model_normalized';
            let outpath = `${outRoot}/${cate}/${modelName}`;
            mkdirsSync(outpath);
            await render_model(browser, token, outpath);
        }
    }
    await browser.close();
}

async function render_model(browser, token, out_dir) {
    const page = await browser.newPage();
    await page._client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: out_dir });
    await page.goto(`http://127.0.0.1:8000/screenshot.html?token=${token}`);
    await page.waitFor('#finished');
    sleep(1000);
    await page.close();
}

function mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}

function sleep(msec){
    let tic = new Date().getTime();
    while(true){
        let toc = new Date().getTime();
        if ( toc-tic >= msec){
            break;
        }
    }
}

work_fn();
