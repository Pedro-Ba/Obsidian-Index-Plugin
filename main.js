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
                this.app.vault.on("create", async () => {
                    console.log("You created a file");
                    //get where the file was created
                    let currFolder = this.app.workspace.getActiveFile().parent.path; //current folder path
                    let existsIndex = await this.app.vault.adapter.exists(currFolder + "/index.md");
                    if(existsIndex){
                        //just add it to the end of the index file
                        let file = this.app.vault.getFileByPath(currFolder + "/index.md");
                        this.app.vault.append(file, `[[${this.app.workspace.getActiveFile().basename}]]\n`)
                    }
                    else{
                        //this should never happen because of the command we previously created, so I'm not going to treat this right now.
                    }
                })
                this.app.vault.on("delete", () => {
                    console.log("You deleted a file.");
                    //remove the file from the index.md? Kinda lazy to do this rn.
                })
            })
        );
        this.addCommand({
            id: "index-creator",
            name: "Creates and updates all indexes in folders.",
            callback: async () => {
                for(let folder of this.app.vault.getAllFolders()){
                    let existsIndex = await this.app.vault.adapter.exists(folder.path + "/index.md");
                    if(existsIndex){
                        console.log(`The folder ${folder.path} contains an index.md file.`);
                    }
                    else{
                        let file = "";
                        for(let child of folder.children){
                            if(child.extension != "undefined"){
                                file += `[[${child.basename}]]\n`;
                            }
                        }
                        this.app.vault.create(folder.path + "/index.md", file);
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