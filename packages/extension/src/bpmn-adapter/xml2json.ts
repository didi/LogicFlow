// @ts-nocheck

// ========================================================================  
//  XML.ObjTree -- XML source code from/to JavaScript object like E4X  
// ========================================================================  

let XML = function () { };

//  constructor  
XML.ObjTree = function () { // @ts-ignore
  return this;
};

//  class variables  

XML.ObjTree.VERSION = "0.23";

//  object prototype  

XML.ObjTree.prototype.xmlDecl = '<?xml version="1.0" encoding="UTF-8" ?>\n';
XML.ObjTree.prototype.attr_prefix = '-';

//  method: parseXML( xmlsource )  

XML.ObjTree.prototype.parseXML = function (xml) {
  var root;
  if (window.DOMParser) {
    var xmldom = new DOMParser();
    //      xmldom.async = false;           // DOMParser is always sync-mode  
    var dom = xmldom.parseFromString(xml, "application/xml");
    if (!dom) return;
    root = dom.documentElement;
  } else if (window.ActiveXObject) {
    xmldom = new ActiveXObject('Microsoft.XMLDOM');
    xmldom.async = false;
    xmldom.loadXML(xml);
    root = xmldom.documentElement;
  }
  if (!root) return;
  return this.parseDOM(root);
};

//  method: parseHTTP( url, options, callback )  

XML.ObjTree.prototype.parseHTTP = function (url, options, callback) {
  var myOpt = {};
  for (var key in options) {
    myOpt[key] = options[key];                  // copy object  
  }
  if (!myOpt.method) {
    if (typeof (myOpt.postBody) == "undefined" &&
      typeof (myOpt.postbody) == "undefined" &&
      typeof (myOpt.parameters) == "undefined") {
      myOpt.method = "get";
    } else {
      myOpt.method = "post";
    }
  }
  if (callback) {
    myOpt.asynchronous = true;                  // async-mode  
    var __this = this;
    var __func = callback;
    var __save = myOpt.onComplete;
    myOpt.onComplete = function (trans) {
      var tree;
      if (trans && trans.responseXML && trans.responseXML.documentElement) {
        tree = __this.parseDOM(trans.responseXML.documentElement);
      }
      __func(tree, trans);
      if (__save) __save(trans);
    };
  } else {
    myOpt.asynchronous = false;
  }
  var trans;
  if (typeof (HTTP) != "undefined" && HTTP.Request) {
    myOpt.uri = url;
    var req = new HTTP.Request(myOpt);
    if (req) trans = req.transport;
  } else if (typeof (Ajax) != "undefined" && Ajax.Request) {
    var req = new Ajax.Request(url, myOpt);
    if (req) trans = req.transport;
  }
  if (callback) return trans;
  if (trans && trans.responseXML && trans.responseXML.documentElement) {
    return this.parseDOM(trans.responseXML.documentElement);
  }
}

//  method: parseDOM( document root )  

XML.ObjTree.prototype.parseDOM = function (root) {
  if (!root) return;

  this.__force_array = {};
  if (this.force_array) {
    for (var i = 0; i < this.force_array.length; i++) {
      this.__force_array[this.force_array[i]] = 1;
    }
  }

  var json = this.parseElement(root);   // parse root node  
  if (this.__force_array[root.nodeName]) {
    json = [json];
  }
  if (root.nodeType != 11) {            // DOCUMENT_FRAGMENT_NODE  
    var tmp = {};
    tmp[root.nodeName] = json;          // root nodeName  
    json = tmp;
  }
  return json;
};

//  method: parseElement( element )  

