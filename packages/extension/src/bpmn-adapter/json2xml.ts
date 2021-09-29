/*	This work is licensed under Creative Commons GNU LGPL License.

	License: http://creativecommons.org/licenses/LGPL/2.1/
   Version: 0.9
	Author:  Stefan Goessner/2006
	Web:     http://goessner.net/ 
*/
export default function json2xml(o) {
   var addIndSpace = function (ind, deep) {
      for (let i = 0; i < deep; i++) {
         ind += '  '
      }
      return ind
   }
   var toXml = function(v, name, ind, deep) {
      var xml = "";
      if (v instanceof Array) {
         for (var i=0, n=v.length; i<n; i++)
            xml += addIndSpace(ind, deep) + toXml(v[i], name, ind, deep + 1);
      }
      else if (typeof(v) == "object") {
         var hasChild = false;
         xml += addIndSpace(ind, deep) + "<" + name;
         for (var m in v) {
            if (m.charAt(0) == "-")
               xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
            else
               hasChild = true;
         }
         xml += hasChild ? ">" : " />";
         if (hasChild) {
            for (var m in v) {
               if (m == "#text")
                  xml += v[m];
               else if (m == "#cdata")
                  xml += "<![CDATA[" + v[m] + "]]>";
               else if (m.charAt(0) != "-")
                  xml += toXml(v[m], m, ind, deep + 1);
            }
            xml += addIndSpace(ind, deep) + "</" + name + ">";
         } else {
            xml += addIndSpace(ind, deep);
         }
      }
      else {
         xml += addIndSpace(ind, deep) + "<" + name + ">" + v.toString() +  addIndSpace(ind, deep) + "</" + name + ">";
      }
      return xml;
   }, xml="";
   for (var m in o)
      xml += toXml(o[m], m, "\t\n", 0);
   return xml;
}
