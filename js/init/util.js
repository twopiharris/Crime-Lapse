// RGBtoHSV: convert a BABYLON.Color3 to [H,S,V] array
function RGBtoHSV(color) {
    var h,s,v;
    var r = color.r * 255;
    var g = color.g * 255;
    var b = color.b * 255;
    min = Math.min( r, g, b );
    max = Math.max( r, g, b );

    v = max;
    delta = max - min;
    if( max != 0 )
        s = delta / max;        // s
    else {
        // r = g = b = 0        // s = 0, v is undefined
        s = 0;
        h = -1;
        return [h, s, undefined];
    }
    if( r === max )
        h = ( g - b ) / delta;      // between yellow & magenta
    else if( g === max )
        h = 2 + ( b - r ) / delta;  // between cyan & yellow
    else
        h = 4 + ( r - g ) / delta;  // between magenta & cyan
    h *= 60;                // degrees
    if( h < 0 )
        h += 360;
    if ( isNaN(h) )
        h = 0;
    return [h,s,v];
}

// HSVtoRGB: convert [H,S,V] array to BABYLON.Color3
function HSVtoRGB(color) {
    var i;
    var h,s,v,r,g,b;
    h = color[0];
    s = color[1];
    v = color[2];
    if(s === 0 ) {
        // achromatic (grey)
        r = g = b = v;
        return [r,g,b];
    }
    h /= 60;            // sector 0 to 5
    i = Math.floor( h );
    f = h - i;          // factorial part of h
    p = v * ( 1 - s );
    q = v * ( 1 - s * f );
    t = v * ( 1 - s * ( 1 - f ) );
    switch( i ) {
        case 0:
            r = v;
            g = t;
            b = p;
            break;
        case 1:
            r = q;
            g = v;
            b = p;
            break;
        case 2:
            r = p;
            g = v;
            b = t;
            break;
        case 3:
            r = p;
            g = q;
            b = v;
            break;
        case 4:
            r = t;
            g = p;
            b = v;
            break;
        default:        // case 5:
            r = v;
            g = p;
            b = q;
            break;
    }
    return new BABYLON.Color3(r/255, g/255, b/255);
}

// Rodrigues Rotation Formula: rotate a vector about any given axis
function rotateVecAboutAxis(vec, theta, axis) {
    var a = vec.multiplyByFloats(Math.cos(theta), Math.cos(theta), Math.cos(theta));
    var b = BABYLON.Vector3.Cross(axis,vec).multiplyByFloats(Math.sin(theta),Math.sin(theta),Math.sin(theta));
    var c = BABYLON.Vector3.Dot(axis,vec)*(1-Math.cos(theta));
    var d = axis.multiplyByFloats(c,c,c);
    return a.add(b.add(d));
}

// sets all of a meshes materials to toonshader versions of the same material
// for some reason toon shaders require textures and can't just use diffuse color. In order to keep diffuse colors, each color is drawn to a 1x1 canvas and that
// that canvas is saved to a dataURL image to use as the new texture
function giveCellShaderMaterial (mesh) {

    var subMats = mesh.material.subMaterials;
    var numLoops;
    if (subMats)
        numLoops = subMats.length;
    else {
        numLoops = 1;
    }
    for (var i=0; i<numLoops; i++) {
        var newMaterial = new BABYLON.ShaderMaterial("cellShader", scene, "cellShading", {
            attributes: ["position", "normal", "uv"],
            uniforms: ["world", "worldViewProjection"],
            samplers: ["textureSampler"]
        });
        var textureToUse, invertY;
        var mat = subMats ? subMats[i] : mesh.material;
        // if no diffuseTexture exists, draw the diffuseColor to a canvas and use this as the texture image (ShaderMaterial requires an texture for some reason)
        if (mat.diffuseTexture) {
            textureToUse = mat.diffuseTexture.url;
            invertY = mat.diffuseTexture._invertY
        } else {
            var color = mat.diffuseColor;
            colorCtx.fillStyle = "rgb(" + Math.floor(color.r * 255) + "," + Math.floor(color.g * 255) + "," + Math.floor(color.b * 255) + ")";
            colorCtx.fillRect(0, 0, 1, 1);
            var coloredTextureImage = colorCanvas.toDataURL();
            textureToUse = coloredTextureImage;
            invertY = false;
        }
        var tex = new BABYLON.Texture(textureToUse, scene, false, invertY, 2);
        // if previous texture has any uv settings, copy them over
        if(textureToUse.uScale)
            tex.uScale = textureToUse.uScale;
        if(textureToUse.vScale)
            tex.vScale = textureToUse.vScale;
        if(textureToUse.uOffset)
            tex.uOffset = textureToUse.uOffset;
        if(textureToUse.vOffset)
            tex.vOffset = textureToUse.vOffset;

        newMaterial.setTexture("textureSampler", tex);
        if (subMats)
            mesh.material.subMaterials[i] = newMaterial;
        else
            mesh.material = newMaterial;
    }
}

function changeShaderMatColor (mesh, color) {
    colorCtx.fillStyle = "rgb(" + Math.floor(color.r * 255) + "," + Math.floor(color.g * 255) + "," + Math.floor(color.b * 255) + ")";
    colorCtx.fillRect(0, 0, 1, 1);
    var coloredTextureImage = colorCanvas.toDataURL();

    var newMaterial = new BABYLON.ShaderMaterial("cellShader", scene, "cellShading", {
        attributes: ["position", "normal", "uv"],
        uniforms: ["world", "worldViewProjection"],
        samplers: ["textureSampler"]
    });
    newMaterial.setTexture("textureSampler", new BABYLON.Texture(coloredTextureImage, scene, false, false, 2))
        .setVector3("vLightPosition", light.position)
        .setFloats("ToonThresholds", [0.95, 0.5, 0.2, 0.03])
        .setFloats("ToonBrightnessLevels", [1.0, 0.8, 0.6, 0.35, 0.01])
        .setColor3("vLightColor", light.diffuse);

    mesh.material = newMaterial;
}