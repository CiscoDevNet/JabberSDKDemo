# JabberSDKDemo
Demo of the Jabber IM Web SDK

You can enter your credentials and settings at the login screen, or set the default values in JabberDemo.html here:

			var demoConfig = {
				httpBindingURL: "http[s]://<your CIMP server>:5280/httpbinding",
				username: "<username>",
				password: "<password>",
				unsecureAllowed: true,
				domain: "<domain used in JID such as someone@SOMEDOMAIN>",
				resource: "caxl_",
				appTag: "app-data-8",
			};

If your Cisco IM&P server is set to use https, then you'll need to set unsecureAllowed to false.

The username: is simply your login jabber name, not a full JID.  For example, enter <yourname> not <yourname@domain.com>.  The code adds the domain based on what you enter in the domain: setting.
  
  
