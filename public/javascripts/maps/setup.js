nokia.mh5.assetsPath = "/images/maps/";
nokia.mh5.app.embed({
	appId: "Mek1RWK8L0PLr48gT0al",
	appCode: "BU8plLql-XdJ0CmizJSsow",
	hideAddressBar: true,
	layouts: ["gamify"],
	gamify: {
		controller: nokia.mh5.app.controller,
		pages: ["splash", "landing"],
		splash: gamify.SplashPage,
		landing: gamify.LandingPage,
	},
	configuration : {
		distanceUnit : "km",
		map : {
			schema : "normal.day",
			settingsButton : null
		},
		search : null
	}
});