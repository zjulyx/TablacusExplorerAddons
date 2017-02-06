﻿var Addon_Id = "flat";
var Default = "None";

var items = te.Data.Addons.getElementsByTagName(Addon_Id);
var item = null;
if (items.length) {
	item = items[0];
	if (!item.getAttribute("Set")) {
		item.setAttribute("MenuExec", -1);
		item.setAttribute("Menu", "Tabs");
		item.setAttribute("MenuPos", -1);
	}
}

Addons.Flat =
{
	PATH: "flat:",
	iCaret: -1,
	strName: "",

	GetSearchString: function(Ctrl)
	{
		if (Ctrl) {
			var res = new RegExp("^" + Addons.Flat.PATH + "\\s*(.*)" , "i").exec(api.GetDisplayNameOf(Ctrl, SHGDN_FORADDRESSBAR | SHGDN_FORPARSING));
			if (res) {
				return res[1];
			}
		}
		return "";
	},

	Exec: function (Ctrl, pt)
	{
		var FV = GetFolderView(Ctrl, pt);
		var path = api.GetDisplayNameOf(FV, SHGDN_FORADDRESSBAR | SHGDN_FORPARSING);
		var pidl = api.ILCreateFromPath(path);
		if (pidl && pidl.IsFolder) {
			FV.Navigate(Addons.Flat.PATH + path);
		};
		return S_OK;
	},

	AddItem: function (pidl, bRecreate)
	{
		var cFV = te.Ctrls(CTRL_FV);
		for (var i in cFV) {
			var FV = cFV[i];
			var path = Addons.Flat.GetSearchString(FV);
			if (path) {
				if (api.ILIsParent(path, pidl, false)) {
					FV.AddItem(bRecreate ? api.GetDisplayNameOf(pidl, SHGDN_FORADDRESSBAR | SHGDN_FORPARSING) : pidl);
				}
			}
		}
	},

	RemoveItem: function (pidl)
	{
		var cFV = te.Ctrls(CTRL_FV);
		for (var i in cFV) {
			var FV = cFV[i];
			var path = Addons.Flat.GetSearchString(FV);
			if (path) {
				if (api.ILIsParent(path, pidl, false)) {
					FV.RemoveItem(pidl);
				}
			}
		}
	}
};

if (window.Addon == 1) {
	AddEvent("TranslatePath", function (Ctrl, Path)
	{
		if (api.PathMatchSpec(Path, Addons.Flat.PATH + "*")) {
			return ssfRESULTSFOLDER;
		}
	}, true);

	AddEvent("NavigateComplete", function (Ctrl)
	{
		var path = Addons.Flat.GetSearchString(Ctrl);
		if (path) {
			OpenNewProcess("addons\\flat\\worker.js",
			{
				FV: Ctrl,
				Path: path,
				SessionId: Ctrl.SessionId,
				hwnd: te.hwnd
			});
		}
	});

	AddEvent("ChangeNotify", function (Ctrl, pidls)
	{
		if (pidls.lEvent & (SHCNE_DELETE | SHCNE_DRIVEREMOVED | SHCNE_MEDIAREMOVED | SHCNE_NETUNSHARE | SHCNE_RENAMEITEM | SHCNE_RENAMEFOLDER | SHCNE_RMDIR | SHCNE_SERVERDISCONNECT)) {
			Addons.Flat.RemoveItem(pidls[0]);
		}
		if (pidls.lEvent & (SHCNE_RENAMEFOLDER | SHCNE_RENAMEITEM)) {
			Addons.Flat.AddItem(pidls[1], true);
		}
		if (pidls.lEvent & (SHCNE_CREATE | SHCNE_DRIVEADD | SHCNE_MEDIAINSERTED | SHCNE_NETSHARE | SHCNE_MKDIR)) {
			Addons.Flat.AddItem(pidls[0]);
		}
	});

	AddEvent("ILGetParent", function (FolderItem)
	{
		var path = Addons.Flat.GetSearchString(FolderItem);
		if (path) {
			return path;
		}
	});

	AddEvent("Context", function (Ctrl, hMenu, nPos, Selected, item, ContextMenu)
	{
		if (Addons.Flat.GetSearchString(Ctrl)) {
			api.InsertMenu(hMenu, -1, MF_BYPOSITION | MF_STRING, ++nPos, api.LoadString(hShell32, 31368));
			ExtraMenuCommand[nPos] = OpenContains;
		}
		return nPos;
	});

	AddEvent("GetIconImage", function (Ctrl, BGColor)
	{
		if (Addons.Flat.GetSearchString(Ctrl)) {
			return MakeImgSrc("icon:shell32.dll,4,16", 0, false, 16);
		}
	});

	if (item) {
		Addons.Flat.strName = item.getAttribute("MenuName") || GetText(GetAddonInfo(Addon_Id).Name);
		//Menu
		if (item.getAttribute("MenuExec")) {
			Addons.Flat.nPos = api.LowPart(item.getAttribute("MenuPos"));
			AddEvent(item.getAttribute("Menu"), function (Ctrl, hMenu, nPos)
			{
				api.InsertMenu(hMenu, Addons.Flat.nPos, MF_BYPOSITION | MF_STRING, ++nPos, GetText(Addons.Flat.strName));
				ExtraMenuCommand[nPos] = Addons.Flat.Exec;
				return nPos;
			});
		}
		//Key
		if (item.getAttribute("KeyExec")) {
			SetKeyExec(item.getAttribute("KeyOn"), item.getAttribute("Key"), Addons.Flat.Exec, "Func");
		}
		//Mouse
		if (item.getAttribute("MouseExec")) {
			SetGestureExec(item.getAttribute("MouseOn"), item.getAttribute("Mouse"), Addons.Flat.Exec, "Func");
		}
		//Type
		AddTypeEx("Add-ons", "Flat", Addons.Flat.Exec);
	}
	var h = GetAddonOption(Addon_Id, "IconSize") || window.IconSize || 24;
	var s = GetAddonOption(Addon_Id, "Icon");
	if (s) {
		s = '<img title="' + Addons.Flat.strName.replace(/"/g, "") + '" src="' + s.replace(/"/g, "") + '" width="' + h + 'px" height="' + h + 'px" />';
	} else {
		s = Addons.Flat.strName;
	}
	SetAddon(Addon_Id, Default, ['<span class="button" onclick="Addons.Flat.Exec();" oncontextmenu="Addons.Flat.Exec(); return false;" onmouseover="MouseOver(this)" onmouseout="MouseOut()">', s, '</span>']);
}