const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Function to move the 'icon.png' file and rename it
function moveAndRenameIconAndYamlFile(dirPath, destinationPath) {
    const iconDestinationPath = path.join(destinationPath, 'icons');
    const iconFilePath = path.join(dirPath, 'icon.png');
    var newIconRelPath;
    if (fs.existsSync(iconFilePath)) {
        const directoryName = path.basename(dirPath);
        const newFileName = `${directoryName}.png`;
        const newIconPath = path.join(iconDestinationPath, newFileName);
        newIconRelPath = '/icons/' + newFileName;

        try {
            // fs.copyFileSync(iconFilePath, newIconPath);
            fs.renameSync(iconFilePath, newIconPath);
        } catch (err) {
            console.error(`Error moving and renaming 'icon.png' in directory ${dirPath}:`, err);
        }
    }
    else {
        console.log(`'icon.png' not found in directory ${dirPath}. No changes made.`);
    }


    const metadataFilePath = path.join(dirPath, 'metadata.yaml');
    if (!fs.existsSync(metadataFilePath)) {
        console.log(`'metadata.yaml' not found in directory ${dirPath}. No changes made.`);
        return;
    }
    try {
        const fileContents = fs.readFileSync(metadataFilePath, 'utf8');
        const metadata = yaml.load(fileContents);
        const updatedYamlContent = {
            displayName: metadata.displayName,
            description: metadata.description,
            componentType: metadata.componentType,
            buildPack: metadata.buildPreset,
            repositoryUrl: metadata.repositoryUrl,
            componentPath: metadata.componentPath,
            thumbnailPath: newIconRelPath,
            documentationPath: metadata.documentationPath,
            tags: metadata.tags
        }

        const updatedYAML = yaml.dump(updatedYamlContent);

        const directoryName = path.basename(dirPath);
        const newFileName = `${directoryName}.yaml`;
        const newFilePath = path.join(destinationPath, newFileName);

        fs.writeFileSync(newFilePath, updatedYAML, 'utf8');
        fs.unlinkSync(metadataFilePath);

    } catch (err) {
        console.error(`Error reading and modifying metadata.yaml in directory ${dirPath}:`, err);
    }
}

// Function to loop through directories in a given path
function processDirectories(basePath, destinationPath) {
    //create new directory if not exists
    if (!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath);
        if (!fs.existsSync(path.join(destinationPath, 'icons'))) {
            fs.mkdirSync(path.join(destinationPath, 'icons'));
        }
    }
    fs.readdirSync(basePath).forEach((file) => {
        const dirPath = path.join(basePath, file);
        if (fs.statSync(dirPath).isDirectory() && !file.startsWith('.')) {
            moveAndRenameIconAndYamlFile(dirPath, destinationPath);
        }
    });
    console.log('Done!');
}

// Replace 'your_directory_path' with the actual path you want to scan
const directoryPath = '/Users/chameerar/Choreo/repos/choreo-samples';

// Replace 'destination_path' with the path where you want to move the updated YAML files
const destinationPath = '/Users/chameerar/Choreo/repos/choreo-samples/.samples';

processDirectories(directoryPath, destinationPath);
