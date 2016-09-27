CreateXml = function ()
{
	var xml = new ActiveXObject("Msxml2.DOMDocument");
	xml.async = false;
	xml.appendChild(xml.createProcessingInstruction("xml", 'version="1.0" encoding="UTF-8"'));
	return xml;
}

GetAddonInfo2 = function (xml, info, Tag)
{
	var items = xml.getElementsByTagName(Tag);
	if (items.length) {
		var item = items[0].childNodes;
		for (var i = 0; i < item.length; i++) {
			info[item[i].tagName] = item[i].text;
		}
	}
}

var fso = new ActiveXObject("Scripting.FileSystemObject");
var folder = fso.GetFolder(".");

var em = new Enumerator( folder.SubFolders );
var arLangs = ["General", "en", "ja"];
var arAddon = [];
for (em.moveFirst(); !em.atEnd(); em.moveNext()) {
	var name = em.item().Name;
	var xml = new ActiveXObject("Msxml2.DOMDocument");
	xml.async = false;
	if (xml.load(name + "\\config.xml")) {
		var info = [];
		for (var i = arLangs.length; i--;) {
			GetAddonInfo2(xml, info, arLangs[i]);
		}
		var dt = new Date(info.pubDate);
		var ver = info.Version * 100;
		arAddon.push({
			name: name,
			order: ("0000000000000000000" + dt.getTime()).slice(-20) + (9999 -ver)
		});
	}
}

var arSorted = arAddon.sort(function (a, b) {
	if (a.order > b.order) {
		return -1;
	}
	if (a.order < b.order) {
		return 1;
	}
	return 0;
});

var xmlSave = CreateXml();
var root = xmlSave.createElement("TablacusExplorer");
for (var i in arSorted) {
	var name = arSorted[i].name;
	var xml = new ActiveXObject("Msxml2.DOMDocument");
	xml.async = false;
	if (xml.load(name + "\\config.xml")) {
		var item1 = xmlSave.createElement("Item");
		item1.setAttribute("Id", name);
		for (var k = 0; k < arLangs.length; k++) {
			var items = xml.getElementsByTagName(arLangs[k]);
			if (items.length) {
				var item2 = xmlSave.createElement(arLangs[k]);
				var item = items[0].childNodes;
				for (var i = 0; i < item.length; i++) {
					if (/Version$|^pubDate$|^Creator$|^Name$|^Description$/.test(item[i].tagName)) {
						var item3 = xmlSave.createElement(item[i].tagName);
						item3.text = item[i].text;
						item2.appendChild(item3);
					}
				}
				item1.appendChild(item2);
			}
		}
		root.appendChild(item1);
	}
}
xmlSave.appendChild(root);
xmlSave.save("index.xml");