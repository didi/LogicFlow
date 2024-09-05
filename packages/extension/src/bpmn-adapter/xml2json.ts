// @ts-nocheck

// ========================================================================
//  XML.ObjTree -- XML source code from/to JavaScript object like E4X
// ========================================================================

let XML = function () {}

//  constructor
XML.ObjTree = function () {
  // @ts-ignore
  return this
}

//  class variables

XML.ObjTree.VERSION = '0.23'

//  object prototype

XML.ObjTree.prototype.xmlDecl = '<?xml version="1.0" encoding="UTF-8" ?>\n'
XML.ObjTree.prototype.attr_prefix = '-'

//  method: parseXML( xmlsource )

XML.ObjTree.prototype.parseXML = function (xml) {
  var root
  if (window.DOMParser) {
    var xmldom = new DOMParser()
    //      xmldom.async = false;           // DOMParser is always sync-mode
    var dom = xmldom.parseFromString(xml, 'application/xml')
    if (!dom) return
    root = dom.documentElement
  } else if (window.ActiveXObject) {
    xmldom = new ActiveXObject('Microsoft.XMLDOM')
    xmldom.async = false
    xmldom.loadXML(xml)
    root = xmldom.documentElement
  }
  if (!root) return
  return this.parseDOM(root)
}

//  method: parseHTTP( url, options, callback )

XML.ObjTree.prototype.parseHTTP = function (url, options, callback) {
  var myOpt = {}
  for (var key in options) {
    myOpt[key] = options[key] // copy object
  }
  if (!myOpt.method) {
    if (
      typeof myOpt.postBody == 'undefined' &&
      typeof myOpt.postbody == 'undefined' &&
      typeof myOpt.parameters == 'undefined'
    ) {
      myOpt.method = 'get'
    } else {
      myOpt.method = 'post'
    }
  }
  if (callback) {
    myOpt.asynchronous = true // async-mode
    var __this = this
    var __func = callback
    var __save = myOpt.onComplete
    myOpt.onComplete = function (trans) {
      var tree
      if (trans && trans.responseXML && trans.responseXML.documentElement) {
        tree = __this.parseDOM(trans.responseXML.documentElement)
      }
      __func(tree, trans)
      if (__save) __save(trans)
    }
  } else {
    myOpt.asynchronous = false // sync-mode
  }
  var trans
  if (typeof HTTP != 'undefined' && HTTP.Request) {
    myOpt.uri = url
    var req = new HTTP.Request(myOpt)
    if (req) trans = req.transport
  } else if (typeof Ajax != 'undefined' && Ajax.Request) {
    var req = new Ajax.Request(url, myOpt)
    if (req) trans = req.transport
  }
  if (callback) return trans
  if (trans && trans.responseXML && trans.responseXML.documentElement) {
    return this.parseDOM(trans.responseXML.documentElement)
  }
}

XML.ObjTree.prototype.parseDOM = function (root) {
  if (!root) return

  this.__force_array = {}
  if (this.force_array) {
    for (var i = 0; i < this.force_array.length; i++) {
      this.__force_array[this.force_array[i]] = 1
    }
  }

  var json = this.parseElement(root) // parse root node
  if (this.__force_array[root.nodeName]) {
    json = [json]
  }
  if (root.nodeType != 11) {
    // DOCUMENT_FRAGMENT_NODE
    var tmp = {}
    tmp[root.nodeName] = json // root nodeName
    json = tmp
  }
  return json
}

//  method: parseElement( element )
/**
 * @reference node type reference https://www.w3schools.com/xml/dom_nodetype.asp
 */
