/*
 * Copyright (c) 2015 xsbchen
 * Licensed under the MIT license.
 */

'use strict';

var Combo = require('./lib/combo');

/**
 * 打包阶段插件接口
 * @param  {Object} ret      一个包含处理后源码的结构
 * @param  {Object} conf     一般不需要关心，自动打包配置文件
 * @param  {Object} settings 插件配置属性
 * @param  {Object} opt      命令行参数
 * @return {undefined}
 */
module.exports = function (ret, conf, settings, opt) {
  // ret.src 所有的源码，结构是 {'<subpath>': <File 对象>}
  // ret.ids 所有源码列表，结构是 {'<id>': <File 对象>}
  // ret.map 如果是 spriter、postpackager 这时候已经能得到打包结果了，
  //         可以修改静态资源列表或者其他
  var files = ret.src;

  var combo = new Combo(settings);
  var path = require('path')
  var root = fis.project.getProjectPath();
  var fs = require('fs');

  Object.keys(files).forEach(function (subpath) {
    var file = files[subpath];
    var isPage = false;
    if (file.isHtmlLike) {
        var fileId = file.id;
        var content = file.getContent();
        var globalStaticConf = {
            arrGlobalJs: [],
            arrGlobalCss: []
        };

        if (/^page\/(.*?)\.vm$/.test(fileId)) {
            var regLayout = /#extends\(("|')(\/?page\/layout\/.*?)\.vm\1\)/;
            var match = content.match(regLayout);
            if (match) {
                var layoutFileId = match[2];
            }
            if (layoutFileId) {
                isPage = true;
                // get layout_xx.conf.json
                var layoutConfFilePath = path.join(root, layoutFileId + '.conf.json');
                var json = fs.readFileSync(layoutConfFilePath, 'utf8');
                var layoutConf = JSON.parse(json);
                globalStaticConf = {
                    arrGlobalJs: layoutConf['arrGlobalJs'],
                    arrGlobalCss: layoutConf['arrGlobalCss']
                };
            }
        }

        var conf = {
            isPage: isPage,
            fileId: fileId,
            map: ret.map['res'],
            globalStaticConf: globalStaticConf
        };

        content = combo.process(content, conf);
        file.setContent(content);
    }
  });


    var ns = fis.get('namespace');
    var mapFile = ns ? (ns + '-map.json') : 'map.json';
    var map = fis.file.wrap(path.join(root, mapFile));
    map.setContent(JSON.stringify(ret.map, null, map.optimizer ? null : 4));
    ret.pkg[map.subpath] = map;
}
