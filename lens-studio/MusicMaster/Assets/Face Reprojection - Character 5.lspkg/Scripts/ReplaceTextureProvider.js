//ReplaceTextureProvider.js
//Version 0.0.1
//Replaces texture provider of one texture to a texture provider of another

//@input Asset.Texture textureTo
//@input Asset.Texture textureFrom

if (!script.textureTo) {
    debugPrint(" WARNING, Destination texture is not set");
    return;
}

if (!script.textureFrom) {
    debugPrint(" WARNING, Source texture is not set");
    return;
}

script.textureTo.control = script.textureFrom.control;

function debugPrint(message) {
    print("[ReplaceTextureProvider], " + message);
}