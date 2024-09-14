var obsidian = require("obsidian");

var default_settings = {
    mySetting: 'default'
}

class myPlugin extends obsidian.Plugin {
    settings = default_settings;
    async onload() {
        await this.loadSettings();
        this.registerEvent(
            this.app.workspace.onLayoutReady(() => {
                this.app.vault.on("create", async (file) => {
                    console.log("You created a file"); //can this also happen on a folder creation? Need to check these.
                    //get where the file was created
                    let fileFolder = file.parent.path; //path of created file; maybe change for string treatment (remove after last slash?)
                    let existsIndex = await this.app.vault.adapter.exists(`${fileFolder}/index-${file.parent.name}.md`);
                    if(existsIndex){
                        //just add it to the end of the index file
                        let indexFile = this.app.vault.getFileByPath(`${fileFolder}/index-${file.parent.name}.md`);
                        this.app.vault.append(indexFile, `[[${file.basename}]]\n`)
                    }
                    else{
                        //in case index.md file does not exist, then we also assume that it's because we've created this folder recently, and thus index.md file does not exist.
                        //What this means is that we should actually look out and create an index.md file inside a folder when a folder is created, but that's not really relevant to the case right now?
                        //anyway, if you fell here, index.md does not exist for some reason, so we create index.md and then add the file.
                        this.app.vault.create(`${fileFolder}/index-${file.parent.name}.md`, `[[${this.app.workspace.getActiveFile().basename}]]`);
                    }
                })
                this.app.vault.on("delete", async (file) => {
                    console.log("You deleted a file");
                    //parent becomes null on deletion, even if file content still remains. Need string treatment to remove name of file from place...
                    let fileFolder = file.path.replace(`/${file.name}`, "");
                    let existsIndex = await this.app.vault.adapter.exists(`${fileFolder}/index-${fileFolder}.md`); //trailing slash makes this not currently work. Crazy.
                    if(existsIndex){
                        let indexFile = this.app.vault.getFileByPath(`${fileFolder}/index-${fileFolder}.md`);
                        let text = await this.app.vault.read(indexFile);
                        let newText = text.replace(`[[${file.basename}]]\n`, "");
                        this.app.vault.modify(indexFile, newText)
                    }
                    else{
                        console.log("No need to remove as index does not exist."); //realistically you should never fall here unless the plugin is installed into an existing vault, command is never used,
                        //and then you delete a file in a folder without ever creating one first.
                    }
                })
                //need an extra one for when the file is moved.
            })
        );
        this.addCommand({
            id: "index-creator",
            name: "Creates and updates all indexes in folders.",
            callback: async () => {
                for(let folder of this.app.vault.getAllFolders()){
                    let existsIndex = await this.app.vault.adapter.exists(`${folder.path}/index-${folder.name}.md`);
                    if(existsIndex){
                        console.log(`The folder ${folder.path} contains an index file.`);
                    }
                    else{
                        let file = "";
                        for(let child of folder.children){
                            if(child.extension != "undefined"){
                                file += `[[${child.basename}]]\n`;
                            }
                        }
                        this.app.vault.create(`${folder.path}/index-${folder.name}.md`, file);
                    }
                }
            }
        })
    }
    onunload() {
    }
    async loadSettings() {
        this.settings = Object.assign({}, default_settings, await this.loadData());
    }
    async saveSettings() {
        await this.saveData(this.settings);
    }
}

exports.default = myPlugin;