XML.ObjTree.prototype.parseElement = function (elem) {
  //  PROCESSING_INSTRUCTION_NODE
  if (elem.nodeType == 7) {
    return
  }

  //  TEXT_NODE CDATA_SECTION_NODE COMMENT_NODE
  if (elem.nodeType == 3 || elem.nodeType == 4 || elem.nodeType == 8) {
    var bool = elem.nodeValue.match(/[^\x00-\x20]/)
    if (bool == null) return // ignore white spaces
    return elem.nodeValue
  }

  var retVal = null
  var cnt = {}

  if (elem.attributes && elem.attributes.length) {
    retVal = {}
    for (var i = 0; i < elem.attributes.length; i++) {
      var key = elem.attributes[i].nodeName
      if (typeof key != 'string') continue
      var val = elem.attributes[i].nodeValue
      try {
        val = JSON.parse(elem.attributes[i].nodeValue.replace(/'/g, '"'))
      } catch (error) {
        val = elem.attributes[i].nodeValue
      }
      if (!val) continue
      key = this.attr_prefix + key
      if (typeof cnt[key] == 'undefined') cnt[key] = 0
      cnt[key]++
      this.addNode(retVal, key, cnt[key], val)
    }
  }

  //  parse child nodes (recursive)
  if (elem.childNodes && elem.childNodes.length) {
    var textOnly = true
    if (retVal) textOnly = false // some attributes exists
    for (var i = 0; i < elem.childNodes.length && textOnly; i++) {
      var nType = elem.childNodes[i].nodeType
      if (nType == 3 || nType == 4 || nType == 8) continue
      textOnly = false
    }
    if (textOnly) {
      if (!retVal) retVal = ''
      for (var i = 0; i < elem.childNodes.length; i++) {
        retVal += elem.childNodes[i].nodeValue
      }
    } else {
      if (!retVal) retVal = {}
      for (var i = 0; i < elem.childNodes.length; i++) {
        var key = elem.childNodes[i].nodeName
        if (typeof key != 'string') continue
        var val = this.parseElement(elem.childNodes[i])
        if (!val) continue
        if (typeof cnt[key] == 'undefined') cnt[key] = 0
        cnt[key]++
        this.addNode(retVal, key, cnt[key], val)
      }
    }
  } else {
    // @see issue https://github.com/didi/LogicFlow/issues/1068
    // if retVal is null, that means the elem doesn't have any attributes and children,
    // the elem would be like: <a /> or <a></a>, so set retVal to empty object {}
    retVal === null && (retVal = {})
  }
  return retVal
}

//  method: addNode( hash, key, count, value )

XML.ObjTree.prototype.addNode = function (hash, key, counts, val) {
  if (this.__force_array[key]) {
    if (counts == 1) hash[key] = []
    hash[key][hash[key].length] = val // push
  } else if (counts == 1) {
    // 1st sibling
    hash[key] = val
  } else if (counts == 2) {
    // 2nd sibling
    hash[key] = [hash[key], val]
  } else {
    // 3rd sibling and more
    hash[key][hash[key].length] = val
  }
}

//  method: writeXML( tree )

XML.ObjTree.prototype.writeXML = function (tree) {
  var xml = this.hash_to_xml(null, tree)
  return this.xmlDecl + xml
}

//  method: hash_to_xml( tagName, tree )

XML.ObjTree.prototype.hash_to_xml = function (name, tree) {
  var elem = []
  var attr = []
  for (var key in tree) {
    if (!tree.hasOwnProperty(key)) continue
    var val = tree[key]
    if (key.charAt(0) != this.attr_prefix) {
      if (typeof val == 'undefined' || val == null) {
        elem[elem.length] = '<' + key + ' />'
      } else if (typeof val == 'object' && val.constructor == Array) {
        elem[elem.length] = this.array_to_xml(key, val)
      } else if (typeof val == 'object') {
        elem[elem.length] = this.hash_to_xml(key, val)
      } else {
        elem[elem.length] = this.scalar_to_xml(key, val)
      }
    } else {
      attr[attr.length] =
        ' ' + key.substring(1) + '="' + this.xml_escape(val) + '"'
    }
  }
  var jattr = attr.join('')
  var jelem = elem.join('')
  if (typeof name == 'undefined' || name == null) {
    // no tag
  } else if (elem.length > 0) {
    if (jelem.match(/\n/)) {
      jelem = '<' + name + jattr + '>\n' + jelem + '</' + name + '>\n'
    } else {
      jelem = '<' + name + jattr + '>' + jelem + '</' + name + '>\n'
    }
  } else {
    jelem = '<' + name + jattr + ' />\n'
  }
  return jelem
}

//  method: array_to_xml( tagName, array )

XML.ObjTree.prototype.array_to_xml = function (name, array) {
  var out = []
  for (var i = 0; i < array.length; i++) {
    var val = array[i]
    if (typeof val == 'undefined' || val == null) {
      out[out.length] = '<' + name + ' />'
    } else if (typeof val == 'object' && val.constructor == Array) {
      out[out.length] = this.array_to_xml(name, val)
    } else if (typeof val == 'object') {
      out[out.length] = this.hash_to_xml(name, val)
    } else {
      out[out.length] = this.scalar_to_xml(name, val)
    }
  }
  return out.join('')
}

//  method: scalar_to_xml( tagName, text )

XML.ObjTree.prototype.scalar_to_xml = function (name, text) {
  if (name == '#text') {
    return this.xml_escape(text)
  } else {
    return '<' + name + '>' + this.xml_escape(text) + '</' + name + '>\n'
  }
}

//  method: xml_escape( text )

XML.ObjTree.prototype.xml_escape = function (text) {
  return text
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
}

/*
// ========================================================================

=head1 NAME

XML.ObjTree -- XML source code from/to JavaScript object like E4X

=head1 SYNOPSIS

var xotree = new XML.ObjTree();
var tree1 = {
root: {
node: "Hello, World!"
}
};
var xml1 = xotree.writeXML( tree1 );        // object tree to XML source
alert( "xml1: "+xml1 );

var xml2 = '<?xml version="1.0"?><response><error>0</error></response>';
var tree2 = xotree.parseXML( xml2 );        // XML source to object tree
alert( "error: "+tree2.response.error );

=head1 DESCRIPTION

XML.ObjTree class is a parser/generator between XML source code
and JavaScript object like E4X, ECMAScript for XML.
This is a JavaScript version of the XML::TreePP module for Perl.
This also works as a wrapper for XMLHTTPRequest and successor to JKL.ParseXML class
when this is used with prototype.js or JSAN's HTTP.Request class.

=head2 JavaScript object tree format

A sample XML source:

<?xml version="1.0" encoding="UTF-8"?>
<family name="Kawasaki">
<father>Yasuhisa</father>
<mother>Chizuko</mother>
<children>
<girl>Shiori</girl>
<boy>Yusuke</boy>
<boy>Kairi</boy>
</children>
</family>

Its JavaScript object tree like JSON/E4X:

{
'family': {
'-name':    'Kawasaki',
'father':   'Yasuhisa',
'mother':   'Chizuko',
'children': {
'girl': 'Shiori'
'boy': [
'Yusuke',
'Kairi'
]
}
}
};

Each elements are parsed into objects:

tree.family.father;             # the father's given name.

Prefix '-' is inserted before every attributes' name.

tree.family["-name"];           # this family's family name

A array is used because this family has two boys.

tree.family.children.boy[0];    # first boy's name
tree.family.children.boy[1];    # second boy's name
tree.family.children.girl;      # (girl has no other sisters)

=head1 METHODS

=head2 xotree = new XML.ObjTree()

This constructor method returns a new XML.ObjTree object.

=head2 xotree.force_array = [ "rdf:li", "item", "-xmlns" ];

This property allows you to specify a list of element names
which should always be forced into an array representation.
The default value is null, it means that context of the elements
will determine to make array or to keep it scalar.

=head2 xotree.attr_prefix = '@';

This property allows you to specify a prefix character which is
inserted before each attribute names.
Instead of default prefix '-', E4X-style prefix '@' is also available.
The default character is '-'.
Or set '@' to access attribute values like E4X, ECMAScript for XML.
The length of attr_prefix must be just one character and not be empty.

=head2 tree = xotree.parseXML( xmlSrc );

This method loads an XML document using the supplied string
and returns its JavaScript object converted.

=head2 tree = xotree.parseDOM( domNode );

This method parses a DOM tree (ex. responseXML.documentElement)
and returns its JavaScript object converted.

=head2 tree = xotree.parseHTTP( url, options );

This method loads a XML file from remote web server
and returns its JavaScript object converted.
XMLHTTPRequest's synchronous mode is always used.
This mode blocks the process until the response is completed.

First argument is a XML file's URL
which must exist in the same domain as parent HTML file's.
Cross-domain loading is not available for security reasons.

Second argument is options' object which can contains some parameters:
method, postBody, parameters, onLoading, etc.

This method requires JSAN's L<HTTP.Request> class or prototype.js's Ajax.Request class.

=head2 xotree.parseHTTP( url, options, callback );

If a callback function is set as third argument,
XMLHTTPRequest's asynchronous mode is used.

This mode calls a callback function with XML file's JavaScript object converted
after the response is completed.

=head2 xmlSrc = xotree.writeXML( tree );

This method parses a JavaScript object tree
and returns its XML source generated.

=head1 EXAMPLES

=head2 Text node and attributes

If a element has both of a text node and attributes
or both of a text node and other child nodes,
text node's value is moved to a special node named "#text".

var xotree = new XML.ObjTree();
var xmlSrc = '<span class="author">Kawasaki Yusuke</span>';
var tree = xotree.parseXML( xmlSrc );
var class = tree.span["-class"];        # attribute
var name  = tree.span["#text"];         # text node

=head2 parseHTTP() method with HTTP-GET and sync-mode

HTTP/Request.js or prototype.js must be loaded before calling this method.

var xotree = new XML.ObjTree();
var url = "http://example.com/index.html";
var tree = xotree.parseHTTP( url );
xotree.attr_prefix = '@';                   // E4X-style
alert( tree.html["@lang"] );

This code shows C<lang=""> attribute from a X-HTML source code.

=head2 parseHTTP() method with HTTP-POST and async-mode

Third argument is a callback function which is called on onComplete.

var xotree = new XML.ObjTree();
var url = "http://example.com/mt-tb.cgi";
var opts = {
postBody:   "title=...&excerpt=...&url=...&blog_name=..."
};
var func = function ( tree ) {
alert( tree.response.error );
};
xotree.parseHTTP( url, opts, func );

This code send a track back ping and shows its response code.

=head2 Simple RSS reader

This is a RSS reader which loads RDF file and displays all items.

var xotree = new XML.ObjTree();
xotree.force_array = [ "rdf:li", "item" ];
var url = "http://example.com/news-rdf.xml";
var func = function( tree ) {
var elem = document.getElementById("rss_here");
for( var i=0; i<tree["rdf:RDF"].item.length; i++ ) {
var divTag = document.createElement( "div" );
var aTag = document.createElement( "a" );
aTag.href = tree["rdf:RDF"].item[i].link;
var title = tree["rdf:RDF"].item[i].title;
var tNode = document.createTextNode( title );
aTag.appendChild( tNode );
divTag.appendChild( aTag );
elem.appendChild( divTag );
}
};
xotree.parseHTTP( url, {}, func );

=head2  XML-RPC using writeXML, prototype.js and parseDOM

If you wish to use prototype.js's Ajax.Request class by yourself:

var xotree = new XML.ObjTree();
var reqTree = {
methodCall: {
methodName: "weblogUpdates.ping",
params: {
param: [
{ value: "Kawa.net xp top page" },  // 1st param
{ value: "http://www.kawa.net/" }   // 2nd param
]
}
}
};
var reqxml = xotree.writeXML( reqTree );       // JS-Object to XML code
var url = "http://example.com/xmlrpc";
var func = function( req ) {
var resDom = req.responseXML.documentElement;
xotree.force_array = [ "member" ];
var resTree = xotree.parseDOM( resDom );   // XML-DOM to JS-Object
alert( resTree.methodResponse.params.param.value.struct.member[0].value.string );
};
var opt = {
method:         "post",
postBody:       reqxml,
asynchronous:   true,
onComplete:     func
};
new Ajax.Request( url, opt );

=head1 AUTHOR

Yusuke Kawasaki http://www.kawa.net/
=head1 COPYRIGHT AND LICENSE

Copyright (c) 2005-2006 Yusuke Kawasaki. All rights reserved.
This program is free software; you can redistribute it and/or
modify it under the Artistic license. Or whatever license I choose,
which I will do instead of keeping this documentation like it is.

=cut
// ========================================================================
*/

/**
 * xml 转 json
 * @param xmlData
 * @returns
 */
const lfXml2Json = (xmlData) => {
  return new XML.ObjTree().parseXML(xmlData)
}

export { lfXml2Json }
