# PureQML TV plugin
This plugin allow you to build [PureQML](https://pureqml.com/) apps for SmartTV platforms

# Platforms
<ul>
<li>AndroidTV</li>
<li>Hisense</li>
<li>LG NetCast</li>
<li>LG WebOS</li>
<li>OperaTV</li>
<li>Samsung Orsay</li>
<li>Samsung Tizen</li>
</ul>

# Install
Just place `qmlcore-tv` into your PureQML project root and you will able to build your app for any corresponded platform

# Build
To build an app for specific platform use this command:

`./qmlcore/build -p androidtv|hisense|netcast|webos|opera|orsay|tizen`

# Licence
[Creative Commons Attribution Share Alike 4.0](https://github.com/pureqml/qmlcore-tv/blob/master/LICENSE.md)

# Adding New Platform

Platform is pretty much similar to any qml package you may have, just a directory with .manifest file in it. Platforms have some additional handling in build command (-p/--platform switch), but that's pretty much it. All dependencies are processed as anywhere else, platform code may have dist/ folder with additional files: own components and javascript modules, etc. 

## Name
Pick a name relevant to platform or platform family. Ideally internal name, recognisable in professional community. Create platform/<name> directory. A few names are webos, orsay, tizen, we prefer lowercase kebab notation. 

## Manifest
Platform manifest is just an ordinary manifests, and they may inherit some addition base platform, e.g. "video.html5" or "html5", and/or override some parent properties, for instance, strict mode. Consider the following example:
```
{
	"requires": ["video.html5", "video.shaka"],
	"templates": ["*.html", "appinfo.json"],
	"strict": false
}
```

This manifest imports video backends from generic html5 and Shaka, and also pass all .html and appinfo.json file to templater, so values from the manifest may override some application properties, like name, author, anything from manifest really. 

## .core.js

This file is added really early in resulting js, if specific platform was activated. You may even override log function in it. Normally platforms declare their own key mapping if any, and/or some specific core functions, like close application or handling back button. See platform/&lt;name&gt;/.core.js as a good example how to do it. 

## dist/*

Content of this folder has been installed into resulting application directory, with template variable replacement if required by "templates" manifest property. 

## Anything else

Anything else goes like normal package into "\_globals.platform.&lt;name&gt;", so you can put additional qml components, include javascript modules, pretty much like anywhere else where .manifest is present. 
  
If you have any questions feel free to drop us an email, or seek telegram/gitter support on our site: https://pureqml.com
