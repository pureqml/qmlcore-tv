#!/usr/bin/env python2.7

import argparse
import os


def build(app, title, release):
	os.system('rm -rf %s' %app)
	res = os.system('cordova create %s com.%s.app %s' %(app, app, title))
	if res != 0:
		print "Failed to create android app"
		return
	os.system('rsync -a ./ %s/www --exclude=%s ' %(app,app))
	os.system('cp androidIcon.png %s' %(app))
	os.system('cp config.xml %s' %(app))
	os.chdir(app)
	os.system('cordova platform add android')
	{% block commands %}{% endblock %}

	os.system('cp ../banner.png ./platforms/android/res/drawable-land-hdpi/.')
	os.system('cp ../banner.png ./platforms/android/res/drawable-land-ldpi/.')
	os.system('cp ../banner.png ./platforms/android/res/drawable-land-mdpi/.')
	os.system('cp ../banner.png ./platforms/android/res/drawable-land-xhdpi/.')
	os.system('cp ../banner.png ./platforms/android/res/drawable-land-xxhdpi/.')
	os.system('cp ../banner.png ./platforms/android/res/drawable-land-xxxhdpi/.')
	os.system('cp ../banner.png ./platforms/android/res/drawable-port-hdpi/.')
	os.system('cp ../banner.png ./platforms/android/res/drawable-port-ldpi/.')
	os.system('cp ../banner.png ./platforms/android/res/drawable-port-mdpi/.')
	os.system('cp ../banner.png ./platforms/android/res/drawable-port-xhdpi/.')
	os.system('cp ../banner.png ./platforms/android/res/drawable-port-xxhdpi/.')
	os.system('cp ../banner.png ./platforms/android/res/drawable-port-xxxhdpi/.')

	os.system('cordova plugin add https://github.com/comrat/Cordova-Android-TV-Plugin')
	os.system('cordova plugin add cordova-plugin-device')
	os.system('cordova plugin add https://github.com/comrat/cordova-plugin-exoplayer')
	{% block plugins %}{% endblock %}

	if release:
		{% if androidBuild %}
		build = 'cordova build android --release -- '
		os.system(build + '--keystore={{androidBuild.keystore}} --storePassword={{androidBuild.storePassword}} --alias={{androidBuild.alias}} --password={{androidBuild.password}}')
		{% else %}
		print "Failed to build release apk androidBuild property is undefined"
		{% endif %}
	else:
		os.system('cordova build android')

	os.chdir('..')


parser = argparse.ArgumentParser('qmlcore build tool')
parser.add_argument('--app', '-a', help='application name', default="app")
parser.add_argument('--title', '-t', help='application title', default="App")
parser.add_argument('--release', '-r', help='build release apk', default=False)
args = parser.parse_args()


res = os.system('cordova --version')
if res == 0:
	build(args.app, args.title, args.release)
else:
	print 'Install "cordova" first: https://cordova.apache.org/docs/en/latest/guide/cli/'
