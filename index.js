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

  Object.keys(files).forEach(function (subpath) {
    var file = files[subpath];

    if (file.isHtmlLike) {
      var content = file.getContent();
      content = combo.process(content);
      file.setContent(content);
    }
  });
}
