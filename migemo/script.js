﻿Addon_Id = "migemo";

Addons.Migemo = 
{
	Init: function ()
	{
		try {
			var ado = te.CreateObject("Adodb.Stream");
			ado.CharSet = "utf-8";
			ado.Open();
			ado.LoadFromFile(fso.BuildPath(fso.GetParentFolderName(api.GetModuleFileName(null)), "lib\\migemo\\migemo.js"));
			var s = ado.ReadText();
			ado.Close();
		} catch (e) {
			s = "";
		}
		s = s.replace("var migemo =", "migemo =").replace(/window\.ActiveXObject[^\)]*\)/, 'true').replace('wo":"を"', 'wo":"を", "fa":"ふぁ", "fi":"ふぃ", "fu":"ふ", "fe":"ふぇ", "fo":"ふぉ"').replace('"cc":"xtuc"', '"cc":"xtuc", "hh":"xtuh"');

		(new Function(s))();
		if (window.migemo) {
			migemo.initialize(fso.BuildPath(fso.GetParentFolderName(api.GetModuleFileName(null)), "lib\\migemo"));
		}
	}
}
if (window.Addon == 1) {
	Addons.Migemo.Init();
} else {
	document.getElementById("tab4").value = "General";
	var s = [''];
	s.push('<table style="width: 100%"><tr><td><label>Test</label></td></tr><tr><td><input type="text" autocomplete="off" onkeyup="KeyUp(this)" style="width: 50%" /></td></td></tr>');

	s.push('<tr><td><label>Regular Expression</label></td></tr><tr><td><input type="text" id="_Migemo" style="width: 100%" readonly /></td></tr></table>');

	KeyUp = function (o)
	{
		var m = MainWindow.migemo || window.migemo;
		if (!m) {
			Addons.Migemo.Init();
		}
		try {
			document.getElementById("_Migemo").value = m.query(o.value) || o.value;
		} catch (e) {
			document.getElementById("_Migemo").value = o.value;
		}
	}
	s.push('<table style="width: 100%"><tr><td><label>Path</label></td></tr><tr><td style="width: 100%"><input type="text" readonly value="', fso.BuildPath(fso.GetParentFolderName(api.GetModuleFileName(null)), "lib\\migemo\\migemo.js"), '"style="width: 100%" /></td><td><input type="button" value="Open" onclick="OpenLibrary()"></td></td></tr>');
	s.push('</table><br />');
	s.push('<table style="width: 100%"><tr><td style="width: 100%"><input type="button" value="Get JavaScript/Migemo..." title="http://www.oldriver.org/jsmigemo/" onclick="wsh.Run(this.title)">');
	s.push('</td><td><input type="button" value="Install" onclick="InstallMigemo(this)"></td></tr></table>');
	document.getElementById("panel4").innerHTML = s.join("");

	OpenLibrary = function ()
	{
		var path = fso.BuildPath(fso.GetParentFolderName(api.GetModuleFileName(null)), "lib\\migemo");
		if (!IsExists(path)) {
			CreateFolder2(fso.GetParentFolderName(path));
			CreateFolder2(path);
		}
		MainWindow.Navigate(path, SBSP_NEWBROWSER);
	}

	InstallMigemo = function (o)
	{
		var url = "http://www.oldriver.org/jsmigemo/";
		var xhr = createHttpRequest();
		xhr.open("GET", url, false);
		xhr.setRequestHeader('Pragma', 'no-cache');
		xhr.setRequestHeader('Cache-Control', 'no-cache');
		xhr.setRequestHeader('If-Modified-Since', 'Thu, 01 Jun 1970 00:00:00 GMT');
		xhr.send(null);
		if (!/<a href="(jsmigemo.*\.zip)">/i.test(xhr.responseText)) {
			return;
		}
		var file = RegExp.$1;
		if (!confirmOk(GetText("Do you want to install it now?") + "\r\n" + file)) {
			return;
		}
		var temp = fso.BuildPath(fso.GetSpecialFolder(2).Path, "tablacus");
		CreateFolder2(temp);
		var zipfile = fso.BuildPath(temp, file);
		temp += "\\migemo";
		CreateFolder2(temp);
		DownloadFile(url + file, zipfile);
		if (Extract(zipfile, temp) != S_OK) {
			return;
		}
		var migemojs = temp + "\\migemo\\migemo.js";
		var nDog = 300;
		while (!fso.FileExists(migemojs)) {
			if (wsh.Popup(GetText("Please wait."), 1, TITLE, MB_ICONINFORMATION | MB_OKCANCEL) == IDCANCEL || nDog-- == 0) {
				return;
			}
		}
		var oSrc = sha.NameSpace(temp);
		if (oSrc) {
			var Items = oSrc.Items();
			var dest = fso.BuildPath(fso.GetParentFolderName(api.GetModuleFileName(null)), "lib");
			CreateFolder2(dest);
			var oDest = sha.NameSpace(dest);
			if (oDest) {
				oDest.MoveHere(Items, FOF_NOCONFIRMATION | FOF_NOCONFIRMMKDIR);
				o.disabled = true;
				o.value = GetText("Installed");
			}
		}
	}
}