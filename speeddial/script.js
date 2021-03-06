﻿if (window.Addon == 1) {
	Addons.SpeedDial =
	{
		SAVE: 512,
		DISP: 10,
		PATH: "about:newtab",
		CONFIG: fso.BuildPath(te.Data.DataFolder, "config\\speeddial.tsv"),
		db: [],
		bSave: false,
		Prev: null,
		tid: [],

		IsHandle: function (Ctrl)
		{
			return String(typeof(Ctrl) == "string" ? Ctrl : api.GetDisplayNameOf(Ctrl, SHGDN_FORADDRESSBAR | SHGDN_FORPARSING)).toLowerCase() == Addons.SpeedDial.PATH;
		},

		IsDisp: function (path)
		{
			if (!api.PathMatchSpec("\\\\")) {
				if (api.PathMatchSpec(path, "?:\\*")) {
					try {
						var d = fso.GetDrive(fso.GetDriveName(path));
						return d.DriveType == 2;
					} catch (e) {
						return false;
					}
				}
				return true;
			}
			return false;
		}

	}
	try {
		var f = fso.OpenTextFile(Addons.SpeedDial.CONFIG, 1, false, -1);
		var s;
		while (s = f.ReadLine()) {
			Addons.SpeedDial.db.push(s.replace(/\t.*$/, ""));
		}
		f.Close();
	} catch (e) {
		f && f.Close();
	}

	AddEvent("SaveConfig", function ()
	{
		if (Addons.SpeedDial.bSave) {
			try {
				var f = fso.OpenTextFile(Addons.SpeedDial.CONFIG, 2, true, -1);
				for (var i in Addons.SpeedDial.db) {
					var path = Addons.SpeedDial.db[i];
					if (Addons.SpeedDial.IsDisp(path)) {
						f.WriteLine(path);
					}
				}
				f.Close();
			} catch (e) {}
		}
	});

	AddEvent("NavigateComplete", function (Ctrl)
	{
		if (Addons.SpeedDial.IsHandle(Ctrl)) {
			if (Addons.SpeedDial.tid[Ctrl.Id]) {
				return;
			}
			Ctrl.SortColumn = "";
			Addons.SpeedDial.tid[Ctrl.Id] = setTimeout(function () {
				delete Addons.SpeedDial.tid[Ctrl.Id];
				var keys = [];
				var hash = {};
				for (var i in Addons.SpeedDial.db) {
					var path = Addons.SpeedDial.db[i];
					if (hash[path]) {
						hash[path]++;
					} else {
						hash[path] = 1;
					}
				}
				for (var i in hash) {
					keys.push(i);
				}
				keys.sort(function (a, b) {
					return hash[b] - hash[a];
				});
				var nDog = Addons.SpeedDial.DISP;
				for (var i = 0; i < keys.length; i++) {
					if (!Addons.SpeedDial.IsDisp(keys[i])) {
						delete keys[i];
					}
				}
				Ctrl.RemoveAll();
				Ctrl.AddItems(keys.slice(0, Addons.SpeedDial.DISP));
			}, 99);
		} else {
			var path = api.GetDisplayNameOf(Ctrl.FolderItem, SHGDN_FORPARSINGEX | SHGDN_FORPARSING | SHGDN_FORADDRESSBAR);
			if (path != "" && IsSavePath(path) && Addons.SpeedDial.IsDisp(path)) {
				Addons.SpeedDial.db.unshift(path);
				Addons.SpeedDial.db.splice(Addons.SpeedDial.SAVE, MAXINT);
				Addons.SpeedDial.bSave = true;
			}
		}
	});

	AddEvent("TranslatePath", function (Ctrl, Path)
	{
		if (Addons.SpeedDial.IsHandle(Path)) {
			return ssfRESULTSFOLDER;
		}
	}, true);

	AddEvent("GetTabName", function (Ctrl)
	{
		if (Addons.SpeedDial.IsHandle(Ctrl)) {
			return GetText("New Tab");
		}
	}, true);

	AddEvent("Context", function (Ctrl, hMenu, nPos, Selected, item, ContextMenu)
	{
		if (Addons.SpeedDial.IsHandle(Ctrl)) {
			RemoveCommand(hMenu, ContextMenu, "delete;rename");
			api.InsertMenu(hMenu, -1, MF_BYPOSITION | MF_STRING, ++nPos, GetText('Remove'));
			ExtraMenuCommand[nPos] = Addons.History1.Remove;
		}
		return nPos;
	});

	AddEvent("Command", function (Ctrl, hwnd, msg, wParam, lParam)
	{
		if (Ctrl.Type == CTRL_SB || Ctrl.Type == CTRL_EB) {
			if (Addons.SpeedDial.IsHandle(Ctrl)) {
				if ((wParam & 0xfff) == CommandID_DELETE - 1) {
					return S_OK;
				}
			}
		}
	}, true);

	AddEvent("InvokeCommand", function (ContextMenu, fMask, hwnd, Verb, Parameters, Directory, nShow, dwHotKey, hIcon)
	{
		if (Verb == CommandID_DELETE - 1) {
			var FV = ContextMenu.FolderView;
			if (FV && Addons.SpeedDial.IsHandle(FV)) {
				return S_OK;
			}
		}
		if (!Verb) {
			if (ContextMenu.Items.Count >= 1) {
				var path = api.GetDisplayNameOf(ContextMenu.Items.Item(0), SHGDN_FORADDRESSBAR | SHGDN_FORPARSING);
				if (Addons.SpeedDial.IsHandle(path)) {
					var FV = te.Ctrl(CTRL_FV);
					FV.Navigate(path, SBSP_SAMEBROWSER);
					return S_OK;
				}
			}
		}
	}, true);

	HOME_PATH = Addons.SpeedDial.PATH;
}
