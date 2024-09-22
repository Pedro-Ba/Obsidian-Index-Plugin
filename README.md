The plugin contains a command that serves to create an initial "index.md" file on all folders in your obsidian vault. 
This index.md file contains a hyperlink reference to all the other files within that same folder.

Other than that, the plugin also contains a check for the onCreate event, such that when a file is created, a hyperlink to that file is automatically added to the index.md file of the respective folder. The same is also now done on deletion.

This is done in javascript only and there is no typescript code. This is mostly my personal preference and because I felt as if the obsidian documentation and steps towards a first plugin were too bloated and unnecessary.

TODO:

- Make index file creation not add itself to itself.
- In case file is moved, delete hyperlink from previous index.md and add it to the index.md of the new folder we find ourselves in
- Better handling of plugin unloading (possibly generates garbage if attempted to unload)
- Clean my code up.
