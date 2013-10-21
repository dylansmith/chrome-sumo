"Sumo" Chrome extension
=======================

This is the source code for the "Straight to Full-Size for Google Images(TM)" extension
for Google Chrome or Chromium browsers.

The official built extension can be downloaded from:
https://chrome.google.com/webstore/detail/ghhmhdkbiodiengmhbbpjkcjodingned

If you find any of this source code useful, awesome! Tell your friends about my extension,
and maybe give it a positive rating at the URL above, or leave a nice comment.

Thanks!

Description
-----------

Google Images forces you through an intermediate preview step when trying to view an image from their images search result page.

Sometimes, I'd prefer to just go directly to the URL of the fullsize image. This extension detects when your browser has arrived at a Google Images preview page and provides a simpler way to get at the full-size image.

Changelog
---------

Version 2.0 (in development)
- Updating the source code to work with Google's new search results page format.

Version 1.6 (2 October 2012)
- Updated the manifest file to the new format (was preventing the extension from being installed)
- Rewrote a lot of the code to change the way the tab handling is done
- Added "View original website" and "View Google Images preview" links to the full-size image display page

Version 1.5 (15 September 2011)
- Fixed a major issue introduced when Google changed the structure of their URLs which broke the previous version.
- Removed the additional links added below the image in the previous version.

Version 1.4 (28 Mar 2011)
- Added browser toolbar button to toggle the extension on and off
- Can now use the browser's back/forward buttons to switch between Google Images preview and the full-size image.
- Added useful options below the full-size image
- Slight name change to comply with the Chrome Web Store's branding guidelines

Version 1.3 (23 Aug 2010)
- bugfix to support images.google.com domain (thanks Nos402)

Version 1.2 (3 Aug 2010)
- Added new icons

Version 1.1 (3 Aug 2010)
- Detection update

Version 1.0 (2 Aug 2010)
- Initial release