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
                        // this.app.vault.create(fileFolder + "/index.md", `[[${this.app.workspace.getActiveFile().basename}]]`);
                    }
                })
                this.app.vault.on("delete", () => {
                    console.log("You deleted a file.");
                    //remove the file from the index.md? Kinda lazy to do this rn.
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