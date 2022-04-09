/**
 * This work is licensed under Creative Commons GNU LGPL License.
 * License: 
 * Version: 0.9
 * Author:  Stefan Goessner/2006
 * Web:     http://goessner.net/ 
 */
function addIndSpace (ind, deep) {
   for (let i = 0; i < deep; i++) {
      ind += '  ';
   }
   return ind;
}

function toXml(v, name, ind, deep) {
   let xml = "";
   if (v instanceof Array) {
      for (let i=0, n=v.length; i<n; i++) {
         xml += addIndSpace(ind, deep) + toXml(v[i], name, ind, deep + 1);
      }
   }
   else if (typeof(v) == "object") {
      let hasChild = false;
      xml += addIndSpace(ind, deep) + "<" + name;
      for (let m in v) {
         if (m.charAt(0) == "-") {
            console.log(m, v[m]);
            xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
         } else {
            hasChild = true;
         }
      }
      xml += hasChild ? ">" : " />";
      if (hasChild) {
         for (let m in v) {
            if (m == "#text")
               xml += v[m];
            else if (m == "#cdata")
               xml += "<![CDATA[" + v[m] + "]]>";
            else if (m.charAt(0) != "-")
               xml += toXml(v[m], m, ind, deep + 1);
         }
         xml += addIndSpace(ind, deep) + "</" + name + ">";
      } else {
         // xml += addIndSpace(ind, deep);
      }
   }
   else {
      xml += addIndSpace(ind, deep) + "<" + name + ">" + v.toString() +  "</" + name + ">";
   }
   return xml;
};

function lfJson2Xml(o) {
   let xmlStr= "";
   for (var m in o) {
      xmlStr += toXml(o[m], m, "\t\n", 0);
   }
   return xmlStr;
}

export {
   lfJson2Xml
};