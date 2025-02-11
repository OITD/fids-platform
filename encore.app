{
	"id":   "fids-platform-c9ui",
	"lang": "typescript",
  	"build": {
  		"docker": {
  			"bundle_source": true
  		}
  	},
  	"global_cors": {
  		"allow_origins_without_credentials": [
  			"http://localhost*",
  			"https://*.oitd.org"
  		],
  		"allow_origins_with_credentials": [
  			"http://localhost*",
  			"https://*.oitd.org"
  		],
  		"allow_headers": ["*"],
  		"expose_headers": ["*"]
  	}
  }