XML.ObjTree.prototype.parseElement = function (elem) {
  //  COMMENT_NODE  
  if (elem.nodeType == 7) {
    return;
  }

  //  TEXT_NODE CDATA_SECTION_NODE  
  if (elem.nodeType == 3 || elem.nodeType == 4) {
    var bool = elem.nodeValue.match(/[^\x00-\x20]/);
    if (bool == null) return;     // ignore white spaces  
    return elem.nodeValue;
  }

  var retVal;
  var cnt = {};

  //  parse attributes  
  if (elem.attributes && elem.attributes.length) {
    retVal = {};
    for (var i = 0; i < elem.attributes.length; i++) {
      var key = elem.attributes[i].nodeName;
      if (typeof (key) != "string") continue;
      var val = elem.attributes[i].nodeValue;
      if (!val) continue;
      key = this.attr_prefix + key;
      if (typeof (cnt[key]) == "undefined") cnt[key] = 0;
      cnt[key]++;
      this.addNode(retVal, key, cnt[key], val);
    }
  }

  //  parse child nodes (recursive)  
  if (elem.childNodes && elem.childNodes.length) {
    var textOnly = true;
    if (retVal) textOnly = false;        // some attributes exists  
    for (var i = 0; i < elem.childNodes.length && textOnly; i++) {
      var nType = elem.childNodes[i].nodeType;
      if (nType == 3 || nType == 4) continue;
      textOnly = false;
    }
    if (textOnly) {
      if (!retVal) retVal = "";
      for (var i = 0; i < elem.childNodes.length; i++) {
        retVal += elem.childNodes[i].nodeValue;
      }
    } else {
      if (!retVal) retVal = {};
      for (var i = 0; i < elem.childNodes.length; i++) {
        var key = elem.childNodes[i].nodeName;
        if (typeof (key) != "string") continue;
        var val = this.parseElement(elem.childNodes[i]);
        if (!val) continue;
        if (typeof (cnt[key]) == "undefined") cnt[key] = 0;
        cnt[key]++;
        this.addNode(retVal, key, cnt[key], val);
      }
    }
  }
  return retVal;
};

//  method: addNode( hash, key, count, value )  

XML.ObjTree.prototype.addNode = function (hash, key, counts, val) {
  if (this.__force_array[key]) {
    if (counts == 1) hash[key] = [];
    hash[key][hash[key].length] = val;      // push  
  } else if (counts == 1) {                   // 1st sibling  
    hash[key] = val;
  } else if (counts == 2) {                   // 2nd sibling  
    hash[key] = [hash[key], val];
  } else {                                    // 3rd sibling and more  
    hash[key][hash[key].length] = val;
  }
};

//  method: writeXML( tree )  

XML.ObjTree.prototype.writeXML = function (tree) {
  var xml = this.hash_to_xml(null, tree);
  return this.xmlDecl + xml;
};

//  method: hash_to_xml( tagName, tree )  

XML.ObjTree.prototype.hash_to_xml = function (name, tree) {
  var elem = [];
  var attr = [];
  for (var key in tree) {
    if (!tree.hasOwnProperty(key)) continue;
    var val = tree[key];
    if (key.charAt(0) != this.attr_prefix) {
      if (typeof (val) == "undefined" || val == null) {
        elem[elem.length] = "<" + key + " />";
      } else if (typeof (val) == "object" && val.constructor == Array) {
        elem[elem.length] = this.array_to_xml(key, val);
      } else if (typeof (val) == "object") {
        elem[elem.length] = this.hash_to_xml(key, val);
      } else {
        elem[elem.length] = this.scalar_to_xml(key, val);
      }
    } else {
      attr[attr.length] = " " + (key.substring(1)) + '="' + (this.xml_escape(val)) + '"';
    }
  }
  var jattr = attr.join("");
  var jelem = elem.join("");
  if (typeof (name) == "undefined" || name == null) {
    // no tag  
  } else if (elem.length > 0) {
    if (jelem.match(/\n/)) {
      jelem = "<" + name + jattr + ">\n" + jelem + "</" + name + ">\n";
    } else {
      jelem = "<" + name + jattr + ">" + jelem + "</" + name + ">\n";
    }
  } else {
    jelem = "<" + name + jattr + " />\n";
  }
  return jelem;
};

//  method: array_to_xml( tagName, array )  

XML.ObjTree.prototype.array_to_xml = function (name, array) {
  var out = [];
  for (var i = 0; i < array.length; i++) {
    var val = array[i];
    if (typeof (val) == "undefined" || val == null) {
      out[out.length] = "<" + name + " />";
    } else if (typeof (val) == "object" && val.constructor == Array) {
      out[out.length] = this.array_to_xml(name, val);
    } else if (typeof (val) == "object") {
      out[out.length] = this.hash_to_xml(name, val);
    } else {
      out[out.length] = this.scalar_to_xml(name, val);
    }
  }
  return out.join("");
};

//  method: scalar_to_xml( tagName, text )  

XML.ObjTree.prototype.scalar_to_xml = function (name, text) {
  if (name == "#text") {
    return this.xml_escape(text);
  } else {
    return "<" + name + ">" + this.xml_escape(text) + "</" + name + ">\n";
  }
};

//  method: xml_escape( text )  

XML.ObjTree.prototype.xml_escape = function (text) {
  return text.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"');
};

const lfXml2Json = (xmlData) => {
  return new XML.ObjTree().parseXML(xmlData)
};

export {
  lfXml2Json,
};
